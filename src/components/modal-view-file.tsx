"use client"; // Quan trọng nếu dùng trong Next.js App Router

import { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from '@heroui/react';

import { useViewFile } from '@/hooks/common/use-view-file';
import { DocumentType } from '@/lib/constants';
import { convertMimeToExtension } from '@/lib/utils';

export default function ModalViewFile() {
  const { open, file, onClose } = useViewFile((state) => state);

  const isImage = file?.type?.startsWith('image/') || file?.type === DocumentType.IMAGE;
  const isPdf = file?.type === 'application/pdf' || file?.type === DocumentType.DOCUMENT;
  const isVideo = file?.type === DocumentType.VIDEO || file?.type === 'video/mp4';

  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    onClose();
    setLoading(false);
  };

  return (
    <Modal
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
      size={isPdf ? '5xl' : 'xl'} // HeroUI size: xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, full
      placement="center"
      backdrop="blur" // hoặc "opaque", "transparent"
      classNames={{
        base: 'max-h-[90vh]',
        body: 'p-0',
      }}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <p className="text-lg font-semibold truncate max-w-[80vw]">
                {file?.name}
              </p>
              <p className="text-sm text-foreground/60">
                {convertMimeToExtension(file?.type ?? "")}
              </p>
            </ModalHeader>

            <ModalBody className="p-4 flex items-center justify-center overflow-hidden">
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ height: isPdf ? '70vh' : 'auto' }}
              >
                {isImage && (
                  <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg p-3 bg-content1">
                    <Image
                      src={file!.url!}
                      alt={file!.name!}
                      radius="md"
                      className="w-full h-full object-contain"
                    // removeWrapper={true} // nếu muốn bỏ wrapper mặc định
                    />
                  </div>
                )}

                {isPdf && (
                  <iframe
                    src={file?.url}
                    className="w-full h-full rounded-lg"
                    title={file?.name}
                  />
                )}

                {isVideo && (
                  <video
                    src={file?.url}
                    autoPlay
                    controls
                    muted
                    className="w-full h-full rounded-lg object-contain"
                  />
                )}

                {!isImage && !isPdf && !isVideo && (
                  <p className="text-foreground/70 text-center">
                    File không hỗ trợ xem trực tuyến, vui lòng <span
                      className="text-primary cursor-pointer hover:underline"
                      onClick={() => {
                        setLoading(true);
                        // downloadFromSignedUrl(file?.url ?? '', file?.name ?? 'tep_dinh_kem').finally(() =>
                        //   setLoading(false)
                        // );
                      }}
                    >
                      tài về máy
                    </span> để xem
                  </p>
                )}
              </div>
            </ModalBody>

            <ModalFooter className="justify-center px-6 py-4 gap-3">
              <Button
                variant="bordered"
                radius="lg"
                onPress={() => {
                  onCloseModal();
                  handleClose();
                }}
                className='border-[#006FEE] border bg-white text-[#006FEE]'
              >
                Hủy
              </Button>

              <Button
                variant="solid"
                color="primary"
                radius="lg"
                onPress={() => {
                  setLoading(true);
                  // downloadFromSignedUrl(file?.url ?? '', file?.name ?? 'tep_dinh_kem').finally(() =>
                  //   setLoading(false)
                  // );
                }}
                isLoading={loading}
              >
                Tải xuống
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}