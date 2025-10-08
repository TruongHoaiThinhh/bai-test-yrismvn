import { useRouter } from "next/router";

const LoginRequire = () => {
    const router = useRouter();
    
    return (
        <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4`}>
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    CodeSnippet Platform
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    Chia sẻ và khám phá code snippets từ cộng đồng developer
                </p>
                <div className="space-y-4">
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors mr-4"
                    >
                        Đăng nhập
                    </button>
                    <button
                        onClick={() => router.push('/register')}
                        className="border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium py-3 px-8 rounded-lg transition-colors"
                    >
                        Đăng ký
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginRequire;