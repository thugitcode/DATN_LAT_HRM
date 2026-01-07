import {
  useForm,
  type FormAsyncValidateOrFn,
  type FormOptions,
  type FormValidateOrFn,
} from '@tanstack/react-form';
import dayjs from 'dayjs';
import { z } from 'zod/v4';

import { CustomerModel, CustomerType } from '@/types/customer.type';

export const useCommonForm = <T, Meta = undefined>(
  props: FormOptions<
    T,
    FormValidateOrFn<T>,
    FormValidateOrFn<T>,
    FormAsyncValidateOrFn<T>,
    FormValidateOrFn<T>,
    FormAsyncValidateOrFn<T>,
    FormValidateOrFn<T>,
    FormAsyncValidateOrFn<T>,
    FormValidateOrFn<T>,
    FormAsyncValidateOrFn<T>,
    FormAsyncValidateOrFn<T>,
    Meta
  >,
) => {
  const form = useForm<
    T,
    FormValidateOrFn<T>,
    FormValidateOrFn<T>,
    FormAsyncValidateOrFn<T>,
    FormValidateOrFn<T>,
    FormAsyncValidateOrFn<T>,
    FormValidateOrFn<T>,
    FormAsyncValidateOrFn<T>,
    FormValidateOrFn<T>,
    FormAsyncValidateOrFn<T>,
    FormAsyncValidateOrFn<T>,
    Meta
  >(props);

  return form;
};

