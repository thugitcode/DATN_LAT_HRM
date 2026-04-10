import { Button, Chip } from '@heroui/react';
import { IconFileText } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { formatDate } from '@/lib/utils';
import { formatVND } from '@/lib/helpers';
import { icons } from '@/lib/icons';
import { OfferStatus } from '@/features/recruitment-management/types/candidate.type';
import type { ICandidateOffer } from '@/features/recruitment-management/types/candidate.type';
import type { ICandidate } from '@/features/recruitment-management/recruitment-request-details/types/candidate.type';
import { useDetailsOfferCandidate } from '../../../hooks/use-candidate-offer';
import { LoadingWrapper } from '@/components/loading-wrapper';
import { DrawerType, useDrawer } from '@/store/useDrawer';

interface OfferTabProps {
    candidate: ICandidate;
}

type StatusLabelKey =
    | 'candidate.detail.offer.status.draft'
    | 'candidate.detail.offer.status.sent'
    | 'candidate.detail.offer.status.accepted'
    | 'candidate.detail.offer.status.declined'
    | 'candidate.detail.offer.status.expired';

const OFFER_STATUS_STYLE: Partial<Record<
    OfferStatus,
    { labelKey: StatusLabelKey; color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' }
>> = {
    [OfferStatus.DRAFT]: { labelKey: 'candidate.detail.offer.status.draft', color: 'default' },
    [OfferStatus.SENT]: { labelKey: 'candidate.detail.offer.status.sent', color: 'primary' },
    [OfferStatus.ACCEPTED]: { labelKey: 'candidate.detail.offer.status.accepted', color: 'success' },
    [OfferStatus.REJECTED]: { labelKey: 'candidate.detail.offer.status.declined', color: 'danger' },
    [OfferStatus.EXPIRED]: { labelKey: 'candidate.detail.offer.status.expired', color: 'warning' },
    [OfferStatus.PENDING]: { labelKey: 'candidate.detail.offer.status.sent', color: 'primary' },
    [OfferStatus.CANCELLED]: { labelKey: 'candidate.detail.offer.status.declined', color: 'danger' },
};

function InfoRow({ label, value, highlight = false }: { label: string; value: React.ReactNode; highlight?: boolean }) {
    return (
        <div className={`flex justify-start items-center py-2.5 ${highlight ? 'bg-[#EEF5FF] rounded-xl px-3 -mx-3' : ''}`}>
            <span className={`min-w-[202px] text-sm ${highlight ? 'text-primary font-medium' : 'text-[#71717A]'}`}>{label}</span>
            <span className={`text-sm font-medium ${highlight ? 'text-primary text-base' : 'text-[#11181C]'}`}>{value ?? '—'}</span>
        </div>
    );
}

function OfferDetail({ offer, candidate }: { offer: ICandidateOffer, candidate: ICandidate }) {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const statusStyle = offer.offerStatus ? OFFER_STATUS_STYLE[offer.offerStatus] : undefined;
    const { onOpen } = useDrawer()
    return (
        <>{offer?.offerStatus ? <div className="overflow-hidden flex flex-col gap-3 border-b border-b-[#11111126] pb-6">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 pb-3 pt-5">
                {icons.fileTextFill}
                <span className="font-semibold text-[#11181C] text-base">{t("candidate.detail.offer.offer_letter")}</span>
                {statusStyle && (
                    <Chip size="sm" color={statusStyle.color} variant="flat" className="text-xs">
                        {t(statusStyle.labelKey)}
                    </Chip>
                )}
            </div>

            {/* Body */}
            <div className="px-6 py-0 flex flex-col">
                {offer.offerPosition && (
                    <InfoRow label={t('candidate.detail.offer.position')} value={offer.offerPosition} />
                )}
                {offer.offerDepartment && (
                    <InfoRow label={t('candidate.detail.offer.department_room')} value={offer.offerDepartment} />
                )}
                {offer.baseSalary > 0 && (
                    <InfoRow label={t('candidate.detail.offer.basic_salary')} value={formatVND(offer.baseSalary)} />
                )}
                {offer.allowance > 0 && (
                    <InfoRow label={t('candidate.detail.offer.allowance')} value={formatVND(offer.allowance)} />
                )}
                {offer.specialAllowance > 0 && (
                    <InfoRow
                        label={t('candidate.detail.offer.medical_allowance')}
                        value={formatVND(offer.specialAllowance)}
                    />
                )}
                {offer.totalCompensation > 0 && (
                    <InfoRow
                        label={t('candidate.detail.offer.total_income')}
                        value={`${formatVND(offer.totalCompensation)}/${t('candidate.detail.offer.month')}`}
                        highlight
                    />
                )}
                {offer.offerStartDate && (
                    <InfoRow
                        label={t('candidate.detail.offer.start_date')}
                        value={formatDate(offer.offerStartDate)}
                    />
                )}
                {offer.probationMonths > 0 && (
                    <InfoRow
                        label={t('candidate.detail.offer.probation_period')}
                        value={`${offer.probationMonths} ${t('candidate.detail.offer.months')}`}
                    />
                )}
                {offer?.offerApprover?.id && (
                    <InfoRow
                        label={t('candidate.detail.offer.approver')}
                        value={`${offer.offerApprover.name}`}
                    />
                )}

                {/* Attachment */}
                {offer.offerDocumentUrl && (
                    <div className="flex justify-start items-center py-2.5">
                        <span className="text-sm min-w-[202px] text-[#71717A]">{t('candidate.detail.offer.attachment')}</span>
                        <a
                            href={offer.offerDocumentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 rounded-lg py-1.5 text-primary hover:opacity-80"
                        >
                            <span className='color-transparent fill-transparent'>{icons.fileText}</span>
                            <span className="text-sm font-medium">
                                {offer.offerDocumentUrl.split('/').pop()}
                            </span>
                        </a>
                    </div>
                )}

                {/* Notes */}
                {/* {offer.offerNotes && (
                    <div className="flex flex-col gap-1 py-2.5">
                        <span className="text-sm text-[#71717A]">{t('candidate.detail.note')}</span>
                        <p className="text-sm text-[#11181C] leading-relaxed">{offer.offerNotes}</p>
                    </div>
                )} */}
            </div>
            <div className='px-6'>
                <hr className='h-px text-[#11111126] w-full' />
            </div>
            <div className='px-6'>
                <Button color='primary'>
                    {t("candidate.actions.send_offer")}
                </Button>
            </div>
        </div> : <div className='flex h-1/2 flex-col items-center gap-3 justify-center'>
            <h3>{t('candidate.detail.offer.no_offer')}</h3>
            <Button color='primary' onPress={() => onOpen(DrawerType.OFFER_MUTATE, {
                candidateId: candidate.id,
                candidateName: candidate.name,
                candidatePosition: candidate.recruitmentRequest?.position,
                candidateDepartment: candidate.recruitmentRequest?.department?.name,
                candidateStatus: candidate.status,
            })}>{t('candidate.detail.offer.create_offer')}</Button>
        </div>}</>
    );
}

export function OfferTab({ candidate }: OfferTabProps) {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const { data: res, isLoading } = useDetailsOfferCandidate(candidate.id);
    const offer = res?.data;

    if (isLoading) {
        return (
            <LoadingWrapper isLoading={isLoading}><></></LoadingWrapper>
        );
    }

    if (!offer) {
        return <p className="text-sm text-[#71717A]">{t('candidate.detail.no_data')}</p>;
    }

    return <OfferDetail offer={offer} candidate={candidate} />;
}
