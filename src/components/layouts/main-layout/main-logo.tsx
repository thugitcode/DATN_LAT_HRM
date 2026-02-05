import { Link } from '@tanstack/react-router';
import { Image } from '@heroui/react';
import HRM_LOGO from '@public/images/logo/hrm-logo.svg';

export const MainLogo = () => {
  return (
    <Link to="/admin" className="flex gap-x-3.5 items-center leading-8 font-semibold text-2xl">
      <Image alt="HeroUI hero Image" src={HRM_LOGO} height={32} />
      HRM
    </Link>
  );
};
