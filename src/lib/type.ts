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

export interface AuthResponse {
	access_token: string;
	refresh_token: string;
	username: string;
	token_type: string;
}

export type User = {
	id: number;
	username: string;
	email: string;
	todos: Todo[];
	created_at: string;
	updated_at: string;
};
