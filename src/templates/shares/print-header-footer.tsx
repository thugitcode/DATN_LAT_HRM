import dayjs from 'dayjs';

interface PrintHeaderProps {
  companyName: string;
  unitName: string;
  title: string;
  subtitle?: string;
}

export const PrintHeader = ({ companyName, unitName, title, subtitle }: PrintHeaderProps) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
    <div style={{ lineHeight: '1.6' }}>
      <div style={{ fontWeight: 'bold', fontSize: '10px' }}>{companyName}</div>
      <div style={{ fontWeight: 'bold', fontSize: '10px' }}>{unitName}</div>
    </div>
    <div style={{ textAlign: 'center', flex: 1, paddingLeft: '16px' }}>
      <div
        style={{
          fontWeight: 'bold',
          fontSize: '13px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        {title}
      </div>
      {subtitle && <div style={{ fontSize: '10px', marginTop: '2px' }}>{subtitle}</div>}
    </div>
    <div style={{ minWidth: '120px' }} />
  </div>
);

export const PrintFooter = () => {
  const year = dayjs().year();

  return (
    <div style={{ marginTop: '16px' }}>
      <div
        style={{ textAlign: 'right', paddingRight: '8%', fontSize: '10px', marginBottom: '4px' }}
      >
        ….............., ngày __ tháng __ năm {year}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        {['Trưởng Đơn Vị', 'TL. Hành chánh - Nhân sự', 'Lập Bảng'].map((label) => (
          <div key={label} style={{ width: '30%', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '28px' }}>
              {label}
            </div>
            <div style={{ fontStyle: 'italic', fontSize: '9px' }}>(Ký, họ tên)</div>
          </div>
        ))}
      </div>
    </div>
  );
};
