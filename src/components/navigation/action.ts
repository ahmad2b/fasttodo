'use server';
import { cookies } from 'next/headers';

export async function logout(formData: FormData) {
	'use server';
	const cookieStore = cookies();
	cookieStore.delete('access_token');
	cookieStore.delete('refresh_token');
	cookieStore.delete('username');
	cookieStore.delete('token_type');
}
