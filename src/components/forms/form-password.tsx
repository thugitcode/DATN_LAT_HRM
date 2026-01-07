import { useState } from 'react';
import { ActionIcon, Group, PasswordInput, Tooltip, type PasswordInputProps } from '@mantine/core';
import { IconCopy, IconEye, IconEyeOff, IconRefresh } from '@tabler/icons-react';

import type { FormFieldProps } from '@/types';
import { getFormFieldProps } from '@/lib/utils';

export type FormPasswordProps = PasswordInputProps &
  FormFieldProps & {
    enableGenerate?: boolean;
    enableCopy?: boolean;
    showEye?: boolean;
    onGenerate?: () => void;
  };

export const FormPassword = ({
  formProps,
  enableGenerate,
  enableCopy,
  onGenerate,
  showEye = true,
  ...props
}: FormPasswordProps) => {
  const [visible, setVisible] = useState(false);

  const value = formProps?.state?.value ?? props.value ?? '';

  const handleChange = (val: string) => {
    formProps?.handleChange(val);
    props.onChange?.({
      target: { value: val },
    } as any);
  };

  return (
    <PasswordInput
      radius="md"
      visible={visible}
      onVisibilityChange={setVisible}
      value={value}
      styles={{
        label: {
          marginBottom: 8,
          fontSize: '14px',
          fontWeight: 500,
        },
        input: {
          padding: '12px 14px',
          fontSize: '14px',
          borderRadius: 8,
          marginBottom: 10,
          height: 40,
        },
      }}
      placeholder={!props.readOnly ? 'Nhập' : ''}
      variant="filled"
      rightSectionWidth={enableGenerate || enableCopy ? 72 : 40}
      rightSection={
        <Group gap={4}>
          {/* Show / Hide */}
          {showEye && <Tooltip label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
            <ActionIcon variant="subtle" onClick={() => setVisible((v) => !v)} c={'#333333'}>
              {visible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </ActionIcon>
          </Tooltip>}

          {/* Generate */}
          {enableGenerate && (
            <Tooltip label="Đặt lại mật khẩu">
              <ActionIcon
                variant="subtle"
                onClick={() => {
                  onGenerate?.();
                }}
                c={'#333333'}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          )}

          {/* Copy */}
          {enableCopy && (
            <Tooltip label="Copy">
              <ActionIcon
                variant="subtle"
                disabled={!value}
                onClick={() => navigator.clipboard.writeText(String(value))}
              >
                <IconCopy size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      }
      {...(formProps ? getFormFieldProps({ formProps }) : {})}
      onChange={(e) => handleChange(e.currentTarget.value)}
      {...props}
    />
  );
};
