import React, { useState } from 'react';
import ShiftCategory from './ShiftCategory'; // Nạp màn hình Danh mục ca vào đây

const CategoryLayout = () => {
  const [activeMenu, setActiveMenu] = useState('shift');

  const menuItems = [
    { id: 'shift', label: 'Danh mục ca làm việc' },
    { id: 'holiday', label: 'Danh mục ngày nghỉ' },
    { id: 'leaveFund', label: 'Danh mục quỹ nghỉ' },
    { id: 'leaveReason', label: 'Danh mục lý do nghỉ' },
    { id: 'timekeeping', label: 'Thiết lập chấm công' },
    { id: 'salary', label: 'Thiết lập cơ chế lương' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar bên trái */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Quản lý cấu hình</h2>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveMenu(item.id)}
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

      {/* Vùng nội dung bên phải */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="bg-white rounded-lg shadow min-h-full p-6">
           <h1 className="text-2xl font-semibold mb-6">
             {menuItems.find(m => m.id === activeMenu)?.label}
           </h1>
           
           {/* Khu vực render nội dung */}
           {activeMenu === 'shift' && <ShiftCategory />}
           
           {/* Giữ chỗ cho các tab chưa làm */}
           {activeMenu !== 'shift' && (
             <div className="text-gray-500 italic">
               (Khu vực này sẽ code sau khi hoàn thiện xong Danh mục ca làm việc)
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CategoryLayout;