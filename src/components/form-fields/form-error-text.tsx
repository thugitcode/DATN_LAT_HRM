import type { FC } from 'react';

interface FormErrorTextProps {
  errorMessage?: string;
}

export const FormErrorText: FC<Readonly<FormErrorTextProps>> = ({ errorMessage }) => {
  return <span className="text-[#F31260] text-xs">{errorMessage}</span>;
};
