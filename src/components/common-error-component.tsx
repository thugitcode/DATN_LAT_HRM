import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { NAMESPACES } from '@/i18n/constants';
import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';

type Props = {
  type?: 'auth' | 'system';
  isUnauthenticated?: boolean;
};

export const CommonErrorComponent = ({ type = 'system', isUnauthenticated = false }: Props) => {
  const navigate = useNavigate();

  const { t } = useTranslation(NAMESPACES.COMMON);

  useEffect(() => {
    if (isUnauthenticated) {
      navigate({ to: '/unauthenticated' });
    }
  }, [isUnauthenticated, navigate]);

  if (isUnauthenticated) return null;

  const isAuth = type === 'auth';

  const errorCode = isAuth ? '401' : '500';

  const icon = isAuth ? (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-current">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 11V7a4 4 0 0 1 8 0v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  ) : (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-current">
      <path
        d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-md overflow-hidden">
          <div className={`h-1.5 w-full ${isAuth ? 'bg-amber-400' : 'bg-red-500'}`} />

          <div className="p-8 flex flex-col items-center text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${isAuth ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}
            >
              {icon}
            </div>

            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 ${isAuth ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}
            >
              {t('error.code_label', { code: errorCode })}
            </span>

            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {isAuth ? t('error.auth.title') : t('error.system.title')}
            </h2>

            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              {isAuth ? t('error.auth.content') : t('error.system.content')}
            </p>

            {isAuth ? (
              <Button
                onPress={() => (window.location.href = window.CIS_WEB_UI_URL)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm py-2.5 transition-colors"
              >
                {t('error.auth.login_again')}
              </Button>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <Button
                  onPress={() => location.reload()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm py-2.5 transition-colors"
                >
                  {t('error.system.retry')}
                </Button>
                <Button
                  variant="light"
                  className="w-full text-gray-500 hover:text-gray-700 text-sm py-2.5"
                  onPress={() => navigate({ to: '/' })}
                >
                  {t('error.system.home')}
                </Button>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 bg-gray-50 px-8 py-4 flex items-center justify-between">
            <span className="text-xs text-gray-400">{t('error.helpdesk')}</span>
            <span className="text-xs font-mono text-gray-300">{errorCode}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
