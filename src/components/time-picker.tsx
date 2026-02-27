import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type MouseEvent,
} from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';

// ─── Hằng số ─────────────────────────────────────────────────────────────────

const ITEM_H = 36;
const SO_HANG_HIEN_THI = 7;
const VI_TRI_TRUNG_TAM = Math.floor(SO_HANG_HIEN_THI / 2);
const COLUMN_W = 56;

const pad = (n: number): string => String(n).padStart(2, '0');

const GIO = Array.from({ length: 24 }, (_, i) => pad(i));
const PHUT = Array.from({ length: 60 }, (_, i) => pad(i));
const GIAY = Array.from({ length: 60 }, (_, i) => pad(i));

// ─── Kiểu dữ liệu ────────────────────────────────────────────────────────────

interface GiaTri {
  gio: string;
  phut: string;
  giay: string;
}

interface CotCuonProps {
  items: readonly string[];
  giaTri: string;
  onChange: (val: string) => void;
  nhanDe: string;
}

export interface TimePickerProps {
  /** Giá trị kiểm soát từ ngoài, định dạng "HH:mm:ss" hoặc "HH:mm" */
  value?: string;
  /** Callback khi nhấn OK */
  onChange?: (value: string) => void;
  /** Hiển thị cột giây (mặc định: true) */
  showSeconds?: boolean;
  /** Vô hiệu hoá */
  disabled?: boolean;
  /** Trạng thái lỗi */
  isInvalid?: boolean;
  /** aria-label cho accessibility */
  ariaLabel?: string;
  classInput?: string;
  showIcon?: boolean
}

// ─── Tiện ích ─────────────────────────────────────────────────────────────────

function layGioHienTai(): GiaTri {
  const now = new Date();
  return { gio: pad(now.getHours()), phut: pad(now.getMinutes()), giay: pad(now.getSeconds()) };
}

function phanTichChuoi(value: string, coGiay: boolean): GiaTri | null {
  if (coGiay) {
    const m = value.match(/^(\d{2}):(\d{2}):(\d{2})$/);
    return m ? { gio: m[1], phut: m[2], giay: m[3] } : null;
  }
  const m = value.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  return m ? { gio: m[1], phut: m[2], giay: m[3] ?? '00' } : null;
}

function taoGiaTriHienThi(gt: GiaTri, coGiay: boolean): string {
  return coGiay ? `${gt.gio}:${gt.phut}:${gt.giay}` : `${gt.gio}:${gt.phut}`;
}

// ─── CotCuon ─────────────────────────────────────────────────────────────────

