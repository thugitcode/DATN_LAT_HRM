/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDrawer } from '@/store/useDrawer';
import {
  addToast,
  Button,
  Form
} from '@heroui/react';
import { useFieldArray, useForm } from 'react-hook-form';


import { FormArea } from '@/components/form-fields/form-area';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FileUploadInput } from '@/components/form-fields/form-file-upload-input';
import { FormInput } from '@/components/form-fields/form-input';
import { icons } from '@/lib/icons';
import React, { useRef } from 'react';
import { type DocumentFormValues } from '../schemas/profile-details.schema';
import dayjs from 'dayjs';
type FormValues = {
  documents: DocumentFormValues[];
};
export const ProfileDetailsDrawer = () => {
  const closedDrawer = useDrawer((state) => state.onClose);

  const workScheduleDetailId = useDrawer((state) => state.data) as string;
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormValues>({
    defaultValues: {
      documents: [
        {
          documentType: "",
          updateDate: "",
          updater: "Admin",
          note: "",
          file: null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "documents",
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // TODO: call API upload
      console.log(data);

      addToast({ title: 'Thêm mới tài liệu thành công.', color: 'success' });

      reset();
      // onSuccess?.();
    } catch (error) {
      addToast({ title: 'Có lỗi xảy ra.', color: 'danger' });
    }
  };
  return (
    <Form
      className="h-full gap-2 flex flex-col p-6"
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-4 p-6 w-full">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 bg-white shadow-sm group rounded-xl w-full flex flex-col gap-3 relative"
          >
            {/* Delete Button */}
            <Button
              variant="flat"
              isIconOnly
              onPress={() => remove(index)}
              className="absolute z-20 border-none
            size-8 min-w-8 top-1.5 right-2.5
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200 bg-transparent"
            >
              <icons.trash color="red" />
            </Button>

            {/* Document Type */}
            <FormInput
              control={control}
              name={`documents.${index}.documentType`}
              label="Tên giấy tờ"
              isRequired
            />

            {/* Date + Updater */}
            <div className="flex gap-3">
              <FormDatePicker
                control={control}
                name={`documents.${index}.updateDate`}
                label="Ngày thêm mới"
                disabled
              />
              <FormInput
                control={control}
                name={`documents.${index}.updater`}
                label="Người thêm mới"
                disabled
              />
            </div>

            {/* Note */}
            <FormArea
              control={control}
              name={`documents.${index}.note`}
              label="Lý do điều chỉnh"
              isRequired
              maxRows={16}
              classNames={{
                label:
                  "text-base font-normal leading-4 text-[#52525B] pb-2",
              }}
            />

            {/* File Upload */}
            <div className="w-full flex flex-col gap-3">
              <label className="text-base font-normal leading-4 text-[#52525B]">
                Tệp đính kèm
              </label>

              <FileUploadInput
                control={control}
                name={`documents.${index}.file`}
                disabled={isSubmitting}
              />

              {errors.documents?.[index]?.file && (
                <p className="text-danger text-sm mt-2">
                  {errors.documents[index]?.file?.message}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Add Button */}
        <Button
          type="button"
          className="w-full"
          color="primary"
          onPress={() =>
            append({
              documentType: "",
              updateDate: dayjs().toISOString(),
              updater: "Admin",
              note: "",
              file: null,
            })
          }
        >
          + Thêm giấy tờ
        </Button>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-3 pb-6 px-6 bg-white w-full">
        <Button
          variant="light"
          onPress={closedDrawer}
          className="border-[#006FEE] border bg-white text-[#006FEE] text-[14px] font-normal"
        >
          Hủy
        </Button>
        <Button type="submit" color="primary">
          Cập nhật
        </Button>
      </div>
    </Form>
  );
};
