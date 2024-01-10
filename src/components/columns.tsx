'use client';

import { Todo } from '@/types/todo';
import { ColumnDef, Row } from '@tanstack/react-table';
import { CheckSquare2, Square, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

import { Pen } from 'lucide-react';

import { useForm } from 'react-hook-form';

import { TodoValidator, TodoRequest } from './todo-create';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

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

export const EditTodo = ({ row }: { row: Row<Todo> }) => {
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const form = useForm<TodoRequest>({
		resolver: zodResolver(TodoValidator),
		defaultValues: {
			title: row.original.title,
			description: row.original.description,
			completed: row.original.completed,
		},
	});

	const onSubmit = async (data: TodoRequest) => {
		try {
			const parsedData = TodoValidator.parse(data);
			const response = await fetch(`/fast/todo/${row.original.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(parsedData),
			});

			const json = await response.json();

			if (!response.ok) {
				// throw new Error(json.message);
				toast('Error updating todo', {
					description: json.message,
				});
			}

			form.reset();
			router.refresh();
			setOpen(false); // close the dialog

			toast('Todo updated successfuly', {
				description: parsedData.title,
			});
		} catch (error) {}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button
					variant={'ghost'}
					size={'icon'}
					type='button'
					className='hover:text-blue-500'
				>
					<Pen className='h-4 w-4 ' />
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Edit Todo</DialogTitle>
					<DialogDescription>Edit your todo here</DialogDescription>
				</DialogHeader>
				<div className='flex items-center space-x-2 w-full'>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className='flex flex-col space-y-2 w-full'
						>
							<FormField
								control={form.control}
								name='title'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input
												placeholder='Enter your todo title'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='description'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder='Enter your todo description'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type='submit'
								disabled={
									form.formState.isSubmitting || !form.formState.isValid
								}
								className='w-full'
								isLoading={form.formState.isSubmitting}
							>
								Update Todo
							</Button>
						</form>
					</Form>
				</div>
				{/* <Button
					type='button'
					variant='destructive'
					className='w-full'
					onClick={() => handleDelete(row.original.id)}
					disabled={form.formState.isSubmitting}
					isLoading={isDeleting}
				>
					Delete Todo
				</Button> */}
			</DialogContent>
		</Dialog>
	);
};
