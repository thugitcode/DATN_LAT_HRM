# Mapping trường dữ liệu — Phiếu lương chi tiết (SalarySlip)

Source type: `SalaryData` — `src/features/payroll-management/types/payroll-caculation.type.ts`

---

## 1. BasicIncomeSection — Thu nhập cơ bản

| Hiển thị (UI label) | Field `SalaryData` | Ghi chú |
|---|---|---|
| Tiêu đề section / tổng | `contractTotalSalary` | Hiển thị ở `CardHeader` |
| Lương cơ bản theo hợp đồng | `actualWorkSalary` | Sub-label: `totalAttendance` ngày / `workDays` ngày |
| Lương làm thêm giờ | `overtimeAmount` | Sub-label: `totalOvertimeHours`h OT |
| Lương trực | `onCallSalary` | Sub-label: `onCallDays` ngày |
| Sản phẩm | `0` (hardcode) | Sub-label: `fromDate` |

---

## 2. AllowanceSection — Phụ cấp & thưởng

| Hiển thị (UI label) | Field `SalaryData` | Ghi chú |
|---|---|---|
| Tiêu đề section / tổng | Tính tổng 10 field bên dưới | Hiển thị ở `CardHeader` |
| Phụ cấp trách nhiệm | `responsibilityAllowance` | |
| Phụ cấp độc hại | `hazardAllowance` | |
| Phụ cấp chức vụ | `positionAllowance` | |
| Phụ cấp ăn trưa | `mealAllowance` | |
| Phụ cấp điện thoại | `phoneAllowance` | |
| Phụ cấp xăng xe | `fuelAllowance` | |
| Phụ cấp công tác | `businessTripAllowance` | |
| Lương hiệu quả / KPI | `performanceSalary` | |
| Thưởng | `bonusAmount` | |
| Phụ cấp khác | `otherAllowance` | |

---

## 3. DeductionSection — Khấu trừ

| Hiển thị (UI label) | Field `SalaryData` | Tỷ lệ | Ghi chú |
|---|---|---|---|
| Tiêu đề section / tổng | `totalDeduction` (hoặc `deductionAmount`) | | Ưu tiên `deductionAmount` nếu có |
| Bảo hiểm xã hội | `socialInsurance` | 8% | |
| Bảo hiểm y tế | `healthInsurance` | 1.5% | |
| Bảo hiểm thất nghiệp | `unemploymentInsurance` | 1% | |
| Công đoàn phí | `unionFee` | | |
| Thuế thu nhập cá nhân | `personalIncomeTax` | | |
| Phạt vi phạm | `violationPenalty` | | Chỉ hiện khi `> 0`; ghi chú: `violationDetails` |

---

## 4. NetIncomeSection — Thực lĩnh

| Hiển thị (UI label) | Field `SalaryData` | Ghi chú |
|---|---|---|
| Tổng thực lĩnh | `finalAmount` | Hiển thị nổi bật màu xanh |

---

## 5. SalarySummary — Tóm tắt (cột phải)

### 5a. Thông tin chấm công

| Hiển thị (UI label) | Field `SalaryData` | Ghi chú |
|---|---|---|
| Thời gian tính lương từ | `fromDate` | Format `DD/MM/YYYY` |
| Thời gian tính lương đến | `toDate` | Format `DD/MM/YYYY` |
| Ngày công chuẩn | `workDays` | |
| Ngày công thực tế | `totalAttendance` | |
| Nghỉ phép có lương | `paidLeave` | |
| Ngày trực | `onCallDays` | |
| Giờ làm thêm | `totalOvertimeHours` | |

### 5b. Thông tin nghỉ phép

| Hiển thị (UI label) | Field `SalaryData` | Ghi chú |
|---|---|---|
| Tổng phép năm | `totalLeaveDays` | |
| Số phép đã dùng | `usedLeaveDays` | |
| Số phép còn lại | `remainingLeaveDays` | |

### 5c. Tổng kết lương

| Hiển thị (UI label) | Field `SalaryData` | Ghi chú |
|---|---|---|
| Tổng thu nhập (Gross) | `totalBeforeDeduction` | |
| BHXH + BHYT + BHTN (NLĐ đóng) | `socialInsurance + healthInsurance + unemploymentInsurance` | Tính tổng 3 field |
| Thuế TNCN | `personalIncomeTax` | |
| Tạm ứng | `advancePayment` | |
| **Tổng thực lĩnh (Net)** | `finalAmount` | Hiển thị nổi bật |

### 5d. Phần đóng góp của NSDLĐ (Employer)

> Tính qua hàm `calculateEmployerContributions(data)` — `src/lib/utils.ts`

| Hiển thị (UI label) | Nguồn | Ghi chú |
|---|---|---|
| Bảo hiểm xã hội (NSDLĐ) | `employerContributions.socialInsurance` | Thường 17% |
| Bảo hiểm y tế (NSDLĐ) | `employerContributions.healthInsurance` | Thường 3% |
| Bảo hiểm thất nghiệp (NSDLĐ) | `employerContributions.unemploymentInsurance` | Thường 1% |
| Kinh phí công đoàn (NSDLĐ) | `employerContributions.unionFee` | Thường 2% |
| **Tổng chi phí NSDLĐ** | `totalBeforeDeduction + employerContributions.total` | |

---

## 6. Các field trong `SalaryData` chưa được hiển thị

| Field | Kiểu | Mô tả |
|---|---|---|
| `staffName` | string | Tên nhân viên |
| `staffCode` | string | Mã nhân viên |
| `departmentName` | string | Tên khoa/phòng |
| `monthLabel` | string | VD: `"PHIẾU LƯƠNG 01/2026"` |
| `standardWorkingDays` | number | Ngày công chuẩn theo kỳ |
| `unpaidLeave` | number | Nghỉ không lương |
| `totalWorkDays` | number | Tổng ngày làm |
| `compHoursUsed` | number | Giờ bù đã dùng |
| `compHoursRemaining` | number | Giờ bù còn lại |
| `contractBasicSalary` | number | Lương cơ bản hợp đồng |
| `contractHazardAllowance` | number | Phụ cấp độc hại theo HĐ |
| `contractSupportAllowance` | number | Phụ cấp hỗ trợ theo HĐ |
| `actualPositionAllowance` | number | Phụ cấp chức vụ thực tế |
| `actualBasicSalaryByWork` | number | Lương cơ bản thực tế theo công |
| `otherIncomeAndOvertime` | number | Thu nhập khác + OT |
| `insuranceBaseSalary` | number | Lương đóng bảo hiểm |
| `selfDeduction` | number | Giảm trừ bản thân (11tr/tháng) |
| `familyDeduction` | number | Giảm trừ người phụ thuộc |
| `taxExemptIncome` | number | Thu nhập miễn thuế |
| `prepaidPhase1` | number | Tạm nộp đợt 1 |
| `pensionFund1Percent` | number | Quỹ hưu trí 1% |
| `netIncome` | number | Thu nhập ròng (trước finalAmount) |
