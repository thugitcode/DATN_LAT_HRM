import { Accordion, AccordionItem } from '@heroui/react';

export interface Item {
  id: string;
  name: string;
}

interface DepartmentRoomInfoProps {
  departments?: Item[];
  rooms?: Item[];
}

const RoomList = ({ rooms }: { rooms: Item[] }) => {
  if (!rooms.length) return null;

  if (rooms.length === 1) {
    return (
      <p className="text-xs text-[#A1A1AA] whitespace-nowrap leading-4.5">
        Phòng: {rooms?.[0]?.name}
      </p>
    );
  }

  return (
    <Accordion
      className="mt-0.5 px-0"
      itemClasses={{
        base: 'py-0 w-full',
        title: 'text-xs text-[#A1A1AA] whitespace-nowrap leading-4.5',
        trigger: 'py-0 px-0 gap-0.5 h-[18px] hover:bg-transparent data-[hover=true]:bg-transparent',
        indicator: 'text-[#A1A1AA] w-3 h-3',
        content: 'pt-0.5 pb-1 pl-3',
      }}
    >
      <AccordionItem
        key="1"
        title={
          <span className="flex items-center gap-1 min-w-0 max-w-40 truncate">
            <span className="truncate max-w-40 text-xs text-[#A1A1AA]" title={rooms?.[0]?.name}>
              {rooms?.[0]?.name}
            </span>
          </span>
        }
      >
        {rooms.slice(1).map((room) => (
          <p key={room.id} className="text-xs text-[#A1A1AA] whitespace-nowrap leading-4.5">
            {room.name}
          </p>
        ))}
      </AccordionItem>
    </Accordion>
  );
};

export const DepartmentRoomInfo = ({ departments = [], rooms = [] }: DepartmentRoomInfoProps) => {
  return (
    <div className="flex flex-col gap-0.5">
      {departments.length === 0 ? (
        <span></span>
      ) : departments.length === 1 ? (
        <p className="text-sm font-medium text-gray-800 whitespace-nowrap leading-4.5">
          {departments?.[0]?.name}
        </p>
      ) : (
        <Accordion
          className="px-0"
          itemClasses={{
            base: 'py-0 w-full',
            title: 'text-sm font-medium text-gray-800 whitespace-nowrap leading-4.5',
            trigger:
              'py-0 px-0 gap-0.5 h-[18px] hover:bg-transparent data-[hover=true]:bg-transparent',
            indicator: 'text-gray-500 w-3 h-3',
            content: 'pt-0.5 pb-1 pl-3',
          }}
        >
          <AccordionItem
            key="1"
            title={
              <span className="flex items-center gap-1 min-w-0">
                <span
                  className="truncate max-w-40 text-sm font-medium text-gray-800"
                  title={departments?.[0]?.name}
                >
                  {departments?.[0]?.name}
                </span>
              </span>
            }
          >
            {departments.slice(1).map((dept) => (
              <p key={dept.id} className="text-xs text-[#A1A1AA] whitespace-nowrap leading-4.5">
                {dept.name}
              </p>
            ))}
          </AccordionItem>
        </Accordion>
      )}

      <RoomList rooms={rooms} />
    </div>
  );
};
