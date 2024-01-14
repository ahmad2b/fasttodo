import { Todo } from '@/lib/type';
import { columns } from './columns';
import { DataTable } from './data-table';
import { cookies } from 'next/headers';
import Link from 'next/link';

async function getData(): Promise<Todo[]> {
	const cookieStore = cookies();
	const token = cookieStore.get('access_token')?.value;
	console.log('ACCESS_TOKEN', token);
	if (!token) {
		return [];
	}

	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todos`, {
		cache: 'no-store',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	});

	console.log('Get TODOS: ' + response.status);

	if (!response.ok) {
		return [];
	}

	return await response.json();
}

export const ToDoList = async () => {
	const cookieStore = cookies();
	const token = cookieStore.get('access_token')?.value;

	if (!token) {
		return (
			<div className='container min-w-[320px] mx-auto p-8 bg-white/30 border border-fuchsia-100 shadow-md rounded-3xl'>
				<h2 className='scroll-m-20 border-b pb-2 mb-2 text-stone-800 text-2xl font-semibold tracking-tight first:mt-0'>
					ToDos List
				</h2>
				<div className='rounded-3xl px-4 sm:px-8 py-2 sm:py-4 flex items-center justify-center'>
					<p className='leading-7 text-fuchsia-950 text-base'>
						Please{' '}
						<Link
							href={'/login'}
							className='font-semibold hover:underline'
						>
							login
						</Link>{' '}
						or{' '}
						<Link
							href={'/login'}
							className='font-semibold hover:underline'
						>
							create account
						</Link>{' '}
						to create & save Todos
					</p>
				</div>
			</div>
		);
	}

	const todos = await getData();

	return (
		<div className='container min-w-[320px] mx-auto p-8 bg-white/30 border border-fuchsia-100 shadow-md rounded-3xl'>
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
