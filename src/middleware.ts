import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;
	const cookiesStore = request.cookies;

	const access_token = cookiesStore.get('access_token')?.value;
	const refresh_token = cookiesStore.get('refresh_token')?.value;

	const isAuth = access_token && refresh_token;
	const isAuthPage = pathname === '/login';

	if (isAuthPage) {
		if (isAuth) {
			return NextResponse.redirect(new URL('/', request.url));
		}

		return null;
	}

	if (refresh_token && !access_token) {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/users/token/refresh`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ refresh_token: refresh_token }),
			}
		);

		if (response.status === 401) {
			return NextResponse.redirect(`${request.url}/login `);
		}

		if (response.status === 200) {
			const json = await response.json();

			const res = NextResponse.redirect(request.url);
			res.cookies.set({
				name: 'access_token',
				value: json.access_token,
				path: '/',
				httpOnly: true,
				maxAge: 60 * 5, // 5 minutes
				sameSite: 'lax',
			});

			return res;
		}
	}

	if (
		request.nextUrl.pathname !== '/' &&
		request.nextUrl.pathname !== '/login'
	) {
		return NextResponse.redirect(new URL('/', request.url));
	}
}

export const config = {
	matcher: ['/api/v1/:path*', '/login', '/'],
};
