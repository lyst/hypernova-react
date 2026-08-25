// Compile-time checks for typings/index.d.ts, run by `npm run typecheck`.
import { renderReact, type ServerRenderedComponent } from "../typings/index";

function Greeting(_props: { name: string }): null {
  return null;
}

const render: ServerRenderedComponent<typeof Greeting> = renderReact(
  "Greeting",
  Greeting
);

const html: string = render({ name: "Desmond" });
void html;

// @ts-expect-error: missing required prop
render({});

// @ts-expect-error: wrong prop type
render({ name: 1 });
