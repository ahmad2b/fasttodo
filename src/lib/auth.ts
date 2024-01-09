import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
	session: {
		strategy: 'jwt',
		maxAge: 30,
	},
	pages: {
		signIn: '/login',
		signOut: '/login',
	},
	providers: [
		CredentialsProvider({
			name: 'Credentials',

			credentials: {
				username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials, req) {
				if (!credentials) {
					throw new Error('Invalid email or password credentials');
				}

				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/user/login`,
					{
						method: 'POST',
						body: JSON.stringify(credentials),
						headers: { 'Content-Type': 'application/json' },
					}
				);

				if (res.status === 401 || res.status === 400) {
					throw new Error('Invalid email or password credentials');
				}

				const user = await res.json();

				// If no error and we have user data, return it
				if (res.ok && user) {
					return user;
				}
				// Return null if user data could not be retrieved
				return null;
			},
		}),
	],
};
