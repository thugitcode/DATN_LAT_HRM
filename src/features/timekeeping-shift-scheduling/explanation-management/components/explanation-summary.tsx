import type { FC } from 'react';

import type { ExplanationSummary, ExplanationTypeCount } from '../types';

interface ExplanationSummaryCardProps {
    summary: ExplanationSummary;
    explanationTypes: ExplanationTypeCount[];
}

export const ExplanationSummaryCard: FC<Readonly<ExplanationSummaryCardProps>> = ({
    summary,
    explanationTypes,
}) => {
    return (
        <div className="flex items-stretch gap-6 bg-white rounded-xl p-5">
            {/* Tổng quát */}
            <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-[#11181C] whitespace-nowrap">Tổng quát:</span>
                <div className="flex items-center gap-3">
                    <SummaryBadge
                        icon={
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="8" fill="#006FEE" />
                                <path d="M5.5 8L7.5 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        }
                        label="Tổng yêu cầu"
                        count={summary.totalRequests}
                        color="#006FEE"
                    />
                    <SummaryBadge
                        icon={
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="8" fill="#17C964" />
                                <path d="M5.5 8L7.5 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        }
                        label="Đã xác nhận"
                        count={summary.approved}
                        color="#17C964"
                    />
                    <SummaryBadge
                        icon={
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="8" fill="#F31260" />
                                <path d="M6 6L10 10M10 6L6 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        }
                        label="Từ chối"
                        count={summary.rejected}
                        color="#F31260"
                    />
                    <SummaryBadge
                        icon={
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="8" fill="#F5A524" />
                                <circle cx="8" cy="8" r="3" fill="white" />
                            </svg>
                        }
                        label="Chờ xác nhận"
                        count={summary.pending}
                        color="#F5A524"
                    />
                </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-[#E4E4E7]" />

            {/* Loại lỗi giải trình */}
            <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-1">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8" cy="8" r="7" stroke="#006FEE" strokeWidth="2" />
                        <circle cx="8" cy="6" r="1" fill="#006FEE" />
                        <path d="M8 8.5V11" stroke="#006FEE" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-sm font-semibold text-[#11181C] whitespace-nowrap">
                        Loại lỗi giải trình:
                    </span>
                </div>

                <div className="flex flex-col gap-1 flex-1">
                    {explanationTypes.map((type, index) => (
                        <ExplanationTypeRow
                            key={type.label}
                            label={type.label}
                            count={type.count}
                            colorIndex={index}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

interface SummaryBadgeProps {
    icon: React.ReactNode;
    label: string;
    count: number;
    color: string;
}

const SummaryBadge: FC<Readonly<SummaryBadgeProps>> = ({ icon, label, count, color }) => {
    return (
        <div className="flex items-center gap-2 bg-[#F4F4F5] rounded-lg px-3 py-2">
            {icon}
            <span className="text-xs text-[#71717A] whitespace-nowrap">{label}</span>
            <span className="text-lg font-bold" style={{ color }}>
                {count}
            </span>
        </div>
    );
};

const TYPE_COLORS = ['#006FEE', '#17C964', '#F5A524'];

interface ExplanationTypeRowProps {
    label: string;
    count: number;
    colorIndex: number;
}

const ExplanationTypeRow: FC<Readonly<ExplanationTypeRowProps>> = ({
    label,
    count,
    colorIndex,
}) => {
    const color = TYPE_COLORS[colorIndex % TYPE_COLORS.length];

    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-[#71717A] min-w-[60px]">{label}</span>
            <div className="flex-1 h-[3px] bg-[#E4E4E7] rounded-full relative">
                <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                        backgroundColor: color,
                        width: `${Math.min((count / 30) * 100, 100)}%`,
                    }}
                />
            </div>
            <span className="text-xs font-semibold text-[#11181C] min-w-[20px] text-right">{count}</span>
        </div>
    );
};
