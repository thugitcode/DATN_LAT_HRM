
import { AdditionalInfoSection } from './staff-detail-sections/additional-info-section';
import { ContactSection } from './staff-detail-sections/contact-section';
import { DepartmentSection } from './staff-detail-sections/department-section';
import { PersonnelInfoSection } from './staff-detail-sections/personnel-info-section';
import { QualificationSection } from './staff-detail-sections/qualification-section';


export const StaffDetailInfo = () => {

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
