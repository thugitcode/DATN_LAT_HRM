"use client"

import { useState, useCallback, useMemo } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
} from "@heroui/react"
import { cn } from "@/lib/utils"
import { hourlyPayrollMock } from "../hourly-payroll/moc/hourly-payroll.mock"
import type { HourlyPayrollRecord, HourlyPayrollDay } from "../../types/index.type"
import { IconCaretRightFilled } from "@tabler/icons-react"
import { DetailedTimeSheetColor } from "../../constants/data"
import { DrawerType, useDrawer } from "@/store/useDrawer"

const columns = [
  { textAlign: "left", key: "date", label: "NGÀY" },
  { textAlign: "left", key: "shiftCode", label: "MÃ CA" },
  { textAlign: "left", key: "standardHours", label: "GIỜ CÔNG CHUẨN" },
  { textAlign: "center", key: "checkIn", label: "GIỜ VÀO" },
  { textAlign: "center", key: "checkOut", label: "GIỜ RA" },
  { textAlign: "center", key: "late", label: "ĐI MUỘN" },
  { textAlign: "center", key: "early", label: "VỀ SỚM" },
  { textAlign: "center", key: "workUnits", label: "CÔNG" },
  { textAlign: "center", key: "totalHours", label: "TỔNG GIỜ" },
  { textAlign: "center", key: "overtime", label: "TĂNG CA" },
  { textAlign: "center", key: "compensatory", label: "GIỜ BÙ" },
]

