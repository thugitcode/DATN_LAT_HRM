import { icons } from "@/lib/icons";
import { Card, CardBody, CardFooter, Image, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { IconDownload, IconDots, IconTrash } from "@tabler/icons-react";

interface FileCardProps {
  thumbnail: string;
  title: string;
  note?: string;
  size: string;
  author: string;
  datetime: string;
  onDownload?: () => void;
  onMore?: () => void;
}

export default function FileCard({
  thumbnail,
  title,
  note,
  size,
  author,
  datetime,
  onDownload,
  onMore,
}: FileCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm border border-default-200">
      {/* Thumbnail */}
      <div className="p-0">
        <div className="rounded-t-2xl overflow-hidden bg-default-100 pt-3 px-[21.5px]">
          <Image
            src={thumbnail}
            alt={title}
            removeWrapper
            className="w-full h-55 object-cover rounded-none! rounded-b-0! rounded-t-xl!"
          />
        </div>
      </div>

      <CardBody className="px-3 pt-3 pb-2 gap-1.5 flex flex-col">
        <h3 className="text-lg leading-7 font-bold text-foreground">{title}</h3>

        {note && (
          <p className="text-sm leading-5 text-[#27272A] mt-1.5">{note}</p>
        )}

        <p className="text-sm leading-5 text-[#A1A1AA]">{size}</p>

        <p className="text-sm leading-5 text-[#A1A1AA]">
          {author} - {datetime}
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
              <DropdownItem key="profile">
                <div className="flex justify-between w-full">
                  <div>Xóa</div>
                  <div><icons.trash /></div>
                </div>
              </DropdownItem>
              <DropdownItem key="settings">
                <div className="flex justify-between w-full">
                  <div>Chỉnh sửa</div>
                  <div><icons.edit /></div>
                </div></DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardFooter>
    </Card>
  );
}