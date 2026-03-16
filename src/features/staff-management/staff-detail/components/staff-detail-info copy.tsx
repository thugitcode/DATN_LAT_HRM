import type { Staff } from '@/types/staff.type';
import { type FC } from 'react';

import { Form, FormProvider } from 'react-hook-form';
import { useStaffForm } from '../hooks/use-staff-form';
import { AdditionalInfoSection } from './staff-detail-sections/additional-info-section';
import { ContactSection } from './staff-detail-sections/contact-section';
import { DepartmentSection } from './staff-detail-sections/department-section';
import { PersonnelInfoSection } from './staff-detail-sections/personnel-info-section';
import { QualificationSection } from './staff-detail-sections/qualification-section';

interface StaffDetailInfoProps {
    staff: Staff;
}

export const StaffDetailInfo: FC<StaffDetailInfoProps> = ({ staff }) => {
    const { form } = useStaffForm(true, staff, () => { })

    return (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            <div className="space-y-6">
                <PersonnelInfoSection />
                <DepartmentSection />
                <AdditionalInfoSection />
            </div>
            <div className="space-y-6">
                <ContactSection />
                <QualificationSection />
            </div>
        </div>
    );
};
