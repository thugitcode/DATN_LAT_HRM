import { STATUS_CODE } from '@/lib/constants';
import { convertFileInfo } from '@/lib/utils';
import { getSignedUrlQueryOptions } from '@/query-options/upload-file.option';
import { useQueryClient } from '@tanstack/react-query';
import { useViewFile } from './common/use-view-file';

const convertFileType = (type: string) => {
    const map: Record<string, string> = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'png': 'image/png',
    };
    return map[type.toLowerCase()] || 'application/octet-stream';
};


export const useOpenSignedFile = () => {
    const queryClient = useQueryClient();
    const { onOpen } = useViewFile((state) => state)

    const getSignedUrlAndOpen = async (
        fileUrl: string,
        openFile?: boolean
    ): Promise<string | undefined> => {
        const file = convertFileInfo([{ key: fileUrl }])[0]
        if (!file) return
        try {
            const res = await queryClient.fetchQuery(
                getSignedUrlQueryOptions(file?.FILE_URL)
            );
            if (res?.status?.toString()?.startsWith(STATUS_CODE.SUCCESS)) {
                const signedUrl = res.data ?? '';

                openFile && onOpen({
                    name: file?.FILE_NAME,
                    url: signedUrl,
                    type: convertFileType(file?.FILE_TYPE),
                });

                return signedUrl;
            }
        } catch (error: any) {
            console.error('Lỗi lấy signed URL:', error);
            // notifications.show({ message: 'Không thể mở file', color: 'red' });
        }

        return undefined;
    };

    return { getSignedUrlAndOpen };
};