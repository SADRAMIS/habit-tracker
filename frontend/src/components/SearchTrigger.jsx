import { useEffect, useState } from 'react';
import SearchModal from './SearchModal';

export default function SearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Ctrl+K или Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {open && <SearchModal onClose={() => setOpen(false)} />}
    </>
  );
}