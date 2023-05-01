// <reference types="react-scripts" />
declare module '*.jpeg';
declare module '*.webp';

// declare module '*.svg';
declare module '*.svg' {
	const path: string;
	export default path;
}

declare module '*.png' {
	const path: string;
	export default path;
}

declare module '*.jpg' {
	const path: string;
	export default path;
}
