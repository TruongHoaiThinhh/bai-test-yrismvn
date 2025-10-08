import { GetServerSideProps } from 'next';
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { ISnippet } from "@/models/Snippet";
import { SnippetsList } from "@/components";
import { useAuth } from "@/hooks/useAuth";
import { authenticatedApiCall } from "@/lib/api";
import connectDB from "@/lib/mongodb";
import Snippet from "@/models/Snippet";
import { getCurrentUser } from "@/lib/auth";
import SeoMetaHead from '@/components/layout/SeoMetaHead';

interface SnippetsPageProps {
    initialSnippets: ISnippet[];
    hasInitialData: boolean;
    tag?: string;
}

export default function SnippetsPage({ initialSnippets, hasInitialData, tag }: SnippetsPageProps) {
    const { user, isAuthLoading } = useAuth();
    const router = useRouter();
    const [snippets, setSnippets] = useState<ISnippet[]>(initialSnippets);
    const [snippetsLoading, setSnippetsLoading] = useState(false);

    useEffect(() => {
        const revalidateSnippets = async () => {
            if (!user || isAuthLoading) return;

            if (!hasInitialData) {
                setSnippetsLoading(true);
                try {
                    const url = tag 
                        ? `/api/snippets?tag=${encodeURIComponent(tag)}&limit=100`
                        : `/api/snippets?limit=100`;
                    const response = await authenticatedApiCall(url, user);
                    setSnippets(response.snippets || []);
                } catch (error) {
                    console.error('Error fetching snippets:', error);
                } finally {
                    setSnippetsLoading(false);
                }
            }
        };

        revalidateSnippets();
    }, [user, isAuthLoading, hasInitialData, tag]);

    const pageTitle = tag ? `Snippets với tag "${tag}" | CodeSnippet` : "Snippets | CodeSnippet";

    return (
        <>
            <SeoMetaHead pageTitle={pageTitle} />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {tag && (
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Snippets với tag: <span className="text-blue-600 dark:text-blue-400">#{tag}</span>
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        Tìm thấy {snippets.length} snippet(s)
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push('/snippets')}
                                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span>Xóa filter</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <SnippetsList snippets={snippets} snippetsLoading={snippetsLoading} isAll={true} showAuthor={true} />
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        await connectDB();

        const { tag } = context.query;
        const tagFilter = tag ? String(tag) : undefined;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = await getCurrentUser(context.req as any);

        let snippets: ISnippet[] = [];
        let hasInitialData = false;

        if (user) {
            try {
                const query = tagFilter ? { tags: { $in: [tagFilter] } } : {};
                snippets = await Snippet.find(query)
                    .populate('author', 'name email')
                    .sort({ createdAt: -1 })
                    .limit(100)
                    .select('-__v');
                hasInitialData = true;
            } catch (error) {
                console.error('Error fetching user snippets in SSR:', error);
            }
        }

        return {
            props: {
                initialSnippets: JSON.parse(JSON.stringify(snippets)),
                hasInitialData,
                ...(tagFilter && { tag: tagFilter })
            }
        };
    } catch (error) {
        console.error('Error in getServerSideProps:', error);
        return {
            props: {
                initialSnippets: [],
                hasInitialData: false
            }
        };
    }
};