export type SelectPrimitive = string | number | boolean;

export type SelectValue =
	| undefined
	| null
	| SelectPrimitive
	| SelectPrimitive[]; // allow (string|number|boolean)[]

export type SelectId = string | number;