const CotCuon: FC<CotCuonProps> = memo(({ items, giaTri, onChange, nhanDe }) => {
  const refDanhSach = useRef<HTMLDivElement>(null);
  const dangKeo = useRef(false);
  const batDauY = useRef(0);
  const batDauCuon = useRef(0);

  const cuonDenVi = useCallback((viTri: number, hanhDong: ScrollBehavior = 'smooth') => {
    refDanhSach.current?.scrollTo({ top: viTri * ITEM_H, behavior: hanhDong });
  }, []);

  useEffect(() => {
    const i = items.indexOf(giaTri);
    if (i !== -1) cuonDenVi(i, 'instant' as ScrollBehavior);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const i = items.indexOf(giaTri);
    if (i !== -1) cuonDenVi(i, 'smooth');
  }, [giaTri, items, cuonDenVi]);

  const snapGanNhat = useCallback(() => {
    const el = refDanhSach.current;
    if (!el) return;
    const i = Math.round(el.scrollTop / ITEM_H);
    const clamp = Math.max(0, Math.min(items.length - 1, i));
    onChange(items[clamp]);
    cuonDenVi(clamp);
  }, [items, onChange, cuonDenVi]);

  const xuLyCuon = useCallback(() => {
    if (dangKeo.current) return;
    const el = refDanhSach.current;
    if (!el) return;
    const i = Math.round(el.scrollTop / ITEM_H);
    const clamp = Math.max(0, Math.min(items.length - 1, i));
    if (items[clamp] !== giaTri) onChange(items[clamp]);
  }, [items, giaTri, onChange]);

  const xuLyMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    dangKeo.current = true;
    batDauY.current = e.clientY;
    batDauCuon.current = refDanhSach.current?.scrollTop ?? 0;
  }, []);

  const xuLyMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!dangKeo.current || !refDanhSach.current) return;
    refDanhSach.current.scrollTop = batDauCuon.current + (batDauY.current - e.clientY);
  }, []);

  const xuLyMouseUp = useCallback(() => {
    if (!dangKeo.current) return;
    dangKeo.current = false;
    snapGanNhat();
  }, [snapGanNhat]);

  const xuLyTouchStart = useCallback((e: globalThis.TouchEvent) => {
    batDauY.current = e.touches[0].clientY;
    batDauCuon.current = refDanhSach.current?.scrollTop ?? 0;
  }, []);

  const xuLyTouchMove = useCallback((e: globalThis.TouchEvent) => {
    if (!refDanhSach.current) return;
    refDanhSach.current.scrollTop = batDauCuon.current + (batDauY.current - e.touches[0].clientY);
  }, []);

  useEffect(() => {
    const el = refDanhSach.current;
    if (!el) return;
    window.addEventListener('mousemove', xuLyMouseMove);
    window.addEventListener('mouseup', xuLyMouseUp);
    el.addEventListener('touchstart', xuLyTouchStart, { passive: true });
    el.addEventListener('touchmove', xuLyTouchMove, { passive: true });
    el.addEventListener('touchend', snapGanNhat);
    return () => {
      window.removeEventListener('mousemove', xuLyMouseMove);
      window.removeEventListener('mouseup', xuLyMouseUp);
      el.removeEventListener('touchstart', xuLyTouchStart);
      el.removeEventListener('touchmove', xuLyTouchMove);
      el.removeEventListener('touchend', snapGanNhat);
    };
  }, [xuLyMouseMove, xuLyMouseUp, xuLyTouchStart, xuLyTouchMove, snapGanNhat]);

  const chonItem = useCallback(
    (i: number) => {
      onChange(items[i]);
      cuonDenVi(i);
    },
    [items, onChange, cuonDenVi],
  );

  return (
    <div className="relative flex flex-col items-center" style={{ width: COLUMN_W }}>
      <span className="text-[10px] font-semibold tracking-widest uppercase text-default-400 mb-1 select-none">
        {nhanDe}
      </span>

      <div className="relative" style={{ width: COLUMN_W }}>
        <div
          className="absolute inset-x-0 top-0 z-10 pointer-events-none"
          style={{
            height: VI_TRI_TRUNG_TAM * ITEM_H,
            background: 'linear-gradient(to bottom, white 10%, transparent)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{
            height: VI_TRI_TRUNG_TAM * ITEM_H,
            background: 'linear-gradient(to top, white 10%, transparent)',
          }}
        />
        <div
          className="absolute inset-x-0 z-0 pointer-events-none rounded-lg bg-primary/10"
          style={{ top: VI_TRI_TRUNG_TAM * ITEM_H, height: ITEM_H }}
        />

        <div
          ref={refDanhSach}
          onScroll={xuLyCuon}
          onMouseDown={xuLyMouseDown}
          role="listbox"
          aria-label={nhanDe}
          className="overflow-y-scroll select-none cursor-grab active:cursor-grabbing outline-none"
          style={{ height: SO_HANG_HIEN_THI * ITEM_H, width: '100%', scrollbarWidth: 'none' }}
        >
          <div style={{ height: VI_TRI_TRUNG_TAM * ITEM_H }} aria-hidden />
          {items.map((item, idx) => {
            const dangChon = item === giaTri;
            return (
              <div
                key={item}
                role="option"
                aria-selected={dangChon}
                onClick={() => chonItem(idx)}
                className="flex items-center justify-center font-mono transition-all duration-150"
                style={{
                  height: ITEM_H,
                  color: dangChon ? 'hsl(var(--heroui-primary, 213 100% 50%))' : '#9ca3af',
                  fontWeight: dangChon ? 700 : 400,
                  fontSize: dangChon ? 15 : 13,
                  letterSpacing: dangChon ? '0.04em' : '0',
                }}
              >
                {item}
              </div>
            );
          })}
          <div style={{ height: VI_TRI_TRUNG_TAM * ITEM_H }} aria-hidden />
        </div>
      </div>
    </div>
  );
});
CotCuon.displayName = 'CotCuon';

// ─── Icon đồng hồ ─────────────────────────────────────────────────────────────

const BieuTuongDongHo: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    viewBox="0 0 24 24"
    aria-hidden
  >
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
  </svg>
);

// ─── Cấu hình cột ─────────────────────────────────────────────────────────────

const CAU_HINH_COT = [
  { key: 'gio' as const, nhanDe: 'Giờ', items: GIO },
  { key: 'phut' as const, nhanDe: 'Phút', items: PHUT },
  { key: 'giay' as const, nhanDe: 'Giây', items: GIAY },
] as const;

// ─── TimePicker ───────────────────────────────────────────────────────────────

