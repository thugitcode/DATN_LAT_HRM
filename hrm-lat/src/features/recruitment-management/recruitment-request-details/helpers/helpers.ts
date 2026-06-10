type FormValues = {
    educationLevel?: string;
    requiredCertificates?: string;
    experienceYears?: number;
    technicalSkills?: string;
    softSkills?: string;
    otherRequirements?: string;
};

export const buildRequirementsText = (
    data: FormValues,
    t: any
) => {
    const fields = [
        {
            label: t('form.fields.education_level'),
            value: data.educationLevel,
        },
        {
            label: t('form.fields.required_certificates'),
            value: data.requiredCertificates,
        },
        {
            label: t('form.fields.experience_years'),
            value: data.experienceYears,
        },
        {
            label: t('form.fields.technical_skills'),
            value: data.technicalSkills,
        },
        {
            label: t('form.fields.soft_skills'),
            value: data.softSkills,
        },
        {
            label: t('form.fields.other_requirements'),
            value: data.otherRequirements,
        },
    ];

    return fields
        .filter((f) => f.value !== undefined && f.value !== null && f.value !== '')
        .map((f) => `- ${f.label}: ${f.value}`)
        .join('\n');
};

export async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
}