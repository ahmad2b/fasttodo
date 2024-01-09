import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'FastTodo App',
	description: 'A Fullstack todo app built with Next.js and FastAPI',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en'>
			<body
				className={cn(
					'bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-fuchsia-300 via-green-400 to-rose-700 min-h-screen h-full flex flex-col',
					inter.className
				)}
			>
				<main className='flex-1 px-2 sm:px-4 md:px-8'>{children}</main>
				<Toaster />
			</body>
		</html>
	);
}