type FlatRow =
  | {
    type: "group"
    key: string
    staff: HourlyPayrollRecord
    index: number
    isExpanded: boolean
  }
  | {
    type: "shift"
    key: string
    staffId: string
    shift: HourlyPayrollDay
    isLast: boolean
  }

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function GroupedTable() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    // () => new Set(hourlyPayrollMock.map((staff) => staff.id))
    () => new Set()
  )
  const { onOpen } = useDrawer((state) => state);

  const toggleGroup = useCallback((staffId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(staffId)) next.delete(staffId)
      else next.add(staffId)
      return next
    })
  }, [])

  const flatRows = useMemo<FlatRow[]>(() => {
    const rows: FlatRow[] = []

    hourlyPayrollMock.forEach((staff, idx) => {
      const staffIndex = idx + 1
      const isExpanded = expandedGroups.has(staff.id)
      const allDays = staff.weeks.flatMap((week) => week.days)

      rows.push({
        type: "group",
        key: `group-${staff.id}`,
        staff,
        index: staffIndex,
        isExpanded,
      })

      if (isExpanded) {
        allDays.forEach((shift, shiftIdx) => {
          rows.push({
            type: "shift",
            key: `shift-${staff.id}-${shiftIdx}`,
            staffId: staff.id,
            shift,
            isLast: shiftIdx === allDays.length - 1,
          })
        })
      }
    })

    return rows
  }, [expandedGroups])

  const totalStaff = hourlyPayrollMock.length
  const totalShifts = hourlyPayrollMock.reduce(
    (sum, s) => sum + s.weeks.reduce((ws, w) => ws + w.days.length, 0),
    0
  )

  const renderShiftCell = useCallback(
    (row: FlatRow, columnKey: React.Key) => {
      if (row.type === "group") {
        if (columnKey !== "date") return null

        return (
          <div
            className="flex w-full items-center gap-3 cursor-pointer px-4 py-2 bg-[#E4E4E7] hover:bg-accent transition-colors"
            onClick={() => toggleGroup(row.staff.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                toggleGroup(row.staff.id)
              }
            }}
          >
            <IconCaretRightFilled
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                row.isExpanded && "rotate-90"
              )}
            />
            <div className="text-sm font-medium">{row.index}.</div>

            <div className="flex items-center gap-3 pl-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {getInitials(row.staff.staffName)}
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-sm font-medium text-foreground">
                  {row.staff.staffName} - {row.staff.staffCode}
                </div>
                <div className="text-sm font-medium text-gray-600">{row.staff.position}</div>
              </div>
            </div>

            <div className="flex flex-col gap-0.5 pl-8">
              <div className="text-sm font-medium text-foreground">{row.staff.department}</div>
              <div className="text-sm font-medium text-gray-600">{row.staff.room}</div>
            </div>
          </div>
        )
      }

      // ── Shift row ───────────────────────────────────────────────
      const { shift, isLast } = row

      const colorLate = "text-[#D55829]"
      const colorEarly = "text-[#73C9C6]"

      switch (columnKey) {
        case "date":
          return (
            <span className={cn("flex font-medium text-foreground", "pl-6", "py-2.5 px-4")}>
              {shift.date}
            </span>
          );

        case "shiftCode":
          return (
            <span className="fontflex -medium text-foreground py-2.5 px-4">
              {shift.shiftCode || "--"}
            </span>
          );

        case "standardHours":
          return (
            <span className={cn("flex text-muted-foreground py-2.5 px-4", "hidden sm:flex")}>
              {shift.standardHours ? `${shift.standardHours}h` : "--"}
            </span>
          );

        case "checkIn":
          return (
            <span className={cn("flex text-muted-foreground py-2.5 px-4", "hidden sm:flex justify-center")}>
              {shift.checkInTime || "--"}
            </span>
          );

        case "checkOut":
          return (
            <span className={cn("flex text-muted-foreground py-2.5 px-4", "hidden sm:flex justify-center")}>
              {shift.checkOutTime || "--"}
            </span>
          );

        case "late":
          return (
            <span
              className={cn(
                shift.lateMinutes > 0 ? colorLate : "text-muted-foreground",
                "hidden md:flex justify-center py-2.5 px-4"
              )}
            >
              {shift.lateMinutes > 0 ? `${shift.lateMinutes}` : "--"}
            </span>
          );

        case "early":
          return (
            <span
              className={cn(
                shift.earlyLeaveMinutes > 0 ? colorEarly : "text-muted-foreground",
                "hidden md:flex justify-center py-2.5 px-4"
              )}
            >
              {shift.earlyLeaveMinutes > 0 ? `${shift.earlyLeaveMinutes}` : "--"}
            </span>
          );

        case "workUnits":
          return (
            <span className={cn("flex text-foreground py-2.5 px-4", "justify-center")}>
              {shift.workUnits ? shift.workUnits.toFixed(1) : "0"}
            </span>
          );

        case "totalHours":
          return (
            <span className={cn("flex text-muted-foreground py-2.5 px-4", "hidden lg:flex justify-center")}>
              {shift.totalHours !== null ? `${shift.totalHours.toFixed(1)}` : "--"}
            </span>
          );

        case "overtime":
          return (
            <span className={cn("flex py-2.5 px-4", "hidden lg:flex justify-center")}>
              {shift.overtimeHours > 0 ? `${shift.overtimeHours.toFixed(1)}` : "--"}
            </span>
          );

        case "compensatory":
          return (
            <span className={cn("flex py-2.5 px-4", "hidden xl:flex justify-center")}>
              {shift.compensatoryHours > 0 ? `${shift.compensatoryHours.toFixed(1)}` : "--"}
            </span>
          );

        default:
          return null;
      }
    },
    [toggleGroup]
  )

  return (
    <div className="w-full overflow-hidden rounded-xl bg-card shadow-sm bg-white p-4">
      <div className="overflow-x-auto">
        <Table
          isStriped
          isVirtualized
          isHeaderSticky
          maxTableHeight={500}
          rowHeight={52}
          radius="none"
          classNames={{
            wrapper: "border-0 rounded-none",
            th: cn(
              "h-14 bg-[#F4F4F5] text-[#71717A] text-xs font-semibold uppercase tracking-wider px-4 py-2.5 text-left",
              // "!rounded-none",
              // "first:!rounded-bl-0",
              // "first:!rounded-tl-lg",
              // "last:!rounded-tr-lg",
              // "last:!rounded-br-0"
            ),
            td: "p-0",
            tr: "rounded-0"
          }}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.key}
                className={cn(
                  column.key === "date" && "rounded-tl-lg",
                  column.key === "compensatory" && "rounded-tr-lg text-center",
                  column.textAlign === "center" && "text-center",
                  column.textAlign === "left" && "text-left",
                )}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>

          <TableBody items={flatRows}>
            {(row) => (
              <TableRow
                key={row.key}
                className={cn(
                  // row.type === "shift" &&
                  // "border-b border-[#11111126]",
                  row.type === "group" && "cursor-pointer"
                )}
                onClick={() => { row.type === "shift" && onOpen(DrawerType.TIME_SHEET_DETAIL, row) }
                }
              >
                {(columnKey) => {
                  const col = columns.find(c => c.key === columnKey);
                  const alignClass = `text-${col?.textAlign}`
                  return <TableCell className={cn(alignClass, row.type === "shift" &&
                    "border-b border-[#11111126]",)} colSpan={row.type === "shift" ? 1 : columns.length}>{renderShiftCell(row, columnKey)}</TableCell>
                }}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Hiển thị {totalStaff} nhân viên • {totalShifts} bản ghi ca làm việc
      </p>
    </div>
  )
}