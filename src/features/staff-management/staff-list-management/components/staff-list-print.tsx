import { forwardRef, type CSSProperties } from 'react';
import dayjs from 'dayjs';
import { translateJobTitle, translatePosition } from '../../time-attendance-management/helpers';

interface Staff {
  id: string;
  code: string;
  name: string;
  avatar?: string;
  birthday?: string;
  gender?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  position?: string;
  departments?: { id: string; name: string }[];
  workType?: string;
  endDate?: string;
  activeStatus?: string;
}

interface StaffListPrintProps {
  data: Staff[];
}

export const StaffListPrint = forwardRef<HTMLDivElement, StaffListPrintProps>(
  ({ data }, ref) => {
    const thStyle: CSSProperties = {
      backgroundColor: '#374151',
      color: '#fff',
      fontWeight: 'bold',
      border: '1px solid #9ca3af',
      textAlign: 'center',
      verticalAlign: 'middle',
      padding: '6px 2px',
      fontSize: '10px',
    };

    const tdBase: CSSProperties = {
      border: '1px solid #9ca3af',
      textAlign: 'center',
      verticalAlign: 'middle',
      padding: '4px',
      fontSize: '10px',
      wordBreak: 'break-word',
    };

    const tdLeft: CSSProperties = { ...tdBase, textAlign: 'left' };

    return (
      <div ref={ref}>
        <style>{`@media print {
          body * { visibility: hidden; }
          .staff-print-wrap, .staff-print-wrap * { visibility: visible; }
          .staff-print-wrap { position: absolute; left: 0; top: 0; width: 100%; padding: 10mm; }
          @page { size: A4 landscape; margin: 0; }
        }`}</style>

        <div className="staff-print-wrap" style={{ fontFamily: "'Times New Roman', serif" }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, textTransform: 'uppercase' }}>DANH SÁCH NHÂN VIÊN</h2>
            <p style={{ fontStyle: 'italic', fontSize: '11px' }}>Ngày in: {dayjs().format('DD/MM/YYYY HH:mm')}</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '30px' }} /> {/* STT */}
              <col style={{ width: '130px' }} /> {/* Nhân viên */}
              <col style={{ width: '70px' }} />  {/* Ngày sinh */}
              <col style={{ width: '50px' }} />  {/* Giới tính */}
              <col style={{ width: '140px' }} /> {/* Liên hệ */}
              <col style={{ width: '80px' }} />  {/* Cấp bậc */}
              <col style={{ width: '100px' }} /> {/* Khoa/Phòng */}
              <col style={{ width: '80px' }} />  {/* Loại hình */}
              <col style={{ width: '70px' }} />  {/* Hết hạn HĐ */}
            </colgroup>
            <thead>
              <tr>
                <th style={thStyle}>STT</th>
                <th style={thStyle}>NHÂN VIÊN</th>
                <th style={thStyle}>NGÀY SINH</th>
                <th style={thStyle}>GIỚI TÍNH</th>
                <th style={thStyle}>LIÊN HỆ</th>
                <th style={thStyle}>CẤP BẬC</th>
                <th style={thStyle}>KHOA/PHÒNG</th>
                <th style={thStyle}>LOẠI HÌNH</th>
                <th style={thStyle}>HẾT HẠN HĐ</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record, idx) => (
                <tr key={record.id}>
                  <td style={tdBase}>{idx + 1}</td>
                  {/* Cột Nhân viên (Avatar + Name + Code) */}
                  <td style={tdLeft}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{record.name}</div>
                        <div style={{ fontSize: '8px', color: '#666' }}>{translateJobTitle(record.jobTitle || '')} - {record.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdBase}>{record.birthday ? dayjs(record.birthday).format('DD/MM/YYYY') : ''}</td>
                  <td style={tdBase}>{record.gender === 'MALE' ? 'Nam' : record.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</td>
                  {/* Cột Liên hệ */}
                  <td style={tdLeft}>
                    <div style={{ fontSize: '9px' }}>{record.email}</div>
                    <div style={{ fontSize: '9px' }}>{record.phone}</div>
                  </td>
                  <td style={tdBase}>{translatePosition(record.position || '')}</td>
                  <td style={tdLeft}>
                    {record.departments?.map((d) => d.name).join(', ') || '—'}
                  </td>
                  <td style={tdBase}>
                    {record.workType === 'FULL_TIME' ? 'Toàn thời gian' : record.workType === 'PART_TIME' ? 'Bán thời gian' : record.workType || '—'}
                  </td>
                  <td style={tdBase}>
                    {record.endDate ? dayjs(record.endDate).format('DD/MM/YYYY') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer chữ ký (Tùy chọn) */}
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ fontWeight: 'bold' }}>Người lập bảng</div>
              <div style={{ marginTop: '50px' }}>(Ký và ghi rõ họ tên)</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

StaffListPrint.displayName = 'StaffListPrint';