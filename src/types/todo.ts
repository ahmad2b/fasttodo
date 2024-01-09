export type Todo = {
	id: number;
	title: string;
	description: string;
	completed: boolean;
};

export type TodoRequest = {
	title: string;
	description: string;
	completed: boolean;
};

export type TodoResponse = {
	id: number;
	title: string;
	description: string;
	completed: boolean;
};
