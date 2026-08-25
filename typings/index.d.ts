import type { ComponentProps, ComponentType } from "react";

export type ServerRenderedComponent<C extends ComponentType<any>> = (
  props: ComponentProps<C>
) => string;

// Typed for the server branch: hypernova's server() is what is evaluated
// when the bundle renders HTML. On the client renderReact returns the
// component itself, but the return value is not used there.
export function renderReact<C extends ComponentType<any>>(
  name: string,
  component: C
): ServerRenderedComponent<C>;
