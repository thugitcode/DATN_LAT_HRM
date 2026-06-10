import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { IconDots } from "@tabler/icons-react";
import { MainNavigateEnum, type CandidateRowSecondaryAction, type ICandidate } from "../../recruitment-request-details/types/candidate.type";
import { CANDIDATE_ROW_ACTION_CONFIG } from "../../constants/candidate.constants";
import { useDrawer } from "@/store/useDrawer";
import { useNavigate } from "@tanstack/react-router";
import { useCandidateUpdateStatus } from "../../recruitment-request-details/hooks/use-candidate-update-status";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "@/i18n/constants";

export function CandidateRowActionsCell({ candidate }: { candidate: ICandidate }) {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const { mutate: updateStatus, isPending } = useCandidateUpdateStatus();
    const { onOpen } = useDrawer();
    const navigate = useNavigate();

    const config = CANDIDATE_ROW_ACTION_CONFIG[candidate.status];
    if (!config) return null;

    const handleMainAction = () => {
        if (config.mainStatusTo) {
            updateStatus({ id: candidate.id, status: config.mainStatusTo });
            return;
        }
        if (config.mainDrawer) {
            onOpen(config.mainDrawer, { candidateId: candidate?.id, candidateName: candidate?.name, candidateStatus: candidate.status, candidateEmail: candidate?.email });
            return;
        }
        if (config.mainNavigate === MainNavigateEnum.DETAIL) {
            navigate({ to: `/admin/recruitment-management/candidate/${candidate.id}` });
        }
        if (config.mainNavigate === MainNavigateEnum.SCHEDULE) {
            navigate({ to: `/admin/recruitment-management/interview-schedule`, search: { candidateId: candidate.id } });
        }
    };

    const handleSecondaryAction = (action: CandidateRowSecondaryAction) => {
        if (action.statusTo) {
            updateStatus({ id: candidate.id, status: action.statusTo });
            return;
        }
        if (action.drawer) {
            onOpen(action.drawer, { candidateId: candidate.id, candidateName: candidate.name });
            return;
        }
        if (action.navigate === 'detail') {
            navigate({ to: `/admin/recruitment-management/candidate/${candidate.id}` });
        }
    };

    return (
        <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
        >
            <Button
                size="sm"
                variant={config.mainVariant === 'bordered' ? 'bordered' : 'bordered'}
                color={config.mainColor ?? 'primary'}
                className="rounded-xl text-xs font-medium border-1 whitespace-nowrap h-8 min-w-26"
                isLoading={isPending}
                onPress={handleMainAction}
            // startContent={!isPending ? config.mainIcon : undefined}
            >
                {t(config.mainLabelKey as any)}
            </Button>

            {config.secondary.length > 0 ? (
                <Dropdown>
                    <DropdownTrigger>
                        <Button isIconOnly variant="light" className="rounded-lg h-8 w-8 min-w-8">
                            <IconDots size={16} color="#71717A" />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="secondary actions">
                        {config.secondary.map((action) => (
                            <DropdownItem
                                key={action.key}
                                startContent={action.icon}
                                color={action.color}
                                className={action.color === 'danger' ? 'text-danger' : ''}
                                onPress={() => handleSecondaryAction(action)}
                            >
                                {t(action.labelKey as any)}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
            ) : <div className="h-8 w-8"></div>}
        </div>
    );
}