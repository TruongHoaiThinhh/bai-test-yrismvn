import { GetServerSideProps } from 'next';
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { ISnippet } from "@/models/Snippet";
import { IUser } from "@/models/User";
import { SnippetsList } from "@/components";
import { useAuth } from "@/hooks/useAuth";
import { authenticatedApiCall } from "@/lib/api";
import connectDB from "@/lib/mongodb";
import Snippet from "@/models/Snippet";
import User from "@/models/User";
import SeoMetaHead from '@/components/layout/SeoMetaHead';
import Link from 'next/link';

interface UserProfilePageProps {
    user: IUser | null;
    initialSnippets: ISnippet[];
    hasInitialData: boolean;
    error?: string;
}

export default function UserProfilePage({ user, initialSnippets, hasInitialData, error }: UserProfilePageProps) {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [snippets, setSnippets] = useState<ISnippet[]>(initialSnippets);
    const [snippetsLoading, setSnippetsLoading] = useState(false);

    useEffect(() => {
        const revalidateSnippets = async () => {
            if (!user || hasInitialData) return;

            setSnippetsLoading(true);
            try {
                const response = await authenticatedApiCall(
                    `/api/snippets?author=${user._id}&limit=100`,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    currentUser as any
                );
                setSnippets(response.snippets || []);
            } catch (error) {
                console.error('Error fetching user snippets:', error);
            } finally {
                setSnippetsLoading(false);
            }
        };

        revalidateSnippets();
    }, [user, hasInitialData, currentUser]);

    if (error) {
        return (
            <>
                <SeoMetaHead pageTitle="User Not Found | CodeSnippet" />
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy người dùng</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </>
        );
    }

    if (!user) {
        return (
            <>
                <SeoMetaHead pageTitle="Loading... | CodeSnippet" />
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Đang tải...</p>
                    </div>
                </div>
            </>
        );
    }

    const isOwnProfile = currentUser && currentUser._id === user._id;

    return (
        <>
            <SeoMetaHead pageTitle={`${user.name || user.email} | CodeSnippet`} />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* User Profile Header */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                        <div className="flex items-start space-x-6">
                            <div className="flex-shrink-0">
                                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {user.name || 'Người dùng'}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {user.email}
                                </p>
                                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center space-x-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>{snippets.length} snippets</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>Tham gia {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Snippets Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {isOwnProfile ? (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        (Snippets của tôi)
                                    </span>
                                ) : (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        (Snippets của {user.name || 'người dùng này'})
                                    </span>
                                )}
                            </h2>
                            {snippets.length > 0 && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {snippets.length} snippet{snippets.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {snippetsLoading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Đang tải snippets...</p>
                            </div>
                        ) : snippets.length > 0 ? (
                            <div className="space-y-4">
                                {snippets.map((snippet) => (
                                    <Link key={snippet._id as string} href={`/snippets/${snippet._id}`}>
                                        <div key={snippet._id as string} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                        <Link
                                                            href={`/snippets/${snippet._id}`}
                                                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                        >
                                                            {snippet.title}
                                                        </Link>
                                                    </h3>
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
                                                <Link
                                                    href={`/snippets/${snippet._id}`}
                                                    className="ml-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
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
                                    {user.name || 'Người dùng này'} chưa có snippet nào
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        await connectDB();

        const { id } = context.params as { id: string };

        if (!id) {
            return {
                props: {
                    user: null,
                    initialSnippets: [],
                    hasInitialData: false,
                    error: "ID người dùng không hợp lệ"
                }
            };
        }

        const user = await User.findById(id).select('-password');

        if (!user) {
            return {
                props: {
                    user: null,
                    initialSnippets: [],
                    hasInitialData: false,
                    error: "Không tìm thấy người dùng"
                }
            };
        }

        let snippets: ISnippet[] = [];
        let hasInitialData = false;

        try {
            snippets = await Snippet.find({ author: user._id })
                .sort({ createdAt: -1 })
                .limit(100)
                .select('-__v');
            hasInitialData = true;
        } catch (error) {
            console.error('Error fetching user snippets in SSR:', error);
        }

        return {
            props: {
                user: JSON.parse(JSON.stringify(user)),
                initialSnippets: JSON.parse(JSON.stringify(snippets)),
                hasInitialData
            }
        };
    } catch (error) {
        console.error('Error in getServerSideProps:', error);
        return {
            props: {
                user: null,
                initialSnippets: [],
                hasInitialData: false,
                error: "Có lỗi xảy ra khi tải trang"
            }
        };
    }
};
