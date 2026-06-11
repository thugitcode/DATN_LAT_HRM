import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, 
  Input, Button, RadioGroup, Radio 
} from '@heroui/react';
import { IconPlus, IconTrash, IconDeviceFloppy, IconRefresh } from '@tabler/icons-react'; // 🛠️ SỬA: Đổi IconSave thành IconDeviceFloppy

interface EmployeeTaxType {
  id?: number;
  name: string;
  tax_method: 'EXEMPT' | 'FIXED' | 'PROGRESSIVE';
  is_system: number;
}

interface TaxBracket {
  id?: number;
  level_number: number;
  from_amount: number;
  to_amount: number;
  tax_rate: number;
}

export default function PersonalTaxTab() {
  const [employeeTypes, setEmployeeTypes] = useState<EmployeeTaxType[]>([]);
  const [brackets, setBrackets] = useState<TaxBracket[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/tax-configs');
      if (res.data.success) {
        setEmployeeTypes(res.data.employeeTypes || []);
        setBrackets(res.data.brackets || []);
      }
    } catch (e) { console.error('Lỗi nạp cấu hình biểu thuế:', e); }
  };

  useEffect(() => { loadData(); }, []);

  // --- Logic Xử lý Nhóm Đối Tượng Nhân Sự ---
  const handleAddEmployeeType = () => {
    setEmployeeTypes([...employeeTypes, { name: '', tax_method: 'EXEMPT', is_system: 0 }]);
  };

  const handleUpdateEmployeeType = (idx: number, field: keyof EmployeeTaxType, val: any) => {
    const updated = [...employeeTypes];
    const item = updated[idx];
    if (item) {
      // 🛠️ GIA CỐ TS: Ép kiểu tường minh (as EmployeeTaxType) để giải quyết lỗi dòng 48
      updated[idx] = { ...item, [field]: val } as EmployeeTaxType;
      setEmployeeTypes(updated);
    }
  };

  const handleDeleteEmployeeType = (idx: number) => {
    setEmployeeTypes(employeeTypes.filter((_, i) => i !== idx));
  };

  // --- Logic Xử lý Biểu Mẫu Lũy Tiến ---
  const handleAddBracket = () => {
    const lastBracket = brackets[brackets.length - 1];
    const nextFrom = lastBracket ? lastBracket.to_amount : 0;
    setBrackets([
      ...brackets, 
      { level_number: brackets.length + 1, from_amount: nextFrom, to_amount: nextFrom + 10000000, tax_rate: 5 }
    ]);
  };

  const handleUpdateBracket = (idx: number, field: 'to_amount' | 'tax_rate', val: string) => {
    const updated = [...brackets];
    const numericVal = parseFloat(val) || 0;
    const item = updated[idx];
    if (!item) return;

    // 🛠️ GIA CỐ TS: Ép kiểu TaxBracket để xóa lỗi dòng 69
    updated[idx] = { ...item, [field]: numericVal } as TaxBracket;

    if (field === 'to_amount') {
      let currentFrom = numericVal;
      for (let i = idx + 1; i < updated.length; i++) {
        const nextItem = updated[i];
        // 🛠️ GIA CỐ TS: Đặt rào chắn kiểm tra sự tồn tại để diệt tận gốc lỗi "Object is possibly undefined" từ dòng 75-79
        if (nextItem) {
          nextItem.from_amount = currentFrom;
          if (nextItem.to_amount <= currentFrom) {
            nextItem.to_amount = currentFrom + 10000000;
          }
          currentFrom = nextItem.to_amount;
        }
      }
    }
    setBrackets(updated);
  };

  const handleDeleteBracket = (idx: number) => {
    if (idx === 0) return;
    const filtered = brackets.filter((_, i) => i !== idx);
    let currentFrom = 0;
    const rebuilt = filtered.map((b, i) => {
      const updatedBracket = { ...b, level_number: i + 1, from_amount: currentFrom };
      currentFrom = updatedBracket.to_amount;
      return updatedBracket;
    });
    setBrackets(rebuilt);
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const res = await axios.put('http://localhost:5000/api/v1/tax-configs', { employeeTypes, brackets });
      alert(res.data.message); loadData();
    } catch (e) { alert('Không thể lưu cấu hình biểu thuế'); }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 p-2 animate-fadeIn">
      
      {/* SECTION 1: THUẾ SUẤT CỦA NHÂN VIÊN */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <span className="text-sm font-bold text-gray-800">Thuế suất của nhân viên</span>
          <Button size="sm" variant="light" startContent={<IconRefresh size={16} />} onClick={loadData}>Nạp lại</Button>
        </div>
        
        <div className="flex flex-col gap-4">
          {employeeTypes.map((type, idx) => (
            <div key={idx} className="flex flex-col md:flex-row md:items-center gap-4 py-2 border-b border-gray-50 last:border-0">
              <div className="w-48 flex-shrink-0">
                {type.is_system === 1 ? (
                  <span className="text-sm font-semibold text-gray-700">{type.name}</span>
                ) : (
                  <Input 
                    size="sm" placeholder="Tên loại hình..." value={type.name}
                    onValueChange={(val) => handleUpdateEmployeeType(idx, 'name', val)}
                    classNames={{ inputWrapper: "bg-white border h-9" }}
                  />
                )}
              </div>
              
              <div className="flex-grow">
                <RadioGroup 
                  orientation="horizontal" size="sm" color="primary"
                  value={type.tax_method}
                  onValueChange={(val) => handleUpdateEmployeeType(idx, 'tax_method', val)}
                >
                  <Radio value="EXEMPT" classNames={{ label: "text-xs font-medium text-gray-600" }}>Miễn thuế</Radio>
                  <Radio value="FIXED" classNames={{ label: "text-xs font-medium text-gray-600" }}>Cố định (%)</Radio>
                  <Radio value="PROGRESSIVE" classNames={{ label: "text-xs font-medium text-gray-600" }}>Theo biểu lũy tiến</Radio>
                </RadioGroup>
              </div>

              {type.is_system === 0 && (
                <Button isIconOnly size="sm" variant="light" color="danger" radius="full" onClick={() => handleDeleteEmployeeType(idx)}>
                  <IconTrash size={16} />
                </Button>
              )}
            </div>
          ))}
          
          <div className="pt-2">
            <Button size="sm" variant="light" color="primary" startContent={<IconPlus size={16} />} onClick={handleAddEmployeeType} className="font-semibold">
              Thêm đối tượng
            </Button>
          </div>
        </div>
      </div>

      {/* SECTION 2: BIỂU MẪU LŨY TIẾN */}
      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-gray-50/40 border-b">
          <span className="text-sm font-bold text-gray-800">Biểu mẫu lũy tiến</span>
        </div>
        
        <Table aria-label="Progressive Tax Bracket Table" removeWrapper>
          <TableHeader>
            <TableColumn width={90}>Bậc</TableColumn>
            <TableColumn>Từ mức (VND)</TableColumn>
            <TableColumn>Đến mức (VND)</TableColumn>
            <TableColumn width={220}>Thuế suất (%)</TableColumn>
            <TableColumn width={80} align="center">Hành động</TableColumn>
          </TableHeader>
          <TableBody>
            {brackets.map((b, idx) => (
              <TableRow key={idx} className="border-b hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-bold text-gray-700 text-center">{b.level_number}</TableCell>
                <TableCell className="font-mono text-sm text-gray-500">
                  {new Intl.NumberFormat('vi-VN').format(b.from_amount)}
                </TableCell>
                <TableCell>
                  <Input 
                    size="sm" type="number" value={b.to_amount.toString()}
                    onValueChange={(val) => handleUpdateBracket(idx, 'to_amount', val)}
                    classNames={{ inputWrapper: "bg-gray-50/50 border max-w-xs font-mono" }}
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    size="sm" type="number" value={b.tax_rate.toString()}
                    onValueChange={(val) => handleUpdateBracket(idx, 'tax_rate', val)}
                    classNames={{ inputWrapper: "bg-gray-50/50 border max-w-[140px] font-mono font-bold" }}
                  />
                </TableCell>
                <TableCell>
                  {idx > 0 ? (
                    <div className="flex justify-center">
                      <Button isIconOnly size="sm" variant="light" radius="full" color="danger" onClick={() => handleDeleteBracket(idx)}>
                        <IconTrash size={16} className="text-gray-400 hover:text-red-500" />
                      </Button>
                    </div>
                  ) : <div className="h-8"></div>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="p-3 bg-gray-50/20 border-t">
          <Button size="sm" variant="light" color="primary" startContent={<IconPlus size={16} />} onClick={handleAddBracket} className="font-semibold">
            Thêm bậc thuế
          </Button>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-end gap-3 border-t pt-4 mt-2">
        <Button variant="bordered" size="sm" className="font-medium">Thoát (ESC)</Button>
        {/* 🛠️ SỬA: Đổi IconSave thành IconDeviceFloppy dưới đây */}
        <Button color="primary" size="sm" startContent={<IconDeviceFloppy size={16} />} isLoading={loading} onClick={handleSaveAll} className="font-semibold px-6 shadow-sm">
          Lưu (Ctrl+S)
        </Button>
      </div>
    </div>
  );
}