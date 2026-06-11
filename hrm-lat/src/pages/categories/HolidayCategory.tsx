import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Button, Input, Select, SelectItem, Drawer, DrawerContent, 
  DrawerHeader, DrawerBody, DrawerFooter, useDisclosure, Table, 
  TableHeader, TableBody, TableColumn, TableRow, TableCell, Checkbox, Textarea, RadioGroup, Radio
} from '@heroui/react';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';

const HolidayCategory = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('2026'); // Dropdown lọc năm chuẩn UI mẫu

  const [formData, setFormData] = useState({
    name: '', startDate: '', endDate: '', salaryCoefLeave: '1.0', salaryCoefWork: '1.0',
    isAnnualFixed: true, applyType: 'ALL', employeeIds: [] as string[], note: ''
  });

  const fetchData = async () => {
    try {
      const resData = await axios.get('http://localhost:5000/api/v1/holidays');
      if (resData.data.success) setRecords(resData.data.data);

      const resEmps = await axios.get('http://localhost:5000/api/v1/holidays/employees');
      if (resEmps.data.success) setEmployees(resEmps.data.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddNew = () => {
    setEditId(null);
    setFormData({
      name: '', startDate: '', endDate: '', salaryCoefLeave: '1.0', salaryCoefWork: '1.0',
      isAnnualFixed: true, applyType: 'ALL', employeeIds: [], note: ''
    });
    onOpen();
  };

  const handleEdit = (record: any) => {
    setEditId(record.id);
    setFormData({
      name: record.name || '',
      // SỬA: Đổ trực tiếp chuỗi sạch từ DB vào ô input date mà không lo lệch múi giờ
      startDate: record.start_date || '', 
      endDate: record.end_date || '',
      salaryCoefLeave: record.salary_coef_leave?.toString() || '1.0',
      salaryCoefWork: record.salary_coef_work?.toString() || '1.0',
      isAnnualFixed: record.is_annual_fixed === 1,
      applyType: record.apply_type || 'ALL',
      employeeIds: record.employee_ids ? record.employee_ids.map((id: any) => id.toString()) : [],
      note: record.note || ''
    });
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        start_date: formData.startDate,
        end_date: formData.endDate,
        salary_coef_leave: parseFloat(formData.salaryCoefLeave),
        salary_coef_work: parseFloat(formData.salaryCoefWork),
        is_annual_fixed: formData.isAnnualFixed,
        apply_type: formData.applyType,
        employee_ids: formData.applyType === 'SPECIFIC' ? formData.employeeIds.map(id => parseInt(id)) : [],
        note: formData.note
      };

      if (editId) {
        await axios.put(`http://localhost:5000/api/v1/holidays/${editId}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/v1/holidays', payload);
      }
      onClose(); fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra, thao tác thất bại!');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ngày nghỉ lễ này?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/holidays/${id}`);
      fetchData();
    } catch (error: any) { alert(error.response?.data?.message || 'Lỗi xóa!'); }
  };

  // Logic lọc song song: Vừa tìm kiếm từ khóa, vừa lọc theo Năm được chọn từ Dropdown phía trên bên phải
  const filteredRecords = records.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = r.start_date?.startsWith(yearFilter);
    return matchesSearch && matchesYear;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="flex flex-col h-full bg-white p-6 rounded-xl shadow-sm">
      {/* TOOLBAR KHỚP 100% ẢNH MẪU */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <Input 
          classNames={{ base: "max-w-sm", inputWrapper: "h-10 bg-gray-100" }}
          placeholder="Tìm kiếm..."
          startContent={<IconSearch size={18} />}
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <div className="flex items-center gap-3">
          <Select 
            className="w-32" 
            selectedKeys={[yearFilter]} 
            size="sm"
            onSelectionChange={(keys) => setYearFilter(Array.from(keys)[0] as string)}
          >
            <SelectItem key="2026">Năm 2026</SelectItem>
            <SelectItem key="2025">Năm 2025</SelectItem>
          </Select>
          <Button color="primary" startContent={<IconPlus size={18} onClick={handleAddNew} />} onClick={handleAddNew} className="font-medium rounded-lg">
            Thêm mới
          </Button>
        </div>
      </div>

      {/* LƯỚI DANH SÁCH PIXEL-PERFECT */}
      <div className="flex-1 overflow-auto rounded-lg border border-gray-200">
        <Table aria-label="Danh mục ngày nghỉ lễ" removeWrapper className="w-full">
          <TableHeader>
            <TableColumn width={60}>STT</TableColumn>
            <TableColumn>Tên ngày lễ</TableColumn>
            <TableColumn>Thời gian</TableColumn>
            <TableColumn>Hệ số công nghỉ</TableColumn>
            <TableColumn>Hệ số công làm</TableColumn>
            <TableColumn width={300}>Ghi chú</TableColumn>
            <TableColumn align="center">Hành động</TableColumn>
          </TableHeader>
          <TableBody>
            {filteredRecords.length > 0 ? filteredRecords.map((r, index) => (
              <TableRow key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <TableCell className="text-gray-500 text-sm">{index + 1}</TableCell>
                <TableCell className="text-gray-700 font-medium">{r.name}</TableCell>
                <TableCell className="text-gray-700 text-sm">
                  {r.start_date === r.end_date ? formatDate(r.start_date) : `${formatDate(r.start_date)} - ${formatDate(r.end_date)}`}
                </TableCell>
                <TableCell className="text-gray-700 font-semibold">{r.salary_coef_leave}</TableCell>
                <TableCell className="text-gray-700 font-semibold">{r.salary_coef_work}</TableCell>
                <TableCell className="text-gray-600 text-sm max-w-xs truncate">{r.note || '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-4 justify-center text-gray-400">
                    <IconEdit size={18} className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleEdit(r)} />
                    <IconTrash size={18} className="cursor-pointer hover:text-red-500 transition-colors" onClick={() => handleDelete(r.id)} />
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell> </TableCell><TableCell> </TableCell><TableCell> </TableCell>
                <TableCell className="text-gray-400 text-center py-8">Chưa có dữ liệu ngày nghỉ lễ</TableCell>
                <TableCell> </TableCell><TableCell> </TableCell><TableCell> </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* DRAWER FORM THÊM MỚI THEO FIGMA */}
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="right" size="xl">
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="border-b bg-gray-50 font-bold text-lg">Thêm mới nghỉ lễ</DrawerHeader>
              <DrawerBody className="pt-6 pb-6 flex flex-col gap-5 overflow-y-auto">
                
                {/* Khối 1: Thông tin ngày nghỉ */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Thông tin ngày nghỉ</h4>
                  
                  <Input name="name" value={formData.name} onChange={handleChange} label="Tên ngày nghỉ" placeholder="Nhập" isRequired />

                  <div className="grid grid-cols-2 gap-4">
                    <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} label="Ngày bắt đầu" isRequired />
                    <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} label="Ngày kết thúc" isRequired />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input type="number" step="0.1" name="salaryCoefLeave" value={formData.salaryCoefLeave} onChange={handleChange} label="Hệ số công nghỉ" placeholder="Nhập" />
                    <Input type="number" step="0.1" name="salaryCoefWork" value={formData.salaryCoefWork} onChange={handleChange} label="Hệ số công làm" placeholder="Nhập" />
                  </div>

                  <div className="mt-1">
                    <Checkbox isSelected={formData.isAnnualFixed} onValueChange={(val) => setFormData({ ...formData, isAnnualFixed: val })}>
                      Lặp lại hàng năm
                    </Checkbox>
                  </div>
                </div>

                {/* Khối 2: Nhân viên áp dụng */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Nhân viên áp dụng</h4>
                  
                  <RadioGroup value={formData.applyType} onValueChange={(val) => setFormData({ ...formData, applyType: val })}>
                    <Radio value="ALL">Áp dụng cho tất cả nhân viên</Radio>
                    <Radio value="SPECIFIC">Tên nhân viên</Radio>
                  </RadioGroup>

                  {formData.applyType === 'SPECIFIC' && (
                    <div className="mt-2 animate-appearance-in">
                      <Select 
                        label="Chọn nhân viên hưởng lễ" 
                        placeholder="Bấm để chọn nhiều..."
                        selectionMode="multiple"
                        selectedKeys={new Set(formData.employeeIds)}
                        onSelectionChange={(keys) => setFormData({ ...formData, employeeIds: Array.from(keys) as string[] })}
                      >
                        {employees.map((e) => (
                          <SelectItem key={e.id.toString()}>{e.name}</SelectItem>
                        ))}
                      </Select>
                    </div>
                  )}
                </div>

                {/* Khối 3: Ghi chú */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ghi chú</h4>
                  <Textarea name="note" value={formData.note} onChange={handleChange} placeholder="Nhập" minRows={3} />
                </div>

              </DrawerBody>

              <DrawerFooter className="border-t bg-gray-50">
                <Button variant="bordered" onClick={onClose}>Thoát (ESC)</Button>
                <Button color="primary" onClick={handleSubmit}>Lưu (Ctrl+S)</Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default HolidayCategory;