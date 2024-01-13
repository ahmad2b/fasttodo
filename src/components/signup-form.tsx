'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { signup } from '@/app/actions/auth';

import { SignupRequest, SignupValidator } from '@/lib/validators';

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

export const SignupForm = () => {
	const router = useRouter();

	const form = useForm<SignupRequest>({
		resolver: zodResolver(SignupValidator),
		defaultValues: {
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const onSubmit = async (data: SignupRequest) => {
		const parsedData = SignupValidator.parse(data);

		if (parsedData.password !== parsedData.confirmPassword) {
			toast('Error Signing up', {
				description: 'Passwords do not match',
			});
			return;
		}

		let formData = new FormData();

		Object.entries(parsedData).forEach(([key, value]) => {
			formData.append(key, value);
		});

		const action_res = await signup(formData);

		if (action_res.error) {
			toast('Signup Failed', {
				description: action_res.error,
			});
			return;
		} else if (action_res.data) {
			toast('Success!', {
				description: 'You have successfully signed up! Please login.',
				action: {
					label: 'Login',
					onClick: () => {
						router.push('/login');
					},
				},
			});
			form.reset();
			router.refresh();
			return;
		} else {
			toast('Signup Failed', {
				description: 'Something went wrong',
			});
			return;
		}
	};

	return (
		<div>
			<Card className='bg-opacity-40 rounded-2xl'>
				<CardHeader>
					<CardTitle>Signup</CardTitle>
					<CardDescription>
						Signup to create your account and access your todos.
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
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												placeholder='Enter your email'
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
												placeholder='Create password'
												type='password'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='confirmPassword'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												placeholder='Re-enter your password'
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
									className='mt-4'
									disabled={
										form.formState.isSubmitting || !form.formState.isValid
									}
									isLoading={form.formState.isSubmitting}
								>
									Create account
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};
