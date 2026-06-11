import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Tabs, Tab, Input, Button, Switch, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, 
  Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, useDisclosure, Select, SelectItem 
} from '@heroui/react';
import { IconDeviceLaptop, IconWifi, IconMapPin, IconCpu, IconDeviceFloppy, IconPlus, IconTrash } from '@tabler/icons-react';

const TimekeepingCategory = () => {
  const [activeTab, setActiveTab] = useState('general');

  const { isOpen: isWifiOpen, onOpen: onWifiOpen, onOpenChange: onWifiOpenChange, onClose: onWifiClose } = useDisclosure();
  const { isOpen: isGpsOpen, onOpen: onGpsOpen, onOpenChange: onGpsOpenChange, onClose: onGpsClose } = useDisclosure();
  const { isOpen: isMachineOpen, onOpen: onMachineOpen, onOpenChange: onMachineOpenChange, onClose: onMachineClose } = useDisclosure();

  // States danh sách dữ liệu lấy từ DB
  const [generalConfig, setGeneralConfig] = useState({
    cycle_start_day: 1, cycle_end_day: 31, lock_date: 5, allow_explanation_days: 3, auto_connect_shift: 1
  });
  const [wifis, setWifis] = useState<any[]>([]);
  const [gpsList, setGpsList] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);

  // States Form dữ liệu
  const [wifiForm, setWifiForm] = useState({ name: '', ip_address: '', bssid: '' });
  const [gpsForm, setGpsForm] = useState({ name: '', latitude: '21.028511', longitude: '105.804222', allowed_radius: '500' });
  const [machineForm, setMachineForm] = useState({ name: '', ip_address: '', serial_number: '', connection_method: 'SERVER' });

  const loadAllData = async () => {
    try {
      const resConf = await axios.get('http://localhost:5000/api/v1/timekeeping/config');
      if (resConf.data.success && resConf.data.data) setGeneralConfig(resConf.data.data);

      const resWifi = await axios.get('http://localhost:5000/api/v1/timekeeping/wifis');
      setWifis(resWifi.data.data || []);

      const resGps = await axios.get('http://localhost:5000/api/v1/timekeeping/gps');
      setGpsList(resGps.data.data || []);

      const resMach = await axios.get('http://localhost:5000/api/v1/timekeeping/machines');
      setMachines(resMach.data.data || []);
    } catch (err) { console.error('Lỗi nạp cấu hình:', err); }
  };

  useEffect(() => { loadAllData(); }, []);

  // ==========================================
  // LOGIC ĐỒNG BỘ BẢN ĐỒ TỰ ĐỘNG KHI BẤM CHUỘT
  // ==========================================
  useEffect(() => {
    if (!isGpsOpen) return;

    const initLeafletMap = () => {
      const L = (window as any).L;
      if (!L) return;

      // Chờ 300ms đợi hiệu ứng mở Drawer của HeroUI hoàn tất để tránh vỡ khung map
      setTimeout(() => {
        const mapContainer = document.getElementById('interactive-map');
        if (!mapContainer) return;

        const initLat = parseFloat(gpsForm.latitude) || 21.028511;
        const initLng = parseFloat(gpsForm.longitude) || 105.804222;

        // Khởi tạo bản đồ số
        const map = L.map('interactive-map').setView([initLat, initLng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);

        // Tạo ghim đỏ định vị (cho phép kéo rê ghim trên bản đồ)
        const marker = L.marker([initLat, initLng], { draggable: true }).addTo(map);

        // CASE 1: Bấm chuột vào bất kỳ điểm nào trên bản đồ để lấy tọa độ tại chỗ
        map.on('click', (e: any) => {
          const clickedLat = e.latlng.lat.toFixed(6);
          const clickedLng = e.latlng.lng.toFixed(6);
          marker.setLatLng(e.latlng);
          setGpsForm(prev => ({ ...prev, latitude: clickedLat, longitude: clickedLng }));
        });

        // CASE 2: Cầm ghim kéo rê (Drag) đi nơi khác, thả tay ra tự bốc tọa độ mới
        marker.on('dragend', () => {
          const position = marker.getLatLng();
          setGpsForm(prev => ({ ...prev, latitude: position.lat.toFixed(6), longitude: position.lng.toFixed(6) }));
        });

        // Lưu giữ thực thể bản đồ vào bộ nhớ window để clear khi đóng Drawer
        (window as any).activeGpsMap = map;
      }, 300);
    };

    // Nạp tự động file CSS và Thư viện Map từ Cloudflare CDN (Thay thế cho unpkg bị chặn)
    if (!(window as any).L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; // <-- ĐỔI DÒNG NÀY
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';    // <-- ĐỔI DÒNG NÀY
      script.async = true;
      document.body.appendChild(script);
      script.onload = initLeafletMap;
    } else {
      initLeafletMap();
    }

    // Hàm dọn dẹp bộ nhớ (Cleanup) chống lỗi trùng container ID khi mở lại Drawer
    return () => {
      if ((window as any).activeGpsMap) {
        (window as any).activeGpsMap.remove();
        (window as any).activeGpsMap = null;
      }
    };
  }, [isGpsOpen]);

  // Các hàm tương tác API giữ nguyên
  const handleToggleStatus = async (channel: string, id: number, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await axios.put(`http://localhost:5000/api/v1/timekeeping/${channel}/toggle/${id}`, { status: nextStatus });
      loadAllData();
    } catch (err) { alert('Không thể đổi trạng thái thiết bị'); }
  };

  const handleSaveGeneral = async () => {
    try {
      const res = await axios.put('http://localhost:5000/api/v1/timekeeping/config', generalConfig);
      alert(res.data.message); loadAllData();
    } catch (err: any) { alert(err.response?.data?.message || 'Thao tác thất bại'); }
  };

  const handleAddWifi = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/v1/timekeeping/wifis', wifiForm);
      alert(res.data.message); setWifiForm({ name: '', ip_address: '', bssid: '' }); onWifiClose(); loadAllData();
    } catch (err: any) { alert(err.response?.data?.message); }
  };

  const handleAddGps = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/v1/timekeeping/gps', gpsForm);
      alert(res.data.message); onGpsClose(); loadAllData();
    } catch (err: any) { alert(err.response?.data?.message); }
  };

  const handleAddMachine = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/v1/timekeeping/machines', machineForm);
      alert(res.data.message); setMachineForm({ name: '', ip_address: '', serial_number: '', connection_method: 'SERVER' }); onMachineClose(); loadAllData();
    } catch (err: any) { alert(err.response?.data?.message); }
  };

  const handleDeleteItem = async (channel: string, id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn gỡ bỏ hoàn toàn thiết bị cấu hình này?')) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/v1/timekeeping/${channel}/${id}`);
      alert(res.data.message); loadAllData();
    } catch (err) { alert('Lỗi không thể xóa!'); }
  };

  return (
    <div className="flex flex-col h-full bg-white p-2 rounded-xl">
      <Tabs 
        selectedKey={activeTab} 
        onSelectionChange={(key) => setActiveTab(key as string)}
        color="primary" variant="underlined"
        classNames={{
          tabList: "gap-6 w-full border-b border-divider bg-white px-4",
          cursor: "w-full bg-blue-800",
          tab: "max-w-fit h-12 text-sm font-medium",
          tabContent: "font-semibold"
        }}
      >
        {/* TAB 1: CHU KỲ CÔNG */}
        <Tab key="general" title={<div className="flex items-center gap-2"><IconDeviceLaptop size={18}/><span>Chu kỳ công & Tổng quát</span></div>}>
          <div className="p-4 max-w-2xl flex flex-col gap-6 mt-2">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Cấu hình chu kỳ tính công</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" min={1} max={31} label="Ngày bắt đầu chu kỳ công *" value={generalConfig.cycle_start_day.toString()} onChange={(e) => setGeneralConfig({...generalConfig, cycle_start_day: parseInt(e.target.value) || 1})} />
                <Input type="number" min={1} max={31} label="Ngày kết thúc chu kỳ công *" value={generalConfig.cycle_end_day.toString()} onChange={(e) => setGeneralConfig({...generalConfig, cycle_end_day: parseInt(e.target.value) || 31})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" min={1} max={31} label="Ngày nhắc giải trình công *" value={generalConfig.lock_date.toString()} onChange={(e) => setGeneralConfig({...generalConfig, lock_date: parseInt(e.target.value) || 5})} />
                <Input type="number" min={0} max={30} label="Hạn gửi giải trình công (Ngày) *" value={generalConfig.allow_explanation_days.toString()} onChange={(e) => setGeneralConfig({...generalConfig, allow_explanation_days: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Tự động kết ca liên tiếp</h4>
                <p className="text-xs text-gray-400 mt-1">Hệ thống tự động nối giờ OUT ca trước làm giờ IN ca sau nếu làm ca kíp gối đầu nhau</p>
              </div>
              <Switch isSelected={generalConfig.auto_connect_shift === 1} onValueChange={(val) => setGeneralConfig({...generalConfig, auto_connect_shift: val ? 1 : 0})} color="success" />
            </div>
            <Button color="primary" startContent={<IconDeviceFloppy size={18}/>} onClick={handleSaveGeneral} className="w-fit font-medium rounded-lg">Lưu cấu hình</Button>
          </div>
        </Tab>

        {/* TAB 2: CONFIG WIFI */}
        <Tab key="wifi" title={<div className="flex items-center gap-2"><IconWifi size={18}/><span>Cấu hình WiFi</span></div>}>
          <div className="p-4 mt-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-600">Danh sách mạng Wifi nội bộ cho phép chấm công</span>
              <Button color="primary" size="sm" startContent={<IconPlus size={16}/>} onClick={onWifiOpen}>Thêm wifi</Button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <Table aria-label="Wifi Table" removeWrapper>
                <TableHeader>
                  <TableColumn>Tên wifi</TableColumn>
                  <TableColumn>IP Mạng / Gateway</TableColumn>
                  <TableColumn>Địa chỉ BSSID (MAC)</TableColumn>
                  <TableColumn width={120} align="center">Trạng thái</TableColumn>
                  <TableColumn width={100} align="center">Hành động</TableColumn>
                </TableHeader>
                <TableBody>
                  {wifis.map((w) => (
                    <TableRow key={w.id} className="border-b">
                      <TableCell className="font-semibold text-gray-700">{w.name}</TableCell>
                      <TableCell className="text-gray-600 text-sm">{w.ip_address || '—'}</TableCell>
                      <TableCell className="text-blue-700 font-mono text-xs font-semibold">{w.bssid}</TableCell>
                      <TableCell>
                        <Switch size="sm" isSelected={w.status === 'ACTIVE'} onValueChange={() => handleToggleStatus('wifis', w.id, w.status)} color="success" />
                      </TableCell>
                      <TableCell>
                        <IconTrash size={18} className="text-gray-400 cursor-pointer hover:text-red-500 m-auto" onClick={() => handleDeleteItem('wifis', w.id)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Tab>

        {/* TAB 3: CONFIG GPS */}
        <Tab key="gps" title={<div className="flex items-center gap-2"><IconMapPin size={18}/><span>Định vị GPS</span></div>}>
          <div className="p-4 mt-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-600">Vùng bán kính định vị thực địa</span>
              <Button color="primary" size="sm" startContent={<IconPlus size={16}/>} onClick={onGpsOpen}>Thêm vị trí</Button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <Table aria-label="GPS Table" removeWrapper>
                <TableHeader>
                  <TableColumn>Địa điểm</TableColumn>
                  <TableColumn>Tọa độ gốc (Lat, Lng)</TableColumn>
                  <TableColumn>Bán kính cho phép</TableColumn>
                  <TableColumn width={120} align="center">Trạng thái</TableColumn>
                  <TableColumn width={100} align="center">Hành động</TableColumn>
                </TableHeader>
                <TableBody>
                  {gpsList.map((g) => (
                    <TableRow key={g.id} className="border-b">
                      <TableCell className="font-semibold text-gray-700">{g.name}</TableCell>
                      <TableCell className="text-gray-600 text-sm font-mono">{g.latitude}, {g.longitude}</TableCell>
                      <TableCell className="text-gray-700 text-sm font-medium">Bán kính cho phép: {g.allowed_radius}m</TableCell>
                      <TableCell>
                        <Switch size="sm" isSelected={g.status === 'ACTIVE'} onValueChange={() => handleToggleStatus('gps', g.id, g.status)} color="success" />
                      </TableCell>
                      <TableCell>
                        <IconTrash size={18} className="text-gray-400 cursor-pointer hover:text-red-500 m-auto" onClick={() => handleDeleteItem('gps', g.id)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Tab>

        {/* TAB 4: MÁY VÂN TAY */}
        <Tab key="machine" title={<div className="flex items-center gap-2"><IconCpu size={18}/><span>Máy chấm công vân tay</span></div>}>
          <div className="p-4 mt-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-600">Đồng bộ dữ liệu từ thiết bị máy vật lý</span>
              <Button color="primary" size="sm" startContent={<IconPlus size={16}/>} onClick={onMachineOpen}>Thêm máy chấm công</Button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <Table aria-label="Machine Table" removeWrapper>
                <TableHeader>
                  <TableColumn>Tên thiết bị</TableColumn>
                  <TableColumn>Địa chỉ IP mạng LAN</TableColumn>
                  <TableColumn>Số SERIAL định danh</TableColumn>
                  <TableColumn width={120} align="center">Trạng thái</TableColumn>
                  <TableColumn width={100} align="center">Hành động</TableColumn>
                </TableHeader>
                <TableBody>
                  {machines.map((m) => (
                    <TableRow key={m.id} className="border-b">
                      <TableCell className="font-semibold text-gray-700">{m.name}</TableCell>
                      <TableCell className="text-gray-600 font-mono text-sm">{m.ip_address || '—'}</TableCell>
                      <TableCell className="text-gray-700 text-sm font-mono font-bold">SERIAL: {m.serial_number}</TableCell>
                      <TableCell>
                        <Switch size="sm" isSelected={m.status === 'ACTIVE'} onValueChange={() => handleToggleStatus('machines', m.id, m.status)} color="success" />
                      </TableCell>
                      <TableCell>
                        <IconTrash size={18} className="text-gray-400 cursor-pointer hover:text-red-500 m-auto" onClick={() => handleDeleteItem('machines', m.id)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Tab>
      </Tabs>

      {/* DRAWER WIFI */}
      <Drawer isOpen={isWifiOpen} onOpenChange={onWifiOpenChange} placement="right" size="md">
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="border-b bg-gray-50 font-bold text-base text-gray-800">Thêm wifi chấm công</DrawerHeader>
              <DrawerBody className="gap-4 pt-4">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Thông tin trạm</span>
                <Input label={<span>Tên Wifi (SSID) hiển thị <span className="text-red-500">*</span></span>} placeholder="Nhập" value={wifiForm.name} onChange={(e) => setWifiForm({...wifiForm, name: e.target.value})} />
                <Input label={<span>Địa chỉ IP (Gateway) <span className="text-red-500">*</span></span>} placeholder="Nhập" value={wifiForm.ip_address} onChange={(e) => setWifiForm({...wifiForm, ip_address: e.target.value})} />
                <Input label={<span>Địa chỉ MAC (BSSID) <span className="text-red-500">*</span></span>} placeholder="Nhập" value={wifiForm.bssid} onChange={(e) => setWifiForm({...wifiForm, bssid: e.target.value})} />
              </DrawerBody>
              <DrawerFooter className="border-t bg-gray-50">
                <Button variant="bordered" onClick={onWifiClose}>Thoát (ESC)</Button>
                <Button color="primary" onClick={handleAddWifi}>Lưu (Ctrl+S)</Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* DRAWER GPS (CÓ BẢN ĐỒ CLICK GHIM TỌA ĐỘ) */}
      <Drawer isOpen={isGpsOpen} onOpenChange={onGpsOpenChange} placement="right" size="md">
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="border-b bg-gray-50 font-bold text-base text-gray-800">Thêm vị trí địa lý (GPS)</DrawerHeader>
              <DrawerBody className="gap-4 pt-4">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Thông tin vùng quét</span>
                <Input label={<span>Tên địa điểm <span className="text-red-500">*</span></span>} placeholder="Nhập tên" value={gpsForm.name} onChange={(e) => setGpsForm({...gpsForm, name: e.target.value})} />
                
                {/* BẢN ĐỒ SỐ TƯƠNG TÁC THẬT 100% CỦA CHÚNG TA */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 font-medium">Bản đồ số định vị (Bấm chuột vào bản đồ hoặc kéo ghim để lấy tọa độ)</span>
                  <div id="interactive-map" className="w-full h-52 rounded-xl border border-gray-200 shadow-inner z-0"></div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input label="Vĩ độ (Latitude) *" value={gpsForm.latitude} disabled className="opacity-80" />
                  <Input label="Kinh độ (Longitude) *" value={gpsForm.longitude} disabled className="opacity-80" />
                </div>
                
                <Input type="number" label={<span>Bán kính giới hạn (mét) <span className="text-red-500">*</span></span>} placeholder="Nhập bán kính" value={gpsForm.allowed_radius} onChange={(e) => setGpsForm({...gpsForm, allowed_radius: e.target.value})} />
              </DrawerBody>
              <DrawerFooter className="border-t bg-gray-50">
                <Button variant="bordered" onClick={onGpsClose}>Thoát (ESC)</Button>
                <Button color="primary" onClick={handleAddGps}>Lưu (Ctrl+S)</Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* DRAWER MÁY VÂN TAY */}
      <Drawer isOpen={isMachineOpen} onOpenChange={onMachineOpenChange} placement="right" size="md">
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="border-b bg-gray-50 font-bold text-base text-gray-800">Thêm máy chấm công</DrawerHeader>
              <DrawerBody className="gap-4 pt-4">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Thông tin kết nối đầu vào</span>
                <Input label={<span>Tên máy chấm công <span className="text-red-500">*</span></span>} placeholder="Nhập tên" value={machineForm.name} onChange={(e) => setMachineForm({...machineForm, name: e.target.value})} />
                
                <Select label={<span>Phương thức kết nối <span className="text-red-500">*</span></span>} selectedKeys={[machineForm.connection_method]} onChange={(e) => setMachineForm({...machineForm, connection_method: e.target.value})}>
                  <SelectItem key="SERVER">Kết nối qua server</SelectItem>
                  <SelectItem key="DIRECT">Kết nối trực tiếp (Direct IP / LAN)</SelectItem>
                </Select>

                {machineForm.connection_method === 'DIRECT' ? (
                  <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 animate-appearance-in">
                    <Input label={<span>Địa chỉ IP (Static) <span className="text-red-500">*</span></span>} placeholder="Ví dụ: 192.168.1.10" value={machineForm.ip_address} onChange={(e) => setMachineForm({...machineForm, ip_address: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Port *" defaultValue="4370" disabled />
                      <Input label="Mật khẩu máy *" placeholder="Nhập mã" />
                    </div>
                  </div>
                ) : (
                  <div className="animate-appearance-in">
                    <Input label={<span>Số serial (SN) trên vỏ máy <span className="text-red-500">*</span></span>} placeholder="Nhập số serial" value={machineForm.serial_number} onChange={(e) => setMachineForm({...machineForm, serial_number: e.target.value})} />
                  </div>
                )}
              </DrawerBody>
              <DrawerFooter className="border-t bg-gray-50">
                <Button variant="bordered" onClick={onMachineClose}>Thoát (ESC)</Button>
                <Button color="primary" onClick={handleAddMachine}>Lưu (Ctrl+S)</Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default TimekeepingCategory;