import { IconMail, IconPhone } from '@tabler/icons-react';

interface ContactCellProps {
  email?: string;
  phone?: string;
}

export const ContactCell = ({ email, phone }: ContactCellProps) => {
  return (
    <div className="flex flex-col gap-0.5 text-sm text-link">
      {!!email && (
        <span className="flex items-center gap-1.5">
          <IconMail size={16} stroke={1} />
          {email}
        </span>
      )}

      {!!phone && (
        <span className="flex items-center gap-1.5">
          <IconPhone size={16} stroke={1} />
          {phone}
        </span>
      )}
    </div>
  );
};