const TimePicker: FC<TimePickerProps> = ({
  value: giaTriBenNgoai,
  onChange,
  showSeconds = true,
  disabled = false,
  isInvalid = false,
  ariaLabel = 'Chọn thời gian',
  classInput = "",
  showIcon = true
}) => {
  const laDieuKhien = giaTriBenNgoai !== undefined;

  const [chuaCoGiaTri, setChuaCoGiaTri] = useState<boolean>(
    () => !giaTriBenNgoai || !phanTichChuoi(giaTriBenNgoai, showSeconds),
  );
  const [phac, setPhac] = useState<GiaTri>(() => {
    if (giaTriBenNgoai) return phanTichChuoi(giaTriBenNgoai, showSeconds) ?? layGioHienTai();
    return layGioHienTai();
  });
  const [daXacNhan, setDaXacNhan] = useState<GiaTri>(phac);
  const [dangMo, setDangMo] = useState(false);

  // Đồng bộ từ prop bên ngoài
  useEffect(() => {
    if (!laDieuKhien) return;
    if (!giaTriBenNgoai) {
      setChuaCoGiaTri(true);
      return;
    }
    const parsed = phanTichChuoi(giaTriBenNgoai, showSeconds);
    if (parsed) {
      setPhac(parsed);
      setDaXacNhan(parsed);
      setChuaCoGiaTri(false);
    }
  }, [giaTriBenNgoai, laDieuKhien, showSeconds]);

  const doCotHienThi = useMemo(
    () => CAU_HINH_COT.filter((c) => showSeconds || c.key !== 'giay'),
    [showSeconds],
  );

  const datTruong = useCallback(
    (truong: keyof GiaTri) => (val: string) => setPhac((prev) => ({ ...prev, [truong]: val })),
    [],
  );

  const xuLyBayGio = useCallback(() => setPhac(layGioHienTai()), []);

  const xuLyOK = useCallback(() => {
    setDaXacNhan(phac);
    setChuaCoGiaTri(false);
    onChange?.(taoGiaTriHienThi(phac, showSeconds));
    setDangMo(false);
  }, [phac, onChange, showSeconds]);

  // Khi popover mở: init phac
  const xuLyMoThayDoi = useCallback(
    (mo: boolean) => {
      if (mo) setPhac(chuaCoGiaTri ? layGioHienTai() : daXacNhan);
      else setPhac(daXacNhan); // hủy nếu đóng không qua OK
      setDangMo(mo);
    },
    [chuaCoGiaTri, daXacNhan],
  );

  const giaTriHienThi = useMemo(() => {
    if (chuaCoGiaTri) return showSeconds ? '--:--:--' : '--:--';
    return taoGiaTriHienThi(daXacNhan, showSeconds);
  }, [chuaCoGiaTri, daXacNhan, showSeconds]);

  const getBgClass = () => {
    if (isInvalid) return 'bg-[#F4F4F5]';
    return 'bg-default-100 hover:bg-default-200';
  };

  return (
    <Popover
      isOpen={dangMo}
      onOpenChange={xuLyMoThayDoi}
      placement="bottom-start"
      // shouldBlockScroll ngăn drawer scroll nhưng KHÔNG đóng drawer
      shouldBlockScroll={false}
    // HeroUI Popover tự handle portal + focus trap, không bubble lên drawer
    >
      <PopoverTrigger>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={dangMo}
          className={[
            'relative flex items-center gap-2 w-full h-10 px-3',
            'rounded-xl border border-transparent',
            getBgClass(),
            isInvalid ? 'ring-2 ring-danger/50 ring-offset-1' : '',
            'transition-[background] duration-150 ease-in-out',
            'outline-none',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span
            className={[
              'flex-1 text-left font-mono text-sm tracking-widest',
              chuaCoGiaTri ? 'text-default-400' : 'text-default-800',
              classInput
            ].join(' ')}
          >
            {giaTriHienThi}
          </span>

          {showIcon && <BieuTuongDongHo
            className={[
              'w-4 h-4 flex-shrink-0 transition-colors duration-150',
              isInvalid ? 'text-danger' : dangMo ? 'text-primary' : 'text-default-400',
            ].join(' ')}
          />}
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-0 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        {/* Cột cuộn */}
        <div className="flex items-end justify-around px-3 pt-3 pb-1 gap-1">
          {doCotHienThi.map((col, i) => (
            <div key={col.key} className="flex items-end gap-1">
              <CotCuon
                items={col.items}
                giaTri={phac[col.key]}
                onChange={datTruong(col.key)}
                nhanDe={col.nhanDe}
              />
              {i < doCotHienThi.length - 1 && (
                <span
                  className="text-default-200 font-bold text-base select-none mb-[3px]"
                  aria-hidden
                >
                  :
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2.5 border-t border-default-100 bg-default-50/80">
          <button
            type="button"
            onClick={xuLyBayGio}
            className="text-primary text-sm font-medium px-2 py-1 rounded-lg transition-all duration-150 hover:bg-primary/10 active:bg-primary/20 active:scale-[0.97] outline-none"
          >
            Bây giờ
          </button>
          <button
            type="button"
            onClick={xuLyOK}
            className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-lg transition-all duration-150 hover:opacity-80 active:opacity-70 active:scale-[0.97] outline-none shadow-sm"
          >
            OK
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;
