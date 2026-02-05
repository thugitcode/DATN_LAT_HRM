import { menu } from './constant/data';
import { MainNavItem } from './main-nav-item';

export const MainNav = () => {
  return (
    <ul className="flex items-center justify-center gap-2">
      {menu.map((item) => (
        <MainNavItem key={item.id} {...item} />
      ))}
    </ul>
  );
};
