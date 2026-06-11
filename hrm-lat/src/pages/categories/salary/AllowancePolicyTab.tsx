import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, 
  Input, Button, Switch, Select, SelectItem, Checkbox, Chip
} from '@heroui/react';
import { IconPlus, IconSearch, IconTrash, IconEdit, IconArrowLeft } from '@tabler/icons-react';

const MOCK_EMPLOYEES = ["Cấn Đạt", "Bác Sĩ Hảo", "Nguyễn Văn A", "Trần Thị B", "Lê Văn C"];

export default function AllowancePolicyTab() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [list, setList] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // Master data kết nối chéo danh mục gốc khoa phòng chức danh
  const [departments, setDepartments] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [positions, setPositions] = useState<string[]>([]);

  // ⚙️ GIA CỐ CÁC STATE PHỤC VỤ BỘ TRÌNH DIỄN GIÁ TRỊ THÔNG MINH
  const [salaryComponents, setSalaryComponents] = useState<any[]>([]);
  const [calcType, setCalcType] = useState<'FIXED' | 'PERCENT'>('FIXED');
  const [fixedAmount, setFixedAmount] = useState('');
  const [percentValue, setPercentValue] = useState('');
  const [baseComponent, setBaseComponent] = useState('');

  // States quản trị lõi của Form nhập
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    payment_type: 'Theo tháng',
    start_date: '',
    nature: 'Phụ cấp',
    is_taxable: false,
    is_tax_exempt_full: false,
    is_tax_exempt_partial: false,
    is_tax_deductible: false,
    applied_departments: [] as string[],
    applied_rooms: [] as string[],
    applied_positions: [] as string[],
    applied_employees: [] as string[],
    policy_value: ''
  });

  const loadInitialData = async () => {
    try {
      const resList = await axios.get('http://localhost:5000/api/v1/allowances');
      if (resList.data.success) setList(resList.data.data);

      const resMaster = await axios.get('http://localhost:5000/api/v1/master-data/hospital-lookup');
      if (resMaster.data.success) {
        setDepartments(resMaster.data.departments || []);
        setRooms(resMaster.data.rooms || []);
        setPositions(resMaster.data.positions || []);
      }

      // Tải danh mục biến số lương hoạt động để nhét vào ô thiết lập % gốc
      const resComp = await axios.get('http://localhost:5000/api/v1/salary-configs/components');
      if (resComp.data.success) {
        setSalaryComponents(resComp.data.data?.filter((c: any) => c.status === 'ACTIVE') || []);
      }
    } catch (e) { console.error('Lỗi nạp thông tin cấu hình chính sách:', e); }
  };

  useEffect(() => { loadInitialData(); }, []);

  const handleOpenAdd = () => {
    setSelectedId(null);
    setFormData({
      code: '', name: '', payment_type: 'Theo tháng', start_date: new Date().toISOString().split('T')[0] || '', nature: 'Phụ cấp',
      is_taxable: false, is_tax_exempt_full: false, is_tax_exempt_partial: false, is_tax_deductible: false,
      applied_departments: [], applied_rooms: [], applied_positions: ['Tất cả'], applied_employees: [], policy_value: ''
    });
    
    // Reset các trường tính toán thông minh
    setCalcType('FIXED');
    setFixedAmount('');
    setPercentValue('');
    setBaseComponent('');
    setView('form');
  };

  const handleOpenEdit = async (id: number) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/allowances/${id}`);
      if (res.data.success) {
        const item = res.data.data;
        setSelectedId(item.id);
        
        const formattedDate = item.start_date ? item.start_date.split('T')[0] : '';

        setFormData({
          code: item.code,
          name: item.name,
          payment_type: item.payment_type,
          start_date: formattedDate,
          nature: item.nature,
          is_taxable: item.is_taxable === 1,
          is_tax_exempt_full: item.is_tax_exempt_full === 1,
          is_tax_exempt_partial: item.is_tax_exempt_partial === 1,
          is_tax_deductible: item.is_tax_deductible === 1,
          applied_departments: typeof item.applied_departments === 'string' ? JSON.parse(item.applied_departments) : item.applied_departments || [],
          applied_rooms: typeof item.applied_rooms === 'string' ? JSON.parse(item.applied_rooms) : item.applied_rooms || [],
          applied_positions: typeof item.applied_positions === 'string' ? JSON.parse(item.applied_positions) : item.applied_positions || [],
          applied_employees: typeof item.applied_employees === 'string' ? JSON.parse(item.applied_employees) : item.applied_employees || [],
          policy_value: item.policy_value || ''
        });

        // 🔥 PHÂN TÍCH REGEX: Tự động bóc tách chuỗi ngược về giao diện trực quan cho HR
        const rawValue = item.policy_value || '';
        const match = rawValue.match(/^([\d.]+)\s*\*\s*([A-Za-z0-9_]+)$/);
        
        if (match && match[1] && match[2]) {
          setCalcType('PERCENT');
          setPercentValue((parseFloat(match[1]) * 100).toString());
          setBaseComponent(match[2]);
          setFixedAmount('');
        } else {
          setCalcType('FIXED');
          setFixedAmount(rawValue);
          setPercentValue('');
          setBaseComponent('');
        }

        setView('form');
      }
    } catch (e) { alert('Không thể bốc dữ liệu sửa đổi'); }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await axios.put(`http://localhost:5000/api/v1/allowances/toggle/${id}`, { status: nextStatus });
      loadInitialData();
    } catch (e) { alert('Lỗi chuyển trạng thái'); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn khoản chính sách này?')) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/v1/allowances/${id}`);
      alert(res.data.message); loadInitialData();
    } catch (e) { alert('Gặp sự cố lệnh xóa'); }
  };

  const handleSaveAll = async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('⚠️ Vui lòng điền đủ Mã khoản và Tên khoản bắt buộc!');
      return;
    }

    // 🔥 ĐÓNG GÓI CÔNG THỨC CHUẨN TỰ ĐỘNG CHỐNG TOÁC DATABASE
    let finalPolicyValue = '';
    if (calcType === 'FIXED') {
      finalPolicyValue = fixedAmount.trim() || '0';
    } else {
      if (!percentValue.trim() || !baseComponent) {
        alert('⚠️ Vui lòng nhập đầy đủ phần trăm (%) và chọn cấu trúc biến lương gốc!');
        return;
      }
      const decimalRate = parseFloat(percentValue) / 100;
      finalPolicyValue = `${decimalRate} * ${baseComponent}`;
    }

    try {
      const payload = { ...formData, policy_value: finalPolicyValue };
      if (selectedId) {
        await axios.put(`http://localhost:5000/api/v1/allowances/${selectedId}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/v1/allowances', payload);
      }
      alert('🎉 Lưu cấu trúc chính sách phụ cấp/khấu trừ thành công!');
      setView('list'); loadInitialData();
    } catch (err: any) { alert(err.response?.data?.message || 'Gặp sự cố hệ thống'); }
  };

  const formatDateString = (rawDate: string) => {
    if (!rawDate) return '—';
    const d = new Date(rawDate);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  if (view === 'list') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center bg-gray-50/40 p-2 rounded-xl border border-gray-100">
          <Input 
            classNames={{ base: "max-w-xs", inputWrapper: "h-10 bg-white" }}
            placeholder="Tìm kiếm mã hoặc tên chính sách..."
            startContent={<IconSearch size={18} className="text-gray-400" />}
            value={search} onValueChange={setSearch}
          />
          <Button color="primary" startContent={<IconPlus size={18} />} onClick={handleOpenAdd} className="font-semibold rounded-lg">
            Thêm mới
          </Button>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <Table aria-label="Allowance Master List Grid" removeWrapper>
            <TableHeader>
              <TableColumn>Mã khoản</TableColumn>
              <TableColumn>Tên khoản</TableColumn>
              <TableColumn width={130}>Tính chất</TableColumn>
              <TableColumn width={180}>Thời gian bắt đầu sử dụng</TableColumn>
              <TableColumn width={150}>Loại thanh toán</TableColumn>
              <TableColumn>Giá trị / Công thức</TableColumn>
              <TableColumn width={130} align="center">Trạng thái</TableColumn>
              <TableColumn width={110} align="center">Hành động</TableColumn>
            </TableHeader>
            <TableBody>
              {list.filter(item => item.name?.toLowerCase().includes(search.toLowerCase()) || item.code?.toLowerCase().includes(search.toLowerCase())).map((item) => (
                <TableRow key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-gray-800">{item.code}</TableCell>
                  <TableCell className="font-semibold text-gray-700">{item.name}</TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color={item.nature === 'Phụ cấp' ? 'success' : 'danger'}>
                      {item.nature}
                    </Chip>
                  </TableCell>
                  <TableCell className="font-mono text-gray-600 text-sm">{formatDateString(item.start_date)}</TableCell>
                  <TableCell className="text-sm font-medium text-gray-600">{item.payment_type}</TableCell>
                  <TableCell className="font-mono text-xs text-blue-700 font-semibold bg-blue-50/20 max-w-xs truncate">{item.policy_value || '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Switch size="sm" isSelected={item.status === 'ACTIVE'} onValueChange={() => handleToggleStatus(item.id, item.status)} color="success" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 justify-center">
                      <IconEdit size={18} className="text-blue-500 cursor-pointer hover:text-blue-700" onClick={() => handleOpenEdit(item.id)} />
                      <IconTrash size={18} className="text-gray-400 cursor-pointer hover:text-red-500" onClick={() => handleDelete(item.id)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 bg-white rounded-xl p-2 animate-fadeIn">
      <div className="flex items-center gap-3 border-b pb-3">
        <Button isIconOnly size="sm" variant="light" radius="full" onClick={() => setView('list')}>
          <IconArrowLeft size={20} className="text-gray-600" />
        </Button>
        <span className="text-lg font-bold text-gray-800">
          {selectedId ? "Chỉnh sửa khoản phụ cấp, khấu trừ" : "Thêm khoản phụ cấp, khấu trừ"}
        </span>
      </div>

      <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/30 flex flex-col gap-5 shadow-sm">
        <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Thông tin thành phần chính</span>
        
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Mã khoản *" placeholder="VD: PC_DOC_HAI_70" value={formData.code}
            disabled={selectedId !== null} className={selectedId ? "opacity-70" : ""}
            onChange={(e) => setFormData({...formData, code: e.target.value})} classNames={{ inputWrapper: "bg-white border" }}
          />
          <Input 
            label="Tên khoản *" placeholder="Nhập định danh tên khoản" value={formData.name}
            onValueChange={(val) => setFormData({...formData, name: val})} classNames={{ inputWrapper: "bg-white border" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select 
            label="Loại thanh toán *" selectedKeys={[formData.payment_type]}
            onChange={(e) => setFormData({...formData, payment_type: e.target.value})} classNames={{ trigger: "bg-white border" }}
          >
            <SelectItem key="Theo tháng">Theo tháng</SelectItem>
            <SelectItem key="Theo năm">Theo năm</SelectItem>
            <SelectItem key="Theo ngày">Theo ngày</SelectItem>
          </Select>
          
          <div className="relative flex flex-col justify-end border rounded-xl px-3 pb-1 pt-1.5 bg-white h-14">
            <label className="text-[10px] text-gray-500 font-medium absolute top-1.5 left-3">Thời gian bắt đầu áp dụng *</label>
            <input 
              type="date" value={formData.start_date} 
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              className="w-full text-sm font-medium outline-none text-gray-700 pt-3 bg-transparent cursor-pointer" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select 
            label="Tính chất *" selectedKeys={[formData.nature]}
            onChange={(e) => setFormData({...formData, nature: e.target.value})} classNames={{ trigger: "bg-white border" }}
          >
            <SelectItem key="Phụ cấp">Phụ cấp</SelectItem>
            <SelectItem key="Khấu trừ">Khấu trừ</SelectItem>
          </Select>
        </div>

        <div className="flex flex-wrap gap-6 p-4 bg-white border border-gray-200/60 rounded-xl mt-1">
          <Checkbox isSelected={formData.is_taxable} onValueChange={(val) => setFormData({...formData, is_taxable: val})}>
            <span className="text-xs font-semibold text-gray-600">Tính thuế</span>
          </Checkbox>
          <Checkbox isSelected={formData.is_tax_exempt_full} onValueChange={(val) => setFormData({...formData, is_tax_exempt_full: val})}>
            <span className="text-xs font-semibold text-gray-600">Miễn thuế toàn bộ</span>
          </Checkbox>
          <Checkbox isSelected={formData.is_tax_exempt_partial} onValueChange={(val) => setFormData({...formData, is_tax_exempt_partial: val})}>
            <span className="text-xs font-semibold text-gray-600">Miễn thuế một phần</span>
          </Checkbox>
          <Checkbox isSelected={formData.is_tax_deductible} onValueChange={(val) => setFormData({...formData, is_tax_deductible: val})}>
            <span className="text-xs font-semibold text-gray-600">Giảm trừ khi tính thuế</span>
          </Checkbox>
        </div>

        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">Phạm vi tác động (Target Scope)</span>
        <div className="grid grid-cols-2 gap-4">
          <Select 
            label="Khoa áp dụng" selectionMode="multiple" placeholder="Tất cả các khoa"
            selectedKeys={new Set(formData.applied_departments)} onSelectionChange={(keys) => setFormData({...formData, applied_departments: Array.from(keys) as string[]})}
            classNames={{ trigger: "bg-white border" }}
          >
            {departments.map(d => <SelectItem key={d.code} textValue={d.name}>{d.name}</SelectItem>)}
          </Select>
          <Select 
            label="Phòng áp dụng" selectionMode="multiple" placeholder="Tất cả các phòng"
            selectedKeys={new Set(formData.applied_rooms)} onSelectionChange={(keys) => setFormData({...formData, applied_rooms: Array.from(keys) as string[]})}
            classNames={{ trigger: "bg-white border" }}
          >
            {rooms.map(r => <SelectItem key={r.code} textValue={r.name}>{r.name}</SelectItem>)}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select 
            label="Vị trí áp dụng" selectionMode="multiple" placeholder="Tất cả chức danh"
            selectedKeys={new Set(formData.applied_positions)} onSelectionChange={(keys) => setFormData({...formData, applied_positions: Array.from(keys) as string[]})}
            classNames={{ trigger: "bg-white border" }}
          >
            {positions.map(p => <SelectItem key={p} textValue={p}>{p}</SelectItem>)}
          </Select>
          <Select 
            label="Nhân sự áp dụng" selectionMode="multiple" placeholder="Chọn đích danh cá nhân ngoại lệ"
            selectedKeys={new Set(formData.applied_employees)} onSelectionChange={(keys) => setFormData({...formData, applied_employees: Array.from(keys) as string[]})}
            classNames={{ trigger: "bg-white border" }}
          >
            {MOCK_EMPLOYEES.map(emp => <SelectItem key={emp} textValue={emp}>{emp}</SelectItem>)}
          </Select>
        </div>

        {/* =========================================================
            ⚙️ VỊ TRÍ THAY THẾ: KHỐI CHỌN CÔNG THỨC THÔNG MINH CHUẨN ERP
           ========================================================= */}
        <span className="text-xs font-bold text-blue-800 uppercase tracking-wider mt-2">Cấu hình giá trị phát sinh</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white border border-gray-200/60 rounded-xl">
          
          <Select 
            label="Cách tính toán" selectedKeys={[calcType]}
            onChange={(e) => setCalcType(e.target.value as 'FIXED' | 'PERCENT')}
            classNames={{ trigger: "bg-gray-50 border" }}
          >
            <SelectItem key="FIXED" textValue="Số tiền cố định (VNĐ)">Số tiền cố định (VNĐ)</SelectItem>
            <SelectItem key="PERCENT" textValue="Theo phần trăm (%)">Theo phần trăm (%)</SelectItem>
          </Select>

          {calcType === 'FIXED' ? (
            <Input 
              type="number" label="Số tiền cố định (VNĐ) *" placeholder="Ví dụ: 500000"
              value={fixedAmount} onValueChange={setFixedAmount}
              classNames={{ inputWrapper: "bg-gray-50 border" }}
            />
          ) : (
            <>
              <Input 
                type="number" label="Tỷ lệ phần trăm (%) *" placeholder="Ví dụ: 70 hoặc 100"
                value={percentValue} onValueChange={setPercentValue}
                classNames={{ inputWrapper: "bg-gray-50 border" }}
              />
              <Select 
                label="Dựa trên thành phần lương gốc *" placeholder="Chọn biến số"
                selectedKeys={baseComponent ? [baseComponent] : []}
                onChange={(e) => setBaseComponent(e.target.value)}
                classNames={{ trigger: "bg-gray-50 border" }}
              >
                {salaryComponents.map(comp => (
                  <SelectItem key={comp.code} textValue={`${comp.name} (${comp.code})`}>
                    {comp.name} ({comp.code})
                  </SelectItem>
                ))}
              </Select>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t pt-4 mt-2">
          <Button variant="bordered" onClick={() => setView('list')}>Thoát (ESC)</Button>
          <Button color="primary" onClick={handleSaveAll} className="font-semibold shadow-sm">Lưu (Ctrl+S)</Button>
        </div>
      </div>
    </div>
  );
}