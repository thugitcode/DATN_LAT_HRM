import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Button, Input, Select, SelectItem, Switch, Drawer, DrawerContent, 
  DrawerHeader, DrawerBody, DrawerFooter, useDisclosure, Dropdown, 
  DropdownTrigger, DropdownMenu, DropdownItem, Table, TableHeader, 
  TableBody, TableColumn, TableRow, TableCell, Chip
} from '@heroui/react';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';

const ShiftCategory = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const [records, setRecords] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // State tìm kiếm

  const [shiftType, setShiftType] = useState<string>('FIXED');
  const [breakTimes, setBreakTimes] = useState([{ id: Date.now(), start: '', end: '' }]);
  const [formData, setFormData] = useState({
    code: '', name: '', startTime: '', endTime: '', workHours: '', handoverTime: '',
    lateGrace: '0', earlyGrace: '0', workCoef: '1.0', allowance: '0', exchangeType: 'SHIFT', exchangeCoef: '1.0', restTimeAfter: '0'
  });

  const fetchShifts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/shifts');
      if (response.data.success) {
        setRecords(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddNew = (type: string) => {
    setEditId(null);
    setShiftType(type);
    setBreakTimes([{ id: Date.now(), start: '', end: '' }]);
    setFormData({
      code: '', name: '', startTime: '', endTime: '', workHours: '', handoverTime: '',
      lateGrace: '0', earlyGrace: '0', workCoef: '1.0', allowance: '0', exchangeType: 'SHIFT', exchangeCoef: '1.0', restTimeAfter: '0'
    });
    onOpen();
  };

  const handleEdit = (record: any) => {
    setEditId(record.id);
    setShiftType(record.shift_type);
    
    let parsedBreakTimes = [{ id: Date.now(), start: '', end: '' }];
    if (record.break_times) {
      try {
        const parsed = typeof record.break_times === 'string' ? JSON.parse(record.break_times) : record.break_times;
        if (Array.isArray(parsed) && parsed.length > 0) parsedBreakTimes = parsed;
      } catch(e) {}
    }
    setBreakTimes(parsedBreakTimes);

    setFormData({
      code: record.code || '',
      name: record.name || '',
      startTime: record.start_time?.slice(0,5) || '',
      endTime: record.end_time?.slice(0,5) || '',
      workHours: record.work_hours || '',
      handoverTime: record.handover_time || '0',
      lateGrace: record.late_allowance || '0',
      earlyGrace: record.early_allowance || '0',
      workCoef: record.coefficient || '1.0',
      allowance: record.allowance || '0',
      exchangeType: record.comp_type || 'SHIFT',
      exchangeCoef: record.comp_coefficient || '1.0',
      restTimeAfter: record.rest_time_after || '0'
    });
    
    onOpen();
  };

  const addBreakTime = () => setBreakTimes([...breakTimes, { id: Date.now(), start: '', end: '' }]);
  const removeBreakTime = (id: number) => setBreakTimes(breakTimes.filter(b => b.id !== id));
  const handleBreakTimeChange = (id: number, field: 'start' | 'end', value: string) => {
    setBreakTimes(breakTimes.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleSubmit = async () => {
    try {
      const rules = shiftType === 'FIXED' 
        ? { lateGrace: formData.lateGrace, earlyGrace: formData.earlyGrace }
        : { workCoef: formData.workCoef, allowance: formData.allowance, exchangeType: formData.exchangeType, exchangeCoef: formData.exchangeCoef };

      const payload = {
        code: formData.code,
        name: formData.name,
        shift_type: shiftType,
        start_time: formData.startTime || null,
        end_time: formData.endTime || null,
        work_hours: formData.workHours || null,
        handover_time: formData.handoverTime || 0, 
        rest_time_after: formData.restTimeAfter || 0,
        break_times: breakTimes.filter(b => b.start && b.end),
        rules: rules,
        status: true
      };

      if (editId) {
        await axios.put(`http://localhost:5000/api/v1/shifts/${editId}`, payload);
        alert('🎉 Cập nhật thông tin ca thành công!');
      } else {
        await axios.post('http://localhost:5000/api/v1/shifts', payload);
        alert('🎉 Lưu ca làm việc mới thành công!');
      }
      
      onClose();     
      fetchShifts(); 
    } catch (error: any) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || 'Thao tác thất bại'));
    }
  };

  const handleToggleStatus = async (record: any, newStatus: boolean) => {
    try {
      await axios.put(`http://localhost:5000/api/v1/shifts/${record.id}`, { 
        ...record, 
        status: newStatus ? 'ACTIVE' : 'INACTIVE'
      });
      fetchShifts();
    } catch (error) {
      console.error('Lỗi khi đổi trạng thái');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ca này?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/shifts/${id}`);
      fetchShifts(); 
    } catch (error) {
      alert('Lỗi khi xóa!');
    }
  };

  // TỰ ĐỘNG LỌC DỮ LIỆU TÌM KIẾM THEO TÊN HOẶC MÃ CA
  const filteredRecords = records.filter(r => 
    r.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <Input 
          classNames={{ base: "max-w-sm", inputWrapper: "h-10 bg-gray-100" }}
          placeholder="Tìm kiếm mã ca hoặc tên ca..."
          startContent={<IconSearch size={18} />}
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <Dropdown>
          <DropdownTrigger>
            <Button color="primary" startContent={<IconPlus size={18} />}>Thêm mới</Button>
          </DropdownTrigger>
          <DropdownMenu onAction={(key) => handleAddNew(key as string)}>
            <DropdownItem key="FIXED">Ca cố định</DropdownItem>
            <DropdownItem key="FLEXIBLE">Ca linh hoạt</DropdownItem>
            <DropdownItem key="ON_CALL">Ca trực</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-gray-200">
        <Table aria-label="Danh sách ca làm việc" removeWrapper className="w-full">
          <TableHeader>
            <TableColumn>Mã ca</TableColumn>
            <TableColumn>Tên ca</TableColumn>
            <TableColumn>Loại ca</TableColumn>
            <TableColumn>Thời gian</TableColumn>
            <TableColumn>Quy tắc ca</TableColumn>
            <TableColumn align="center">Trạng thái</TableColumn>
            <TableColumn align="center">Hành động</TableColumn>
          </TableHeader>
          <TableBody>
            {/* Sử dụng filteredRecords thay vì records */}
            {filteredRecords.length > 0 ? filteredRecords.map((r) => (
              <TableRow key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                
                <TableCell className="font-semibold text-gray-700">{r.code}</TableCell>
                <TableCell className="text-gray-700">{r.name}</TableCell>
                <TableCell>
                  <span className="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-sm">
                    {r.shift_type === 'FIXED' ? 'Ca cố định' : r.shift_type === 'ON_CALL' ? 'Ca trực' : 'Ca linh hoạt'}
                  </span>
                </TableCell>

                <TableCell>
                  {r.shift_type === 'FIXED' ? (
                    <span className="text-gray-700">{r.start_time?.slice(0,5)} - {r.end_time?.slice(0,5)}</span>
                  ) : (
                    <div className="flex flex-col gap-1 text-gray-700">
                      <span>Số giờ làm việc: {r.work_hours} giờ</span>
                      <span>Thời gian bàn giao: {r.handover_time || 0} phút</span>
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex flex-col gap-1 text-gray-600 text-sm">
                    {r.shift_type === 'FIXED' ? (
                      <>
                        <span>• Đi muộn: {r.late_allowance || 0} phút</span>
                        <span>• Về sớm: {r.early_allowance || 0} phút</span>
                      </>
                    ) : (
                      <>
                        <span>• Hệ số ngày thường: {r.coefficient || 1.0}</span>
                        <span>• Phụ cấp: {Number(r.allowance || 0).toLocaleString('vi-VN')} VND</span>
                        {(r.shift_type === 'ON_CALL' || r.comp_coefficient > 0) && (
                          <>
                            <span>• Quy đổi: {r.comp_coefficient} / {r.comp_type === 'HOURS' ? 'Giờ' : 'Ca'}</span>
                            <span>• Nghỉ sau ca: {r.rest_time_after || 0} giờ</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>

                <TableCell align="center">
                  <Chip 
                    size="sm" 
                    color={r.status === 'ACTIVE' ? "success" : "default"} 
                    variant="flat" 
                    className="font-medium"
                  >
                    {r.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng HĐ'}
                  </Chip>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3 justify-center text-gray-500">
                    <Switch 
                      isSelected={r.status === 'ACTIVE'} 
                      size="sm" 
                      color="success" 
                      onValueChange={(val) => handleToggleStatus(r, val)}
                    />
                    <IconEdit 
                      size={18} 
                      className="cursor-pointer hover:text-blue-600 transition-colors" 
                      onClick={() => handleEdit(r)}
                    />
                    <IconTrash 
                      size={18} 
                      className="cursor-pointer hover:text-red-500 transition-colors" 
                      onClick={() => handleDelete(r.id)}
                    />
                  </div>
                </TableCell>
                
              </TableRow>
            )) : (
              <TableRow>
                <TableCell> </TableCell><TableCell> </TableCell><TableCell> </TableCell>
                <TableCell className="text-gray-400 text-center py-8">Không tìm thấy ca làm việc phù hợp</TableCell>
                <TableCell> </TableCell><TableCell> </TableCell><TableCell> </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="right" size="2xl">
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="border-b bg-gray-50">
                {editId ? 'Cập nhật ca làm việc' : 'Thêm mới ca làm việc'}
              </DrawerHeader>
              <DrawerBody className="pt-6 pb-6 overflow-y-auto">
                <h3 className="text-md font-bold text-gray-700 mb-3 uppercase text-sm">Thông tin ca</h3>
                <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <Input name="code" value={formData.code} onChange={handleChange} label="Mã ca" placeholder="Nhập" isRequired isDisabled={!!editId} />
                  <Input name="name" value={formData.name} onChange={handleChange} label="Tên ca" placeholder="Nhập" isRequired />
                  
                  {shiftType === 'FIXED' ? (
                    <>
                      <Input type="time" name="startTime" value={formData.startTime} onChange={handleChange} label="Giờ vào (Check-in)" isRequired />
                      <Input type="time" name="endTime" value={formData.endTime} onChange={handleChange} label="Giờ ra (Check-out)" isRequired />
                    </>
                  ) : (
                    <>
                      <Input type="number" name="workHours" value={formData.workHours} onChange={handleChange} label="Số giờ làm việc (giờ)" placeholder="Nhập" isRequired endContent={<div className="pointer-events-none flex items-center"><span className="text-default-400 text-small">giờ</span></div>} />
                      <Input type="number" name="handoverTime" value={formData.handoverTime} onChange={handleChange} label="Thời gian bàn giao ca" placeholder="Nhập" endContent={<div className="pointer-events-none flex items-center"><span className="text-default-400 text-small">phút</span></div>} />
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-bold text-gray-700 uppercase text-sm">Giờ nghỉ</h3>
                  <Button size="sm" variant="flat" color="primary" onPress={addBreakTime}>+ Thêm giờ nghỉ</Button>
                </div>
                <div className="flex flex-col gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {breakTimes.map((bt) => (
                    <div key={bt.id} className="flex gap-4 items-center">
                      <Input type="time" label="Bắt đầu" value={bt.start} onChange={(e) => handleBreakTimeChange(bt.id, 'start', e.target.value)} className="flex-1" />
                      <Input type="time" label="Kết thúc" value={bt.end} onChange={(e) => handleBreakTimeChange(bt.id, 'end', e.target.value)} className="flex-1" />
                      <Button isIconOnly color="danger" variant="light" onPress={() => removeBreakTime(bt.id)} isDisabled={breakTimes.length === 1}><IconTrash size={20} /></Button>
                    </div>
                  ))}
                </div>

                <h3 className="text-md font-bold text-gray-700 mb-3 uppercase text-sm">Cơ chế ca</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {shiftType === 'FIXED' ? (
                     <div className="grid grid-cols-2 gap-4">
                      <Input type="number" name="lateGrace" value={formData.lateGrace} onChange={handleChange} label="Cho phép đi muộn" endContent={<div className="pointer-events-none"><span className="text-default-400 text-small">phút</span></div>} />
                      <Input type="number" name="earlyGrace" value={formData.earlyGrace} onChange={handleChange} label="Cho phép về sớm" endContent={<div className="pointer-events-none"><span className="text-default-400 text-small">phút</span></div>} />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input type="number" step="0.1" name="workCoef" value={formData.workCoef} onChange={handleChange} label="Hệ số công ngày thường" placeholder="Nhập" />
                        <Input type="number" name="allowance" value={formData.allowance} onChange={handleChange} label="Phụ cấp ca trực" placeholder="Nhập" endContent={<div className="pointer-events-none"><span className="text-default-400 text-small">VND</span></div>} />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <Input type="number" name="restTimeAfter" value={formData.restTimeAfter} onChange={handleChange} label="Thời gian nghỉ sau ca" placeholder="Nhập" endContent={<div className="pointer-events-none"><span className="text-default-400 text-small">Giờ</span></div>} />
                        <Select label="Hình thức quy đổi nghỉ bù" selectedKeys={[formData.exchangeType]} onChange={(e) => setFormData({...formData, exchangeType: e.target.value})}>
                          <SelectItem key="SHIFT">Ca bù</SelectItem>
                          <SelectItem key="HOURS">Giờ bù</SelectItem>
                        </Select>
                        <Input type="number" step="0.1" name="exchangeCoef" value={formData.exchangeCoef} onChange={handleChange} label="Hệ số quy đổi" placeholder="Nhập" />
                      </div>
                    </div>
                  )}
                </div>
              </DrawerBody>

              <DrawerFooter className="border-t">
                <Button color="danger" variant="light" onPress={onClose}>Hủy</Button>
                <Button color="primary" onPress={handleSubmit}>{editId ? 'Cập nhật' : 'Lưu ca'}</Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ShiftCategory;