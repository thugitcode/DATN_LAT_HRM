import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormArea } from '@/components/form-fields/form-area';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormInput } from '@/components/form-fields/form-input';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { useDepartmentOptions } from '@/hooks/select-options/use-department-options';
import { useRoomOptions } from '@/hooks/select-options/use-room-options';
import { NAMESPACES } from '@/i18n/constants';
import { StaffTypeEnum, WorkingTypeEnum } from '@/types/staff.type';
import { useFormRecruitmentRequest } from '../../recruitment-request-list/hooks/use-form-recruitment-request';
import { useParams } from '@tanstack/react-router';
import { icons } from '@/lib/icons';
import { BtnCancel } from '@/components/btn-cancel';
import { BtnSave } from '@/components/btn-save';
import { Button, Textarea } from '@heroui/react';
import { ControlMode, useControlMode } from '@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle';
import { useEffect } from 'react';
import { buildRequirementsText } from '../helpers/helpers';

export const RecruitmentInformationSection = () => {
    const { id } = useParams({ strict: false })
    const { methods, onSubmit } = useFormRecruitmentRequest({ id });
    const { control, watch } = methods
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const { t: tCommon } = useTranslation(NAMESPACES.COMMON);
    const { setMode, isView } = useControlMode()
    const variant = isView ? 'underlined' : 'flat'
    const isReadOnly = isView
    const { options: departmentOptions } = useDepartmentOptions();
    const selectedDept = watch('departmentId');
    const { options: roomOptions } = useRoomOptions(selectedDept);

    const staffTypeOptions = Object.values(StaffTypeEnum).map((val) => ({
        key: val,
        label: t(`form.options.staff_type.${val}`),
    }));

    const workTypeOptions = Object.values(WorkingTypeEnum).map((val) => ({
        key: val,
        label: t(`form.options.work_type.${val}`),
    }));
    useEffect(() => {
        setMode(ControlMode.view)
    }, [])
    return (
        <>
            {/* Section 1: Thông tin chung */}
            <form action="" onSubmit={onSubmit}>
                <div className="bg-white py-5 px-6 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
                    <div className='flex justify-between items-center text-lg leading-7 font-medium'>
                        <span className='flex gap-2.5 items-center'>{icons.case} {t('form.fields.recruitment_information')}</span>
                        <div className="flex items-center justify-between mt-0.75 mb-3.75">
                            <div className="flex items-center gap-2">
                                {!isView ? (
                                    <>
                                        <BtnCancel
                                            onPress={() => { setMode(ControlMode.view) }}
                                        // isDisabled={updateStaffMutation.isPending}
                                        />
                                        <BtnSave
                                            type="submit"
                                        // isLoading={updateStaffMutation.isPending}
                                        />
                                    </>
                                ) : (
                                    <Button
                                        variant="bordered"
                                        className="border-primary text-primary font-semibold rounded-xl px-4"
                                        startContent={<icons.edit stroke="#6576FF" className="size-5" />}
                                        onPress={() => {
                                            setMode(ControlMode.edit,);
                                        }}
                                    >
                                        {tCommon('button.edit')}
                                    </Button>
                                )}
                            </div>
                        </div></div>
                    <div className="grid grid-cols-3 gap-4">
                        <FormInput
                            control={control}
                            name="code"
                            label={t('form.fields.code')}
                            placeholder={t('form.placeholders.auto_generated')}
                            isDisabled
                            variant={variant}
                        />
                        <FormSelect
                            control={control}
                            name="departmentId"
                            label={t('form.fields.department')}
                            isRequired
                            placeholder={t('form.placeholders.select_department')}
                            options={departmentOptions.map((o) => ({ key: o.value, label: o.label }))}
                            readOnly={isReadOnly}
                            variant={variant}
                        />
                        <FormSelect
                            control={control}
                            name="roomId"
                            label={t('form.fields.room')}
                            isRequired
                            placeholder={t('form.placeholders.select_room')}
                            options={roomOptions.map((o) => ({ key: o.value, label: o.label }))}
                            readOnly={isReadOnly}
                            variant={variant}
                        />
                        <FormInput
                            control={control}
                            name="position"
                            label={t('form.fields.position')}
                            isRequired
                            readOnly={isReadOnly}
                            variant={variant}
                        />
                        <FormSelect
                            control={control}
                            name="staffType"
                            label={t('form.fields.staff_type')}
                            isRequired
                            placeholder={t('form.placeholders.select_staff_type')}
                            options={staffTypeOptions}
                            readOnly={isReadOnly}
                            variant={variant}
                        />
                        <FormNumberInput
                            control={control}
                            name="quantity"
                            label={t('form.fields.quantity')}
                            isRequired
                            placeholder={t('form.placeholders.enter_quantity')}
                            allowNegative={false}
                            decimalScale={0}
                            readOnly={isReadOnly}
                            variant={variant}
                        />
                        <FormSelect
                            control={control}
                            name="workType"
                            label={t('form.fields.work_type')}
                            isRequired
                            placeholder={t('form.placeholders.select_work_type')}
                            options={workTypeOptions}
                            readOnly={isReadOnly}
                            variant={variant}
                        />
                        <FormDatePicker
                            control={control}
                            name="requiredDate"
                            label={t('form.fields.required_date')}
                            isReadOnly={isReadOnly}
                            variant={variant}
                        />
                        <div className="col-span-1 grid grid-cols-2 gap-4">
                            <FormNumberInput
                                control={control}
                                name="salaryFrom"
                                label={t('form.fields.salary_expected_short')}
                                isRequired
                                placeholder={t('form.placeholders.from')}
                                allowNegative={false}
                                readOnly={isReadOnly}
                                variant={variant}
                            />
                            <FormNumberInput
                                control={control}
                                name="salaryTo"
                                label={t('form.fields.salary_expected_short')}
                                classNames={{ label: 'text-transparent! text-base leading-4' }}
                                placeholder={t('form.placeholders.to')}
                                allowNegative={false}
                                readOnly={isReadOnly}
                                variant={variant}
                            />
                        </div>
                        <div className="col-span-3">
                            <FormArea
                                control={control}
                                name="reason"
                                label={t('form.fields.reason')}
                                placeholder={t('form.placeholders.enter_reason')}
                                minRows={2}
                                readOnly={isReadOnly}
                                variant={variant}
                            />
                        </div>
                        <div className="col-span-3">
                            <FormArea
                                control={control}
                                name="description"
                                label={t('form.fields.description')}
                                isRequired
                                placeholder={t('form.placeholders.enter_description')}
                                minRows={5}
                                readOnly={isReadOnly}
                                variant={variant}
                            />
                        </div>
                        {!isReadOnly ? <div className="col-span-3 grid grid-cols-3 gap-4">
                            <FormInput
                                control={control}
                                name="educationLevel"
                                label={t('form.fields.education_level')}
                                isRequired
                                placeholder={t('form.placeholders.enter_education_level')}
                                isReadOnly={isReadOnly}
                                variant={variant}
                            />
                            <FormInput
                                control={control}
                                name="requiredCertificates"
                                label={t('form.fields.required_certificates')}
                                isRequired
                                placeholder={t('form.placeholders.enter_certificates')}
                                isReadOnly={isReadOnly}
                                variant={variant}
                            />
                            <FormNumberInput
                                control={control}
                                name="experienceYears"
                                label={t('form.fields.experience_years')}
                                isRequired
                                placeholder={t('form.placeholders.enter_experience_years')}
                                isReadOnly={isReadOnly}
                                variant={variant}
                            />
                            <div className="col-span-3">
                                <FormArea
                                    control={control}
                                    name="technicalSkills"
                                    label={t('form.fields.technical_skills')}
                                    placeholder={t('form.placeholders.enter_technical_skills')}
                                    minRows={3}
                                    isReadOnly={isReadOnly}
                                    variant={variant}
                                />
                            </div>
                            <div className="col-span-3">
                                <FormArea
                                    control={control}
                                    name="softSkills"
                                    label={t('form.fields.soft_skills')}
                                    placeholder={t('form.placeholders.enter_soft_skills')}
                                    minRows={3}
                                    isReadOnly={isReadOnly}
                                    variant={variant}
                                />
                            </div>
                            <div className="col-span-3">
                                <FormArea
                                    control={control}
                                    name="otherRequirements"
                                    label={t('form.fields.other_requirements')}
                                    placeholder={t('form.placeholders.enter_other_requirements')}
                                    minRows={3}
                                    isReadOnly={isReadOnly}
                                    variant={variant}
                                />
                            </div>
                        </div>
                            : <div className='col-span-3'>
                                <Textarea
                                    label={t('form.sections.candidate_requirements')}
                                    classNames={{ label: "text-lg" }}
                                    isRequired
                                    placeholder={t('form.sections.candidate_requirements')}
                                    minRows={8}
                                    value={buildRequirementsText(watch(), t)}
                                    readOnly={isReadOnly}
                                    variant={variant}
                                />
                            </div>}
                    </div>
                </div>
            </form >
        </>
    );
};
