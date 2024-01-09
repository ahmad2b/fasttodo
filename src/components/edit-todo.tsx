'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

import { Pen } from 'lucide-react';
import { Todo } from '@/types/todo';
import { Row } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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

export const EditTodo = ({ row }: { row: Row<Todo> }) => {
	const router = useRouter();
	const [open, setOpen] = useState(false); // create a state for the dialog

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
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/todos/${row.original.id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(parsedData),
				}
			);

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

	const handleDelete = async (id: number) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/todos/${id}`,
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			const json = await response.json();

			if (!response.ok) {
				toast('Error deleting todo', {
					description: json.message,
				});
			}

			toast('Todo deleted successfuly', {
				description: row.original.title,
			});
		} catch (error) {}
		form.reset();
		router.refresh();
		setOpen(false);
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
							>
								Update Todo
							</Button>
						</form>
					</Form>
				</div>
				{/* <DialogFooter className='sm:justify-start'> */}
				<Button
					type='button'
					variant='destructive'
					className='w-full'
					onClick={() => handleDelete(row.original.id)}
					disabled={form.formState.isSubmitting}
				>
					Delete Todo
				</Button>
				{/* </DialogFooter> */}
			</DialogContent>
		</Dialog>
	);
};
