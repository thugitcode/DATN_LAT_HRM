import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  NAMESPACES,
  SUPPORTED_LANGUAGES,
} from './constants';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: Object.values(SUPPORTED_LANGUAGES),
    defaultNS: NAMESPACES.COMMON,
    ns: Object.values(NAMESPACES),
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    },

    // backend: {
    //   loadPath: '/locales/{{lng}}/{{ns}}.json',
    // },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
