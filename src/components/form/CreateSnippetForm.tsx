import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import AlgorithmAnalyzer from '@/components/common/AlgorithmAnalyzer';

interface CreateSnippetFormProps {
    onSubmit: (form: FormCreateSnippetState) => void;
    error: string | null;
    submitting: boolean;
}

type FormCreateSnippetState = {
    title: string;
    description: string;
    code: string;
    tags: string;
    programmingLanguage: string;
};

const CreateSnippetForm = ({ onSubmit, error, submitting }: CreateSnippetFormProps) => {
    const { t } = useTranslation();
    const [form, setForm] = useState<FormCreateSnippetState>({
        title: "",
        description: "",
        code: "",
        tags: "",
        programmingLanguage: "typescript",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    const onChange = (key: keyof FormCreateSnippetState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((s) => ({ ...s, [key]: e.target.value }));
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {t("snippets.create.title")}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Tạo và chia sẻ code snippets của bạn
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t("snippets.fields.title") + "*"}
                        </label>
                        <input
                            value={form.title}
                            onChange={onChange("title")}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder={t("snippets.placeholders.title")}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t("snippets.fields.description") + "*"}
                        </label>
                        <textarea
                            value={form.description}
                            onChange={onChange("description")}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder={t("snippets.placeholders.description")}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t("snippets.fields.code") + "*"}
                        </label>
                        <textarea
                            value={form.code}
                            onChange={onChange("code")}
                            rows={10}
                            className="w-full font-mono px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder={t("snippets.placeholders.code")}
                            required
                        />

                        {/* Algorithm Analyzer */}
                        {form.code && (
                            <div className="mt-4">
                                <AlgorithmAnalyzer 
                                    code={form.code} 
                                    language={form.programmingLanguage}
                                    showDetails={false}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t("snippets.fields.tags")}
                            </label>
                            <input
                                value={form.tags}
                                onChange={onChange("tags")}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                                placeholder={t("snippets.placeholders.tags")}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t("snippets.fields.language")}
                            </label>
                            <select
                                value={form.programmingLanguage}
                                onChange={onChange("programmingLanguage")}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
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
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {submitting ? t("snippets.create.submitting") : t("snippets.create.submit")}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setForm({
                                    title: "",
                                    description: "",
                                    code: "",
                                    tags: "",
                                    programmingLanguage: "typescript",
                                })
                            }
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            {t("snippets.create.reset")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSnippetForm;