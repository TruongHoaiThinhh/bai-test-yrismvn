import { useTranslation } from '@/hooks/useTranslation';


const LanguageSwitcher = () => {
    const { changeLanguage, currentLanguage } = useTranslation();
return (
        <div className="flex items-center space-x-2">
        <button
          onClick={() => changeLanguage('vi')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            currentLanguage === 'vi'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          VI
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            currentLanguage === 'en'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          EN
        </button>
      </div>
    );
}

export default LanguageSwitcher;