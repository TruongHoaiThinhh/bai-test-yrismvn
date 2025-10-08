import { useState } from 'react';
import { useRouter } from 'next/router';
import { RegisterForm } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SeoMetaHead from '@/components/layout/SeoMetaHead';
import { useTranslation } from '@/hooks/useTranslation';

export default function RegisterScreen() {
    const { register, isAuthLoading } = useAuth();
    const [error, setError] = useState('');
    const router = useRouter();
    const { t } = useTranslation();

    const handleRegister = async (formData: { name: string; email: string; password: string; confirmPassword: string }) => {
        setError('');
        try {
            await register(formData);
            router.push('/');
        } catch (e) {
            console.log(e);
            setError((e as Error).message || 'Đăng ký thất bại');
        }
    };

    return (
        <>
            <SeoMetaHead pageTitle={t('auth.registerButton') + ' | CodeSnippet'} />
            <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4`}>
                <RegisterForm isLoading={isAuthLoading} error={error} handleRegister={handleRegister} />
            </div>
        </>

    );

}


export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'vi', ['common'])),
        },
    };
}