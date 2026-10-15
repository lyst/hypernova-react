// Runs the package inside Hypernova's VM sandbox (createVM, which
// createGetComponent uses), where only a few Node globals exist.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { createVM } = require("hypernova/server");

const root = path.join(__dirname, "..");
let outDir;

beforeAll(() => {
  // The sandbox loads plain CommonJS from disk, bypassing jest's
  // transforms, so build src/ the same way `npm run build` does.
  outDir = fs.mkdtempSync(path.join(__dirname, ".vm-"));
  execFileSync(
    path.join(root, "node_modules", ".bin", "babel"),
    ["src", "-d", outDir],
    { cwd: root, stdio: "ignore" }
  );
});

afterAll(() => {
  fs.rmSync(outDir, { recursive: true, force: true });
});

test("renders inside Hypernova's VM sandbox", async () => {
  const entry = path.join(outDir, "vm-entry.js");
  const code = `
    const React = require("react");
    const { renderReact } = require(${JSON.stringify(outDir)});
    module.exports = renderReact("Example", ({ name }) =>
      React.createElement("p", null, "Hello " + name)
    );
  `;
  const render = createVM().run(entry, code);

  expect(await render({ name: "Desmond" })).toMatch(/<p>Hello Desmond<\/p>/);
});
