import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { NumericFormat, type NumericFormatProps } from "react-number-format";
import { Input, type InputProps } from "@heroui/react";
import { cn } from "@/lib/utils";

type FormNumberInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  error?: string;
} & Omit<NumericFormatProps, "customInput" | "value" | "onChange"> &
  Omit<InputProps, "value" | "onChange">;

export function FormNumberInput<T extends FieldValues>({
  name,
  control,
  error,
  ...props
}: FormNumberInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <NumericFormat
          customInput={Input}
          value={field.value}
          onBlur={field.onBlur}
          onValueChange={(values) => {
            field.onChange(values.floatValue?.toString() || "");
          }}
          isAllowed={(values) => {
            const { floatValue } = values;

            if (floatValue === undefined) return true;
            if (props?.min !== undefined && floatValue < +props?.min) return false;
            if (props?.max !== undefined && floatValue > +props?.max) return false;

            return true;
          }}
          labelPlacement="outside-top"
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={0}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
          classNames={{
            label: cn('text-base font-normal leading-4 text-[#52525B]',
              !!fieldState.error ? 'text-[#F31260]' : 'text-[#52525B]'),
            inputWrapper: `
            data-[invalid=true]:!bg-[#F4F4F5]
            group-data-[invalid=true]:!bg-[#F4F4F5]
          `,
            input: '[&::-webkit-datetime-edit-ampm-field]:hidden',
          }}
          {...props}
        />
      )}
    />
  );
}