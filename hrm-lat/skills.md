# Codebase Skills & Patterns — hrm-web-ui

> Phân tích từ commits của `dungtientran` và kiến trúc chung của project.

---

## 1. Tổng quan project

| Mục | Chi tiết |
|-----|---------|
| Framework | React 19 + TypeScript (strict) |
| Build | RSBuild |
| Routing | TanStack Router (file-based) |
| Server state | TanStack Query v5 |
| UI | HeroUI + Tailwind CSS |
| i18n | react-i18next (namespace-based) |
| Form | TanStack Form + Zod |
| Global state | Zustand |
| Auth | Keycloak |

---

## 2. Các domain chính dungtientran phụ trách

- **Payroll Management** (~60%): tính lương, phiếu lương, kỳ lương, KPI, thu nhập khác, lịch sử lương
- **Staff Management** (~25%): danh sách NV, chi tiết, grid/list layout, filter, sync
- **Timekeeping & Attendance** (~15%): duyệt chấm công, tính toán, API integration

---

## 3. Cấu trúc feature

```
src/features/{feature}/
├── components/          # UI components
├── hooks/               # Custom hooks (query + mutation)
├── colums/              # Column definition hooks (chú ý: typo "colums" - đã có trong codebase)
├── types/               # Interface & enum definitions
└── {feature}.tsx        # Page entry component
```

---

## 4. Patterns thường dùng

### 4.1 Component

- **Luôn là functional component**, không dùng class component
- Props tách ra interface riêng
- Sub-component nhỏ nằm cùng file nếu chỉ dùng 1 lần

```tsx
interface SummaryRowProps {
  label: string;
  value: string | number;
  isAmount?: boolean;
}

const SummaryRow = ({ label, value, isAmount = false }: SummaryRowProps) => (
  // ...
);
```

### 4.2 Column definition hook

```tsx
export const usePayrollColumns = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);

  const columns = useMemo<ColumnDef<PayrollRow>[]>(
    () => [
      {
        key: 'staffName',
        title: t('columns.staff_name'),
        render: (_, record) => <StaffNameCell record={record} />,
      },
    ],
    [t],
  );

  return { columns };
};
```

### 4.3 Query & mutation hook

```tsx
// hooks/use-payroll-management.ts
export const usePayrollList = (params?: PayrollParams) => {
  return useQuery(payrollOptions.list(params));
};

export const useCreatePayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payrollService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.lists() });
      toast.success('Tạo thành công');
    },
    onError: (err) => {
      toast.error(normalizeAxiosError(err));
    },
  });
};
```

### 4.4 Query options factory

```ts
export const payrollKeys = {
  all: ['payroll'] as const,
  lists: () => [...payrollKeys.all, 'list'] as const,
  list: (params?: PayrollParams) => [...payrollKeys.lists(), params] as const,
  detail: (id: string) => [...payrollKeys.all, 'detail', id] as const,
} as const;

export const payrollOptions = {
  list: (params?: PayrollParams) =>
    queryOptions({
      queryKey: payrollKeys.list(params),
      queryFn: () => payrollService.getAll(params),
    }),
};
```

### 4.5 Filter component

```tsx
export const PageFilter = () => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const { filters, setFilter } = useQueryFilter<ShiftManagementParams>();
  const { options: departmentOptions } = useDepartmentOptions();

  const handleDepartmentChange = useCallback(
    (value: string | undefined) => setFilter('departmentId', value),
    [setFilter],
  );

  return (
    <FilterSelect
      options={departmentOptions}
      value={filters.departmentId as string}
      onChange={handleDepartmentChange}
      placeholder={t('actions.department')}
    />
  );
};
```

### 4.6 Enum → FilterSelect options

```tsx
const options = useMemo(
  () =>
    Object.values(SomeEnum).map((value) => ({
      key: value,
      label: t(`someNamespace.${value}`),
    })),
  [t],
);
```

---

## 5. Quy ước đặt tên

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Hook query | `use{Entity}List`, `use{Entity}Detail` | `usePayrollList` |
| Hook mutation | `use{Action}{Entity}` | `useCreatePayroll`, `useSendPayslips` |
| Hook column | `use{Entity}Columns` | `usePayrollFeedbackColumns` |
| Type file | `{entity}.type.ts` | `payslip-feedback.type.ts` |
| Enum value | `UPPER_SNAKE_CASE` | `PENDING`, `EARLY_LEAVE` |
| Component file | `kebab-case.tsx` | `salary-summary.tsx` |
| i18n key | `dot.notation.snake_case` | `payslipFeedback.detail.from_date` |

---

## 6. i18n

- Namespace per feature: `NAMESPACES.PAYROLL_MANAGEMENT` → `public/locales/{lang}/payroll-management.json`
- Dùng 2 namespace cùng lúc khi cần:

```tsx
const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
const { t: tCommon } = useTranslation(NAMESPACES.COMMON);
```

- `defaultValue` fallback cho dynamic keys:

```tsx
t(`options.job_title.${jobTitle}`, { defaultValue: jobTitle })
```

- Interpolation cho dynamic string:

```tsx
// JSON: "payslip_period": "Phiếu lương {{period}}"
t('payslipFeedback.detail.payslip_period', { period: 'T1/2026' })
```

---

## 7. Styling

- Tailwind CSS + HeroUI components
- Chiều cao chuẩn: `h-9` (input, select), `h-10` (button lớn hơn)
- Bo góc: `rounded-xl` (card/panel), `rounded-lg` (button/input)
- Primary color: `#006FEE`
- Spacing: `gap-3`, `px-4 py-3`, `space-y-4`
- Table height: `h-[calc(100vh-260px)]`

---

## 8. Drawer pattern

```tsx
// Mở drawer
const { onOpen } = useDrawer();
onOpen({ type: 'DETAIL', data: record });

// Trong drawer component
const { data, onClose } = useDrawer((state) => state);
const record = data as PayslipFeedback | undefined;
```

---

## 9. Lưu ý codebase

- `src/routeTree.gen.ts` — **KHÔNG chỉnh tay**, auto-generated bởi TanStack Router
- Thư mục `colums/` (thiếu 'n') — typo đã có từ đầu, giữ nguyên để không break import
- `ShiftManagementParams` được dùng làm type filter chung cho nhiều feature khác nhau
- `useQueryFilter<T>()` — hook quản lý filter state qua URL search params
- `normalizeAxiosError(err)` — luôn dùng để lấy message lỗi từ axios response
- Re-call query hook đã có trong cache: không tốn thêm network request (TanStack Query cache by query key)

---

## 10. Git & commit style

- Prefix: `feat:`, `fix:`, `refactor:`
- Tham chiếu ticket: `fix HRM-137`, `fix 320`
- Branch prefix: `dungtran/`, `feature/tungnt/`
- Ngôn ngữ: tiếng Việt + tiếng Anh mix
