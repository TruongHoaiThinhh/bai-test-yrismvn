import { useState } from 'react';
import { useRouter } from 'next/router';
import { LoginForm } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function LoginScreen() {
    const { login, isAuthLoading } = useAuth();
    const {user} = useAuth();
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (email: string, password: string) => {
        setError('');
        try {
            await login(email, password);
            router.push('/');
        } catch (e) {
            console.log(e);
            setError((e as Error).message || 'Đăng nhập thất bại');
        }
    };

    if (user) {
        router.push('/');
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4`}>
            <LoginForm isLoading={isAuthLoading} error={error} handleLogin={handleLogin} />
        </div>
    );
}

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'vi', ['common'])),
        },
    };
}