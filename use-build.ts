import path from "node:path";
import { parseAst, runnerImport, type Plugin } from "vite";

type Range = { start: number; end: number };

const DIRECTIVE = "use build";
const REGISTRY = "__useBuildFunctions";

/** Finds functions whose body opens with a "use build" directive. */
function findBuildFunctions(code: string, id: string): Range[] {
  const ranges: Range[] = [];
  const visit = (node: any): void => {
    if (!node || typeof node.type !== "string") return;
    if (
      (node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression") &&
      node.body?.type === "BlockStatement" &&
      node.body.body.some((statement: any) => statement.directive === DIRECTIVE)
    ) {
      if (node.params.length) throw new Error(`${id}: a "${DIRECTIVE}" function cannot take arguments`);
      ranges.push({ start: node.start, end: node.end });
      return;
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") visit(value);
    }
  };
  visit(parseAst(code, { lang: /\.[cm]?tsx$/.test(id) ? "tsx" : /\.[cm]?ts$/.test(id) ? "ts" : "jsx" }));
  return ranges;
}

function replaceRanges(code: string, ranges: Range[], replace: (range: Range, index: number) => string) {
  let result = code;
  for (let index = ranges.length - 1; index >= 0; index--) {
    const range = ranges[index];
    result = result.slice(0, range.start) + replace(range, index) + result.slice(range.end);
  }
  return result;
}

/**
 * Runs functions marked with a "use build" directive once at build time and replaces each one with a function
 * that returns its result as a JSON literal. The function must take no arguments and return JSON-serializable data.
 */
export function useBuild(): Plugin {
  // Shared across environments so the client and server bundles inline the same values.
  const cache = new Map<string, Promise<string[]>>();
  const dependencies = new Map<string, string[]>();

  async function evaluate(id: string): Promise<string[]> {
    const registry: Array<() => unknown> = [];
    (globalThis as any)[REGISTRY] = registry;
    try {
      const result = await runnerImport(id, {
        plugins: [
          {
            name: "use-build:extract",
            enforce: "pre",
            resolveId(source) {
              if (source === "server-only") return "\0use-build:empty";
            },
            load(source) {
              if (source === "\0use-build:empty") return "export {}";
            },
            transform(code, source) {
              if (source !== id) return;
              const ranges = findBuildFunctions(code, id);
              return replaceRanges(
                code,
                ranges,
                ({ start, end }, index) => `(globalThis.${REGISTRY}[${index}] = ${code.slice(start, end)})`,
              );
            },
          },
        ],
      });
      // Virtual modules (the server-only stub) are not files; watching them breaks dev import analysis.
      dependencies.set(id, result.dependencies.filter((file) => path.isAbsolute(file)));
      return await Promise.all(
        registry.map(async (fn, index) => {
          const json = JSON.stringify(await fn());
          if (json === undefined) throw new Error(`${id}: "${DIRECTIVE}" function #${index} returned a non-JSON value`);
          return json;
        }),
      );
    } finally {
      delete (globalThis as any)[REGISTRY];
    }
  }

  return {
    name: "use-build",
    enforce: "pre",
    async transform(code, id) {
      if (id.includes("/node_modules/") || !/\.[cm]?[jt]sx?(\?|$)/.test(id) || !code.includes(DIRECTIVE)) return;
      const file = id.split("?")[0];
      const ranges = findBuildFunctions(code, file);
      if (!ranges.length) return;
      let values = cache.get(file);
      if (!values) {
        values = evaluate(file);
        cache.set(file, values);
        values.catch(() => cache.delete(file));
      }
      const json = await values;
      for (const dependency of dependencies.get(file) ?? []) this.addWatchFile(dependency);
      return { code: replaceRanges(code, ranges, (_, index) => `(() => ${json[index]})`), map: null };
    },
    watchChange(changed) {
      for (const id of cache.keys()) {
        if (id === changed || dependencies.get(id)?.includes(changed)) cache.delete(id);
      }
    },
    hotUpdate({ file, modules }) {
      // Importers of a changed dependency are invalidated, but the module that inlined its result may not be.
      const graph = this.environment.moduleGraph;
      const stale = [...dependencies]
        .filter(([, files]) => files.includes(file))
        .flatMap(([id]) => [...(graph.getModulesByFile(id) ?? [])]);
      if (!stale.length) return;
      for (const mod of stale) graph.invalidateModule(mod);
      return [...modules, ...stale];
    },
  };
}
