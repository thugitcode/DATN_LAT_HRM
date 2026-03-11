import { icons } from "@/lib/icons";
import { DrawerType, useDrawer } from "@/store/useDrawer";
import { Card, CardBody, CardFooter, Image, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { IconDownload, IconDots, IconTrash } from "@tabler/icons-react";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import dayjs from "dayjs";

import { ConfirmModal } from "@/components/confirm-modal/confirm-modal";
import { CONFIRM_CONFIG } from "@/components/confirm-modal/confirm.config";
import { useDeleteStaffProfile } from "../../salary-and-benefits/hooks/use-staff-profile";

interface FileCardProps {
  id: string;
  thumbnail: string;
  name: string;
  note?: string;
  createdByName: string;
  createdAt: string;
  onDownload?: () => void;
  onMore?: () => void;
}

export default function FileCard({
  id,
  thumbnail,
  name,
  note,
  createdByName,
  createdAt,
  onDownload,
  onMore,
}: FileCardProps) {
  // Format createdAt from ISO format to readable date
  const { id: staffId } = useParams({ strict: false })
  const formattedDate = createdAt ? dayjs(createdAt).format("HH:mm DD/MM/YYYY") : "";
  const { onOpen } = useDrawer()
  
  // Delete confirmation modal state
  const [pendingDelete, setPendingDelete] = useState(false);
  const { mutate: deleteProfile, isPending: isDeleting } = useDeleteStaffProfile();

  const handleDelete = () => {
    deleteProfile(id, {
      onSuccess: () => {
        setPendingDelete(false);
      }
    });
  };

  return (
    <>
      <Card className="rounded-2xl shadow-sm border border-default-200">
        {/* Thumbnail */}
        <div className="p-0">
          <div className="rounded-t-2xl overflow-hidden bg-default-100 pt-3 px-[21.5px]">
            <Image
              src={thumbnail}
              alt={name}
              removeWrapper
              className="w-full h-55 object-cover rounded-none! rounded-b-0! rounded-t-xl!"
            />
          </div>
        </div>

        <CardBody className="px-3 pt-3 pb-2 gap-1.5 flex flex-col">
          <h3 className="text-lg leading-7 font-bold text-foreground">{name}</h3>

          {note && (
            <p className="text-sm leading-5 text-[#27272A] mt-1.5">{note}</p>
          )}

          <p className="text-sm leading-5 text-[#A1A1AA]">
            {createdByName} - {formattedDate}
          </p>
        </CardBody>
        <CardFooter className="px-[9.5px] py-0">
          <div className="w-full flex items-center gap-3 border-t-1 border-[#11111126] p-3">
            <Button
              onPress={onDownload}
              startContent={<icons.startContent />}
              className="flex-1 bg-[#021B3A] text-white text-base rounded-lg h-8"
            >
              Tải xuống
            </Button>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="flat"
                  onPress={onMore}
                  className="h-8 w-8 min-w-8 rounded-lg bg-default-100"
                >
                  <IconDots size={20} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions" variant="flat">
                <DropdownItem key="delete" onPress={() => setPendingDelete(true)}>
                  <div className="flex justify-between w-full">
                    <div>Xóa</div>
                    <div><icons.trash /></div>
                  </div>
                </DropdownItem>
                <DropdownItem key="edit" onPress={() => onOpen(DrawerType.PROFILE_STAFF_DETAIL, { staffId: staffId, id: id })}>
                  <div className="flex justify-between w-full">
                    <div>Chỉnh sửa</div>
                    <div><icons.edit /></div>
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={pendingDelete}
        config={CONFIRM_CONFIG["delete"]}
        isLoading={isDeleting}
        reason=""
        onReasonChange={() => {}}
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(false)}
      />
    </>
  );
}
