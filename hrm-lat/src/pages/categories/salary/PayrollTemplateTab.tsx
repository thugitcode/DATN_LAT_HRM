import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, 
  Input, Button, Switch, Select, SelectItem, Checkbox, Chip, Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, useDisclosure
} from '@heroui/react';
import { IconPlus, IconSearch, IconTrash, IconEdit, IconArrowLeft, IconGridPattern } from '@tabler/icons-react';
import { useStaffOptions } from '@/hooks/options/use-staff-options';

export default function PayrollTemplateTab() {
  // Danh sách nhân viên THẬT (trước đây dùng MOCK_EMPLOYEES cứng — đã bỏ, gây hiển thị tên giả không tồn tại)
  const { options: employeeOptions } = useStaffOptions();
  // Trạng thái điều hướng màn hình (list: Lưới danh sách, form: Thêm/Sửa Full-page)
  const [view, setView] = useState<'list' | 'form'>('list');
  const { isOpen: isCompOpen, onOpen: onCompOpen, onOpenChange: onCompOpenChange, onClose: onCompClose } = useDisclosure();

  // Dữ liệu phục vụ Master Data & Lưới
  const [templates, setTemplates] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [searchGrid, setSearchGrid] = useState('');

  // States quản lý dữ liệu Form Thêm/Sửa
  const [tplId, setTplId] = useState<number | null>(null);
  const [tplName, setTplName] = useState('');
  const [selDeps, setSelDeps] = useState<string[]>([]);
  const [selRooms, setSelRooms] = useState<string[]>([]);
  const [selEmps, setSelEmps] = useState<string[]>([]);
  const [selPositions, setSelPositions] = useState<string[]>([]);
  const [tplColumns, setTplColumns] = useState<any[]>([]);

  // State tạm thời lưu các thành phần được tích chọn trong Drawer phụ
  const [tempSelectedCompCodes, setTempSelectedCompCodes] = useState<string[]>([]);

  const loadInitialData = async () => {
    try {
      const resTpl = await axios.get('http://localhost:5000/api/v1/payroll-templates');
      if (resTpl.data.success) setTemplates(resTpl.data.data);

      const resComp = await axios.get('http://localhost:5000/api/v1/salary-configs/components');
      if (resComp.data.success) setComponents(resComp.data.data);

      const resMaster = await axios.get('http://localhost:5000/api/v1/master-data/hospital-lookup');
      if (resMaster.data.success) {
        setPositions(resMaster.data.titles || []);
        setDepartments(resMaster.data.departments || []);
        setRooms(resMaster.data.rooms || []);
      }
    } catch (err) { console.error('Lỗi nạp dữ liệu phôi lương:', err); }
  };

  useEffect(() => { loadInitialData(); }, []);

  // ── Lọc liên kết: Khoa → Phòng, Khoa/Phòng → Nhân viên (không để 4 ô này độc lập, chọn gì cũng được) ──
  // Phòng chỉ hiện đúng phòng thuộc Khoa đã chọn (dựa vào department_code của cat_rooms).
  const filteredRooms = selDeps.length
    ? rooms.filter((r: any) => selDeps.includes(r.department_code))
    : rooms;

  // Nhân viên chỉ hiện đúng người thuộc Khoa/Phòng đã chọn (dựa vào departments/rooms gắn theo hồ sơ nhân viên).
  const filteredEmployeeOptions = (selDeps.length || selRooms.length)
    ? employeeOptions.filter((emp: any) => {
        const inDept = selDeps.length ? emp.departments?.some((d: any) => selDeps.includes(d.code)) : true;
        const inRoom = selRooms.length ? emp.rooms?.some((r: any) => selRooms.includes(r.code)) : true;
        return inDept && inRoom;
      })
    : employeeOptions;

  // Khi đổi Khoa/Phòng, tự bỏ những lựa chọn Phòng/Nhân viên đã chọn trước đó nhưng KHÔNG còn hợp lệ
  // (VD: đã chọn nhân viên khoa A, sau đó đổi Khoa áp dụng sang khoa B → nhân viên đó phải tự bị bỏ chọn).
  useEffect(() => {
    setSelRooms(prev => prev.filter(code => filteredRooms.some((r: any) => r.code === code)));
    setSelEmps(prev => prev.filter(key => filteredEmployeeOptions.some((e: any) => String(e.code) === String(key))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selDeps)]);

  useEffect(() => {
    setSelEmps(prev => prev.filter(key => filteredEmployeeOptions.some((e: any) => String(e.code) === String(key))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selRooms)]);

  const handleOpenAdd = () => {
    setTplId(null); setTplName('');
    setSelDeps([]); setSelRooms([]); setSelEmps([]); setSelPositions(['Tất cả']);
    setTplColumns([]);
    setView('form');
  };

  const handleOpenEdit = async (id: number) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/payroll-templates/${id}`);
      if (res.data.success) {
        const m = res.data.master;
        setTplId(m.id); setTplName(m.name);
        setSelDeps(typeof m.applied_departments === 'string' ? JSON.parse(m.applied_departments) : m.applied_departments || []);
        setSelRooms(typeof m.applied_rooms === 'string' ? JSON.parse(m.applied_rooms) : m.applied_rooms || []);
        setSelEmps(typeof m.applied_employees === 'string' ? JSON.parse(m.applied_employees) : m.applied_employees || []);
        setSelPositions(typeof m.applied_positions === 'string' ? JSON.parse(m.applied_positions) : m.applied_positions || []);
        setTplColumns(res.data.columns || []);
        setView('form');
      }
    } catch (err) { alert('Không thể nạp thông tin mẫu bảng lương cần sửa'); }
  };

  const handleToggleTemplateStatus = async (id: number, currentStatus: string) => {
  try {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    // Gọi lên đúng API toggle của mẫu lương
    await axios.put(`http://localhost:5000/api/v1/payroll-templates/toggle/${id}`, { status: nextStatus });
    loadInitialData(); // Tải lại lưới để cập nhật giao diện
  } catch (err: any) {
    alert(err.response?.data?.message || 'Lỗi đổi trạng thái mẫu lương');
  }
};

  // Mở Drawer phụ, nạp sẵn trạng thái Checkbox của các cột đang có trong bảng cấu hình
  const handleOpenCompSelector = () => {
    const currentCodes = tplColumns.map(c => c.component_code);
    setTempSelectedCompCodes(currentCodes);
    onCompOpen();
  };

  // Bấm nút "Áp dụng" trên Drawer phụ: Đồng bộ danh sách cột Excel theo chỉ số mảng
  const handleApplyComponents = () => {
    const newColumns = tempSelectedCompCodes.map((code) => {
      const exist = tplColumns.find(c => c.component_code === code);
      if (exist) return exist;
      const origin = components.find(c => c.code === code);
      return {
        component_code: code,
        display_name: origin ? origin.name : '',
        custom_formula: origin ? origin.formula : '',
        is_visible: true
      };
    });
    setTplColumns(newColumns);
    onCompClose();
  };

  const handleSaveAll = async () => {
    if (!tplName.trim()) { alert('⚠️ Vui lòng điền Tên mẫu bảng lương!'); return; }
    const payload = {
      name: tplName,
      applied_departments: selDeps,
      applied_rooms: selRooms,
      applied_employees: selEmps,
      applied_positions: selPositions,
      columns: tplColumns
    };

    try {
      if (tplId) {
        await axios.put(`http://localhost:5000/api/v1/payroll-templates/${tplId}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/v1/payroll-templates', payload);
      }
      alert('🎉 Đã thiết lập thành công cấu trúc phôi tính lương!');
      setView('list');
      loadInitialData();
    } catch (err: any) { alert(err.response?.data?.message || 'Gặp sự cố khi lưu'); }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn phôi mẫu tính lương này?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/payroll-templates/${id}`);
      loadInitialData();
    } catch (err) { alert('Lỗi hệ thống không thể xóa'); }
  };

  // =========================================================
  // VIEW 1: LƯỚI DANH SÁCH MẪU LƯƠNG (ẢNH image_2c7758.png)
  // =========================================================
  if (view === 'list') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-xl border">
          <Input 
            classNames={{ base: "max-w-xs", inputWrapper: "h-10 bg-white" }}
            placeholder="Tìm kiếm mẫu phôi lương..."
            startContent={<IconSearch size={18} className="text-gray-400" />}
            value={searchGrid} onValueChange={setSearchGrid}
          />
          <Button color="primary" startContent={<IconPlus size={18} />} onClick={handleOpenAdd} className="font-semibold rounded-lg">
            Thêm mới
          </Button>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <Table aria-label="Payroll Templates Grid" removeWrapper>
            <TableHeader>
              <TableColumn>Tên mẫu bảng lương</TableColumn>
              <TableColumn width={180}>Vị trí áp dụng</TableColumn>
              <TableColumn>Khoa/phòng áp dụng</TableColumn>
              <TableColumn width={140} align="center">Trạng thái</TableColumn>
              <TableColumn width={120} align="center">Hành động</TableColumn>
            </TableHeader>
            <TableBody>
              {templates.filter(t => t.name?.toLowerCase().includes(searchGrid.toLowerCase())).map((t) => {
                const dCodes: string[] = typeof t.applied_departments === 'string' ? JSON.parse(t.applied_departments) : t.applied_departments || [];
                const rCodes: string[] = typeof t.applied_rooms === 'string' ? JSON.parse(t.applied_rooms) : t.applied_rooms || [];
                const pCodes: string[] = typeof t.applied_positions === 'string' ? JSON.parse(t.applied_positions) : t.applied_positions || [];
                return (
                  <TableRow key={t.id} className="border-b hover:bg-gray-50 transition-colors">
                    <TableCell className="font-semibold text-gray-800">{t.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {pCodes.map(p => <Chip key={p} size="sm" variant="flat" color="primary">{p}</Chip>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {dCodes.map(code => (
                          <Chip key={code} size="sm" color="success" variant="flat">
                            {departments.find(d => d.code === code)?.name || code}
                          </Chip>
                        ))}
                        {rCodes.map(code => (
                          <Chip key={code} size="sm" color="secondary" variant="flat">
                            {rooms.find(r => r.code === code)?.name || code}
                          </Chip>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Switch size="sm" isSelected={t.status === 'ACTIVE'} onValueChange={() => handleToggleTemplateStatus(t.id, t.status)} color="success" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 justify-center">
                        <IconEdit size={18} className="text-blue-500 cursor-pointer hover:text-blue-700" onClick={() => handleOpenEdit(t.id)} />
                        <IconTrash size={18} className="text-gray-400 cursor-pointer hover:text-red-500" onClick={() => handleDeleteTemplate(t.id)} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // =========================================================
  // VIEW 2: MÀN HÌNH CẤU HÌNH FULL-PAGE (ẢNH image_2c76fd.png)
  // =========================================================
  return (
    <div className="flex flex-col gap-6 bg-white rounded-xl p-2 animate-fadeIn">
      {/* THANH TIÊU ĐỀ KHỚP 100% SƠ ĐỒ MŨI TÊN BACK */}
      <div className="flex items-center gap-3 border-b pb-3">
        <Button isIconOnly size="sm" variant="light" radius="full" onClick={() => setView('list')}>
          <IconArrowLeft size={20} className="text-gray-600" />
        </Button>
        <span className="text-lg font-bold text-gray-800">
          {tplId ? "Chỉnh sửa mẫu bảng lương" : "Thêm mới mẫu bảng lương"}
        </span>
      </div>

      {/* KHỐI 1: THÔNG TIN CHUNG BLOCK KHUNG */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/30 flex flex-col gap-4">
        <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Thông tin chung</span>
        <div className="grid grid-cols-3 gap-4">
          <Input 
            label="Tên mẫu bảng lương *" placeholder="Nhập tên mẫu" 
            value={tplName} onValueChange={setTplName} classNames={{ inputWrapper: "bg-white border" }}
          />
          <Select 
            label="Khoa áp dụng" selectionMode="multiple" placeholder="Chọn khoa"
            selectedKeys={new Set(selDeps)} onSelectionChange={(keys) => setSelDeps(Array.from(keys) as string[])}
            classNames={{ trigger: "bg-white border" }}
          >
            {departments.map(d => <SelectItem key={d.code} textValue={d.name}>{d.name}</SelectItem>)}
          </Select>
          <Select 
            label="Phòng áp dụng" selectionMode="multiple" placeholder="Chọn phòng"
            selectedKeys={new Set(selRooms)} onSelectionChange={(keys) => setSelRooms(Array.from(keys) as string[])}
            classNames={{ trigger: "bg-white border" }}
          >
            {filteredRooms.map((r: any) => <SelectItem key={r.code} textValue={r.name}>{r.name}</SelectItem>)}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select 
            label="Nhân viên áp dụng *" selectionMode="multiple" placeholder="Chọn đích danh"
            selectedKeys={new Set(selEmps)} onSelectionChange={(keys) => setSelEmps(Array.from(keys) as string[])}
            classNames={{ trigger: "bg-white border" }}
          >
            {filteredEmployeeOptions.map((emp: any) => <SelectItem key={emp.code} textValue={`${emp.label} (${emp.code})`}>{emp.label} ({emp.code})</SelectItem>)}
          </Select>
          <Select 
            label="Vị trí áp dụng *" selectionMode="multiple" placeholder="Chọn chức danh"
            selectedKeys={new Set(selPositions)} onSelectionChange={(keys) => setSelPositions(Array.from(keys) as string[])}
            classNames={{ trigger: "bg-white border" }}
          >
            {positions.map(p => <SelectItem key={p} textValue={p}>{p}</SelectItem>)}
          </Select>
        </div>
      </div>

      {/* KHỐI 2: THÀNH PHẦN LƯƠNG ĐỘNG (BẢNG KÉO THẢ/CHÈN CỘT FIGMA) */}
      <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 bg-white">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Thành phần lương</span>
        <span className="text-xs text-gray-400 -mt-2">Cấu hình danh sách cột phôi Excel</span>

        <div className="border border-gray-200 rounded-xl overflow-hidden mt-1">
          <Table aria-label="Excel Columns Form Mapping" removeWrapper>
            <TableHeader>
              <TableColumn width={70} align="center">CỘT</TableColumn>
              <TableColumn>TÊN THÀNH PHẦN</TableColumn>
              <TableColumn>MÃ THÀNH PHẦN</TableColumn>
              <TableColumn>TÊN CỘT HIỂN THỊ</TableColumn>
              <TableColumn>CÔNG THỨC</TableColumn>
              <TableColumn width={90} align="center">HIỂN THỊ</TableColumn>
              <TableColumn width={80} align="center">HÀNH ĐỘNG</TableColumn>
            </TableHeader>
            <TableBody>
              {tplColumns.map((col, idx) => (
                <TableRow key={idx} className="border-b bg-white">
                  <TableCell className="font-mono font-bold text-blue-800 text-center bg-gray-50/50">
                    {String.fromCharCode(65 + idx)}
                  </TableCell>
                  <TableCell className="font-medium text-gray-700">
                    {components.find(c => c.code === col.component_code)?.name || col.component_code}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-400">{col.component_code}</TableCell>
                  <TableCell>
                    <Input 
                      size="sm" variant="bordered" classNames={{ inputWrapper: "h-8 bg-white" }}
                      value={col.display_name} 
                      onValueChange={(val) => {
                        const next = [...tplColumns]; next[idx].display_name = val; setTplColumns(next);
                      }} 
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-400 truncate max-w-xs">
                    {col.custom_formula || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Checkbox 
                        isSelected={col.is_visible === 1 || col.is_visible === true} 
                        onValueChange={(val) => {
                          const next = [...tplColumns]; next[idx].is_visible = val ? 1 : 0; setTplColumns(next);
                        }} 
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <IconTrash size={16} className="text-red-400 cursor-pointer hover:text-red-600" onClick={() => setTplColumns(tplColumns.filter((_, i) => i !== idx))} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {tplColumns.length === 0 && (
            <div className="text-center p-8 text-sm text-gray-400 bg-gray-50/30 flex flex-col items-center justify-center gap-2">
              <IconGridPattern size={28} className="text-gray-300" />
              Chưa có thành phần nào được chèn. Bấm nút bên dưới để nạp cấu trúc cột Excel!
            </div>
          )}
        </div>

        {/* =========================================================
            ✨ KHU VỰC LIVE PREVIEW: XEM TRƯỚC PHÔI EXCEL THỜI GIAN THỰC
           ========================================================= */}
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider">👁️ Xem trước phôi bảng tính (Excel Layout Preview)</span>
            <Chip size="sm" color="success" variant="dot" className="h-5 text-[10px]">Real-time</Chip>
          </div>
          
          {/* Box giả lập cửa sổ Excel có thanh cuộn ngang nếu bảng lương quá rộng */}
          <div className="w-full overflow-x-auto border border-gray-300 rounded-xl bg-gray-100/50 p-2 shadow-inner custom-scrollbar">
            <table className="min-w-full border-collapse bg-white text-left text-xs font-sans rounded-lg overflow-hidden">
              <thead>
                {/* Hàng 1: Hiển thị ký hiệu chữ cái cột Excel (A, B, C...) */}
                <tr className="bg-gray-200/80 text-gray-400 font-mono text-[11px] text-center divide-x divide-gray-300 border-b border-gray-300">
                  <th className="p-1 w-12 bg-gray-300/50 text-gray-500 font-bold">#</th>
                  <th className="p-1 w-24">A</th>
                  <th className="p-1 w-32">B</th>
                  <th className="p-1 w-32">C</th>
                  <th className="p-1 w-36">D</th>
                  {tplColumns.map((_, idx) => (
                    <th key={idx} className="p-1 w-40 text-green-700 font-bold bg-green-50/50">
                      {String.fromCharCode(69 + idx)} {/* Tự động tăng ký tự cột từ chữ E trở đi */}
                    </th>
                  ))}
                </tr>
                {/* Hàng 2: Tiêu đề cột nghiệp vụ thực tế */}
                <tr className="bg-gray-50 font-bold text-gray-700 divide-x divide-gray-200 border-b border-gray-200">
                  <td className="p-2 text-center bg-gray-100/50 text-gray-400">1</td>
                  <td className="p-2 text-gray-400 italic">Mã Nhân Viên</td>
                  <td className="p-2 text-gray-400 italic">Họ Và Tên</td>
                  <td className="p-2 text-gray-400 italic">Khoa / Phòng</td>
                  <td className="p-2 text-gray-400 italic">Vị Trí / Chức Danh</td>
                  {tplColumns.map((col, idx) => (
                    <td key={idx} className={`p-2 font-semibold ${col.is_visible === 0 ? 'text-gray-300 bg-gray-50/50 line-through' : 'text-blue-900 bg-blue-50/10'}`}>
                      {col.display_name || '—'}
                      {col.is_visible === 0 && <span className="text-[9px] text-red-400 font-normal block not-italic">(Đang ẩn)</span>}
                    </td>
                  ))}
                </tr>
              </thead>
              {/* Thân bảng: Đổ 1 dòng dữ liệu mẫu (Mock data) cho HR dễ hình dung */}
              <tbody>
                <tr className="divide-x divide-gray-100 text-gray-500 hover:bg-gray-50/50">
                  <td className="p-2 text-center font-bold bg-gray-100/30 text-gray-400">2</td>
                  <td className="p-2 font-mono text-xs">NV_00241 (example)</td>
                  <td className="p-2 font-medium text-gray-800">ThS. BS Nguyễn Văn A</td>
                  <td className="p-2 text-blue-700">Khoa Nội Tổng Hợp</td>
                  <td className="p-2 text-gray-600">Bác sĩ điều trị</td>
                  {tplColumns.map((col, idx) => (
                    <td key={idx} className={`p-2 font-mono text-right ${col.is_visible === 0 ? 'text-gray-200 bg-gray-50/30' : 'text-gray-600'}`}>
                      {col.is_visible === 0 ? '————' : '15,000,000'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 border-t pt-3">
          <Button size="sm" variant="bordered" color="primary" startContent={<IconPlus size={16}/>} onClick={handleOpenCompSelector} className="font-medium">
            Thêm thành phần
          </Button>
          <div className="flex gap-2">
            <Button size="sm" variant="flat" onClick={() => setView('list')}>Thoát (ESC)</Button>
            <Button size="sm" color="primary" onClick={handleSaveAll} className="font-semibold">Lưu (Ctrl+S)</Button>
          </div>
        </div>
      </div>

      {/* =========================================================
          DRAWER PHỤ CHỌN THÀNH PHẦN LƯƠNG (ẢNH image_0eeb1b.png)
         ========================================================= */}
      <Drawer isOpen={isCompOpen} onOpenChange={onCompOpenChange} placement="right" size="xl">
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="border-b bg-gray-50 font-bold text-gray-800 flex items-center gap-2">
                <span>Chọn thành phần</span>
              </DrawerHeader>
              <DrawerBody className="p-4 overflow-y-auto gap-4">
                <div className="flex gap-2">
                  <select className="text-sm border rounded-lg px-2 bg-gray-50 font-medium text-gray-600 max-w-[160px]">
                    <option value="all">Tất cả thành phần</option>
                    <option value="cc">Chấm công</option>
                  </select>
                  <Input 
                    placeholder="Tìm kiếm mã hoặc tên thành phần..." size="sm"
                    classNames={{ inputWrapper: "bg-gray-100" }}
                    startContent={<IconSearch size={14} className="text-gray-400" />}
                  />
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <Table aria-label="Component Selector List Grid" removeWrapper>
                    <TableHeader>
                      <TableColumn width={40}>{" "}</TableColumn>
                      <TableColumn>Tên thành phần</TableColumn>
                      <TableColumn>Loại thành phần</TableColumn>
                      <TableColumn>Tính chất</TableColumn>
                      <TableColumn>Công thức tính</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {components.map((c) => {
                        const isChecked = tempSelectedCompCodes.includes(c.code);
                       
                        const isInactive = c.status === 'INACTIVE';
                        
                        const isAlreadyInTemplate = tplColumns.some(col => col.component_code === c.code);
                        
                        const shouldDisableCheckbox = isInactive && !isAlreadyInTemplate;

                        return (
                            <TableRow 
                            key={c.id} 
                            className={`border-b transition-colors ${isInactive ? 'bg-gray-50/80 text-gray-400' : 'hover:bg-gray-50'}`}
                            >
                            <TableCell>
                                <Checkbox 
                                isSelected={isChecked}
                                isDisabled={shouldDisableCheckbox}
                                onValueChange={(checked) => {
                                    if (checked) {
                                    setTempSelectedCompCodes([...tempSelectedCompCodes, c.code]);
                                    } else {
                                    setTempSelectedCompCodes(tempSelectedCompCodes.filter(code => code !== c.code));
                                    }
                                }}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                <span className="font-mono text-xs text-gray-400">{c.code}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`font-semibold text-sm ${isInactive ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                    {c.name}
                                    </span>
                                    {isInactive && (
                                    <Chip size="sm" color="danger" variant="flat" className="h-5 px-1 text-[10px] font-bold">
                                        Ngưng hoạt động
                                    </Chip>
                                    )}
                                </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-xs text-gray-500">{c.component_type}</TableCell>
                            <TableCell>
                                <Chip size="sm" variant="flat" color={c.nature === 'Thu nhập' ? 'success' : 'danger'} className={isInactive ? 'opacity-50' : ''}>
                                {c.nature}
                                </Chip>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-blue-700 truncate max-w-xxs bg-blue-50/10">
                                {c.formula || '—'}
                            </TableCell>
                            </TableRow>
                        );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </DrawerBody>
              <DrawerFooter className="border-t bg-gray-50">
                <Button variant="bordered" size="sm" onClick={onCompClose}>Hủy bỏ</Button>
                <Button color="primary" size="sm" onClick={handleApplyComponents} className="font-semibold">Áp dụng</Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}