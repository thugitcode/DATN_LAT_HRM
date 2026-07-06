import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Input, Button, Switch, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, 
  Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, useDisclosure, Select, SelectItem
} from '@heroui/react';
import { IconPlus, IconSearch, IconTrash, IconEdit } from '@tabler/icons-react';

export default function SalaryScaleTab() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  // States lưu trữ dữ liệu lưới & tìm kiếm
  const [scales, setScales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positions, setPositions] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // States quản lý dữ liệu Form nhập ngạch bậc
  const [formData, setFormData] = useState({
    position_name: '',
    level_number: '',
    coefficient: '',
    floor_salary: '',
    ceil_salary: ''
  });

  const loadData = async () => {
    try {
      // 1. Tải danh sách thang bảng lương từ hệ thống
      const resScale = await axios.get('http://localhost:5000/api/v1/salary-scales');
      if (resScale.data.success) setScales(resScale.data.data);
    } catch (err) { console.error('Lỗi tải dữ liệu thang bảng lương:', err); }

    try {
      // 2. Tải danh mục chức danh chức vụ gốc (Bác sĩ, Điều dưỡng...) để nhét vào ô Select form
      const resMaster = await axios.get('http://localhost:5000/api/v1/master-data/hospital-lookup');
      if (resMaster.data.success) setPositions(resMaster.data.titles || []);
    } catch (err) { console.error('Lỗi tải chức danh danh mục gốc:', err); }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenAdd = () => {
    setSelectedId(null);
    setFormData({ position_name: '', level_number: '', coefficient: '', floor_salary: '', ceil_salary: '' });
    onOpen();
  };

  const handleOpenEdit = (item: any) => {
    setSelectedId(item.id);
    setFormData({
      position_name: item.position_name,
      level_number: item.level_number.toString(),
      coefficient: item.coefficient.toString(),
      floor_salary: item.floor_salary ? item.floor_salary.toString() : '',
      ceil_salary: item.ceil_salary ? item.ceil_salary.toString() : ''
    });
    onOpen();
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await axios.put(`http://localhost:5000/api/v1/salary-scales/toggle/${id}`, { status: nextStatus });
      loadData();
    } catch (err) { alert('Không thể cập nhật trạng thái hoạt động ngạch bậc lương này'); }
  };

  const handleSave = async () => {
    const { position_name, level_number, coefficient } = formData;
    if (!position_name || !level_number || !coefficient) {
      alert('⚠️ Vui lòng nhập đầy đủ Cấp bậc, Bậc số và Hệ số lương!');
      return;
    }

    try {
      if (selectedId) {
        const res = await axios.put(`http://localhost:5000/api/v1/salary-scales/${selectedId}`, formData);
        alert(res.data.message);
      } else {
        const res = await axios.post('http://localhost:5000/api/v1/salary-scales', formData);
        alert(res.data.message);
      }
      onClose(); loadData();
    } catch (err: any) { 
      alert(err.response?.data?.message || 'Gặp sự cố khi lưu thông tin thang bảng lương'); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ngạch bậc lương này?')) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/v1/salary-scales/${id}`);
      alert(res.data.message); loadData();
    } catch (err) { alert('Lỗi máy chủ không thể thực hiện lệnh xóa'); }
  };

  // Hàm định dạng tiền tệ trực quan VNĐ
  const formatMoney = (value: any) => {
    if (!value) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(value));
  };

  const filteredScales = scales.filter(s => 
    s.position_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 p-2">
      {/* THANH ĐIỀU KHIỂN: TÌM KIẾM ĐỘNG + NÚT THÊM MỚI */}
      <div className="flex justify-between items-center gap-4">
        <Input 
          classNames={{ base: "max-w-xs", inputWrapper: "h-10 bg-gray-100" }}
          placeholder="Tìm kiếm theo cấp bậc chức danh..."
          startContent={<IconSearch size={18} className="text-gray-400" />}
          value={searchTerm} onValueChange={setSearchTerm}
        />
        <Button color="primary" startContent={<IconPlus size={18} />} onClick={handleOpenAdd} className="font-semibold rounded-lg">
          Thêm mới
        </Button>
      </div>

      {/* LƯỚI GRID HIỂN THỊ HỆ SỐ CHUẨN ERP */}
      <div className="border border-gray-200 rounded-xl overflow-hidden mt-2 bg-white">
        <Table aria-label="Salary Scale Master Grid" removeWrapper>
          <TableHeader>
            <TableColumn>Cấp bậc (Chức danh)</TableColumn>
            <TableColumn width={120} align="center">Bậc số</TableColumn>
            <TableColumn width={140} align="center">Hệ số lương</TableColumn>
            <TableColumn align="end">Mức lương sàn</TableColumn>
            <TableColumn align="end">Mức lương trần</TableColumn>
            <TableColumn width={130} align="center">Trạng thái</TableColumn>
            <TableColumn width={120} align="center">Thao tác</TableColumn>
          </TableHeader>
          <TableBody>
            {filteredScales.map((s) => (
              <TableRow key={s.id} className="border-b hover:bg-gray-50 transition-colors">
                <TableCell className="font-semibold text-gray-700">{s.position_name}</TableCell>
                <TableCell className="font-mono text-center font-bold text-blue-700 bg-blue-50/20">Bậc {s.level_number}</TableCell>
                <TableCell className="font-mono text-center font-bold text-gray-800">{s.coefficient}</TableCell>
                <TableCell className="font-mono text-right text-gray-600">{formatMoney(s.floor_salary)}</TableCell>
                <TableCell className="font-mono text-right text-green-700 font-medium">{formatMoney(s.ceil_salary)}</TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Switch size="sm" isSelected={s.status === 'ACTIVE'} onValueChange={() => handleToggleStatus(s.id, s.status)} color="success" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 justify-center">
                    <IconEdit size={18} className="text-blue-500 cursor-pointer hover:text-blue-700" onClick={() => handleOpenEdit(s)} />
                    <IconTrash size={18} className="text-gray-400 cursor-pointer hover:text-red-500" onClick={() => handleDelete(s.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredScales.length === 0 && (
          <div className="text-center p-6 text-xs text-gray-400">Không tìm thấy ngạch bậc lương nào phù hợp.</div>
        )}
      </div>

      {/* DRAWER FORM NHẬP NGẠCH BẬC HỆ SỐ */}
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="right" size="md">
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="border-b bg-gray-50 font-bold text-base text-gray-800">
                {selectedId ? "Cập nhật ngạch bậc lương" : "Thêm mới ngạch bậc lương"}
              </DrawerHeader>
              <DrawerBody className="gap-4 pt-4 overflow-y-auto">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Thông tin ngạch bậc chính</span>
                
                <Select 
                  label="Cấp bậc (Chức danh) *" 
                  placeholder="Chọn chức danh áp dụng"
                  selectedKeys={formData.position_name ? [formData.position_name] : []} 
                  onChange={(e) => setFormData({...formData, position_name: e.target.value})}
                >
                  {positions.map((p) => <SelectItem key={p} textValue={p}>{p}</SelectItem>)}
                </Select>

                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    type="number" label="Bậc số *" placeholder="VD: 1, 2, 3" 
                    value={formData.level_number} 
                    onValueChange={(val) => setFormData({...formData, level_number: val})} 
                  />
                  <Input 
                    type="number" label="Hệ số lương *" placeholder="VD: 2.34" step="0.01"
                    value={formData.coefficient} 
                    onValueChange={(val) => setFormData({...formData, coefficient: val})} 
                  />
                </div>

                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">Biên giới hạn tiền (Khung lương)</span>
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Input 
                    type="number" label="Mức lương sàn (VNĐ)" placeholder="Bỏ trống nếu = 0" 
                    value={formData.floor_salary} 
                    onValueChange={(val) => setFormData({...formData, floor_salary: val})} 
                  />
                  <Input 
                    type="number" label="Mức lương trần (VNĐ)" placeholder="Bỏ trống nếu = 0" 
                    value={formData.ceil_salary} 
                    onValueChange={(val) => setFormData({...formData, ceil_salary: val})} 
                  />
                </div>
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
}