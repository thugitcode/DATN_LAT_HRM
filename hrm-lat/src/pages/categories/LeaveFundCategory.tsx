import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Button, Input, Select, SelectItem, Switch, Drawer, DrawerContent, 
  DrawerHeader, DrawerBody, DrawerFooter, useDisclosure, Table, 
  TableHeader, TableBody, TableColumn, TableRow, TableCell, Checkbox, Textarea
} from '@heroui/react';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';

const LeaveFundCategory = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const [records, setRecords] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    code: '', name: '', allowanceValue: '', allowanceUnit: 'DAYS_PER_YEAR',
    maxLimitValue: '', maxLimitUnit: 'DAYS_PER_YEAR', isCarriedForward: false,
    expirationDate: '31/03', carryForwardRate: '100', note: ''
  });

  const fetchFunds = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/leave-funds');
      if (response.data.success) setRecords(response.data.data);
    } catch (error) { console.error('Lỗi lấy dữ liệu quỹ nghỉ:', error); }
  };

  useEffect(() => { fetchFunds(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddNew = () => {
    setEditId(null);
    setFormData({
      code: '', name: '', allowanceValue: '', allowanceUnit: 'DAYS_PER_YEAR',
      maxLimitValue: '', maxLimitUnit: 'DAYS_PER_YEAR', isCarriedForward: false,
      expirationDate: '31/03', carryForwardRate: '100', note: ''
    });
    onOpen();
  };

  const handleEdit = (record: any) => {
    setEditId(record.id);
    setFormData({
      code: record.code || '',
      name: record.name || '',
      allowanceValue: record.allowance_value?.toString() || '',
      allowanceUnit: record.allowance_unit || 'DAYS_PER_YEAR',
      maxLimitValue: record.max_limit_value?.toString() || '',
      maxLimitUnit: record.max_limit_unit || 'DAYS_PER_YEAR',
      isCarriedForward: record.is_carried_forward === 1 || record.is_carried_forward === true,
      expirationDate: record.expiration_date || '31/03',
      carryForwardRate: record.carry_forward_rate?.toString() || '100',
      note: record.note || ''
    });
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        allowance_value: parseFloat(formData.allowanceValue),
        allowance_unit: formData.allowanceUnit,
        max_limit_value: formData.maxLimitValue ? parseInt(formData.maxLimitValue) : null,
        max_limit_unit: formData.maxLimitUnit,
        is_carried_forward: formData.isCarriedForward,
        expiration_date: formData.isCarriedForward ? formData.expirationDate : null,
        carry_forward_rate: formData.isCarriedForward ? parseInt(formData.carryForwardRate) : null,
        note: formData.note,
        status: true
      };

      if (editId) {
        await axios.put(`http://localhost:5000/api/v1/leave-funds/${editId}`, payload);
        alert('🎉 Cập nhật quỹ nghỉ thành công!');
      } else {
        await axios.post('http://localhost:5000/api/v1/leave-funds', payload);
        alert('🎉 Tạo quỹ nghỉ thành công!');
      }
      onClose(); fetchFunds();
    } catch (error: any) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || 'Thao tác thất bại'));
    }
  };

  const handleToggleStatus = async (record: any, newStatus: boolean) => {
    try {
      await axios.put(`http://localhost:5000/api/v1/leave-funds/${record.id}`, {
        ...record, status: newStatus ? 'ACTIVE' : 'INACTIVE'
      });
      fetchFunds();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa quỹ nghỉ này?')) return;
    try {
      await axios.delete('http://localhost:5000/api/v1/leave-funds/' + id);
      fetchFunds();
    } catch (error: any) { alert(error.response?.data?.message || 'Lỗi xóa!'); }
  };

  const getUnitLabel = (unit: string) => {
    if (unit === 'HOURS_PER_DAY') return 'Giờ/ngày';
    if (unit === 'DAYS_PER_MONTH') return 'Ngày/tháng';
    return 'Ngày/năm';
  };

  const filteredRecords = records.filter(r =>
    r.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white p-6 rounded-xl shadow-sm">
      {/* TOOLBAR */}
      <div className="flex justify-between items-center mb-6">
        <Input 
          classNames={{ base: "max-w-sm", inputWrapper: "h-10 bg-gray-100" }}
          placeholder="Tìm kiếm..."
          startContent={<IconSearch size={18} />}
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <Button color="primary" startContent={<IconPlus size={18} />} onClick={handleAddNew} className="font-medium rounded-lg">
          Thêm mới
        </Button>
      </div>

      {/* BẢNG LƯỚI KHỚP 100% FIGMA */}
      <div className="flex-1 overflow-auto rounded-lg border border-gray-200">
        <Table aria-label="Danh mục quỹ nghỉ" removeWrapper className="w-full">
          <TableHeader>
            <TableColumn width={60}>STT</TableColumn>
            <TableColumn>Mã quỹ nghỉ</TableColumn>
            <TableColumn>Tên quỹ nghỉ</TableColumn>
            <TableColumn>Thời gian nghỉ</TableColumn>
            <TableColumn width={350}>Ghi chú</TableColumn>
            <TableColumn>Cộng dồn</TableColumn>
            <TableColumn align="center">Hành động</TableColumn>
          </TableHeader>
          <TableBody>
            {filteredRecords.length > 0 ? filteredRecords.map((r, index) => (
              <TableRow key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <TableCell className="text-gray-500 text-sm">{index + 1}</TableCell>
                <TableCell className="font-semibold text-gray-700">{r.code}</TableCell>
                <TableCell className="text-gray-700 font-medium">{r.name}</TableCell>
                
                {/* Logic hiển thị dấu Bullet đa dòng cho thời gian nghỉ */}
                <TableCell>
                  <div className="flex flex-col gap-0.5 text-gray-700 text-sm">
                    <span>• {r.allowance_value} {getUnitLabel(r.allowance_unit)}</span>
                    {r.max_limit_value && (
                      <span>• {r.max_limit_value} {getUnitLabel(r.max_limit_unit)}</span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="text-gray-600 text-sm max-w-xs truncate">
                  {r.note || '—'}
                </TableCell>
                
                <TableCell className="text-gray-700 text-sm">
                  {r.is_carried_forward === 1 ? 'Có' : 'Không'}
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-3 justify-center text-gray-400">
                    <Switch 
                      isSelected={r.status === 'ACTIVE'} 
                      size="sm" 
                      color="success" 
                      onValueChange={(val) => handleToggleStatus(r, val)} 
                    />
                    <IconEdit size={18} className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleEdit(r)} />
                    <IconTrash size={18} className="cursor-pointer hover:text-red-500 transition-colors" onClick={() => handleDelete(r.id)} />
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell> </TableCell><TableCell> </TableCell><TableCell> </TableCell>
                <TableCell className="text-gray-400 text-center py-8">Chưa có dữ liệu quỹ nghỉ</TableCell>
                <TableCell> </TableCell><TableCell> </TableCell><TableCell> </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* DRAWER FORM */}
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="right" size="xl">
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="border-b bg-gray-50 font-bold text-lg">Thêm mới quỹ nghỉ</DrawerHeader>
              <DrawerBody className="pt-6 pb-6 flex flex-col gap-5 overflow-y-auto">
                
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Thông tin</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input name="code" value={formData.code} onChange={handleChange} label="Mã quỹ nghỉ" placeholder="Nhập" isRequired isDisabled={!!editId} />
                    <Input name="name" value={formData.name} onChange={handleChange} label="Tên quỹ nghỉ" placeholder="Nhập" isRequired />
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-end">
                    <Input type="number" name="allowanceValue" value={formData.allowanceValue} onChange={handleChange} label="Thời gian nghỉ" placeholder="Nhập" isRequired />
                    <Select label="Đơn vị tính thời gian" selectedKeys={[formData.allowanceUnit]} onChange={(e) => setFormData({ ...formData, allowanceUnit: e.target.value })}>
                      <SelectItem key="HOURS_PER_DAY">Giờ/ngày</SelectItem>
                      <SelectItem key="DAYS_PER_MONTH">Ngày/tháng</SelectItem>
                      <SelectItem key="DAYS_PER_YEAR">Ngày/năm</SelectItem>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-end">
                    <Input type="number" name="maxLimitValue" value={formData.maxLimitValue} onChange={handleChange} label="Hạn mức tối đa (Nếu có)" placeholder="Nhập" />
                    <Select label="Đơn vị hạn mức" selectedKeys={[formData.maxLimitUnit]} onChange={(e) => setFormData({ ...formData, maxLimitUnit: e.target.value })}>
                      <SelectItem key="DAYS_PER_MONTH">Ngày/tháng</SelectItem>
                      <SelectItem key="DAYS_PER_YEAR">Ngày/năm</SelectItem>
                    </Select>
                  </div>

                  <div className="mt-2 flex flex-col gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100/40">
                    <Checkbox isSelected={formData.isCarriedForward} onValueChange={(val) => setFormData({ ...formData, isCarriedForward: val })}>
                      Cho phép cộng dồn thời gian nghỉ còn dư sang chu kỳ sau
                    </Checkbox>
                    
                    {formData.isCarriedForward && (
                      <div className="grid grid-cols-2 gap-4 mt-2 animate-appearance-in">
                        <Input name="expirationDate" value={formData.expirationDate} onChange={handleChange} label="Hạn hết hạn cộng dồn" placeholder="VD: 31/03" />
                        <Input type="number" name="carryForwardRate" value={formData.carryForwardRate} onChange={handleChange} label="Tỷ lệ cộng dồn tối đa (%)" endContent={<span className="text-gray-400 text-sm">%</span>} />
                      </div>
                    )}
                  </div>
                </div>

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

export default LeaveFundCategory;