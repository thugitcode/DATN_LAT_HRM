/// <reference types="@rsbuild/core/types" />

/**
 * Imports the SVG file as a React component.
 * @requires [@rsbuild/plugin-svgr](https://npmjs.com/package/@rsbuild/plugin-svgr)
 */
declare module "*.svg?react" {
  import type React from "react";
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

/**
 * Allows importing CSS files as side-effect imports.
 */
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

/**
 * Specific declaration for react-big-calendar CSS.
 */
declare module 'react-big-calendar/lib/css/react-big-calendar.css';
