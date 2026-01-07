import type {
  SelectOptionsConfig,
  SelectOptionsItemTypes,
  SelectOptionsMetaTypes,
  UseOptions,
} from '@/types';
import { useCustomerModelOptions } from '@/hooks/select-options/use-customer-model-options';
import { useCustomerSourceOptions } from '@/hooks/select-options/use-customer-source';
import { useCustomerStatusOptions } from '@/hooks/select-options/use-customer-status-options';
import { useCustomerTypeOptions } from '@/hooks/select-options/use-customer-type-options';
import { useFilterStatusOptions } from '@/hooks/select-options/use-filter-status-options';
import { useHospitalLineOptions } from '@/hooks/select-options/use-hospital-line-options';
import { useProvinceOptions } from '@/hooks/select-options/use-province-options';
import { useStaffOptions } from '@/hooks/select-options/use-staff-options';
import { useSubscriptionDurationOptions } from '@/hooks/select-options/use-subscription-duration-options';
import { useSubscriptionModuleOptions } from '@/hooks/select-options/use-subscription-module-options';
import { useSubscriptionPlanTypeOptions } from '@/hooks/select-options/use-subscription-plan-type-options';
import { useSubscriptionPricingTypeOptions } from '@/hooks/select-options/use-subscription-pricing-type-options';
import { useUtilityOptions } from '@/hooks/select-options/use-utility-options';
import { useWardOptions } from '@/hooks/select-options/use-ward-options';
import { useCustomerStageOptions } from '@/hooks/select-options/use-customer-stage-options';

import { FormMultiSelect, type FormMultiSelectProps } from './forms/form-multi-select';
import { FormSelect, type FormSelectProps } from './forms/form-select';

interface SelectConfig<T> {
  useOptions: UseOptions<T>;
  label: string;
  searchable?: boolean;
}

type BaseFormSelectEnhancedProps<TSubject extends keyof SelectOptionsConfig> = {
  subject: TSubject;
  noLabel?: boolean;
} & (SelectOptionsMetaTypes[TSubject] extends undefined
  ? { meta?: never }
  : { meta: SelectOptionsMetaTypes[TSubject] });

type FormSelectEnhancedSelectProps<TSubject extends keyof SelectOptionsConfig> = Omit<
  FormSelectProps<SelectOptionsItemTypes[TSubject]>,
  'data'
>;
type FormSelectEnhancedMultiSelectProps<TSubject extends keyof SelectOptionsConfig> = Omit<
  FormMultiSelectProps<SelectOptionsItemTypes[TSubject]>,
  'data'
>;

export type FormSelectEnhancedProps<
  TSubject extends keyof SelectOptionsConfig = keyof SelectOptionsConfig,
> = FormSelectEnhancedSelectProps<TSubject> & BaseFormSelectEnhancedProps<TSubject>;

export function FormSelectEnhanced<TSubject extends keyof SelectOptionsConfig>({
  subject,
  meta,
  noLabel,
  multiple,
  ...props
}: FormSelectEnhancedProps<TSubject>): React.ReactElement {
  const config = SELECT_CONFIGS[subject];
  const { options, disabled } = config.useOptions(meta);

  if (multiple) {
    return (
      <FormMultiSelect
        data={options}
        clearable={!props.withAsterisk}
        searchable={config.searchable}
        disabled={disabled}
        {...(noLabel
          ? {
            label: null,
            placeholder: config.label,
          }
          : {
            label: config.label,
          })}
        {...(props as FormSelectEnhancedMultiSelectProps<TSubject>)}
      />
    );
  }

  return (
    <FormSelect
      data={options}
      clearable={!props.withAsterisk}
      searchable={config.searchable}
      disabled={disabled}
      {...(noLabel
        ? {
          label: null,
          placeholder: config.label,
        }
        : {
          label: config.label,
        })}
      {...(props as FormSelectEnhancedSelectProps<TSubject>)}
    />
  );
}

const SELECT_CONFIGS: {
  [K in keyof SelectOptionsConfig]: SelectConfig<SelectOptionsItemTypes[K]>;
} = {
  province: {
    useOptions: useProvinceOptions,
    label: 'Tỉnh/Thành phố',
    searchable: true,
  },
  ward: {
    useOptions: useWardOptions,
    label: 'Xã/Phường',
    searchable: true,
  },
  customerModel: {
    useOptions: useCustomerModelOptions,
    label: 'Mô hình CSKCB',
  },
  customerType: {
    useOptions: useCustomerTypeOptions,
    label: 'Loại hình CSKCB',
  },
  customerStatus: {
    useOptions: useCustomerStatusOptions,
    label: 'Trạng thái',
  },
  filterStatus: {
    useOptions: useFilterStatusOptions,
    label: 'Trạng thái',
  },
  customerSource: {
    useOptions: useCustomerSourceOptions,
    label: 'Nguồn khách',
    searchable: true,
  },
  staff: {
    useOptions: useStaffOptions,
    label: 'Nhân viên',
    searchable: true,
  },
  utility: {
    useOptions: useUtilityOptions,
    label: 'Tiện ích',
  },
  hospitalLine: {
    useOptions: useHospitalLineOptions,
    label: 'Tuyến',
  },
  subscriptionModule: {
    useOptions: useSubscriptionModuleOptions,
    label: 'Phân hệ',
  },
  subscriptionDuration: {
    useOptions: useSubscriptionDurationOptions,
    label: 'Thời hạn',
  },
  subscriptionPricingType: {
    useOptions: useSubscriptionPricingTypeOptions,
    label: 'Loại giá bán',
  },
  subscriptionPlanType: {
    useOptions: useSubscriptionPlanTypeOptions,
    label: 'Loại gói',
  },
  customerStage: {
    useOptions: useCustomerStageOptions,
    label: 'Giai đoạn',
  },
};
