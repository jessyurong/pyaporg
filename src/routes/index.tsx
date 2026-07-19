import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - JSX module without types
import App from "../pyap/App.jsx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PYAP Barangay Samac" },
      { name: "description", content: "Pag-asa Youth Association of the Philippines — Barangay Samac management system." },
      { property: "og:title", content: "PYAP Barangay Samac" },
      { property: "og:description", content: "Pag-asa Youth Association of the Philippines — Barangay Samac management system." },
    ],
  }),
  component: Index,
});

function Index() {
  return <App />;
}
