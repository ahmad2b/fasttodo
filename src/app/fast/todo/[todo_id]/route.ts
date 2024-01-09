import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

interface TodoParams {
	params: {
		todo_id: string;
	};
}

export async function PUT(req: NextRequest, { params }: TodoParams) {
	const todo_id = params.todo_id;

	if (!todo_id) {
		return NextResponse.json('Missing Todo ID', {
			status: 400,
			statusText: 'Bad Request',
		});
	}

	const body = await req.json();

	const parsedData = {
		title: body.title,
		description: body.description,
		completed: body.completed,
	};

	if (!body.title || !body.description) {
		console.log('PUT REQ MISSING', parsedData);
		return NextResponse.json('Missing Todo Data', {
			status: 400,
			statusText: 'Bad Request',
		});
	}

	const cookieStore = cookies();
	const access_token = cookieStore.get('access_token')?.value;

	if (!access_token) {
		return NextResponse.json('Unauthorized', {
			status: 401,
		});
	}

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/todos/${todo_id}`,
		{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + access_token || '',
			},
			body: JSON.stringify(parsedData),
			cache: 'no-store',
		}
	);

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

export async function DELETE(req: NextRequest, { params }: TodoParams) {
	const todo_id = params.todo_id;
	const cookieStore = cookies();
	const access_token = cookieStore.get('access_token')?.value;

	console.log('DEL ID', todo_id);
	console.log('ACCESS TOKEN', access_token);

	if (!access_token) {
		return NextResponse.json('Unauthorized', {
			status: 401,
		});
	}

	if (!todo_id) {
		return NextResponse.json('Missing todo id', {
			status: 400,
			statusText: 'Missing id',
		});
	}

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/todos/${todo_id}`,
		{
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + access_token || '',
			},
			cache: 'no-store',
		}
	);

	console.log('DEL RESPONSE', response.status);

	if (response.status === 401) {
		return NextResponse.json('Unauthorized', {
			status: 401,
		});
	}

	const json = await response.json();

	if (!response.ok) {
		return NextResponse.json(json, {
			status: 400,
			statusText: 'Bad Request',
		});
	}
	revalidatePath('/');

	return NextResponse.json(json, {
		status: 204,
		statusText: 'OK',
	});
}
