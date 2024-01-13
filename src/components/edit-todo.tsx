'use client';

import { Todo } from '@/lib/type';
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
import { useEffect, useState } from 'react';

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

	useEffect(() => {
		form.reset({
			title: row.original.title,
			description: row.original.description,
			completed: row.original.completed,
		});
	}, [row, form]);

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
