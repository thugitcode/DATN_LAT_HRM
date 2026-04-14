import { formatNumberI18n } from "@/lib/utils";
export type Locale = 'vi' | 'en';

export interface FormatOptions {
    locale?: Locale;
    compact?: boolean;
    currency?: boolean;
    maximumFractionDigits?: number;
}

export const COMPACT_CONFIG = {
    'vi': [
        { value: 1_000_000_000, suffix: 'tỷ' },
        { value: 1_000_000, suffix: 'tr' },
        { value: 1_000, suffix: 'k' },
    ],
    'en': [
        { value: 1_000_000_000, suffix: 'B' },
        { value: 1_000_000, suffix: 'M' },
        { value: 1_000, suffix: 'K' },
    ],
};

export function useShortPriceFormatter(locale: Locale = 'vi') {
    return {
        format: (value: number, opts?: Omit<FormatOptions, 'locale'>) =>
            formatNumberI18n(value, { ...opts, locale }),
    };
}