'use client';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const formSchema = z.object({
	username: z.string().min(3),
	password: z.string().min(3),
});

type FormData = z.infer<typeof formSchema>;

export const LoginForm = () => {
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: '',
			password: '',
		},
	});

	const hardRedirect = () => {
		window.location.reload();
		window.location.href = '/';
	};

	const onSubmit = async (data: FormData) => {
		const parsedData = formSchema.parse(data);

		const response = await fetch(`/fast/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(parsedData),
		});

		if (
			response.status === 401 ||
			response.status === 400 ||
			response.status === 404
		) {
			toast('Error Loggin in', {
				description: 'Invalid username or password',
			});
			return;
		} else if (!response.ok) {
			toast('Error Loggin in', {
				description: 'Something went wrong',
			});
			return;
		}

		toast('Login successfully', {
			description: `Welcome back ${parsedData.username}`,
		});
		form.reset();
		hardRedirect();
	};

	return (
		<div>
			<Card className='bg-opacity-40 rounded-2xl'>
				<CardHeader>
					<CardTitle>Login</CardTitle>
					<CardDescription>
						Login to your account to create and access your todos.
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-2'>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className='space-y-1'
						>
							<FormField
								control={form.control}
								name='username'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input
												placeholder='Enter your username'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='password'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												placeholder='Enter your password'
												type='password'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className=''>
								<Button
									type='submit'
									className='mt-4 '
									disabled={
										form.formState.isSubmitting || !form.formState.isValid
									}
									isLoading={form.formState.isSubmitting}
								>
									Login
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};
