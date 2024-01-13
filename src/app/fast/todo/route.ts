import { NextRequest, NextResponse } from 'next/server';
import { TodoRequest } from '@/lib/type';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { TodoValidator } from '@/components/todo-create';

export async function GET(req: NextRequest) {
	const cookieStore = cookies();
	const access_token = cookieStore.get('access_token');

	if (!access_token?.value) {
		return NextResponse.json('Unauthorized', {
			status: 401,
		});
	}

	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todos`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + access_token.value || '',
		},
	});

	if (response.status === 401) {
		return NextResponse.json({
			message: 'Unauthorized',
		});
	}

	const json = await response.json();

	if (!response.ok) {
		return NextResponse.json({
			message: json.message,
		});
	}

	return NextResponse.json(json, {
		status: 200,
		statusText: 'OK',
	});
}

export async function POST(req: NextRequest) {
	const body = await req.json();
	const cookieStore = cookies();
	const access_token = cookieStore.get('access_token');

	if (!access_token?.value) {
		return NextResponse.json('Unauthorized', {
			status: 401,
		});
	}

	const parsedData: TodoRequest = {
		title: body.title,
		description: body.description,
		completed: body.completed,
	};

	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todos`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + access_token.value || '',
		},
		body: JSON.stringify(parsedData),
		cache: 'no-store',
	});

	if (response.status === 401) {
		return NextResponse.json({
			message: 'Unauthorized',
		});
	}

	const json = await response.json();

	if (!response.ok) {
		return NextResponse.json({
			message: json.message,
		});
	}
	revalidatePath('/');

	return NextResponse.json(json, {
		status: 200,
		statusText: 'OK',
	});
}
