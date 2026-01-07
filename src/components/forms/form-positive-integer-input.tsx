import { forwardRef } from 'react';

import { FormNumberInput, type FormNumberInputProps } from '@/components/forms/form-number-input';

type Props = FormNumberInputProps;

export const FormPositiveIntegerInput = forwardRef<HTMLInputElement, Props>((props, ref) => {
  return <FormNumberInput ref={ref} allowNegative={false} allowDecimal={false} {...props} />;
});
FormPositiveIntegerInput.displayName = 'FormPositiveIntegerInput';
