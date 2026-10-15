// jsdom does not provide TextEncoder, which React 18's browser build of
// react-dom/server needs at import time. Real browsers and Node both do.
const { TextEncoder, TextDecoder } = require("util");

if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}
