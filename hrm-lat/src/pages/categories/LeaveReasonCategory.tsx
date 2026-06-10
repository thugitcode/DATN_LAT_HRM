import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Button, Input, Select, SelectItem, Switch, Drawer, DrawerContent, 
  DrawerHeader, DrawerBody, DrawerFooter, useDisclosure, Table, 
  TableHeader, TableBody, TableColumn, TableRow, TableCell, Chip, Checkbox, Textarea
} from '@heroui/react';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';

const LeaveReasonCategory = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const [records, setRecords] = useState<any[]>([]);
  const [funds, setFunds] = useState<any[]>([]); 
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    code: '', name: '', shortCode: '', salaryRate: '100', leaveFundId: '', requireDocument: false, note: ''
  });

  const fetchData = async () => {
    try {
      const resData = await axios.get('http://localhost:5000/api/v1/leave-reasons');
      if (resData.data.success) setRecords(resData.data.data);

      const resFunds = await axios.get('http://localhost:5000/api/v1/leave-reasons/funds');
      if (resFunds.data.success) setFunds(resFunds.data.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddNew = () => {
    setEditId(null);
    setFormData({
      code: '', name: '', shortCode: '', salaryRate: '100', 
      leaveFundId: funds[0]?.id?.toString() || '', requireDocument: false, note: ''
    });
    onOpen();
  };

  const handleEdit = (record: any) => {
    setEditId(record.id);
    setFormData({
      code: record.code || '',
      name: record.name || '',
      shortCode: record.short_code || '',
      salaryRate: record.salary_rate?.toString() || '0',
      leaveFundId: record.leave_fund_id?.toString() || '',
      requireDocument: record.require_document === 1 || record.require_document === true,
      note: record.note || ''
    });
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        short_code: formData.shortCode,
        salary_rate: parseInt(formData.salaryRate),
        leave_fund_id: parseInt(formData.leaveFundId),
        require_document: formData.requireDocument,
        note: formData.note,
        status: true
      };

      if (editId) {
        await axios.put(`http://localhost:5000/api/v1/leave-reasons/${editId}`, payload);
        alert('🎉 Cập nhật lý do nghỉ thành công!');
      } else {
        await axios.post('http://localhost:5000/api/v1/leave-reasons', payload);
        alert('🎉 Thêm lý do nghỉ mới thành công!');
      }
      onClose();
      fetchData();
    } catch (error: any) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || 'Thao tác thất bại'));
    }
  };

  const handleToggleStatus = async (record: any, newStatus: boolean) => {
    try {
      await axios.put(`http://localhost:5000/api/v1/leave-reasons/${record.id}`, {
        ...record,
        status: newStatus ? 'ACTIVE' : 'INACTIVE'
      });
      fetchData();
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lý do nghỉ này?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/leave-reasons/${id}`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi xóa!');
    }
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

      {/* LƯỚI HIỂN THỊ DỮ LIỆU ĐÚNG MẪU FIGMA */}
      <div className="flex-1 overflow-auto rounded-lg border border-gray-200">
        <Table aria-label="Danh mục lý do nghỉ" removeWrapper className="w-full">
          <TableHeader>
            <TableColumn>Mã</TableColumn>
            <TableColumn>Tên lý do nghỉ</TableColumn>
            <TableColumn>Mức hưởng lương</TableColumn>
            <TableColumn>Quỹ nghỉ</TableColumn>
            <TableColumn>Yêu cầu hồ sơ</TableColumn>
            <TableColumn align="center">Trạng thái</TableColumn>
            <TableColumn align="center">Hành động</TableColumn>
          </TableHeader>
          <TableBody>
            {filteredRecords.length > 0 ? filteredRecords.map((r) => (
              <TableRow key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <TableCell className="font-semibold text-gray-700">{r.code}</TableCell>
                <TableCell className="text-gray-700">{r.name}</TableCell>
                <TableCell className="text-gray-700">{r.salary_rate}</TableCell>
                <TableCell className="text-gray-600">{r.fund_name || 'Chưa phân quỹ'}</TableCell>
                <TableCell className="text-gray-700">
                  {r.require_document === 1 ? 'Có' : 'Không'}
                </TableCell>
                <TableCell align="center">
                  <Chip size="sm" variant="flat" color={r.status === 'ACTIVE' ? "primary" : "default"} className="font-medium">
                    {r.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng HĐ'}
                  </Chip>
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
                <TableCell className="text-gray-400 text-center py-8">Chưa có dữ liệu lý do nghỉ</TableCell>
                <TableCell> </TableCell><TableCell> </TableCell><TableCell> </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* DRAWER FORM CHUẨN ĐÉT THEO ẢNH FIGMA CỦA BẠN */}
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="right" size="xl">
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="border-b bg-gray-50 font-bold text-lg">Thêm mới lý do nghỉ</DrawerHeader>
              <DrawerBody className="pt-6 pb-6 flex flex-col gap-5 overflow-y-auto">
                
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Thông tin</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input name="code" value={formData.code} onChange={handleChange} label="Mã lý do nghỉ" placeholder="Nhập" isRequired isDisabled={!!editId} />
                    <Input name="name" value={formData.name} onChange={handleChange} label="Tên lý do nghỉ" placeholder="Nhập" isRequired />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input name="shortCode" value={formData.shortCode} onChange={handleChange} label="Ký tự viết tắt do nghỉ" placeholder="Nhập" isRequired />
                    <Input type="number" name="salaryRate" value={formData.salaryRate} onChange={handleChange} label="Mức lương hưởng (%)" placeholder="Nhập" isRequired endContent={<span className="text-gray-400 text-sm">%</span>} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Select 
                      label="Quỹ nghỉ" 
                      placeholder="Chọn"
                      selectedKeys={formData.leaveFundId ? [formData.leaveFundId] : []}
                      onChange={(e) => setFormData({ ...formData, leaveFundId: e.target.value })}
                      isRequired
                    >
                      {funds.map((f) => (
                        <SelectItem key={f.id.toString()}>{f.name}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="mt-2">
                    <Checkbox 
                      isSelected={formData.requireDocument} 
                      onValueChange={(val) => setFormData({ ...formData, requireDocument: val })}
                      className="text-sm font-medium text-gray-700"
                    >
                      Yêu cầu bổ sung hồ sơ sau
                    </Checkbox>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ghi chú</h4>
                  <Textarea name="note" value={formData.note} onChange={handleChange} placeholder="Nhập" minRows={3} />
                </div>

              </DrawerBody>

              <DrawerFooter className="border-t bg-gray-50">
                <Button variant="bordered" onClick={onClose} className="font-medium rounded-lg px-6">Thoát (ESC)</Button>
                <Button color="primary" onClick={handleSubmit} className="font-medium rounded-lg px-6">Lưu (Ctrl+S)</Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default LeaveReasonCategory;