import { useState, useEffect } from 'react';
import { Loading, LoginRequire, SnippetsList } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { authenticatedApiCall } from '@/lib/api';
import { ISnippet } from '@/models/Snippet';
import Link from 'next/link';
import SeoMetaHead from '@/components/layout/SeoMetaHead';

export default function Home() {
  const { user, isAuthLoading, logout } = useAuth();
  const { t } = useTranslation();
  const [snippets, setSnippets] = useState<ISnippet[]>([]);
  const [snippetsLoading, setSnippetsLoading] = useState(false);

  useEffect(() => {
    const fetchUserSnippets = async () => {
      if (!user) return;

      setSnippetsLoading(true);
      try {
        const response = await authenticatedApiCall(
          `/api/snippets?limit=5`,
          user
        );
        setSnippets(response.snippets || []);
      } catch (error) {
        console.error('Error fetching snippets:', error);
      } finally {
        setSnippetsLoading(false);
      }
    };

    fetchUserSnippets();
  }, [user]);

  if (isAuthLoading) {
    return (
      <Loading />
    );
  }

  return (
    <>
      <SeoMetaHead pageTitle={`${t('dashboard.title')} | ${t('app.title')}`} />
      {user ? (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900`}>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center space-x-4 mb-8">
              <span className="text-gray-700 dark:text-gray-300">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Đăng xuất
              </button>
            </div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('dashboard.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('dashboard.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.codeSnippets')}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{snippets.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.tags')}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {snippets.reduce((acc, snippet) => acc + snippet.tags.length, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.views')}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('dashboard.quickActions')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
                <Link
                  href="/snippets/create"
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.createSnippet')}</p>
                  </div>
                </Link>

                <Link href="/snippets/me" className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.manageTags')}</p>
                  </div>
                </Link>

                <Link href={`/user/${user?._id}`} className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.profile')}</p>
                  </div>
                </Link>
              </div>
            </div>

            <SnippetsList snippets={snippets} snippetsLoading={snippetsLoading} isAll={false} showAuthor={true} />
          </main>
        </div>
      ) : (
        <LoginRequire />
      )}
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