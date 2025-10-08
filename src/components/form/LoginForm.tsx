import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import SeoMetaHead from "../layout/SeoMetaHead";
import Link from "next/link";

interface LoginFormProps {
    isLoading: boolean;
    error: string;
    handleLogin: (email: string, password: string) => void;
}

const LoginForm = ({ isLoading, error, handleLogin }: LoginFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { t } = useTranslation();

    const handleSubmitForm = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin(email, password);
    }

    return (
        <>
            <SeoMetaHead pageTitle={t('auth.loginButton') + ' | CodeSnippet'} />
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('app.title')}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t('auth.loginDescription')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmitForm} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('auth.email')}
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('auth.password')}
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {isLoading ? t('auth.loginLoading') : t('auth.loginButton')}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            {t('auth.noAccount')}{' '}
                            <Link
                                href="/register"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                {t('auth.registerNow')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LoginForm;