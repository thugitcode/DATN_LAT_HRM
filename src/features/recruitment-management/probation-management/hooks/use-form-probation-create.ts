import { addToast } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { normalizeAxiosError } from '@/lib/axios';
import { useCandidateDetail } from '@/hooks/queries/use-candidate-query';
import { probationKeys } from '@/services/query-options/recruitment-management/probation.query';
import { probationService } from '@/services/recruitment-management/probation.service';

import { probationCreateSchema, type ProbationCreateValues } from '../schemas/probation.schema';
import { useCandidateUpdateStatus } from '../../recruitment-request-details/hooks/use-candidate-update-status';
import { CandidateStatusEnum } from '../../recruitment-request-details/types/candidate.type';
import { QUERY_KEY } from '@/hooks/use-crud-query';

interface UseFormProbationCreateProps {
  candidateId: string;
  onSuccess?: () => void;
}

const EMPTY_DEFAULTS = {
  name: '',
  phone: '',
  email: '',
  birthday: null,
  gender: '',
  identity: null,
  identityIssueDate: null,
  identityIssuePlace: null,
  nationality: null,
  address: null,
  basicSalary: null,
  salaryType: 'NET' as const,
  hasHealthInsurance: false,
  hasSocialInsurance: false,
  hasUnemploymentInsurance: false,
  managedDepartmentId: '',
  managedRoomId: null,
  workType: null,
  jobTitleId: '',
  position: '',
  contractType: '',
  directManagerId: '',
  mentorId: '',
  probationStartDate: '',
  probationMonths: 2,
  probationEndDate: null,
  actualStartDate: null,
  probationReviewDate: '',
  qualification: '',
  major: null,
  academicTitle: null,
  certificateNumber: null,
  certificateIssuePlace: null,
  certificateExpiryDate: null,
  onboardingDocumentsCompleted: false,
  onboardingDocumentsNote: null,
  onboardingContractSigned: false,
  onboardingContractNote: null,
  onboardingSystemAccountCreated: false,
  onboardingSystemAccountNote: null,
  onboardingStaffCardIssued: false,
  onboardingStaffCardNote: null,
  onboardingUniformIssued: false,
  onboardingUniformNote: null,
  onboardingOrientationCompleted: false,
  onboardingOrientationNote: null,
  probationWorkObjectives: null,
  note: null,
  allowanceIds: [{ allowanceId: '' }],
};

export function useFormProbationCreate({ candidateId, onSuccess }: UseFormProbationCreateProps) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const queryClient = useQueryClient();
  const schema = probationCreateSchema(t);
  const { mutate: updateStatus, isPending } = useCandidateUpdateStatus();
  const { data: res, isLoading: isFetchingCandidate } = useCandidateDetail(candidateId);
  const candidate = res?.data;

  const methods = useForm<ProbationCreateValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (!candidate) return;
    methods.reset({
      ...EMPTY_DEFAULTS,
      name: candidate.name ?? '',
      phone: candidate.phone ?? '',
      email: candidate.email ?? '',
      birthday: candidate.dateOfBirth ?? null,
      gender: candidate.gender ?? '',
      identity: candidate.identityCard ?? null,
      address: candidate.address ?? null,
      major: candidate.major ?? null,
      academicTitle: candidate.academicTitle ?? null,
      qualification: candidate.educationLevel ?? '',
      managedDepartmentId: candidate.recruitmentRequest?.department?.id ?? '',
      managedRoomId: candidate.recruitmentRequest?.room?.id ?? null,
      workType: candidate.recruitmentRequest?.workType ?? null,
    });
  }, [candidate]);

  const isSubmitting = methods.formState.isSubmitting;

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      await probationService.createFromCandidate({
        candidateId,
        departmentIds: [],
        name: data.name,
        phone: data.phone,
        email: data.email,
        birthday: data.birthday || null,
        gender: data.gender,
        identity: data.identity || null,
        identityIssueDate: data.identityIssueDate || null,
        identityIssuePlace: data.identityIssuePlace || null,
        nationality: data.nationality || null,
        address: data.address || null,
        basicSalary: data.basicSalary || null,
        salaryType: data.salaryType,
        hasHealthInsurance: data.hasHealthInsurance,
        hasSocialInsurance: data.hasSocialInsurance,
        hasUnemploymentInsurance: data.hasUnemploymentInsurance,
        managedDepartmentId: data.managedDepartmentId,
        managedRoomId: data.managedRoomId || null,
        workType: data.workType || null,
        jobTitleId: data.jobTitleId,
        position: data.position,
        contractType: data.contractType,
        directManagerId: data.directManagerId,
        mentorId: data.mentorId,
        probationStartDate: data.probationStartDate,
        probationMonths: data.probationMonths,
        probationEndDate: data.probationEndDate || null,
        actualStartDate: data.actualStartDate || null,
        probationReviewDate: data.probationReviewDate,
        qualification: data.qualification,
        major: data.major || null,
        academicTitle: data.academicTitle || null,
        certificateNumber: data.certificateNumber || null,
        certificateIssuePlace: data.certificateIssuePlace || null,
        certificateExpiryDate: data.certificateExpiryDate || null,
        onboardingDocumentsCompleted: data.onboardingDocumentsCompleted,
        onboardingDocumentsNote: data.onboardingDocumentsNote || null,
        onboardingContractSigned: data.onboardingContractSigned,
        onboardingContractNote: data.onboardingContractNote || null,
        onboardingSystemAccountCreated: data.onboardingSystemAccountCreated,
        onboardingSystemAccountNote: data.onboardingSystemAccountNote || null,
        onboardingStaffCardIssued: data.onboardingStaffCardIssued,
        onboardingStaffCardNote: data.onboardingStaffCardNote || null,
        onboardingUniformIssued: data.onboardingUniformIssued,
        onboardingUniformNote: data.onboardingUniformNote || null,
        onboardingOrientationCompleted: data.onboardingOrientationCompleted,
        onboardingOrientationNote: data.onboardingOrientationNote || null,
        probationWorkObjectives: data.probationWorkObjectives || null,
        note: data.note || null,
      });
      updateStatus({
        id: candidateId,
        status: CandidateStatusEnum.ON_PROBATION,
      });
      await queryClient.invalidateQueries({ queryKey: probationKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CANDIDATE, "list"] });

      addToast({
        description: t('probation.toast.create_success' as any),
        color: 'success',
      });

      onSuccess?.();
    } catch (error: unknown) {
      const { message } = normalizeAxiosError(error);
      addToast({
        description: message || t('probation.toast.create_error' as any),
        color: 'danger',
      });
    }
  });

  return { methods, isSubmitting, isFetchingCandidate, onSubmit };
}
