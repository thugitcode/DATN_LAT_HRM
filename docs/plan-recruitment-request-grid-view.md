# Kế hoạch: Grid View - Danh sách yêu cầu tuyển dụng

## Mục tiêu

Thêm chế độ xem dạng lưới (grid) cho trang "Danh sách yêu cầu tuyển dụng", toggle giữa list/grid qua `LayoutSwitcher`. Dùng mock data, chưa gọi API.

---

## Phân tích từ Figma

### Grid layout
- 4 cột đều nhau, gap 12px
- Card width ~322px, height ~295px
- 2 hàng x 4 cột = 8 cards/page

### Card structure (từ trên xuống dưới)
```
┌──────────────────────────────────────┐
│ [StatusChip]                   [···] │  ← Header: chip + menu 3 chấm
│                                      │
│ Bác sĩ nội trú                      │  ← Tên vị trí (16px, medium)
│ Fulltime • 12-15tr • 3 người        │  ← Subtitle (14px, gray #71717A)
│                                      │
│ ┌────────────┬────────────┐          │
│ │     55     │      5     │          │  ← Stats box (bg #F4F4F5, rounded-xl)
│ │ Ứng viên   │ Đợi phỏng  │          │     2 cột chia bởi divider dọc
│ │ ứng tuyển  │ vấn        │          │     Số: 20px medium, label: 12px
│ └────────────┴────────────┘          │
│                                      │
│ 📅 Ngày cần: 1/1/2026   Còn 12 ngày │  ← Date row (12px)
│ ████████████░░░░░░░░░░░░             │  ← Progress bar (7px, primary)
│                                      │
│ Người tạo: Trần Minh    [Tạm dừng]  │  ← Footer: creator + action button
└──────────────────────────────────────┘
```

### Summary badges (8 trạng thái - khác list view chỉ có 4)
| Key | Label VI | Label EN | Color | BgColor |
|-----|----------|----------|-------|---------|
| totalAll | Tổng yêu cầu | Total | #7828C8 | #F2EAFA |
| totalRecruiting | Đang tuyển | Recruiting | #006FEE | #E6F1FE |
| totalPending | Chờ duyệt | Pending | #F5A524 | #FEFCE8 |
| totalRejected | Từ chối duyệt | Rejected | #F31260 | #FEE7EF |
| totalApproved | Đã duyệt | Approved | #17C964 | #E8FAF0 |
| totalCancelled | Đã hủy | Cancelled | #F5A524 | #FEFCE8 |
| totalPaused | Tạm dừng | Paused | #7828C8 | #F2EAFA |
| totalClosed | Đã đóng | Closed | #11181C | #F4F4F5 |

### Statuses & Action buttons (mỗi status có action riêng)
| Status | Chip color | Action button | Button style |
|--------|-----------|---------------|-------------|
| DRAFT (Nháp) | default | Gửi duyệt | filled primary |
| PENDING (Chờ duyệt) | warning | Duyệt | filled primary |
| REJECTED (Từ chối duyệt) | danger | Gửi duyệt lại | filled primary |
| APPROVED (Đã duyệt) | success | Mở tuyển | filled primary |
| RECRUITING (Đang tuyển) | primary | Tạm dừng | bordered primary |
| PAUSED (Tạm dừng) | secondary | Mở lại | filled primary |
| CANCELLED (Đã hủy) | warning | — (không có) | — |
| CLOSED (Đã đóng) | default | — (không có) | — |

---

## Cần cập nhật enum status

Enum hiện tại chỉ có 4 status. Cần mở rộng thành 8:

```typescript
export enum RecruitmentRequestStatusEnum {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
  RECRUITING = 'RECRUITING',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
}
```

---

## Mock Data (10 items)

```typescript
const MOCK_DATA: RecruitmentRequest[] = [
  // Đa dạng status, position, salary, department
  { status: RECRUITING, position: 'Bác sĩ nội trú', salary: '12-15tr', quantity: 3, candidateCount: 55, interviewCount: 5, ... },
  { status: PENDING, position: 'Bác sĩ nội trú', salary: '12-15tr', quantity: 3, candidateCount: 0, interviewCount: 0, ... },
  { status: CLOSED, position: 'Bác sĩ nội trú', salary: '12-15tr', quantity: 3, candidateCount: 12, interviewCount: 3, ... },
  { status: PAUSED, position: 'Bác sĩ nội trú', salary: '12-15tr', quantity: 3, candidateCount: 124, interviewCount: 23, ... },
  { status: DRAFT, position: 'Bác sĩ nội trú', salary: '12-15tr', quantity: 3, candidateCount: 0, interviewCount: 0, ... },
  { status: CANCELLED, position: 'Bác sĩ nội trú', salary: '12-15tr', quantity: 3, candidateCount: 0, interviewCount: 0, ... },
  { status: REJECTED, position: 'Bác sĩ nội trú', salary: '12-15tr', quantity: 3, candidateCount: 0, interviewCount: 0, ... },
  { status: APPROVED, position: 'Bác sĩ nội trú', salary: '12-15tr', quantity: 3, candidateCount: 0, interviewCount: 0, ... },
  // + 2 items nữa
]
```

---

## Cần thêm fields vào type `RecruitmentRequest`

