import { heroui } from '@heroui/theme';

export default heroui({
  components: {
    Button: {
      variants: {
        bordered: {
          base: 'border-1',
        },
      },
    },
  },
  themes: {
    light: {
      colors: {
        primary: {
          50: '#F0F1FF',
          100: '#E3E6FF',
          200: '#C7CBFF',
          300: '#A8AFFF',
          400: '#8C94FF',
          500: '#6576FF',
          600: '#4D60F0',
          700: '#3B4DDE',
          800: '#2B3BB5',
          900: '#1C2A8A',
          DEFAULT: '#6576FF',
          foreground: '#FFFFFF',
        },
      },
    },
  },
});
