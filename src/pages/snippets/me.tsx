import { GetServerSideProps } from 'next';
import { useState, useEffect } from "react";
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
}

export default function SnippetsPage({ initialSnippets, hasInitialData }: SnippetsPageProps) {
    const { user, isAuthLoading } = useAuth();
    const [snippets, setSnippets] = useState<ISnippet[]>(initialSnippets);
    const [snippetsLoading, setSnippetsLoading] = useState(false);

    useEffect(() => {
        const revalidateSnippets = async () => {
            if (!user || isAuthLoading) return;

            if (!hasInitialData) {
                setSnippetsLoading(true);
                try {
                    const response = await authenticatedApiCall(
                        `/api/snippets?limit=100`,
                        user
                    );
                    setSnippets(response.snippets || []);
                } catch (error) {
                    console.error('Error fetching snippets:', error);
                } finally {
                    setSnippetsLoading(false);
                }
            }
        };

        revalidateSnippets();
    }, [user, isAuthLoading, hasInitialData]);

    return (
        <>
            <SeoMetaHead pageTitle="My Snippets | CodeSnippet" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <SnippetsList snippets={snippets} snippetsLoading={snippetsLoading} isAll={true} showAuthor={false} />
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        await connectDB();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = await getCurrentUser(context.req as any);

        let snippets: ISnippet[] = [];
        let hasInitialData = false;

        if (user) {
            try {
                snippets = await Snippet.find({ author: user._id })
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
                hasInitialData
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