export const useFormValidators = () => {
  const email = z
    .string()
    .nonempty({ message: 'Nhập đầy đủ thông tin' })
    .email('Email không hợp lệ');
  const phone = z
    .string()
    .nonempty({ message: 'Nhập đầy đủ thông tin' })
    .regex(/^((\+84|84|0)[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ');
  const phone10to11 = z
    .union([z.string(), z.number()])
    .transform((val) => String(val ?? ''))
    .pipe(
      z
        .string({ error: 'Nhập đầy đủ thông tin' })
        .min(1, 'Nhập đầy đủ thông tin')
        .regex(/^\d+$/, 'Số điện thoại chỉ được chứa số')
        .min(10, 'Số điện thoại phải có tối thiểu 10 số')
        .max(11, 'Số điện thoại phải có tối đa 11 số'),
    );
  const dateInput = z
    //     .string({ error: 'Chọn đầy đủ thông tin' })
    .string()
    .min(1, { message: 'Chọn đầy đủ thông tin' })
    .refine(
      (val) =>
        typeof val === 'string' &&
        /^(\d{4}-\d{2}-\d{2}|(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?))$/.test(val),
      { message: 'Ngày không hợp lệ' },
    );

  const futureTimeSchema = (dateFieldValue: string | undefined) => {
    const today = dayjs().format('YYYY-MM-DD');

    if (dateFieldValue === today) {
      const now = dayjs();
      const currentMinutes = now.hour() * 60 + now.minute();

      return z
        .string()
        .nonempty({ message: 'Chọn đầy đủ thông tin' })
        .refine(
          (time) => {
            if (!time || !time.includes(':')) return false;
            const [h, m] = time.split(':').map(Number);
            const inputMinutes = h * 60 + m;
            return inputMinutes > currentMinutes;
          },
          { message: 'Giờ phải lớn hơn thời gian hiện tại' },
        );
    }

    return z.string().nonempty({ message: 'Chọn đầy đủ thông tin' });
  };

  const timeSchema = z.string().nonempty({ message: 'Chọn đầy đủ thông tin' });
  //     .refine(
  //       (val) => {
  //         const parts = val.split(':');
  //         const h = Number(parts[0]);
  //         const m = Number(parts[1]);

  //         const now = new Date();
  //         const nowMinutes = now.getHours() * 60 + now.getMinutes();
  //         const adjustedNowMinutes = nowMinutes + (now.getSeconds() > 0 ? 1 : 0);

  //         const inputMinutes = h * 60 + m;

  //         return inputMinutes >= adjustedNowMinutes;
  //       },
  //       { message: 'Giờ không được ở quá khứ.' },
  //     );

  //   const dateInputSafe = z.preprocess((v) => v ?? '', dateInput);

  const dateRangeSchema = ({
    from,
    to,
    required,
    isEdit,
  }: {
    from: { key: string; label: string };
    to: { key: string; label: string };
    required?: boolean;
    isEdit?: boolean;
  }) =>
    z
      .object({
        [from.key]: required ? dateInput : dateInput.optional().nullable(),
        [to.key]: required ? dateInput : dateInput.optional().nullable(),
      })
      .refine(
        (data) => {
          if (isEdit) return true;
          const toValue = data[to.key] as string;
          if (!toValue) return true;
          return dayjs(toValue).isSame(dayjs(), 'day') || dayjs(toValue).isAfter(dayjs(), 'day');
        },
        {
          path: [to.key],
          message: `${to.label} không được nhỏ hơn hơn ngày hiện tại`,
        },
      )
      .refine(
        (data) => {
          const toValue = data[to.key] as string;
          const fromValue = data[from.key] as string;
          if (!toValue || !fromValue) return true;
          return (
            dayjs(toValue).isSame(dayjs(fromValue), 'day') ||
            dayjs(toValue).isAfter(dayjs(fromValue), 'day')
          );
        },
        {
          path: [to.key],
          message: `${to.label} không được nhỏ hơn hơn ${from.label}`,
        },
      )
      .refine(
        (data) => {
          const fromValue = data[from.key] as string;
          const toValue = data[to.key] as string;
          if (!fromValue || !toValue) return true;
          return (
            dayjs(fromValue).isSame(dayjs(toValue), 'day') ||
            dayjs(fromValue).isBefore(dayjs(toValue), 'day')
          );
        },
        {
          path: [from.key],
          message: `${from.label} không được lớn hơn ${to.label}`,
        },
      );
  const numberInput = z.string().regex(/^\d+$/, 'Vui lòng nhập số hợp lệ');
  const partnerCode = z
    .string()
    .trim()
    .max(15, 'Tên viết tắt tối đa 15 ký tự')
    .regex(/^[a-z0-9]+$/, 'Tên viết tắt viết liền không dấu in thường');
  const username = z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Tên đăng nhập phải được viết liền không dấu');
  const requiredNumberInput = z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, { message: 'Bắt buộc' });

  // Tách ra xem sau này có yêu cầu minmax ký tự đặc biệt gì k
  const nameLogin = z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Tên đăng nhập phải viết liền, không dấu, không khoảng trắng');

  const password = z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .max(12, 'Mật khẩu tối đa 12 ký tự')
    .refine((val) => /[A-Z]/.test(val), {
      message: 'Mật khẩu phải chứa ít nhất 1 chữ viết hoa',
    })
    .refine((val) => /[a-z]/.test(val), {
      message: 'Mật khẩu phải chứa ít nhất 1 chữ viết thường',
    })
    .refine((val) => /\d/.test(val), {
      message: 'Mật khẩu phải chứa ít nhất 1 chữ số',
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt',
    });

  return {
    input: z.string().trim().min(1, 'Nhập đầy đủ thông tin'),
    select: z
      .string({ error: 'Chọn đầy đủ thông tin' })
      .nullable()
      .refine((val) => val !== null && val !== '', {
        message: 'Chọn đầy đủ thông tin',
      }),
    email,
    phone,
    phone10to11,
    dateInput,
    timeSchema,
    numberInput,
    partnerCode,
    futureTimeSchema,
    username,
    emailOptional: email.or(z.literal('')),
    phoneOptional: phone.or(z.literal('')),
    dateInputOptional: dateInput.nullable(),
    numberInputOptional: numberInput.or(z.literal('')),
    customerModel: z.enum(CustomerModel, { error: 'Chọn đầy đủ thông tin' }),
    customerType: z.enum(CustomerType, { error: 'Chọn đầy đủ thông tin' }),
    dateRangeSchema,
    requiredNumberInput,
    nameLogin,
    password,
  };
};

export const createDateRangeFieldValidator =
  (schema: z.ZodObject<any>, key: string) =>
  ({ fieldApi, value }: any) => {
    const form = fieldApi.form;

    const data = {
      ...form?.store?.state?.values,
      [key]: value,
    };

    const result = schema.safeParse(data);

    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === key);
      return issue?.message;
    }
  };
