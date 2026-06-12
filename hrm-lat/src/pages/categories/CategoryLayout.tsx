//import React, { useState } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { Button } from '@heroui/react';
import ShiftCategory from './ShiftCategory'; 
import LeaveReasonCategory from './LeaveReasonCategory';
import LeaveFundCategory from './LeaveFundCategory';
import HolidayCategory from './HolidayCategory';
import TimekeepingCategory from './TimekeepingCategory';
import SalaryCategory from './SalaryCategory';
import DepartmentCategory from './DepartmentCategory';
import RoomCategory from './RoomCategory';
import { IconBuildingHospital, IconDoorEnter, IconArrowLeft } from '@tabler/icons-react';

const CategoryLayout = () => {
  // 1. Đọc tham số 'tab' từ URL xuống, nếu trên URL chưa có thì mặc định là 'shift'
  const search: any = useSearch({ from: '/hrm-categories' });
  const activeMenu = search.tab || 'shift';
  
  const navigate = useNavigate({ from: '/hrm-categories' });

  const menuItems = [
    { id: 'shift', label: 'Danh mục ca làm việc' },
    { id: 'holiday', label: 'Danh mục ngày nghỉ' },
    { id: 'leaveFund', label: 'Danh mục quỹ nghỉ' },
    { id: 'leaveReason', label: 'Danh mục lý do nghỉ' },
    { id: 'timekeeping', label: 'Thiết lập chấm công' },
    { id: 'salary', label: 'Thiết lập cơ chế lương' },
    { id: 'department', label: 'Danh mục Khoa', icon: <IconBuildingHospital size={20} /> },
    { id: 'room', label: 'Danh mục Phòng', icon: <IconDoorEnter size={20} /> }
  ];

  // 2. Hàm xử lý khi click đổi Menu: Thay vì set state, ta đẩy thẳng tên tab lên URL
  const handleMenuChange = (tabId: string) => {
    navigate({
      search: (prev: any) => ({ ...prev, tab: tabId }),
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 🛠️ SIDEBAR BÊN TRÁI: Đã bọc flex flex-col justify-between để ghim các khối về 2 đầu */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col justify-between">
        
        {/* Khối trên: Tiêu đề và các nút danh mục */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-6">Quản lý cấu hình</h2>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuChange(item.id)} // Gọi hàm chuyển đổi URL
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeMenu === item.id
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-600 hover:bg-gray-100' 
                  }`}
                >
                  • {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Khối dưới: Nút thoát thiết lập nằm gọn gàng dưới đáy Sidebar */}
        <div className="pt-4 border-t border-gray-100">
          <Button 
            fullWidth
            color="danger" 
            variant="flat" 
            size="sm"
            startContent={<IconArrowLeft size={16} />}
            onClick={() => {
              // Quay trở về phân hệ làm việc chính
              navigate({ to: '/' }); 
            }}
            className="font-bold rounded-xl h-10 tracking-wide text-xs shadow-sm"
          >
            THOÁT THIẾT LẬP
          </Button>
        </div>
      </div> {/* 🌟 ĐÓNG THẺ SIDEBAR ĐÚNG VỊ TRÍ TẠI ĐÂY */}

      {/* Vùng nội dung bên phải */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="bg-white rounded-lg shadow min-h-full p-6">
           <h1 className="text-2xl font-semibold mb-6">
             {menuItems.find(m => m.id === activeMenu)?.label}
           </h1>
           
           {/* Khu vực render nội dung */}
           {activeMenu === 'shift' && <ShiftCategory />}
           
           {activeMenu === 'leaveReason' && <LeaveReasonCategory />}
           
           {activeMenu === 'leaveFund' && <LeaveFundCategory />}

           {activeMenu === 'holiday' && <HolidayCategory />}

           {activeMenu === 'timekeeping' && <TimekeepingCategory />}

           {activeMenu === 'salary' && <SalaryCategory />}

           {activeMenu === 'department' && <DepartmentCategory />}
           
           {activeMenu === 'room' && <RoomCategory />}

           {/* Giữ chỗ thông minh: Chỉ hiện dòng chữ này với các mục thực sự chưa code */}
           {activeMenu === 'timekeeping' && (
             <div className="text-gray-500 italic mt-4">
               (Khu vực này sẽ được triển khai ở phân hệ thiết lập phần cứng và cấu hình cơ chế lương tiếp theo)
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CategoryLayout;