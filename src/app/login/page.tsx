import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/login-form';
import { SignupForm } from '@/components/signup-form';

const page = () => {
	return (
		<div className='flex-1 flex flex-col items-center justify-center h-full py-8 md:py-10'>
			<Tabs
				defaultValue='login'
				className='min-w-[320px] w-full max-w-[400px]'
			>
				<TabsList className='grid w-full grid-cols-2'>
					<TabsTrigger value='login'>Login</TabsTrigger>
					<TabsTrigger value='signup'>Signup</TabsTrigger>
				</TabsList>
				<TabsContent value='login'>
					<LoginForm />
				</TabsContent>
				<TabsContent value='signup'>
					<SignupForm />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default page;
