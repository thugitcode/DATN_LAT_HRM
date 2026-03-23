/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormArea } from '@/components/form-fields/form-area';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FileUploadInput } from '@/components/form-fields/form-file-upload-input';
import { FormInput } from '@/components/form-fields/form-input';
import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';
import { staffProfileKeys } from '@/services/query-options/staff-profile.query';
import { uploadService } from '@/services/upload.service';
import { useDrawer } from '@/store/useDrawer';
import type { IStaffDocument } from '@/types/staff-profile.type';
import { addToast, Button, Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import z from 'zod';
import { useCreateStaffProfile, useStaffProfileDetail, useUpdateStaffProfile } from '../../salary-and-benefits/hooks/use-staff-profile';
import { documentSchema, type DocumentFormValues } from '../schemas/profile-details.schema';

type FormValues = {
  documents: DocumentFormValues[];
};

const TODAY = dayjs().format("YYYY-MM-DD");

export const ProfileDetailsDrawer = () => {
  const closedDrawer = useDrawer((state) => state.onClose);
  const queryClient = useQueryClient();
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const { t: tCommon } = useTranslation(NAMESPACES.COMMON);

  const { mutateAsync: createProfile } = useCreateStaffProfile();
  const { mutateAsync: updateProfile } = useUpdateStaffProfile();

  const staffId = useDrawer((state) => (state?.data as { staffId: string })?.staffId);
  const id = useDrawer((state) => (state?.data as { id: string })?.id);
  const { data: details } = useStaffProfileDetail(id)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
    setValue,
    getValues
  } = useForm<FormValues>({
    resolver: zodResolver(z.object({ documents: z.array(documentSchema) })),
    defaultValues: {
      documents: [
        {
          documentName: "",
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
            documentName: profile.documentName || "",
            note: profile.note || "",
            staffId: staffId,
            createdByName: "Admin",
            files: profile.fileName ? [
              {
                name: profile.fileName,
                size: profile.fileSize,
                type: profile.fileType,
                url: profile.fileUrl,
              }
            ] : null,
            fileName: profile.fileName,
            fileUrl: profile.fileUrl,
            filePath: profile.filePath,
            fileSize: profile.fileSize,
            fileType: profile.fileType,
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
      const uploadPromises = values.documents.map(async (doc) => {
        // Nếu đã có fileUrl và không có file mới (hoặc file cũ là object metadata), return fileData cũ
        if (doc.fileUrl && (!doc.files || doc.files.length === 0 || !(doc.files[0] instanceof File))) {
          return {
            documentName: doc.documentName,
            fileUrl: doc.fileUrl,
            fileName: doc.fileName ?? undefined,
            fileType: doc.fileType ?? undefined,
            fileSize: doc.fileSize ?? undefined,
            filePath: doc.filePath ?? undefined,
            note: doc.note ?? undefined,
            staffId: staffId,
            createdByName: "Admin",
            createdAt: doc.createdAt
          };
        }

        // 1. Kiểm tra và Upload file trước
        if (!doc.files || doc.files.length === 0 || !(doc.files[0] instanceof File)) return null;

        const fileToUpload = doc.files[0];

        const uploadRes = await uploadService.upload(fileToUpload);

        if (uploadRes.statusCode === 200) {
          const fileData = uploadRes.data;
          return {
            documentName: doc.documentName,
            fileUrl: fileData.url,
            filePath: fileData.filePath,
            fileName: fileData.fileName,
            fileType: fileData.fileType,
            fileSize: fileData.fileSize,
            note: doc?.note ?? ""
          };
        }
        return null;
      });

      // Đợi tất cả các file upload hoàn thành
      const uploadedDocs = await Promise.all(uploadPromises);

      // Lọc ra các document đã upload thành công (bỏ các document null)
      const validDocuments = uploadedDocs.filter((doc): doc is NonNullable<typeof doc> => doc !== null);

      if (validDocuments.length > 0) {
        // Gọi API tạo mới document
        details?.data?.id ?
          await updateProfile({
            id: details.data.id,
            data: validDocuments[0] as Partial<IStaffDocument>
          }) :
          await createProfile({
            staffId,
            documents: validDocuments as any,
          });

        queryClient.invalidateQueries({ queryKey: staffProfileKeys.lists() });

        reset();
        closedDrawer();
      } else {
        addToast({ title: t('profileDetails.messages.selectInfo'), color: 'danger' });
      }
    } catch (error) {
      console.error("Submit error:", error);
      addToast({ title: t('profileDetails.messages.updateError'), color: 'danger' });
    }
  };
  const handleFilesSelect = (index: number, files: File[]) => {
    // if (files.length > 0) {
    setValue(`documents.${index}.files`, files, {
      shouldValidate: true,
      shouldDirty: true
    });
    // }
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
              name={`documents.${index}.documentName`} // Fix key to match schema
              label={t('profileDetails.labels.documentName')}
              placeholder={t('profileDetails.placeholders.documentName')}
              isRequired
            />

            {/* Thông tin ẩn/disabled khớp với BE */}
            <div className="flex gap-3">
              <FormDatePicker
                control={control}
                name={`documents.${index}.createdAt`}
                label={t('profileDetails.labels.createdAt')}
                disabled
              />
              <FormInput
                control={control}
                name={`documents.${index}.createdByName`}
                label={t('profileDetails.labels.createdByName')}
                disabled
              />
            </div>

            {/* Note */}
            <FormArea
              control={control}
              name={`documents.${index}.note`}
              label={t('profileDetails.labels.note')}
              placeholder={t('profileDetails.placeholders.note')}
              maxRows={4}
            />

            {/* File Upload Section */}
            <div className="w-full flex flex-col gap-2">
              <label className="text-sm font-medium text-[#52525B]">
                {t('profileDetails.labels.attachments')} <span className="text-danger">*</span>
              </label>

              <Controller
                control={control}
                name={`documents.${index}.files`}
                render={({ field: fileField, fieldState }) => (
                  <FileUploadInput
                    multiple={false}
                    selectedFiles={fileField.value || []}
                    onFilesSelect={(files) => files ? handleFilesSelect(index, files) : handleFilesSelect(index, [])}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
          </div>
        ))}

        {!details?.data?.id && <Button
          type="button"
          variant="bordered"
          className="w-full border-2 border-primary-200 text-primary min-h-10"
          onPress={() =>
            append({
              documentName: "",
              note: "",
              staffId: staffId,
              createdByName: "Admin",
              files: null,
              createdAt: TODAY
            })
          }
        >
          {t('profileDetails.buttons.addOther')}
        </Button>}
      </div>

      {/* Footer cố định */}
      <div className="flex justify-end gap-2 py-4 px-6 bg-white w-full absolute bottom-0 left-0 z-50">
        <Button
          variant="light"
          onPress={closedDrawer}
          className="border-[#006FEE] border bg-white text-[#006FEE]"
        >
          {tCommon("button.cancel")}
        </Button>
        <Button
          type="submit"
          color="primary"
          isLoading={isSubmitting}
          className="px-8"
        >
          {t('profileDetails.buttons.save')}
        </Button>
      </div>
    </Form>
  );
};