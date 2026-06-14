import { StaffAvatar } from '@/features/timekeeping-shift-scheduling/components/staff-avatar';
import { NAMESPACES } from '@/i18n/constants';
import { uploadService } from '@/services/upload.service';
import { Avatar, Spinner } from '@heroui/react';
import { IconCamera, IconUser } from '@tabler/icons-react';
import { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const AvatarSection = () => {
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const { control, formState, getValues } = useFormContext();
  const [url, setUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false);
  const {
    field: { onChange, value },
  } = useController({
    name: 'avatar',
    control,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const uploadRes = await uploadService.upload(file);

        const previewPath = uploadRes.data.filePath;

        // setUrl(uploadRes.data.url)
        const previewUrl = URL.createObjectURL(file)
        setUrl(previewUrl)
        onChange(previewPath);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="col-span-12">
      <div className="relative inline-block group">
        {/* Nếu có blob URL preview thì dùng trực tiếp, không qua GetSignedUrl */}
        {url
          ? <Avatar src={url} className="w-24 h-24 text-large bg-[#E4E4E7] border-2 border-white shadow-md" />
          : <StaffAvatar className="w-24 h-24 text-large bg-[#E4E4E7] border-2 border-white shadow-md" avatarUrl={value} name={getValues("name")} />
        }
        {isUploading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/20">
            <Spinner size="sm" color="white" />
          </div>
        )}
        <label
          htmlFor="avatar-upload"
          className="absolute bottom-0 right-0 rounded-full min-w-8 h-8 bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-600 transition-colors"
        >
          <IconCamera size={16} />
          <input
            id="avatar-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>
      <p className="text-[10px] text-[#A1A1AA] mt-2 italic">
        {t('staffForm.fields.avatar.uploadNote')}
      </p>
    </div>
  );
};