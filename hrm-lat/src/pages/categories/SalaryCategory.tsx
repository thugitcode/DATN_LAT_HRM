import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Tabs, Tab, Input, Button, Switch, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, 
  Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, useDisclosure, Select, SelectItem, Checkbox, Textarea
} from '@heroui/react';
import { IconPlus, IconSearch, IconTrash, IconEdit } from '@tabler/icons-react';

const SalaryCategory = () => {
  const [activeSubTab, setActiveSubTab] = useState('components');
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const [components, setComponents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positions, setPositions] = useState<string[]>([]);

  // TRẠNG THÁI KIỂM SOÁT THÊM / SỬA
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    code: '', name: '', component_type: '', nature: '', applied_position: 'Nhân viên',
    limit_amount: '', allow_over_limit: false, formula: '', description: ''
  });

  const loadData = async () => {
    try {
      const resComp = await axios.get('http://localhost:5000/api/v1/salary-configs/components');
      if (resComp.data.success) setComponents(resComp.data.data);
    } catch (err) { console.error('Lỗi tải thành phần lương:', err); }

    try {
      const resMaster = await axios.get('http://localhost:5000/api/v1/master-data/hospital-lookup');
      if (resMaster.data.success) setPositions(resMaster.data.positions);
    } catch (err) { console.error('Lỗi tải chức danh Master:', err); }
  };

  useEffect(() => { loadData(); }, []);

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await axios.put(`http://localhost:5000/api/v1/salary-configs/components/toggle/${id}`, { status: nextStatus });
      loadData();
    } catch (err) { alert('Không thể đổi trạng thái'); }
  };

  // HÀM KHỞI TẠO ĐỂ THÊM MỚI
  const handleOpenAddForm = () => {
    setSelectedId(null); // Không có ID => Chế độ Thêm mới
    setFormData({
      code: '', name: '', component_type: '', nature: '', applied_position: 'Nhân viên',
      limit_amount: '', allow_over_limit: false, formula: '', description: ''
    });
    onOpen();
  };

  // HÀM KÍCH HOẠT CHẾ ĐỘ SỬA ĐÚNG YÊU CẦU CỦA BẠN
  const handleOpenEditForm = (item: any) => {
    setSelectedId(item.id); // Lưu lại ID đang sửa => Chế độ Cập nhật
    setFormData({
      code: item.code,
      name: item.name,
      component_type: item.component_type,
      nature: item.nature,
      applied_position: item.applied_position || 'Nhân viên',
      limit_amount: item.limit_amount ? item.limit_amount.toString() : '',
      allow_over_limit: item.allow_over_limit === 1 || item.allow_over_limit === true,
      formula: item.formula || '',
      description: item.description || ''
    });
    onOpen();
  };

  // XỬ LÝ LƯU (TỰ ĐỘNG PHÂN TÁCH LUỒNG POST / PUT THEO TRẠNG THÁI)
  const handleSave = async () => {
    try {
      if (selectedId) {
        // LUỒNG CẬP NHẬT (EDIT)
        const res = await axios.put(`http://localhost:5000/api/v1/salary-configs/components/${selectedId}`, formData);
        alert(res.data.message);
      } else {
        // LUỒNG THÊM MỚI (ADD)
        const res = await axios.post('http://localhost:5000/api/v1/salary-configs/components', formData);
        alert(res.data.message);
      }
      onClose();
      loadData();
    } catch (err: any) { alert(err.response?.data?.message || 'Thao tác thất bại'); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thành phần lương này?')) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/v1/salary-configs/components/${id}`);
      alert(res.data.message); loadData();
    } catch (err) { alert('Lỗi xóa dữ liệu'); }
  };

  // BỘ LỌC TÌM KIẾM ĐỘNG THEO TÊN HOẶC MÃ BIẾN SỐ
  const filteredComponents = components.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white p-2 rounded-xl">
      <Tabs 
        selectedKey={activeSubTab} onSelectionChange={(key) => setActiveSubTab(key as string)}
        color="primary" variant="underlined"
        classNames={{
          tabList: "gap-6 w-full border-b border-divider bg-white px-4 mb-4",
          cursor: "w-full bg-blue-800",
          tab: "max-w-fit h-12 text-sm font-medium",
          tabContent: "font-semibold text-gray-500"
        }}
      >
        <Tab key="components" title={`Danh mục thành phần lương (${components.length})`}>
          <div className="flex flex-col gap-4 p-2">
            
            {/* THANH TÌM KIẾM HOẠT ĐỘNG THEO THỜI GIAN THỰC */}
            <div className="flex justify-between items-center gap-4">
              <Input 
                classNames={{ base: "max-w-xs", inputWrapper: "h-10 bg-gray-100" }}
                placeholder="Tìm kiếm theo mã hoặc tên..."
                startContent={<IconSearch size={18} className="text-gray-400" />}
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <Button color="primary" startContent={<IconPlus size={18} />} onClick={handleOpenAddForm} className="font-semibold rounded-lg">
                Thêm mới
              </Button>
            </div>

            {/* LƯỚI GRID HIỂN THỊ DANH SÁCH */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mt-2">
              <Table aria-label="Salary Components Grid" removeWrapper>
                <TableHeader>
                  <TableColumn>Mã thành phần</TableColumn>
                  <TableColumn>Tên thành phần</TableColumn>
                  <TableColumn width={140}>Loại</TableColumn>
                  <TableColumn width={110}>Tính chất</TableColumn>
                  <TableColumn>Công thức tính</TableColumn>
                  <TableColumn width={140} align="center">Trạng thái</TableColumn>
                  <TableColumn width={120} align="center">Hành động</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredComponents.map((c) => (
                    <TableRow key={c.id} className="border-b hover:bg-gray-50 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-gray-800">{c.code}</TableCell>
                      <TableCell className="font-medium text-gray-700">{c.name}</TableCell>
                      <TableCell className="text-gray-600 text-sm">{c.component_type}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.nature === 'Thu nhập' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.nature}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-blue-700 font-semibold bg-blue-50/20 max-w-xs truncate">{c.formula || '—'}</TableCell>
                      <TableCell>
                        <Switch size="sm" isSelected={c.status === 'ACTIVE'} onValueChange={() => handleToggleStatus(c.id, c.status)} color="success" />
                      </TableCell>
                      
                      {/* CỘT HÀNH ĐỘNG TÍCH HỢP ĐẦY ĐỦ CẢ NÚT SỬA VÀ XÓA */}
                      <TableCell>
                        <div className="flex items-center gap-3 justify-center">
                          <IconEdit size={18} className="text-blue-500 cursor-pointer hover:text-blue-700" onClick={() => handleOpenEditForm(c)} />
                          <IconTrash size={18} className="text-gray-400 cursor-pointer hover:text-red-500" onClick={() => handleDelete(c.id)} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Tab>
        <Tab key="template" title="Mẫu bảng lương"></Tab>
        <Tab key="scale" title="Thang bảng lương"></Tab>
        <Tab key="allowance" title="Chính sách phụ cấp và khấu trừ"></Tab>
        <Tab key="tax" title="Thuế TNCN"></Tab>
      </Tabs>

      {/* DRAWER FORM NHẬP LIỆU ĐỘNG BIẾN ĐỔI TIÊU ĐỀ THEO CHẾ ĐỘ THÊM/SỬA */}
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="right" size="md">
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="border-b bg-gray-50 font-bold text-base text-gray-800">
                {selectedId ? "Cập nhật thành phần lương" : "Thêm mới thành phần lương"}
              </DrawerHeader>
              <DrawerBody className="gap-4 pt-4 overflow-y-auto">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Thông tin thành phần</span>
                
                {/* Khi ở chế độ Sửa, khóa ô nhập mã Code để bảo toàn tính nhất quán của toán học */}
                <Input label="Mã thành phần *" placeholder="VD: PHU_CAP_DOC_HAI" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} disabled={selectedId !== null} className={selectedId ? "opacity-70" : ""} />
                <Input label="Tên thành phần *" placeholder="Nhập tên" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Loại thành phần *" selectedKeys={formData.component_type ? [formData.component_type] : []} onChange={(e) => setFormData({...formData, component_type: e.target.value})}>
                    <SelectItem key="Chấm công">Chấm công</SelectItem>
                    <SelectItem key="Khác">Khác</SelectItem>
                  </Select>
                  <Select label="Tính chất *" selectedKeys={formData.nature ? [formData.nature] : []} onChange={(e) => setFormData({...formData, nature: e.target.value})}>
                    <SelectItem key="Thu nhập">Thu nhập</SelectItem>
                    <SelectItem key="Khấu trừ">Khấu trừ</SelectItem>
                  </Select>
                </div>

                <Select label="Vị trí áp dụng *" selectedKeys={[formData.applied_position]} onChange={(e) => setFormData({...formData, applied_position: e.target.value})}>
                  {positions.map((p) => <SelectItem key={p} textValue={p}>{p}</SelectItem>)}
                </Select>

                <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                  <Input type="number" label="Định mức tiền" placeholder="Nhập" value={formData.limit_amount} onChange={(e) => setFormData({...formData, limit_amount: e.target.value})} />
                  <Checkbox isSelected={formData.allow_over_limit} onValueChange={(val) => setFormData({...formData, allow_over_limit: val})}>
                    <span className="text-xs text-gray-600">Cho phép giá trị vượt quá định mức tiền trần</span>
                  </Checkbox>
                </div>

                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">Công thức toán học</span>
                <div className="flex flex-col gap-2 p-3 bg-blue-50/40 rounded-xl border border-blue-100/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 font-medium">Cấu hình biểu thức toán giá trị</span>
                    <select className="text-xs border rounded-lg px-2 py-0.5 bg-white font-semibold text-blue-700 max-w-[180px]" onChange={(e) => { if(!e.target.value)return; setFormData(p => ({...p, formula: p.formula + " " + e.target.value + " "})); e.target.value=''; }}>
                      <option value="">➕ Chọn biến nhanh</option>
                      {components.map(c => <option key={c.id} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                  <Textarea placeholder="Chọn cấu trúc biến ở trên hoặc tự gõ..." value={formData.formula} onChange={(e) => setFormData({...formData, formula: e.target.value})} minRows={2} className="bg-white font-mono" />
                </div>
                <Textarea label="Mô tả tóm tắt" placeholder="Nhập ý nghĩa bài toán..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} minRows={2} />
              </DrawerBody>
              <DrawerFooter className="border-t bg-gray-50">
                <Button variant="bordered" onClick={onClose}>Thoát (ESC)</Button>
                <Button color="primary" onClick={handleSave}>Lưu (Ctrl+S)</Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default SalaryCategory;