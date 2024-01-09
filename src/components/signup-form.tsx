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
import { useRouter } from 'next/navigation';

const formSchema = z.object({
	username: z.string().min(3),
	password: z.string().min(6),
	confirmPassword: z.string().min(6),
	email: z.string().email(),
});

type FormData = z.infer<typeof formSchema>;

export const SignupForm = () => {
	const router = useRouter();

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: '',
			password: '',
			confirmPassword: '',
			email: '',
		},
	});

	const onSubmit = async (data: FormData) => {
		const parsedData = formSchema.parse(data);

		if (parsedData.password !== parsedData.confirmPassword) {
			toast('Error Signing up', {
				description: 'Passwords do not match',
			});
			return;
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/user/signup`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: parsedData.username,
					email: parsedData.email,
					password: parsedData.password,
				}),
			}
		);

		if (response.status === 400) {
			toast('Signup Failed', {
				description: `${parsedData.username} or ${parsedData.email} already registered`,
			});

			return;
		} else if (!response.ok) {
			toast('Signup Failed', {
				description: 'Something went wrong',
			});
			return;
		}

		toast('Success!', {
			description: 'You have successfully signed up! Please login.',
		});
		form.reset();
		router.refresh();
	};

	return (
		<div>
			<Card>
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