Card hiển thị thêm data không có trong type hiện tại:
- `workType: string` — "Fulltime" / "Parttime"
- `candidateCount: number` — số ứng viên ứng tuyển
- `interviewCount: number` — số đợi phỏng vấn
- `daysRemaining: number` — số ngày còn lại (hoặc tính từ `requiredDate`)
- `progress: number` — % tiến trình tuyển dụng (0-100)

---

## Các file cần tạo/sửa

### 1. Sửa type
**File:** `src/features/recruitment-management/recruitment-request-list/type.tsx`
- Mở rộng enum 4 → 8 status
- Thêm fields: `workType`, `candidateCount`, `interviewCount`
- Mở rộng `MetadataRecruitmentRequest` thêm 4 keys mới

### 2. Tạo mock data
**File:** `src/features/recruitment-management/recruitment-request-list/constants/mock-data.ts`
- 10 items đủ 8 status
- Dữ liệu thực tế: tên vị trí, khoa phòng, mức lương khác nhau

### 3. Tạo Card component
**File:** `src/features/recruitment-management/recruitment-request-list/components/recruitment-request-card.tsx`
- Props: `{ data: RecruitmentRequest }`
- Layout đúng theo Figma:
  - Header: StatusChip + menu button (⋯)
  - Position title + subtitle (workType • salary • quantity)
  - Stats box: candidateCount | interviewCount (bg gray, rounded, divider)
  - Date row: calendar icon + ngày cần + còn X ngày
  - Progress bar (HeroUI Progress hoặc custom div)
  - Footer: người tạo + action button theo status
- Tất cả text dùng i18n

### 4. Tạo Grid container
**File:** `src/features/recruitment-management/recruitment-request-list/components/recruitment-request-grid.tsx`
- Props: `{ data: RecruitmentRequest[], isLoading?: boolean }`
- Grid: `grid grid-cols-4 gap-3`
- Loading: skeleton cards
- Empty: thông báo không có dữ liệu

### 5. Sửa trang chính
**File:** `src/features/recruitment-management/recruitment-request-list/recruitment-request-list.tsx`
- Bỏ `hiddenLayoutSwitcher` → hiện LayoutSwitcher
- Import `useLayoutStore` + `LayoutSwitcherEnum`
- Toggle: LIST → DataTable, GRID → RecruitmentRequestGrid với mock data
- Ẩn ColumnVisibilityPopover khi ở GRID mode

### 6. Sửa StatusChip + constants
**File:** `src/features/recruitment-management/recruitment-request-list/components/recruitment-request-status-chip.tsx`
- Thêm 4 status mới: DRAFT, REJECTED, APPROVED, PAUSED, CANCELLED

**File:** `src/features/recruitment-management/constants/constants.tsx`
- Thêm summary badge keys cho 8 status

### 7. Cập nhật i18n
**Files:** `public/locales/{vi,en}/recruitment-management.json`

Keys mới cần thêm:
```json
// Thêm vào recruitment_request
"status.draft": "Nháp" / "Draft",
"status.rejected": "Từ chối duyệt" / "Rejected",
"status.approved": "Đã duyệt" / "Approved",
"status.paused": "Tạm dừng" / "Paused",
"status.cancelled": "Đã hủy" / "Cancelled",

"card.work_type": "Loại hình" / "Work Type",
"card.candidates": "Ứng viên ứng tuyển" / "Candidates Applied",
"card.interviews": "Đợi phỏng vấn" / "Awaiting Interview",
"card.required_date": "Ngày cần" / "Required Date",
"card.days_remaining": "Còn {{count}} ngày" / "{{count}} days left",
"card.created_by": "Người tạo" / "Created By",
"card.people_count": "{{count}} người" / "{{count}} people",

"actions.pause": "Tạm dừng" / "Pause",
"actions.resume": "Mở lại" / "Resume",
"actions.submit_review": "Gửi duyệt" / "Submit for Review",
"actions.resubmit_review": "Gửi duyệt lại" / "Resubmit for Review",
"actions.start_recruiting": "Mở tuyển" / "Start Recruiting",

"summary.rejected": "Từ chối duyệt" / "Rejected",
"summary.approved": "Đã duyệt" / "Approved",
"summary.cancelled": "Đã hủy" / "Cancelled",
"summary.paused": "Tạm dừng" / "Paused"
```

---

## Thứ tự thực hiện

1. Sửa `type.tsx` — mở rộng enum + thêm fields
2. Cập nhật i18n files — thêm tất cả keys mới (vi + en)
3. Sửa `recruitment-request-status-chip.tsx` — thêm 4 status
4. Sửa `constants.tsx` — summary badges 8 status
5. Tạo `mock-data.ts` — 10 items mock
6. Tạo `recruitment-request-card.tsx` — card component
7. Tạo `recruitment-request-grid.tsx` — grid container
8. Sửa `recruitment-request-list.tsx` — toggle list/grid
9. Sửa `summary-badges.tsx` — hỗ trợ 8 badges
10. Build + typecheck

---

## Lưu ý

- Mock data dùng tạm, sau thay bằng API data
- Grid và list view dùng chung filter bar
- Summary badges grid view có 8 items (nhiều hơn list view 4 items) — cần xử lý responsive
- Progress bar: tính `daysRemaining / totalDays * 100` hoặc dùng field `progress` từ mock
- Menu ⋯ (3 chấm): dùng HeroUI `Dropdown` với options: Sửa, Xoá, Xem chi tiết
- `LayoutSwitcher` persist theo route qua `useLayoutStore`
