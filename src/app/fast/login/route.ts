import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
	const body = await req.json();

	if (!body.username || !body.password) {
		return NextResponse.json('Missing credentials', {
			status: 401,
			statusText: 'Missing credentials',
		});
	}

	const parsedData = {
		username: body.username,
		password: body.password,
	};

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/user/login`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(parsedData),
		}
	);

	if (response.status === 401 || response.status === 400) {
		return NextResponse.json('Unauthorized', {
			status: 401,
			statusText: 'Unauthorized',
		});
	}

	const data = await response.json();

	const res = new NextResponse(JSON.stringify(data), {
		status: 200,
		statusText: 'OK',
	});

	const tokenMaxAge = 30 * 60;

	const cookieOptions = {
		name: 'access_token',
		value: data.access_token,
		maxAge: tokenMaxAge,
		httpOnly: true,
		path: '/',
		secure: process.env.NODE_ENV === 'production',
	};
	await Promise.all([res.cookies.set(cookieOptions)]);
	return res;
}
