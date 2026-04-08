import { useCallback, useMemo, useState } from 'react';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import type { Components, EventProps, View } from 'react-big-calendar';

import 'react-big-calendar/lib/css/react-big-calendar.css';

import dayjs from 'dayjs';

import 'dayjs/locale/vi';

import { NAMESPACES } from '@/i18n/constants';
import {
    Button,
    Card,
    Chip,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Spinner,
    Tab,
    Tabs,
} from '@heroui/react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

import { INTERVIEW_STATUS_CONFIG } from '../constants/data';
import { useInterviewSchedule } from '../hooks/use-interview-schedule';
import { type InterviewSchedule } from '../types/interview.type';
import { InterviewDetailCard } from './interview-detail-popup';

dayjs.locale('vi');
const localizer = dayjsLocalizer(dayjs);
interface InterviewEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: InterviewSchedule;
}

const getFixedDate = (hours: number) => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, 0, 0, 0);
};

function toCalendarEvents(data: InterviewSchedule[]): InterviewEvent[] {
    return data.map((item) => {
        const dateStr = dayjs(item.interviewDate).format('YYYY-MM-DD');
        return {
            id: item.id,
            title: item.candidateName,
            start: dayjs(`${dateStr}T${item.startTime}`).toDate(),
            end: dayjs(`${dateStr}T${item.endTime}`).toDate(),
            resource: item,
        };
    });
}

function EventPopoverWrapper({
    interview,
    children,
}: {
    interview: InterviewSchedule;
    children: React.ReactNode;
}) {
    return (
        <Popover
            placement="right"
            showArrow
            classNames={{
                base: 'w-[498px]',
                content: cn('rounded-none! border-t-4', INTERVIEW_STATUS_CONFIG[interview.status].borderTColor),
            }}
        >
            <PopoverTrigger>
                <div className="h-full w-full cursor-pointer">{children}</div>
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-2xl overflow-hidden shadow-lg">
                <InterviewDetailCard interview={interview} />
            </PopoverContent>
        </Popover>
    );
}

function CustomEvent({ event }: EventProps<InterviewEvent>) {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const interview = event.resource;
    const config = INTERVIEW_STATUS_CONFIG[interview.status];

    return (
        <EventPopoverWrapper interview={interview}>
            <Card
                className={`h-full p-2 border-l-4 ${config.borderLColor} ${config.bgColor} w-fit shadow-none rounded-r-xl rounded-l-none overflow-hidden`}
            >
                <Chip
                    size="sm"
                    color={config.chipColor}
                    variant="flat"
                    classNames={{ content: 'w-full flex justify-center' }}
                    className="mb-1 text-sm font-nomal w-full max-w-full"
                >
                    {t(`interview_schedule.status.${interview.status}` as any)}
                </Chip>
                <div className="space-y-0.5">
                    <p className="font-medium text-base text-gray-900 truncate">{interview.candidateName}</p>
                    <div className="flex items-center flex-wrap">
                        <p className="text-sm font-nomal text-black leading-5 truncate">
                            {t('interview_schedule.label.interview')}:&nbsp;
                        </p>
                        <p className="text-sm font-nomal text-black leading-5 truncate">{interview.position}</p>
                    </div>
                    <p className="text-[10px] bg-white rounded-lg text-black font-medium w-fit px-3.5 py-1.25">
                        {interview.startTime} - {interview.endTime}
                    </p>
                </div>
            </Card>
        </EventPopoverWrapper>
    );
}

function MonthEvent({ event }: EventProps<InterviewEvent>) {
    const interview = event.resource;
    const config = INTERVIEW_STATUS_CONFIG[interview.status];

    return (
        <EventPopoverWrapper interview={interview}>
            <Chip
                size="sm"
                color={config.chipColor}
                variant="flat"
                className="w-full max-w-full text-xs truncate rounded-md cursor-pointer"
            >
                {interview.startTime} {interview.candidateName}
            </Chip>
        </EventPopoverWrapper>
    );
}

const components: Components<InterviewEvent> = {
    event: CustomEvent,
    month: { event: MonthEvent },
};

interface InterviewCalendarProps {
    recruitmentRequestId: string;
}

