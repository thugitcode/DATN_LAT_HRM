import { FormRadio, type FormRadioProps } from "./form-radio";

export type FormRadioBooleanProps = Omit<FormRadioProps, "data"> & {
  labelYes?: string;
  labelNo?: string;
};

export const FormRadioBoolean = ({
  labelYes = "Có",
  labelNo = "Không",
  ...props
}: FormRadioBooleanProps) => {
  return (
    <FormRadio
      data={[
        { value: true, label: labelYes },
        { value: false, label: labelNo },
      ]}
      {...props}
    />
  );
};
