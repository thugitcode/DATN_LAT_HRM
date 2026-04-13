import { useEffect } from 'react';
import { useDrawer } from '@/store/useDrawer';

/**
 * Sync React Hook Form's `isDirty` flag into the drawer store.
 * When the form has unsaved changes, closing the drawer will trigger
 * a confirm modal instead of closing immediately.
 *
 * Usage: call inside any drawer form component.
 *   useDirtyDrawer(methods.formState.isDirty)
 */
export function useDirtyDrawer(isDirty: boolean) {
  const setDirty = useDrawer((s) => s.setDirty);

  useEffect(() => {
    setDirty(isDirty);
  }, [isDirty, setDirty]);

  // Reset when the form unmounts (covers programmatic close after submit)
  useEffect(() => () => setDirty(false), [setDirty]);
}
