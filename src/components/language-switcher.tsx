import { LANGUAGE_OPTIONS } from '@/i18n/constants';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLang = LANGUAGE_OPTIONS.find(
    (opt) => opt.code === i18n.language,
  );

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          variant="light"
          size="sm"
          className="min-w-0 gap-1.5 px-2"
        >
          <span className="text-base leading-none">{currentLang?.flag}</span>
          <span className="text-sm font-medium">{currentLang?.label}</span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Language"
        selectionMode="single"
        selectedKeys={new Set([i18n.language])}
        onSelectionChange={(keys) => {
          const lang = Array.from(keys)[0] as string;
          if (lang) i18n.changeLanguage(lang);
        }}
      >
        {LANGUAGE_OPTIONS.map(({ code, flag, label }) => (
          <DropdownItem key={code} textValue={label}>
            <span className="flex items-center gap-2">
              <span className="text-base leading-none">{flag}</span>
              <span>{label}</span>
            </span>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
