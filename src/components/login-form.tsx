'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { login } from '@/app/actions/auth';

import { LoginValidator, LoginRequest } from '@/lib/validators';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';

const hardRedirect = () => {
	window.location.reload();
	window.location.href = '/';
};

export const LoginForm = () => {
	const form = useForm<LoginRequest>({
		resolver: zodResolver(LoginValidator),
		defaultValues: {
			username: '',
			password: '',
		},
	});

	const onSubmit = async (data: LoginRequest) => {
		const parsedData = LoginValidator.parse(data);

		if (!parsedData.username || !parsedData.password) {
			toast('Error Loggin in', {
				description: 'Username or password cannot be empty',
			});
			return;
		}

		let formData = new FormData();

		Object.entries(parsedData).forEach(([key, value]) => {
			formData.append(key, value);
		});

		const action_res = await login(formData);

		if (action_res.error) {
			toast('Login failed', {
				description: action_res.error,
			});
			return;
		} else if (action_res.data) {
			toast('Login Successful', {
				description: `Welcome back ${action_res.data.username}`,
			});
			form.reset();
			hardRedirect();
			return;
		} else {
			toast('Login failed', {
				description: 'Something went wrong',
			});
			return;
		}
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
