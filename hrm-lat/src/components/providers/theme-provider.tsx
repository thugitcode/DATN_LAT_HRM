import React from 'react';
import {
  ActionIcon,
  Button,
  colorsTuple,
  createTheme,
  Input,
  MantineProvider,
  Select,
  TextInput,
  type MantineColorsTuple,
} from '@mantine/core';
import { DateInput, DatePickerInput, DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';

const primary: MantineColorsTuple = colorsTuple('#4971ED');
const secondary: MantineColorsTuple = colorsTuple('#2c3782');
const danger: MantineColorsTuple = colorsTuple('#E63634');
const warning: MantineColorsTuple = colorsTuple('#F6A447');
const success: MantineColorsTuple = colorsTuple('#2CB2A5');
const info: MantineColorsTuple = colorsTuple('#2C80FF');
const inactive: MantineColorsTuple = colorsTuple('#999999');
const background: MantineColorsTuple = colorsTuple('#F2F2F7');
const cultured: MantineColorsTuple = colorsTuple('#F5F6FA');

const theme = createTheme({
  fontFamily: 'Roboto, sans-serif',
  headings: {
    fontFamily: 'Roboto, sans-serif',
    fontWeight: '500',
  },
  colors: {
    primary,
    secondary,
    danger,
    warning,
    success,
    info,
    inactive,
    background,
    cultured,
  },
  primaryColor: 'primary',
  components: {
    Button: Button.extend({
      defaultProps: {
        radius: 'md',
        miw: 150,
      },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        radius: 'md',
      },
    }),
    Input: Input.extend({
      defaultProps: {
        radius: 'md',
      },
    }),
    TextInput: TextInput.extend({
      defaultProps: {
        radius: 'md',
      },
    }),
    DatePickerInput: DatePickerInput.extend({
      defaultProps: {
        radius: 'md',
      },
    }),
    DateInput: DateInput.extend({
      defaultProps: {
        radius: 'md',
      },
    }),
    Select: Select.extend({
      defaultProps: {
        radius: 'md',
      },
    }),
  },
});

export const ThemeProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <DatesProvider settings={{ locale: 'vi' }}>{children}</DatesProvider>

      <Notifications zIndex={1000} />
    </MantineProvider>
  );
};