export function InterviewCalendar({ recruitmentRequestId }: InterviewCalendarProps) {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const [view, setView] = useState<View>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const { data, isLoading } = useInterviewSchedule(recruitmentRequestId);
    const interviews = data?.data ?? [];

    const events = useMemo(() => toCalendarEvents(interviews), [interviews]);

    const handleNavigate = useCallback(
        (action: 'PREV' | 'NEXT') => {
            setCurrentDate((prev) => {
                const d = dayjs(prev);
                if (view === 'day') return d.add(action === 'NEXT' ? 1 : -1, 'day').toDate();
                if (view === 'week') return d.add(action === 'NEXT' ? 1 : -1, 'week').toDate();
                return d.add(action === 'NEXT' ? 1 : -1, 'month').toDate();
            });
        },
        [view],
    );

    const formattedDate = useMemo(
        () => dayjs(currentDate).locale('vi').format('MMMM YYYY'),
        [currentDate],
    );

    const formats = useMemo(
        () => ({
            dayFormat: (date: Date) => dayjs(date).locale('vi').format('dddd, DD'),
            dayHeaderFormat: (date: Date) => dayjs(date).locale('vi').format('dddd, DD/MM'),
            dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
                `${dayjs(start).format('DD/MM')} - ${dayjs(end).format('DD/MM/YYYY')}`,
            weekdayFormat: (date: Date) => dayjs(date).locale('vi').format('ddd, DD'),
            timeGutterFormat: (date: Date) => dayjs(date).format('HH:mm'),
            eventTimeRangeFormat: () => '',
        }),
        [],
    );

    const messages = useMemo(
        () => ({
            today: 'Hôm nay',
            previous: 'Trước',
            next: 'Sau',
            month: t('interview_schedule.view.month'),
            week: t('interview_schedule.view.week'),
            day: t('interview_schedule.view.day'),
            agenda: 'Lịch trình',
            date: 'Ngày',
            time: 'Thời gian',
            event: 'Sự kiện',
            noEventsInRange: t('interview_schedule.label.no_events'),
        }),
        [t],
    );
    const calendarMin = getFixedDate(7);
    const calendarMax = getFixedDate(18);
    return (
        <div className="flex flex-col h-full bg-white rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-[#11111126]">
                <Tabs
                    size="sm"
                    selectedKey={view}
                    onSelectionChange={(key) => setView(key as View)}
                    variant="solid"
                    color="primary"
                >
                    {(['day', 'week', 'month'] as View[]).map((v) => (
                        <Tab key={v} title={t(`interview_schedule.view.${v}` as any)} />
                    ))}
                </Tabs>

                <h2 className="text-lg font-semibold capitalize">{formattedDate}</h2>

                <div className="flex gap-1">
                    <Button isIconOnly size="sm" variant="flat" onPress={() => handleNavigate('PREV')}>
                        <IconChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button isIconOnly size="sm" variant="flat" onPress={() => handleNavigate('NEXT')}>
                        <IconChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="p-4" style={{ height: 'calc(100vh - 230px)' }}>
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Spinner size="lg" color="secondary" />
                    </div>
                ) : (
                    <Calendar<InterviewEvent>
                        localizer={localizer}
                        events={events}
                        view={view}
                        onView={setView}
                        date={currentDate}
                        onNavigate={setCurrentDate}
                        startAccessor="start"
                        endAccessor="end"
                        formats={formats}
                        messages={messages}
                        {...(view !== 'month' && { min: calendarMin, max: calendarMax })}
                        step={30}
                        timeslots={2}
                        toolbar={false}
                        components={components}
                        eventPropGetter={() => ({
                            style: { backgroundColor: 'transparent', border: 'none', padding: 0, margin: 0 },
                        })}
                        className="interview-calendar"
                        style={{ height: '100%', minHeight: 500 }}
                        popup
                        popupOffset={10}
                    />
                )}
            </div>

            <style>{`
        .interview-calendar { height: 100%; min-height: 500px; }
        .interview-calendar .rbc-time-view { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
        .interview-calendar .rbc-time-header { border-bottom: 1px solid #e5e7eb; }
        .interview-calendar .rbc-header { padding: 12px 8px; font-weight: 500; font-size: 14px; color: #374151; border-bottom: none; }
        .interview-calendar .rbc-today { background-color: rgba(101, 118, 255, 0.05); }
        .interview-calendar .rbc-header.rbc-today { color: #6576FF; font-weight: 600; }
        .interview-calendar .rbc-time-gutter { font-size: 12px; color: #6b7280; }
        .interview-calendar .rbc-timeslot-group { min-height: 100px; border-bottom: 1px solid #f3f4f6; }
        .interview-calendar .rbc-time-slot { border-top: none; }
        .interview-calendar .rbc-day-slot .rbc-time-slot { border-top: 1px dashed #f3f4f6; }
        .interview-calendar .rbc-event { border-radius: 4px; }
        .interview-calendar .rbc-event-label { display: none; }
        .interview-calendar .rbc-current-time-indicator { background-color: #6576FF; }
        .interview-calendar .rbc-month-view { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
        .interview-calendar .rbc-month-row { border-bottom: 1px solid #e5e7eb; min-height: 100px; }
        .interview-calendar .rbc-month-row .rbc-row-content { min-height: 80px; }
        .interview-calendar .rbc-date-cell { padding: 8px; font-size: 14px; }
        .interview-calendar .rbc-show-more { color: #6576FF; font-size: 12px; font-weight: 500; padding: 2px 4px; }
        .interview-calendar .rbc-overlay { border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e5e7eb; padding: 8px; z-index: 9999; }
        .interview-calendar .rbc-overlay-header { font-weight: 600; font-size: 13px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; margin-bottom: 6px; }
        .interview-calendar .rbc-off-range-bg { background-color: #f9fafb; }
        .interview-calendar .rbc-time-view .rbc-allday-cell { display: none; }
        .interview-calendar .rbc-time-header-content { border-left: 1px solid #e5e7eb; }
        .interview-calendar .rbc-time-content { border-top: 1px solid #e5e7eb; }
        .interview-calendar .rbc-day-slot .rbc-events-container { margin-right: 4px; }
      `}</style>
        </div>
    );
}
