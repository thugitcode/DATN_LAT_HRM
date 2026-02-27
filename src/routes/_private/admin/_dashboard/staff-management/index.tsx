import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/admin/_dashboard/staff-management/')({
    beforeLoad: () => {
        throw redirect({
            to: '/admin/staff-management/official-staff' as any,
        });
    },
});
