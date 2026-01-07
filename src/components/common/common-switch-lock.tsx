import { useEffect, useState } from 'react';
import { Loader, Switch, Tooltip, type SwitchProps } from '@mantine/core';
import { IconLockFilled, IconLockOpen2 } from '@tabler/icons-react';
import { AxiosError } from 'axios';

import { noti } from '@/lib/utils';

export type CommonSwitchLockProps = SwitchProps & {
  checkedLabel?: string;
  uncheckedLabel?: string;
  onChangeChecked?: (checked: boolean) => Promise<void>;
};

export const CommonSwitchLock = ({
  checkedLabel = 'Mở khóa',
  uncheckedLabel = 'Khóa',
  defaultChecked = false,
  onChangeChecked,
  ...props
}: CommonSwitchLockProps) => {
  const [checked, setChecked] = useState(defaultChecked);
  const [loading, setLoading] = useState(false);
  const prevChecked = checked;
  useEffect(() => {
    setChecked(defaultChecked);
  }, [defaultChecked]);
  return (
    <Tooltip label={checked ? checkedLabel : uncheckedLabel} refProp="rootRef">
      <Switch
        checked={checked}
        onChange={handleChange}
        size="md"
        disabled={loading}
        // color="danger"
        // thumbIcon={
        //   loading ? (
        //     <Loader size={12} />
        //   ) : checked ? (
        //     <IconLockFilled size={12} stroke={2.5} color="var(--mantine-color-danger-filled)" />
        //   ) : (
        //     <IconLockOpen2 size={12} stroke={2.5} color="var(--mantine-color-success-filled)" />
        //   )
        // }
        withThumbIndicator={false}
        styles={{
          thumb: {
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E6EB',
            width: '20px',
            height: '20px',
          },
        }}
        {...props}
      />
    </Tooltip>
  );

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    const checked = e.target.checked;
    setLoading(true);

    try {
      await onChangeChecked?.(checked);

      setChecked(checked);
    } catch (error) {
      setChecked(prevChecked);
    } finally {
      setLoading(false);
    }
  }
};
