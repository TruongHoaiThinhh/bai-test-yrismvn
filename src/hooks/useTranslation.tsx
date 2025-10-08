import { useTranslation as useNextI18nextTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useTranslation = () => {
  const { t, i18n } = useNextI18nextTranslation('common');
  const router = useRouter();
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && i18n && i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);
  
  const changeLanguage = async (locale: string) => {
    const current = router?.locale || i18n?.language;
    if (current === locale) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', locale);
    }

    if (router) {
      await router.push(router.asPath, router.asPath, { locale });
      if (i18n && typeof i18n.changeLanguage === 'function') {
        i18n.changeLanguage(locale);
      }
    } else if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(locale);
    } else {
      console.warn('i18n/router không sẵn sàng để đổi ngôn ngữ');
    }
  };

  return {
    t,
    changeLanguage,
    currentLanguage: router?.locale || i18n?.language || 'vi',
    isReady: i18n?.isInitialized || false
  };
};