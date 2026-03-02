'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@heroui/react';
import { Controller } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';

import type { BaseFieldProps } from './types';

type Props<T extends FieldValues> = BaseFieldProps<T> & {
  placeholder?: string;
};

const ITEM_HEIGHT = 40;
const VISIBLE = 7; // số item hiển thị (lẻ để item chọn nằm giữa)
const PAD = Math.floor(VISIBLE / 2); // 3 item padding top/bottom

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function ScrollColumn({
  items,
  selected,
  onChange,
}: {
  items: string[];
  selected: string;
  onChange: (val: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScroll = useRef(0);
  const rafId = useRef<number>();
  const selectedIndex = items.indexOf(selected);

  // scroll to selected
  const scrollTo = useCallback((index: number, smooth = true) => {
    if (!ref.current) return;
    if (smooth) {
      ref.current.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
    } else {
      ref.current.scrollTop = index * ITEM_HEIGHT;
    }
  }, []);

  useEffect(() => {
    // setTimeout đảm bảo DOM render xong trước khi set scrollTop
    const t = setTimeout(() => scrollTo(selectedIndex, false), 0);
    return () => clearTimeout(t);
  }, []); // chỉ chạy lần đầu

  // snap khi scroll dừng
  const onScroll = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (!ref.current || isDragging.current) return;
      const raw = ref.current.scrollTop / ITEM_HEIGHT;
      const index = Math.round(raw);
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      // chỉ snap nếu chưa ở đúng vị trí
      if (Math.abs(raw - clamped) > 0.01) {
        scrollTo(clamped);
      }
      onChange(items[clamped]);
    });
  };

  // mouse/touch drag
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startScroll.current = ref.current?.scrollTop ?? 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !ref.current) return;
    const delta = startY.current - e.clientY;
    ref.current.scrollTop = startScroll.current + delta;
  };

  const onPointerUp = () => {
    isDragging.current = false;
    if (!ref.current) return;
    const index = Math.round(ref.current.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    scrollTo(clamped);
    onChange(items[clamped]);
  };

  return (
    <div className="relative flex-1 overflow-hidden" style={{ height: ITEM_HEIGHT * VISIBLE }}>
      {/* top fade */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
        style={{
          height: ITEM_HEIGHT * PAD,
          background: 'linear-gradient(to bottom, white 10%, transparent)',
        }}
      />
      {/* selection highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 z-10 border-y border-[#E5E7EB] bg-[#F5F5FF]"
        style={{ top: ITEM_HEIGHT * PAD, height: ITEM_HEIGHT }}
      />
      {/* bottom fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{
          height: ITEM_HEIGHT * PAD,
          background: 'linear-gradient(to top, white 10%, transparent)',
        }}
      />

      <div
        ref={ref}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="scrollbar-hide h-full overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory', cursor: 'grab' }}
      >
        {/* padding */}
        <div style={{ height: ITEM_HEIGHT * PAD }} />
        {items.map((item, i) => {
          const isSelected = i === selectedIndex;
          return (
            <div
              key={item}
              onClick={() => {
                scrollTo(i);
                onChange(item);
              }}
              className="flex select-none items-center justify-center transition-all duration-150"
              style={{
                height: ITEM_HEIGHT,
                scrollSnapAlign: 'center',
                fontWeight: isSelected ? 600 : 400,
                fontSize: isSelected ? 20 : 16,
                color: isSelected ? '#4F46E5' : '#9CA3AF',
              }}
            >
              {item}
            </div>
          );
        })}
        {/* padding */}
        <div style={{ height: ITEM_HEIGHT * PAD }} />
      </div>
    </div>
  );
}

function TimePicker({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
}) {
  const [h, setH] = useState(value?.split(':')[0] ?? '00');
  const [m, setM] = useState(value?.split(':')[1] ?? '00');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onChange(`${h}:${m}`);
        onClose();
      }
    };
    // delay để tránh đóng ngay khi click icon mở
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [h, m, onChange, onClose]);

  const handleOk = () => {
    onChange(`${h}:${m}`);
    onClose();
  };

  const handleNow = () => {
    const now = new Date();
    const nowH = String(now.getHours()).padStart(2, '0');
    const nowM = String(now.getMinutes()).padStart(2, '0');
    setH(nowH);
    setM(nowM);
  };

  return (
    <div
      ref={ref}
      className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-2xl bg-white shadow-2xl"
      style={{ border: '1px solid #F3F4F6' }}
    >
      {/* columns */}
      <div className="flex items-center px-4 pt-2">
        <ScrollColumn items={hours} selected={h} onChange={setH} />
        <span
          className="mx-1 text-xl font-bold text-[#4F46E5]"
          style={{ marginBottom: 2, flexShrink: 0 }}
        >
          :
        </span>
        <ScrollColumn items={minutes} selected={m} onChange={setM} />
      </div>

      {/* footer */}
      <div className="flex items-center justify-between border-t border-[#F3F4F6] px-4 py-2">
        <button
          type="button"
          onClick={handleNow}
          className="text-sm text-[#6B7280] hover:text-[#4F46E5] transition-colors"
        >
          Now
        </button>
        <button
          type="button"
          onClick={handleOk}
          className="rounded-lg bg-[#4F46E5] px-5 py-1 text-sm font-semibold text-white hover:bg-[#4338CA] transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}

export function FormTimeInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  isRequired,
  disabled,
}: Props<T>) {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="relative">
          <Input
            value={field.value ?? ''}
            readOnly
            name={name}
            label={label}
            placeholder={placeholder ?? 'HH:mm'}
            labelPlacement="outside"
            isRequired={isRequired}
            isDisabled={disabled}
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            onClick={() => !disabled && setOpen((v) => !v)}
            endContent={
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) setOpen((v) => !v);
                }}
                className="text-[#A1A1AA] hover:text-[#4F46E5] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" d="M12 7v5l3 3" />
                </svg>
              </button>
            }
            classNames={{
              label: 'text-xs font-normal leading-4 text-[#52525B]!',
              input: 'cursor-pointer',
              inputWrapper: `
                cursor-pointer
                data-[invalid=true]:!bg-[#F4F4F5]
                group-data-[invalid=true]:!bg-[#F4F4F5]
              `,
            }}
          />
          {open && (
            <TimePicker
              value={field.value ?? '00:00'}
              onChange={(val) => field.onChange(val)}
              onClose={() => setOpen(false)}
            />
          )}
        </div>
      )}
    />
  );
}
