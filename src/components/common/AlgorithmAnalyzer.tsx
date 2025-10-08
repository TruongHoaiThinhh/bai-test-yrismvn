import { useState, useEffect } from 'react';

interface ComplexityResult {
    timeComplexity: string;
    spaceComplexity: string;
    explanation: string;
    confidence: number;
}

interface AlgorithmAnalyzerProps {
    code: string;
    language: string;
    showDetails?: boolean;
}

const AlgorithmAnalyzer = ({ code, language, showDetails = false }: AlgorithmAnalyzerProps) => {
    const [analysis, setAnalysis] = useState<ComplexityResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const analyzeCode = (codeString: string, lang: string): ComplexityResult => {
        const normalizedCode = codeString.toLowerCase().replace(/\s+/g, ' ');
        let timeComplexity = 'O(1)';
        let spaceComplexity = 'O(1)';
        let explanation = 'Thuật toán đơn giản không có vòng lặp phức tạp';
        let confidence = 0.5;

        const patterns = [
            // Nested loops - O(n²)
            {
                regex: /for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)\s*\{/,
                time: 'O(n²)',
                space: 'O(1)',
                explanation: 'Phát hiện vòng lặp lồng nhau - độ phức tạp bậc hai',
                confidence: 0.9
            },
            // Single loop - O(n)
            {
                regex: /for\s*\([^)]*\)\s*\{|while\s*\([^)]*\)\s*\{/,
                time: 'O(n)',
                space: 'O(1)',
                explanation: 'Phát hiện vòng lặp đơn - độ phức tạp tuyến tính',
                confidence: 0.8
            },
            // Binary search - O(log n)
            {
                regex: /(left\s*=\s*0|right\s*=\s*length|mid\s*=\s*\(left\s*\+\s*right\)|while\s*\(left\s*<=\s*right\))/,
                time: 'O(log n)',
                space: 'O(1)',
                explanation: 'Phát hiện thuật toán tìm kiếm nhị phân',
                confidence: 0.85
            },
            // Recursion - O(2^n) hoặc O(n)
            {
                regex: /function\s+\w+\s*\([^)]*\)\s*\{[^}]*\w+\s*\([^)]*\)/,
                time: 'O(2^n)',
                space: 'O(n)',
                explanation: 'Phát hiện đệ quy - có thể có độ phức tạp hàm mũ',
                confidence: 0.7
            },
            // Sorting algorithms
            {
                regex: /(bubble\s*sort|selection\s*sort|insertion\s*sort)/,
                time: 'O(n²)',
                space: 'O(1)',
                explanation: 'Thuật toán sắp xếp đơn giản',
                confidence: 0.95
            },
            {
                regex: /(merge\s*sort|quick\s*sort|heap\s*sort)/,
                time: 'O(n log n)',
                space: 'O(n)',
                explanation: 'Thuật toán sắp xếp hiệu quả',
                confidence: 0.95
            },
            // Tree traversal
            {
                regex: /(dfs|bfs|depth.*first|breadth.*first)/,
                time: 'O(n)',
                space: 'O(h)',
                explanation: 'Duyệt cây - h là chiều cao cây',
                confidence: 0.85
            },
            // Hash table operations
            {
                regex: /(map|hash|object|dictionary)/,
                time: 'O(1)',
                space: 'O(n)',
                explanation: 'Sử dụng cấu trúc dữ liệu hash',
                confidence: 0.6
            }
        ];

        for (const pattern of patterns) {
            if (pattern.regex.test(normalizedCode)) {
                timeComplexity = pattern.time;
                spaceComplexity = pattern.space;
                explanation = pattern.explanation;
                confidence = pattern.confidence;
                break;
            }
        }

        const loopCount = (normalizedCode.match(/for\s*\(|while\s*\(/g) || []).length;
        if (loopCount > 1 && timeComplexity === 'O(1)') {
            timeComplexity = 'O(n)';
            explanation = 'Nhiều vòng lặp được phát hiện';
            confidence = 0.6;
        }

        if (normalizedCode.includes('array') || normalizedCode.includes('list') || normalizedCode.includes('[]')) {
            if (timeComplexity === 'O(1)') {
                timeComplexity = 'O(n)';
                explanation = 'Sử dụng cấu trúc dữ liệu tuyến tính';
                confidence = 0.5;
            }
        }

        return {
            timeComplexity,
            spaceComplexity,
            explanation,
            confidence
        };
    };

    useEffect(() => {
        if (code && code.trim()) {
            setIsAnalyzing(true);
            setTimeout(() => {
                const result = analyzeCode(code, language);
                setAnalysis(result);
                setIsAnalyzing(false);
            }, 500);
        } else {
            setAnalysis(null);
        }
    }, [code, language]);

    if (!code || !code.trim()) {
        return null;
    }

    const getComplexityColor = (complexity: string) => {
        if (complexity.includes('O(1)')) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
        if (complexity.includes('O(log n)')) return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
        if (complexity.includes('O(n)')) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
        if (complexity.includes('O(n log n)')) return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900';
        if (complexity.includes('O(n²)') || complexity.includes('O(2^n)')) return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-green-600';
        if (confidence >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Phân tích thuật toán
                </h3>
            </div>

            {isAnalyzing ? (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Đang phân tích...</span>
                </div>
            ) : analysis ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Độ phức tạp thời gian
                            </label>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(analysis.timeComplexity)}`}>
                                {analysis.timeComplexity}
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Độ phức tạp không gian
                            </label>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(analysis.spaceComplexity)}`}>
                                {analysis.spaceComplexity}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Mô tả
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {analysis.explanation}
                        </p>
                    </div>

                    {showDetails && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Độ tin cậy
                            </label>
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${analysis.confidence * 100}%` }}
                                    ></div>
                                </div>
                                <span className={`text-sm font-medium ${getConfidenceColor(analysis.confidence)}`}>
                                    {Math.round(analysis.confidence * 100)}%
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                        <strong>Lưu ý:</strong> Phân tích này chỉ mang tính chất ước tính dựa trên pattern recognition. 
                        Độ phức tạp thực tế có thể khác tùy thuộc vào implementation cụ thể.
                    </div>
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Không thể phân tích code trống
                </p>
            )}
        </div>
    );
};

export default AlgorithmAnalyzer;
