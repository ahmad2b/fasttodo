import { ToDoCreate } from '@/components/todo-create';
import { ToDoList } from '@/components/todo-list';

export default function Home() {
	return (
		<div className='flex flex-col items-center py-6 max-w-7xl mx-auto space-y-8 md:space-y-12'>
			<div className='flex flex-col items-center'>
				<h1 className='scroll-m-10 text-3xl font-extrabold tracking-tight md:text-4xl  lg:text-5xl text-stone-800'>
					Welcome to Fast Todo
				</h1>
				<p className='leading-7 mt-4 text-lg text-stone-700'>
					Create your todo&apos;s and let&apos;s karate chop your tasks. 🥋
				</p>
			</div>

			<div className='flex flex-col lg:flex-row gap-4 lg:gap-8 w-full'>
				<div className='w-full lg:w-1/2'>
					<ToDoCreate />
				</div>
				<div className='w-full lg:w-2/3'>
					<ToDoList />
				</div>
			</div>
		</div>
	);
}
