import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, 
  Input, Button, Switch, useDisclosure, Drawer, DrawerContent, 
  DrawerHeader, DrawerBody, DrawerFooter, Select, SelectItem, Textarea 
} from '@heroui/react';
import { IconPlus, IconSearch, IconTrash, IconEdit } from '@tabler/icons-react';

// Danh sách 9 loại phòng đồng bộ chính xác từ hình ảnh của bạn
const ROOM_TYPES = [
  "Khám bệnh", "Viện phí", "BHYT", "Lấy mẫu", 
  "Xét nghiệm", "CDHA", "Thủ thuật", "Thăm dò chức năng", "Cân đo"
];

const RoomCategory = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [list, setList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Form State tích hợp đầy đủ trường theo cấu trúc Figma mới
  const [form, setForm] = useState({ 
    code: '', 
    name: '', 
    start_time: '00:00', 
    end_time: '23:55', 
    department_code: '', 
    type: 'Khám bệnh',
    medical_form: '',
    description: '' 
  });

  const loadData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/rooms');
      if (res.data.success) setList(res.data.data);

      const resDep = await axios.get('http://localhost:5000/api/v1/departments');
      if (resDep.data.success) {
        setDepartments(resDep.data.data.filter((d: any) => d.status === 'ACTIVE'));
      }
    } catch (err) { 
      console.error('Lỗi tải dữ liệu:', err); 
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenAdd = () => {
    setSelectedId(null);
    setForm({ 
      code: '', 
      name: '', 
      start_time: '00:00', 
      end_time: '23:55', 
      department_code: departments[0]?.code || '', 
      type: 'Khám bệnh',
      medical_form: '',
      description: ''
    });
    onOpen();
  };

  const handleOpenEdit = (item: any) => {
    setSelectedId(item.id);
    setForm({ 
      code: item.code, 
      name: item.name, 
      start_time: item.start_time?.substring(0, 5) || '00:00', 
      end_time: item.end_time?.substring(0, 5) || '23:55', 
      department_code: item.department_code || '', 
      type: item.type,
      medical_form: item.medical_form || '',
      description: item.description || ''
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      if (selectedId) {
        await axios.put(`http://localhost:5000/api/v1/rooms/${selectedId}`, form);
      } else {
        await axios.post('http://localhost:5000/api/v1/rooms', form);
      }
      onClose(); 
      loadData();
    } catch (err: any) { 
      alert(err.response?.data?.message || 'Gặp sự cố khi ghi dữ liệu phòng!'); 
    }
  };

  const handleToggle = async (id: number, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await axios.put(`http://localhost:5000/api/v1/rooms/toggle/${id}`, { status: nextStatus });
      loadData();
    } catch (err) { 
      alert('Lỗi đổi trạng thái hoạt động'); 
    }
  };

  const handleDelete = async (id: number) => {
  if (!window.confirm('Bạn có chắc muốn xóa phòng chức năng này?')) return;
  try {
    // Chuyển sang phương thức DELETE chuẩn và không gán biến res thừa thãi
    await axios.delete(`http://localhost:5000/api/v1/rooms/${id}`);
    alert('🎉 Đã gỡ bỏ phòng chức năng khỏi danh mục thành công!');
    loadData();
  } catch (err) { 
    console.error('Lỗi khi xóa phòng ban:', err); 
    alert('Không thể thực hiện thao tác xóa!');
  }
};

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Input 
          classNames={{ base: "max-w-xs", inputWrapper: "bg-gray-100" }}
          placeholder="Tìm kiếm mã hoặc tên phòng..." 
          value={search} 
          onValueChange={setSearch}
          startContent={<IconSearch size={16} className="text-gray-400" />}
        />
        <Button color="primary" startContent={<IconPlus size={16}/>} onClick={handleOpenAdd} className="font-semibold rounded-lg">
          Thêm phòng ban mới
        </Button>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <Table aria-label="Room Master Table" removeWrapper>
          <TableHeader>
        <TableColumn>Mã Phòng</TableColumn>
        <TableColumn>Tên Phòng</TableColumn>
        <TableColumn>Thời gian</TableColumn>
        <TableColumn>Khoa</TableColumn>
        <TableColumn>Loại Phòng</TableColumn>
        <TableColumn>Ghi chú</TableColumn>
        <TableColumn width={120} align="center">Trạng Thái</TableColumn>
        <TableColumn width={100} align="center">Thao tác</TableColumn>
        </TableHeader>
          <TableBody>
            {list.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()) || r.code?.toLowerCase().includes(search.toLowerCase())).map((item) => (
              <TableRow key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                <TableCell className="font-mono text-xs font-bold text-gray-800">{item.code}</TableCell>
                <TableCell className="font-semibold text-gray-700">{item.name}</TableCell>
                <TableCell className="text-xs text-gray-500 font-mono">
                  {item.start_time ? `${item.start_time.substring(0,5)} - ${item.end_time.substring(0,5)}` : '—'}
                </TableCell>
                <TableCell className="text-blue-700 font-semibold text-sm">{item.department_name || '—'}</TableCell>
                <TableCell className="text-sm text-gray-600 font-medium">{item.type}</TableCell>
                <TableCell className="text-xs text-gray-400 italic max-w-xs truncate">{item.description || '—'}</TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Switch size="sm" isSelected={item.status === 'ACTIVE'} onValueChange={() => handleToggle(item.id, item.status)} color="success" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-3 justify-center">
                    <IconEdit size={18} className="text-blue-500 cursor-pointer hover:text-blue-700" onClick={() => handleOpenEdit(item)} />
                    <IconTrash size={18} className="text-gray-400 cursor-pointer hover:text-red-500" onClick={() => handleDelete(item.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="right" size="md">
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="border-b bg-gray-50 font-bold text-gray-800">
                {selectedId ? "Chỉnh sửa thông tin phòng" : "Thêm mới phòng chức năng"}
              </DrawerHeader>
              <DrawerBody className="gap-4 pt-4">
                <Input 
                  label="Mã Phòng *" 
                  placeholder="Nhập mã phòng (Cc001)" 
                  value={form.code} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, code: e.target.value})} 
                  disabled={selectedId !== null} 
                  className={selectedId ? "opacity-70" : ""} 
                />
                <Input 
                  label="Tên Phòng *" 
                  placeholder="Nhập tên phòng chức năng" 
                  value={form.name} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, name: e.target.value})} 
                />
                
                <Select 
                  label="Khoa *" 
                  selectedKeys={form.department_code ? [form.department_code] : []} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, department_code: e.target.value})}
                >
                  {departments.map(d => <SelectItem key={d.code} textValue={d.name}>{d.name}</SelectItem>)}
                </Select>

                {/* DROPDOWN 9 LOẠI PHÒNG ĐẦY ĐỦ THEO ẢNH FIGMA MỚI */}
                <Select 
                  label="Loại phòng *" 
                  selectedKeys={[form.type]} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, type: e.target.value})}
                >
                  {ROOM_TYPES.map(type => <SelectItem key={type} textValue={type}>{type}</SelectItem>)}
                </Select>

                <Select 
                  label="Form khám bệnh" 
                  selectedKeys={form.medical_form ? [form.medical_form] : []} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, medical_form: e.target.value})}
                >
                  <SelectItem key="Mẫu khám nội tổng quát">Mẫu khám nội tổng quát</SelectItem>
                  <SelectItem key="Mẫu răng hàm mặt nâng cao">Mẫu răng hàm mặt nâng cao</SelectItem>
                  <SelectItem key="Mẫu sơ cứu ban đầu">Mẫu sơ cứu ban đầu</SelectItem>
                </Select>

                <div className="grid grid-cols-2 gap-2">
                  <Input type="time" label="Giờ bắt đầu làm việc" value={form.start_time} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, start_time: e.target.value})} />
                  <Input type="time" label="Giờ kết thúc" value={form.end_time} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, end_time: e.target.value})} />
                </div>

                {/* THÊM Ô TEXTAREA GHI CHÚ TRONG FORM NHẬP LIỆU */}
                <Textarea 
                  label="Ghi chú" 
                  placeholder="Nhập thông tin ghi chú hiển thị (Ví dụ: Hoạt động 24/24)..." 
                  value={form.description} 
                  onValueChange={(val: string) => setForm({...form, description: val})} 
                />
              </DrawerBody>
              <DrawerFooter className="border-t bg-gray-50">
                <Button variant="bordered" onClick={onClose}>Thoát (ESC)</Button>
                <Button color="primary" onClick={handleSave}>Lưu thông tin (Ctrl+S)</Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default RoomCategory;