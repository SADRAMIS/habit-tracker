import { useEffect, useState } from 'react';
import SearchModal from './SearchModal';

export default function SearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        setOpen((prev) => !prev);
      }
    };

    const handleOpenCustom = () => setOpen(true);

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('open-search-modal', handleOpenCustom);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('open-search-modal', handleOpenCustom);
    };
  }, []);

  return (
    <>
      {open && <SearchModal onClose={() => setOpen(false)} />}
    </>
  );
}