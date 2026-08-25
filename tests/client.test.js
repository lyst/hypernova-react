/**
 * @jest-environment jsdom
 */
import { act, createElement, useState } from "react";
import { renderToString } from "react-dom/server";
import { serialize } from "hypernova";
import { renderReact } from "../src/index";

function ExampleReactComponent({ name }) {
  const [clicks, setClicks] = useState(0);
  return createElement(
    "button",
    { id: "example", onClick: () => setClicks(clicks + 1) },
    `Hello ${name} (${clicks})`
  );
}

describe("renderReact client hydration", () => {
  let consoleError;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const props = { name: "Desmond" };
    const html = serialize(
      "ExampleReactComponent",
      renderToString(createElement(ExampleReactComponent, props)),
      props
    );
    document.body.innerHTML = html;
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  test("hydrates server-rendered instances with the server props", async () => {
    const serverNode = document.getElementById("example");

    await act(async () => {
      renderReact("ExampleReactComponent", ExampleReactComponent);
    });

    // Hydration reuses the server DOM node rather than replacing it.
    expect(document.getElementById("example")).toBe(serverNode);
    expect(serverNode.textContent).toBe("Hello Desmond (0)");

    // Event handlers are only attached once hydration has run.
    await act(async () => {
      serverNode.click();
    });

    expect(serverNode.textContent).toBe("Hello Desmond (1)");
    expect(consoleError).not.toHaveBeenCalled();
  });

  test("client-renders containers that have no server markup", async () => {
    // Hypernova falls back to an empty container when the server render
    // fails; hydrating that would report hydration errors.
    const onError = jest.fn();
    window.addEventListener("error", onError);
    document.body.innerHTML = serialize("ExampleReactComponent", "", {
      name: "Fallback",
    });

    try {
      await act(async () => {
        renderReact("ExampleReactComponent", ExampleReactComponent);
      });
    } finally {
      window.removeEventListener("error", onError);
    }

    expect(document.getElementById("example").textContent).toBe(
      "Hello Fallback (0)"
    );
    expect(onError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
