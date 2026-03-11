/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormArea } from '@/components/form-fields/form-area';
import { FileUploadInput } from '@/components/form-fields/form-file-upload-input';
import { FormInput } from '@/components/form-fields/form-input';
import { icons } from '@/lib/icons';
import { useDrawer } from '@/store/useDrawer';
import { addToast, Button, Form } from '@heroui/react';
import dayjs from 'dayjs';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useCreateStaffProfile, useStaffProfileDetail } from '../../salary-and-benefits/hooks/use-staff-profile';
import { documentSchema, type DocumentFormValues } from '../schemas/profile-details.schema';
import { uploadService } from '@/services/upload.service';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { staffProfileKeys } from '@/services/query-options/staff-profile.query';
import { useEffect } from 'react';
import { formatDate } from '@/lib/utils';

type FormValues = {
  documents: DocumentFormValues[];
};

const TODAY = dayjs().format("YYYY-MM-DD");

export const ProfileDetailsDrawer = () => {
  const closedDrawer = useDrawer((state) => state.onClose);
  const queryClient = useQueryClient();

  const { mutateAsync: createProfile } = useCreateStaffProfile(); // Sử dụng mutateAsync để dễ handle try/catch

  const staffId = useDrawer((state) => (state?.data as { staffId: string })?.staffId);
  const id = useDrawer((state) => (state?.data as { id: string })?.id);
  const { data: details } = useStaffProfileDetail(id)
  
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
    setValue
  } = useForm<FormValues>({
    resolver: zodResolver(z.object({ documents: z.array(documentSchema) })),
    defaultValues: {
      documents: [
        {
          name: "",
          note: "",
          staffId: staffId,
          createdByName: "Admin",
          files: null,
          createdAt: TODAY
        },
      ],
    },
  });
  // Set details into form when viewing details
  useEffect(() => {
    if (details?.data && id) {
      const profile = details.data;
      reset({
        documents: [
          {
            name: profile.name || "",
            note: profile.note || "",
            staffId: profile.staffId || staffId,
            createdByName: profile.createdByName || "Admin",
            files: null,
            createdAt: dayjs(profile.createdAt).format("YYYY-MM-DD") || TODAY
          },
        ],
      });
    }
  }, [details, id, staffId, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "documents",
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Duyệt qua từng bộ tài liệu trong form (fields của useFieldArray)
      const requests = values.documents.map(async (doc) => {
        // 1. Kiểm tra và Upload file trước
        if (!doc.files || doc.files.length === 0) return;

        const fileToUpload = doc.files;
        const uploadRes = await uploadService.uploadMultiple(fileToUpload);

        if (uploadRes.statusCode === 200) {
          const fileData = uploadRes.data;
          const payload = {
            name: doc.name || fileData?.[0]?.fileName,
            note: doc.note || "",
            thumbnail: fileData?.[0]?.url,
            createdByName: doc.createdByName || "Admin",
            staffId: staffId,
            documentIds: fileData?.map(it => it.filePath)
          };

          return createProfile(payload);
        }
      });

      // Đợi tất cả các request hoàn thành
      await Promise.all(requests);
      queryClient.invalidateQueries({ queryKey: staffProfileKeys.lists() });
      addToast({
        title: 'Thêm mới tài liệu thành công',
        description: 'Thông tin hồ sơ nhân viên đã được cập nhật',
        color: 'success',
      });
      // addToast({ title: 'Cập nhật tất cả tài liệu thành công', color: 'success' });
      reset();
      closedDrawer();
    } catch (error) {
      console.error("Submit error:", error);
      addToast({ title: 'Có lỗi xảy ra trong quá trình cập nhật', color: 'danger' });
    }
  };
  const handleFilesSelect = (index: number, files: File[]) => {
    if (files.length > 0) {
      setValue(`documents.${index}.files`, files, {
        shouldValidate: true,
        shouldDirty: true
      });
    }
  };
  return (
    <Form
      className="h-full gap-2 flex flex-col p-6"
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-4 w-full pb-24 overflow-y-auto">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 bg-white border border-gray-100 shadow-sm group rounded-xl w-full flex flex-col gap-3 relative"
          >
            {/* Delete Button */}
            {fields.length > 1 && (
              <Button
                variant="flat"
                isIconOnly
                onPress={() => remove(index)}
                className="absolute z-20 border-none size-8 min-w-8 top-1.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-transparent"
              >
                <icons.trash color="red" />
              </Button>
            )}

            {/* Document Name */}
            <FormInput
              control={control}
              name={`documents.${index}.name`} // Đổi key thành name
              label="Tên giấy tờ"
              placeholder="Nhập tên loại giấy tờ..."
              isRequired
            />

            {/* Thông tin ẩn/disabled khớp với BE */}
            <div className="flex gap-3">
              <FormDatePicker
                control={control}
                name={`documents.${index}.createdAt`}
                label="Ngày thêm mới"
                disabled
              />
              <FormInput
                control={control}
                name={`documents.${index}.createdByName`}
                label="Người thêm mới"
                disabled
              />
            </div>

            {/* Note */}
            <FormArea
              control={control}
              name={`documents.${index}.note`}
              label="Ghi chú"
              placeholder="Nhập ghi chú thêm..."
              maxRows={4}
            />

            {/* File Upload Section */}
            <div className="w-full flex flex-col gap-2">
              <label className="text-sm font-medium text-[#52525B]">
                Tệp đính kèm <span className="text-danger">*</span>
              </label>

              <Controller
                control={control}
                name={`documents.${index}.files`}
                render={({ field: fileField, fieldState }) => (
                  <FileUploadInput
                    selectedFiles={fileField.value || []}
                    onFilesSelect={(files) => handleFilesSelect(index, files)}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="bordered"
          className="w-full border-2 border-primary-200 text-primary min-h-10"
          onPress={() =>
            append({
              name: "",
              note: "",
              staffId: staffId,
              createdByName: "Admin",
              files: null,
              createdAt: TODAY
            })
          }
        >
          + Thêm giấy tờ khác
        </Button>
      </div>

      {/* Footer cố định */}
      <div className="flex justify-end gap-2 py-4 px-6 bg-white w-full absolute bottom-0 left-0 z-50">
        <Button
          variant="light"
          onPress={closedDrawer}
          className="border-[#006FEE] border bg-white text-[#006FEE]"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          color="primary"
          isLoading={isSubmitting}
          className="px-8"
        >
          Lưu hồ sơ
        </Button>
      </div>
    </Form>
  );
};