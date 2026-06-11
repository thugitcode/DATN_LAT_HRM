import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, 
  Input, Button, Switch, useDisclosure, Drawer, DrawerContent, 
  DrawerHeader, DrawerBody, DrawerFooter, Select, SelectItem, Textarea 
} from '@heroui/react';
import { IconPlus, IconSearch, IconTrash, IconEdit } from '@tabler/icons-react';

const DepartmentCategory = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [list, setList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [form, setForm] = useState({ 
    code: '', 
    name: '', 
    byt_code: '', 
    type: 'Khám bệnh', 
    description: '' 
  });

  const loadData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/departments');
      if (res.data.success) setList(res.data.data);
    } catch (err) { 
      console.error('Lỗi kết nối API lấy danh sách khoa:', err); 
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenAdd = () => {
    setSelectedId(null);
    setForm({ code: '', name: '', byt_code: '', type: 'Khám bệnh', description: '' });
    onOpen();
  };

  const handleOpenEdit = (item: any) => {
    setSelectedId(item.id);
    setForm({ 
      code: item.code, 
      name: item.name, 
      byt_code: item.byt_code || '', 
      type: item.type, 
      description: item.description || '' 
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      if (selectedId) {
        const res = await axios.put(`http://localhost:5000/api/v1/departments/${selectedId}`, form);
        alert(res.data.message);
      } else {
        const res = await axios.post('http://localhost:5000/api/v1/departments', form);
        alert(res.data.message);
      }
      onClose(); 
      loadData();
    } catch (err: any) { 
      alert(err.response?.data?.message || 'Lỗi lưu thông tin!'); 
    }
  };

  const handleToggle = async (id: number, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await axios.put(`http://localhost:5000/api/v1/departments/toggle/${id}`, { status: nextStatus });
      loadData();
    } catch (err) { 
      alert('Không thể đổi trạng thái hoạt động'); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa khoa này khỏi hệ thống?')) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/v1/departments/${id}`);
      alert(res.data.message); 
      loadData();
    } catch (err: any) { 
      alert(err.response?.data?.message || 'Khoa đang có dữ liệu ràng buộc, không thể xóa!'); 
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Input 
          classNames={{ base: "max-w-xs", inputWrapper: "bg-gray-100" }}
          placeholder="Tìm kiếm theo mã hoặc tên khoa..." 
          value={search} 
          onValueChange={setSearch}
          startContent={<IconSearch size={16} className="text-gray-400" />}
        />
        <Button color="primary" startContent={<IconPlus size={16}/>} onClick={handleOpenAdd} className="font-semibold rounded-lg">
          Thêm khoa
        </Button>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <Table aria-label="Department Master Table" removeWrapper>
          <TableHeader>
            <TableColumn>Mã Khoa</TableColumn>
            <TableColumn>Tên Khoa Bệnh Viện</TableColumn>
            <TableColumn>Mã Bộ Y Tế</TableColumn>
            <TableColumn>Loại Khoa</TableColumn>
            <TableColumn>Ghi chú</TableColumn>
            <TableColumn width={120} align="center">Trạng Thái</TableColumn>
            <TableColumn width={100} align="center">Hành Động</TableColumn>
          </TableHeader>
          <TableBody>
            {list.filter(item => item.name?.toLowerCase().includes(search.toLowerCase()) || item.code?.toLowerCase().includes(search.toLowerCase())).map((item) => (
              <TableRow key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                <TableCell className="font-mono text-xs font-bold text-gray-800">{item.code}</TableCell>
                <TableCell className="font-semibold text-gray-700">{item.name}</TableCell>
                <TableCell className="font-mono text-gray-500 text-xs">{item.byt_code || '—'}</TableCell>
                <TableCell className="text-sm text-gray-600 font-medium">{item.type}</TableCell>
                <TableCell className="text-xs text-gray-400 italic max-w-xs truncate">
                    {item.description || '—'}
                </TableCell>
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
                {selectedId ? "Cập nhật thông tin khoa" : "Thêm mới Khoa bệnh viện"}
              </DrawerHeader>
              <DrawerBody className="gap-4 pt-4">
                <Input 
                  label="Mã Khoa *" 
                  placeholder="Nhập mã khoa (VD: KNTH)" 
                  value={form.code} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, code: e.target.value})} 
                  disabled={selectedId !== null} 
                  className={selectedId ? "opacity-70" : ""} 
                />
                <Input 
                  label="Tên Khoa Bệnh Viện *" 
                  placeholder="Nhập tên khoa" 
                  value={form.name} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, name: e.target.value})} 
                />
                <Input 
                  label="Mã Bộ Y Tế" 
                  placeholder="Nhập mã chuẩn BYT nếu có" 
                  value={form.byt_code} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, byt_code: e.target.value})} 
                />
                
                <Select 
                  label="Loại khoa *" 
                  selectedKeys={[form.type]} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, type: e.target.value})}
                >
                  <SelectItem key="Khám bệnh">Khám bệnh</SelectItem>
                  <SelectItem key="Nội khoa">Nội khoa</SelectItem>
                  <SelectItem key="Dược">Dược</SelectItem>
                  <SelectItem key="Tài chính">Tài chính</SelectItem>
                  <SelectItem key="Xét nghiệm">Xét nghiệm</SelectItem>
                  <SelectItem key="CDHA">CDHA</SelectItem>
                  <SelectItem key="Nội trú">Nội trú</SelectItem>
                  <SelectItem key="Khác">Khác</SelectItem>
                </Select>

                <Textarea 
                  label="Ghi chú / Mô tả" 
                  placeholder="Nhập thông tin ghi chú..." 
                  value={form.description} 
                  onValueChange={(val: string) => setForm({...form, description: val})} 
                />
              </DrawerBody>
              <DrawerFooter className="border-t bg-gray-50">
                <Button variant="bordered" onClick={onClose}>Thoát (ESC)</Button>
                <Button color="primary" onClick={handleSave}>Lưu dữ liệu (Ctrl+S)</Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default DepartmentCategory;