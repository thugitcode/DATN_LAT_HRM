import type { Control, FieldValues, Path } from 'react-hook-form';

export type BaseFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  isRequired?: boolean;
  disabled?: boolean;
};
