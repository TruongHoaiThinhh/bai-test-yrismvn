import { LanguageSwitcher } from "@/components";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4">
                        <Link href="/">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                CodeSnippet
                            </h1>
                        </Link>
        
                    </div>
                    <div className="">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;


