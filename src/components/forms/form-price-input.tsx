import { FormNumberInput, type FormNumberInputProps } from '@/components/forms/form-number-input';

type Props = FormNumberInputProps;

export const FormPriceInput = (props: Props) => {
  return <FormNumberInput allowNegative={false} {...props} />;
};
