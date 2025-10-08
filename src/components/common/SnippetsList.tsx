import { useRouter } from 'next/router';
import { ISnippet } from '@/models/Snippet';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

interface SnippetsListProps {
    snippets: ISnippet[];
    snippetsLoading: boolean;
    isAll: boolean;
    showAuthor?: boolean;
}

const SnippetsList = ({ snippets, snippetsLoading, isAll, showAuthor = true }: SnippetsListProps) => {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                {!isAll && (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('snippetsList.recentSnippets')}
                    </h3>
                )
                }
                {snippets.length > 0 && !isAll && (
                    <button
                        onClick={() => router.push('/snippets')}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {t('snippetsList.viewAll')}
                    </button>
                )}
            </div>

            {snippetsLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">{t('snippetsList.loading')}</p>
                </div>
            ) : snippets.length > 0 ? (
                <div className="space-y-4">
                    {snippets.map((snippet) => (
                        <Link key={snippet._id as string} href={`/snippets/${snippet._id}`}>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            {snippet.title}
                                        </h4>
                                        {snippet.description && (
                                            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                {snippet.description}
                                            </p>
                                        )}
                                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                                {snippet.programmingLanguage}
                                            </span>
                                            <span>
                                                {new Date(snippet.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                            {showAuthor && snippet.author && (
                                                <div className="flex items-center space-x-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <Link 
                                                        href={`/user/${snippet.author._id || snippet.author}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    >
                                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                        {(snippet.author as any).name || (snippet.author as any).email || t('snippetsList.user')}
                                                        {/* {snippet.author.name || snippet.author.email || t('snippetsList.user')} */}
                                                    </Link>
                                                </div>
                                            )}
                                            {snippet.tags.length > 0 && (
                                                <div className="flex items-center space-x-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                    <span>{snippet.tags.slice(0, 3).join(', ')}</span>
                                                    {snippet.tags.length > 3 && <span>+{snippet.tags.length - 3}</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/snippets/${snippet._id}`)}
                                        className="ml-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {t('snippetsList.noSnippets')}
                    </p>
                    <button
                        onClick={() => router.push('/snippets/create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        {t('snippetsList.createFirstSnippet')}
                    </button>
                </div>
            )
            }
        </div >
    );
}

export default SnippetsList;
