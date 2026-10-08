import { runnerImport, type Plugin } from "vite";

const buildModule = /\.build\.[cm]?[jt]sx?$/;

/** Runs `*.build.ts` modules once at build time and replaces them with their exports serialized as JSON. */
export function buildTime(): Plugin {
  // Shared across environments so the client and server bundles inline the same values.
  const cache = new Map<string, Promise<string>>();
  const dependencies = new Map<string, string[]>();

  async function evaluate(id: string) {
    const result = await runnerImport<Record<string, unknown>>(id);
    dependencies.set(id, result.dependencies);
    return Object.entries(result.module)
      .map(([name, value]) => {
        const json = JSON.stringify(value);
        if (json === undefined) throw new Error(`${id}: export "${name}" is not JSON-serializable`);
        return name === "default" ? `export default ${json};` : `export const ${name} = ${json};`;
      })
      .join("\n");
  }

  return {
    name: "build-time",
    enforce: "pre",
    async load(id) {
      if (id.includes("?") || !buildModule.test(id)) return;
      let code = cache.get(id);
      if (!code) {
        code = evaluate(id);
        cache.set(id, code);
        code.catch(() => cache.delete(id));
      }
      const result = await code;
      for (const file of dependencies.get(id) ?? []) this.addWatchFile(file);
      return result;
    },
    watchChange(changed) {
      for (const id of cache.keys()) {
        if (id === changed || dependencies.get(id)?.includes(changed)) cache.delete(id);
      }
    },
  };
}
