import { LogIn, Plus, LogOut } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';
import { Nav } from './nav';
import { cookies } from 'next/headers';
import { logout } from './action';

const Navbar = () => {
	const cookieStore = cookies();
	const token = cookieStore.get('access_token')?.value;

	return (
		<Nav>
			<ul className='block lg:flex lg:space-x-4 space-y-2 lg:space-y-0 px-2 py-1 h-11'>
				<li>
					<Link
						href={'/'}
						className={cn(
							buttonVariants({
								variant: 'outline',
								className:
									'flex py-2 h-9 text-base text-fuchsia-950 hover:text-fuchsia-900 hover:bg-fuchsia-950/10 font-medium space-x-2 px-6',
							})
						)}
					>
						<p>Todo</p>
						<Plus />
					</Link>
				</li>

				<li className={cn(token ? 'hidden' : 'block')}>
					<Link
						href={'/login'}
						className={cn(
							buttonVariants({
								variant: 'outline',
								className:
									'flex py-2 h-9 text-base text-fuchsia-950 hover:text-fuchsia-900 hover:bg-fuchsia-950/10 font-medium space-x-2 px-6',
							})
						)}
					>
						<p>Login</p>
						<LogIn />
					</Link>
				</li>
				<li className={cn(token ? 'block' : 'hidden')}>
					<form action={logout}>
						<button
							// href={'/'}
							className={cn(
								buttonVariants({
									variant: 'outline',
									className:
										'flex py-2 w-full text-base text-fuchsia-950 hover:text-fuchsia-900 hover:bg-fuchsia-950/10 font-medium space-x-2 px-6',
								})
							)}
						>
							<p>Logout</p>
							<LogOut />
						</button>
					</form>
				</li>
			</ul>
		</Nav>
	);
};

export default Navbar;
