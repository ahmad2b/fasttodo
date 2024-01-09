import { Todo } from '@/types/todo';
import { columns } from './columns';
import { DataTable } from './data-table';

async function getData(): Promise<Todo[]> {
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todos`, {
		cache: 'no-store',
	});

	if (!response.ok) {
		throw new Error('Something went wrong');
	}

	return await response.json();
}

export const ToDoList = async () => {
	const todos = await getData();

	return (
		<div className='container min-w-[320px] mx-auto p-8 bg-white/40 border border-stone-300 shadow-md rounded-3xl'>
			<h2 className='scroll-m-20 border-b pb-2 mb-2 text-stone-800 text-2xl font-semibold tracking-tight first:mt-0'>
				ToDos List
			</h2>
			<DataTable
				columns={columns}
				data={todos}
			/>
		</div>
	);
};
