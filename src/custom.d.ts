/* eslint-disable  @typescript-eslint/no-explicit-any */

declare module '*.svg' {
	import React = require('react');
	export const ReactComponent: React.FunctionComponent<
		React.SVGProps<SVGSVGElement>
	>;
	const src: string;
	export default src;
}
declare module '*.png' {
	const content: any;
	export default content;
}
declare module '*.jpg' {
	const content: any;
	export default content;
}
declare module '*.json' {
	const content: any;
	export default content;
}

declare module '*.module.css' {
	const classes: { [key: string]: string };
	export default classes;
}

declare module '*.module.scss' {
	const classes: { [key: string]: string };
	export default classes;
}

declare module '*.module.sass' {
	const classes: { [key: string]: string };
	export default classes;
}

declare module 'react-dnd' {
	export function useDrag(spec: any): any[];
	export function useDrop(spec: any): any[];
	export function DndProvider(props: any): JSX.Element;
}

declare module 'react-dnd-html5-backend' {
	export const HTML5Backend: any;
}

/* eslint-enable  @typescript-eslint/no-explicit-any */
