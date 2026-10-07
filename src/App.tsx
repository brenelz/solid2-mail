import { Title } from "@solidjs/meta";
import { Loading } from "solid-js";
import { Router } from "./router";
import "./App.css";

export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <Title>Solid 2 Mail</Title>
          <Loading fallback={<main>Loading...</main>}>{props.children}</Loading>
        </>
      )}
    </Router>
  );
}
