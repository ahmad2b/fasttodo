import * as z from 'zod';

export const LoginValidator = z.object({
	username: z.string().min(3),
	password: z.string().min(3),
});

export type LoginRequest = z.infer<typeof LoginValidator>;

export const SignupValidator = z.object({
	username: z.string().min(3).max(100, 'Username too long. Max 100 characters'),
	password: z.string().min(6),
	confirmPassword: z.string().min(6),
	email: z.string().email(),
});

export type SignupRequest = z.infer<typeof SignupValidator>;
