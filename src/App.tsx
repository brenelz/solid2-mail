import { Title } from "@solidjs/meta";
import { Loading } from "solid-js";
import { Router } from "./router";
import "./App.css";

export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <Title>Stamp · SolidJS</Title>
          <Loading fallback={<main>Loading...</main>}>{props.children}</Loading>
        </>
      )}
    </Router>
  );
}
