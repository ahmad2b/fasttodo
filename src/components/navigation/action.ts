'use server';
import { cookies } from 'next/headers';

export async function logout(formData: FormData) {
	'use server';
	const cookieStore = cookies();
	console.log('logout ACTION');
	console.log(formData.get('access_token'));

	cookieStore.delete('access_token');
}
