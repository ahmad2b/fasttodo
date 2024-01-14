'use server';
import { AuthResponse, User } from '@/lib/type';
import { cookies } from 'next/headers';

interface SignupResponse {
	data?: User;
	error?: string;
}

export async function signup(formData: FormData): Promise<SignupResponse> {
	console.log('SIGNUP ACTION CALLED');

	const username = formData.get('username') as string;
	const email = formData.get('email') as string;
	const password = formData.get('password') as string;

	if (!username || !email || !password)
		return {
			error: 'Missing required fields',
		};

	console.log('SIGNUP ACTION DATA', username, email, password);

	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username, email, password }),
	});
	console.log('SIGNUP ACTION RES', res.status);

	const data = await res.json();
	console.log('SIGNUP ACTION DATA', data);

	if (res.status === 409) {
		return {
			error: data.detail,
		};
	} else if (!res.ok)
		return {
			error: data.detail,
		};

	return {
		data,
	};
}

interface LoginResponse {
	data?: AuthResponse;
	error?: string;
}

export async function login(formData: FormData): Promise<LoginResponse> {
	console.log('LOGIN ACTION CALLED');

	const username = formData.get('username') as string;
	const password = formData.get('password') as string;

	if (!username || !password)
		return {
			error: 'Missing required fields',
		};

	console.log('LOGIN ACTION DATA', username, password);

	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/signin`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		cache: 'no-store',
		body: JSON.stringify({ username, password }),
	});
	console.log('LOGIN ACTION RES', res.status);

	const data = await res.json();

	console.log('LOGIN ACTION DATA', data);

	if (res.status === 401)
		return {
			error: data.detail,
		};
	else if (!res.ok) {
		return {
			error: data.message,
		};
	}
	const cookieStore = cookies();

	const tokenMaxAge = 60 * 5; // 5 minutes
	const refreshTimeExtra = 60 * 5; // 5 minutes

	for (let key in data) {
		let maxAge = tokenMaxAge; // Default max age for access_token
		if (key === 'refresh_token') {
			maxAge += refreshTimeExtra; // Add extra time for refresh_token
		}

		const cookieOptions = {
			name: key, // Use the attribute name as the cookie name
			value: data[key], // Use the attribute value as the cookie value
			maxAge: maxAge,
			httpOnly: true,
			path: '/',
			secure: process.env.NODE_ENV === 'production',
		};

		cookieStore.set(cookieOptions);
	}

	return {
		data,
	};
}
