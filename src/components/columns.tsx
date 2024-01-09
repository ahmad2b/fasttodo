'use client';

import { Todo } from '@/types/todo';
import { ColumnDef, Row } from '@tanstack/react-table';
import { CheckSquare2, Square } from 'lucide-react';
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
		accessorKey: 'completed',
		header: 'Complete?',
		cell: ({ row }) => <CompleteButton row={row} />,
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
		header: 'Edit',
		cell: ({ row }) => <EditTodo row={row} />,
	},
];

const CompleteButton = ({ row }: { row: Row<Todo> }) => {
	const router = useRouter();

	const handleClick = async () => {
		await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todos/${row.original.id}`, {
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
			description: `Todo ${row.original.title} has been updated`,
		});
		router.refresh();
	};

	return (
		<Button
			variant={'ghost'}
			size={'icon'}
			onClick={handleClick}
		>
			{row.original.completed ? (
				<CheckSquare2 className='h-5 w-5 ' />
			) : (
				<Square className='h-5 w-5 ' />
			)}
		</Button>
	);
};
