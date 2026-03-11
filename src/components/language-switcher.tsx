import { LANGUAGE_OPTIONS } from '@/i18n/constants';
import { Select, SelectItem } from '@heroui/react';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <Select
      selectedKeys={[i18n.language]}
      onSelectionChange={(keys) => {
        const lang = Array.from(keys)[0] as string;
        if (lang) i18n.changeLanguage(lang);
      }}
      className="w-36"
      size="sm"
    >
      {LANGUAGE_OPTIONS.map(({ code, flag, label }) => (
        <SelectItem key={code} textValue={label}>
          {flag} {label}
        </SelectItem>
      ))}
    </Select>
  );
}
