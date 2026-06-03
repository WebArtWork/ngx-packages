export type InputValue =
	| null
	| string
	| number
	| boolean
	| string[]
	| number[]
	| boolean[];

export type InputType =
	| 'text'
	| 'password'
	| 'email'
	| 'radio'
	| 'checkbox'
	| 'textarea'
	| 'search'
	| 'tel'
	| 'url'
	| 'number'
	| 'range'
	| 'color'
	| 'date'
	| 'month'
	| 'week'
	| 'time'
	| 'datetime'
	| 'datetime-local';
