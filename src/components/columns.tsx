'use client';

import { Todo } from '@/types/todo';
import { ColumnDef, Row } from '@tanstack/react-table';
import { CheckSquare2, Square, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { EditTodo } from './edit-todo';

export type Columns = {
	id: number;
	title: string;
	description: string;
	completed: boolean;
};

export const columns: ColumnDef<Todo>[] = [
	{
		header: '#',
		cell: ({ row, cell, column, getValue, renderValue, table }) => (
			<p className='flex items-center justify-center h-4 w-4'>
				{1 + table.getRowModel().rows.findIndex((r) => r.id === row.id)}
			</p>
		),
	},
	{
		accessorKey: 'title',
		header: 'Title',
	},
	{
		accessorKey: 'description',
		header: 'Description',
	},
	{
		accessorKey: 'completed',
		header: 'Actions',
		cell: ({ row }) => (
			<div className='flex space-x-1'>
				<CompleteButton row={row} />
				<EditTodo row={row} />
				<Delete row={row} />
			</div>
		),
	},
];

const CompleteButton = ({ row }: { row: Row<Todo> }) => {
	const router = useRouter();

	const handleClick = async () => {
		await fetch(`/fast/todo/${row.original.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				...row.original,
				completed: !row.original.completed,
			}),
		});

		toast('Todo updated', {
			description: `Todo ${row.original.title} has been marked as ${
				row.original.completed ? 'incompleted' : 'complete'
			}`,
		});
		router.refresh();
	};

	return (
		<Button
			variant={'ghost'}
			size={'icon'}
			onClick={handleClick}
			className='hover:text-green-700'
			type='button'
		>
			{row.original.completed ? (
				<CheckSquare2 className='h-5 w-5 ' />
			) : (
				<Square className='h-5 w-5 ' />
			)}
		</Button>
	);
};

const Delete = ({ row }: { row: Row<Todo> }) => {
	const router = useRouter();

	const handleDelete = async () => {
		const res = await fetch(`/fast/todo/${row.original.id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!res.ok) {
			toast('Error', {
				description: `Todo ${row.original.title} could not be deleted`,
			});
			return;
		}

		toast('Todo updated', {
			description: `Todo ${row.original.title} has been deleted`,
		});
		router.refresh();
	};

	return (
		<Button
			variant={'ghost'}
			size={'icon'}
			onClick={handleDelete}
			className='hover:text-red-700'
			type='button'
		>
			<Trash className='h-4 w-4 ' />
		</Button>
	);
};
