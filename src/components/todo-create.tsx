'use client';
import * as z from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { useState } from 'react';
import { revalidatePath } from 'next/cache';

export const TodoValidator = z.object({
	title: z.string().min(1).max(100),
	description: z.string().min(1).max(100),
	completed: z.boolean().default(false).optional(),
});

export type TodoRequest = z.infer<typeof TodoValidator>;

export const ToDoCreate = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const form = useForm<TodoRequest>({
		resolver: zodResolver(TodoValidator),
		defaultValues: {
			title: '',
			description: '',
			completed: false,
		},
	});

	const onSubmit = async (data: TodoRequest) => {
		try {
			setIsLoading(true);
			const parsedData = TodoValidator.parse(data);
			const response = await fetch(`/fast/todo`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(parsedData),
			});

			if (response.status === 401) {
				toast('Please login or create account to create todos', {
					description: 'Unauthorized',
				});
				return;
			}

			const json = await response.json();

			console.log(json);

			if (!response.ok) {
				toast('Error creating todo', {
					description: json.message,
				});
			}

			form.reset();
			router.refresh();
			// revalidatePath('/');
			toast('Todo created successfuly', {
				description: parsedData.title,
			});
		} catch (error) {
			toast('Error creating todo', {
				description: (error as { message: string }).message,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='w-full min-w-[320px]'>
			<Card className='bg-white/30 border border-fuchsia-100 shadow-md rounded-3xl'>
				<CardHeader>
					<h2 className='scroll-m-20 border-b pb-2 text-stone-800 text-2xl font-semibold tracking-tight first:mt-0'>
						Create Todos
					</h2>
					<p className='leading-7 text-stone-700 text-sm'>
						Enter your todo title and description
					</p>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className='flex flex-col space-y-2'
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
								className='w-full bg-fuchsia-950'
								isLoading={form.formState.isSubmitting || isLoading}
							>
								Create Todo
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};
