import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { ISnippet } from '@/models/Snippet';
import { useAuth } from '@/hooks/useAuth';
import SeoMetaHead from '@/components/layout/SeoMetaHead';
import { copyLinkToClipboard, copyToClipboard, shareToSocial } from '@/helper';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import Snippet from '@/models/Snippet';
import AlgorithmAnalyzer from '@/components/common/AlgorithmAnalyzer';
import { useTranslation } from '@/hooks/useTranslation';

interface SnippetPageProps {
    snippet: ISnippet;
}

export default function SnippetPage({ snippet: initialSnippet }: SnippetPageProps) {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const [snippet, setSnippet] = useState<ISnippet>(initialSnippet);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: snippet.title,
        description: snippet.description || '',
        code: snippet.code,
        tags: snippet.tags.join(', '),
        programmingLanguage: snippet.programmingLanguage
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const { t } = useTranslation();
    const isOwner = user && snippet.author?._id.toString() === user._id.toString();

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({
            title: snippet.title,
            description: snippet.description || '',
            code: snippet.code,
            tags: snippet.tags.join(', '),
            programmingLanguage: snippet.programmingLanguage
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/snippets/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: editData.title,
                    description: editData.description,
                    code: editData.code,
                    tags: editData.tags,
                    programmingLanguage: editData.programmingLanguage
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Cập nhật thất bại');
            }

            const updatedSnippet = await response.json();
            setSnippet(updatedSnippet);
            setIsEditing(false);
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/snippets/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Xóa thất bại');
            }

            router.push('/snippets');
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setLoading(false);
        }
    };




    const generateShareableUrls = () => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const snippetUrl = `${baseUrl}/snippets/${id}`;

        return {
            snippet: snippetUrl,
            tags: snippet.tags.map(tag => ({
                tag,
                url: `${baseUrl}/snippets?tag=${encodeURIComponent(tag)}`
            }))
        };
    };

    return (
        <>
            <SeoMetaHead pageTitle={snippet.title + ' | CodeSnippet'} />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.title}
                                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                            className="w-full text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                                        />
                                    ) : (
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            {snippet.title}
                                        </h1>
                                    )}

                                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                            {snippet.programmingLanguage}
                                        </span>
                                        <span>
                                            {new Date(snippet.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                        {snippet.updatedAt !== snippet.createdAt && (
                                            <span>
                                                Cập nhật: {new Date(snippet.updatedAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        )}
                                    </div>



                                    {snippet.tags.length > 0 && (
                                        <div className="flex items-center space-x-2 mb-4">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            <div className="flex flex-wrap gap-2">
                                                {snippet.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                        onClick={() => router.push(`/snippets?tag=${encodeURIComponent(tag)}`)}
                                                        title={`Xem tất cả snippets với tag "${tag}"`}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>



                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setShowShareModal(true)}
                                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                        </svg>
                                        <span>Chia sẻ</span>
                                    </button>

                                    {isOwner && (
                                        <div className="flex items-center space-x-2">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={handleSave}
                                                        disabled={loading}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                                                    >
                                                        {loading ? 'Đang lưu...' : 'Lưu'}
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEditing(false)}
                                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                    >
                                                        Hủy
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={handleEdit}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                    >
                                                        Chỉnh sửa
                                                    </button>
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(true)}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                    >
                                                        Xóa
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Mô tả
                                    </label>
                                    <textarea
                                        value={editData.description}
                                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Mô tả snippet..."
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Ngôn ngữ lập trình
                                            </label>
                                            <select
                                                value={editData.programmingLanguage}
                                                onChange={(e) => setEditData({ ...editData, programmingLanguage: e.target.value })}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="javascript">JavaScript</option>
                                                <option value="typescript">TypeScript</option>
                                                <option value="python">Python</option>
                                                <option value="java">Java</option>
                                                <option value="cpp">C++</option>
                                                <option value="csharp">C#</option>
                                                <option value="php">PHP</option>
                                                <option value="ruby">Ruby</option>
                                                <option value="go">Go</option>
                                                <option value="rust">Rust</option>
                                                <option value="swift">Swift</option>
                                                <option value="kotlin">Kotlin</option>
                                                <option value="html">HTML</option>
                                                <option value="css">CSS</option>
                                                <option value="sql">SQL</option>
                                                <option value="bash">Bash</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Tags (phân cách bằng dấu phẩy)
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.tags}
                                                onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="react, hooks, state"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                snippet.description && (
                                    <p className="text-gray-600 dark:text-gray-400 mt-4">
                                        {snippet.description}
                                    </p>
                                )
                            )}
                            
                            {/* Author Information */}
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Tác giả</p>
                                        <Link 
                                            href={`/user/${snippet?.author?._id || snippet?.author}`} 
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                                        >
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {(snippet?.author as any).name || (snippet?.author as any).email || t('snippets.author')}
                                            {/* {snippet?.author?.name || snippet?.author?.email || t('snippets.author')} */}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>



                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Code
                                </h3>
                                <button
                                    onClick={() => copyToClipboard(snippet.code)}
                                    className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <span>Sao chép</span>
                                </button>
                            </div>

                            {isEditing ? (
                                <textarea
                                    value={editData.code}
                                    onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={20}
                                    placeholder="Nhập code của bạn..."
                                />
                            ) : (
                                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                                    <code className="text-sm text-gray-900 dark:text-white font-mono">
                                        {snippet.code}
                                    </code>
                                </pre>
                            )}

                            {/* Algorithm Analyzer */}
                            {!isEditing && (
                                <div className="mt-6">
                                    <AlgorithmAnalyzer 
                                        code={snippet.code} 
                                        language={snippet.programmingLanguage}
                                        showDetails={true}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-between">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Quay lại</span>
                        </button>
                    </div>
                </div>
                {showShareModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Chia sẻ snippet
                            </h3>

                            {(() => {
                                const shareableUrls = generateShareableUrls();
                                return (
                                    <>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Link snippet
                                            </label>
                                            <div className="flex">
                                                <input
                                                    type="text"
                                                    value={shareableUrls.snippet}
                                                    readOnly
                                                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                                />
                                                <button
                                                    onClick={() => copyLinkToClipboard(shareableUrls.snippet)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-r-lg text-sm transition-colors"
                                                >
                                                    Sao chép
                                                </button>
                                            </div>
                                        </div>

                                        {shareableUrls.tags.length > 0 && (
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                    Links theo tags
                                                </label>
                                                <div className="space-y-3">
                                                    {shareableUrls.tags.map((tagData, index) => (
                                                        <div key={index} className="flex">
                                                            <div className="flex-1">
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                                    Tag: {tagData.tag}
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={tagData.url}
                                                                    readOnly
                                                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => copyLinkToClipboard(tagData.url)}
                                                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-r-lg text-sm transition-colors"
                                                            >
                                                                Sao chép
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                Chia sẻ qua mạng xã hội
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => shareToSocial('facebook', shareableUrls.snippet, snippet.title)}
                                                    className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                    </svg>
                                                    <span>Facebook</span>
                                                </button>

                                                <button
                                                    onClick={() => shareToSocial('twitter', shareableUrls.snippet, snippet.title)}
                                                    className="flex items-center justify-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                                    </svg>
                                                    <span>Twitter</span>
                                                </button>

                                                <button
                                                    onClick={() => shareToSocial('linkedin', shareableUrls.snippet, snippet.title)}
                                                    className="flex items-center justify-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                    </svg>
                                                    <span>LinkedIn</span>
                                                </button>

                                                <button
                                                    onClick={() => shareToSocial('telegram', shareableUrls.snippet, snippet.title)}
                                                    className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                                    </svg>
                                                    <span>Telegram</span>
                                                </button>

                                                <button
                                                    onClick={() => shareToSocial('whatsapp', shareableUrls.snippet, snippet.title)}
                                                    className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                                                    </svg>
                                                    <span>WhatsApp</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}

                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Xác nhận xóa
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Bạn có chắc chắn muốn xóa snippet {snippet.title}? Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Đang xóa...' : 'Xóa'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>

    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params!;

    try {
        await connectDB();
        
        const snippet = await Snippet.findById(id)
            .populate('author', 'name email')
            .select('-__v');

        if (!snippet) {
            return {
                notFound: true,
            };
        }

        return {
            props: {
                snippet: JSON.parse(JSON.stringify(snippet)),
            },
        };
    } catch (error) {
        console.error('Error fetching snippet:', error);
        return {
            notFound: true,
        };
    }
};