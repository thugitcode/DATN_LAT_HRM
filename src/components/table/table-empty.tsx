import { IconCalendar } from '@tabler/icons-react';

export const TableEmpty = () => {
  return (
    <tr>
      <td colSpan={999}>
        <div
          className="sticky left-0 flex flex-col items-center justify-center py-20 px-6 select-none"
          style={{ width: '100vw' }}
        >
          <div className="relative mb-6">
            <div className="size-5 rounded-2xl bg-[#F4F4F5] flex items-center justify-center">
              <IconCalendar className="size-5 text-[#A1A1AA]" strokeWidth={1.5} />
            </div>
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-[#E4E4E7]" />
            <span className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-[#E4E4E7]" />
          </div>

          <p className="text-[15px] font-semibold text-[#18181B] mb-1">Chưa có dữ liệu</p>
        </div>
      </td>
    </tr>
  );
};
