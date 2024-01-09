'use client';
import { useState } from 'react';
import { Bolt, Menu, X } from 'lucide-react';
import Link from 'next/link';

export const Nav = ({ children }: { children: React.ReactNode }) => {
	const [open, setOpen] = useState(false);

	return (
		<header className={`flex w-full items-center bg-transparent`}>
			<div className='container py-2'>
				<div className='relative -mx-4 flex items-center justify-between'>
					<div className='w-60 max-w-full px-4'>
						<Link href={'/'}>
							<Bolt className='text-fuchsia-950 md:h-10 md:w-10 h-8 w-8' />
						</Link>
					</div>
					<div className='flex items-center justify-between px-4'>
						<div>
							<button
								onClick={() => setOpen(!open)}
								id='navbarToggler'
								className={` ${
									open && 'navbarTogglerActive'
								} absolute right-4 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-fuchsia-950 ring-offset-2 transition-all duration-300 ease-in-out hover:bg-fuchsia-950 hover:text-white focus:outline-none focus-visible:ring-2 lg:hidden`}
							>
								{open ? (
									<X
										size={24}
										className='text-fuchsia-950'
									/>
								) : (
									<Menu
										size={24}
										className='text-fuchsia-950'
									/>
								)}
							</button>
							<nav
								id='navbarCollapse'
								className={`absolute right-4 top-full w-full max-w-[250px] rounded-lg px-6 py-5 shadow bg-white/95 lg:bg-transparent lg:static lg:block lg:w-full lg:max-w-full lg:shadow-none lg:dark:bg-transparent ${
									!open && 'hidden'
								} `}
							>
								{children}
							</nav>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};
