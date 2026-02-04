import { PagesTimeline } from "polotno/pages-timeline";
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

export const EditorFooter = observer(({ store }) => {
  const pages = Array.isArray(store.pages) ? store.pages : [];
  const pagesKey = pages.map((p) => `${p?.id}:${p?.custom?.isActive !== false ? 1 : 0}`).join('|');

  useEffect(() => {
    const sync = () => {
      const root = document.querySelector('.polotno-pages-timeline');
      if (!root) return;
      const thumbs = root.querySelectorAll('.polotno-page-thumbnail, .go3162374498');
      if (!thumbs?.length) return;

      thumbs.forEach((node, index) => {
        const page = pages[index];
        const isActive = page?.custom?.isActive !== false;
        node.dataset.slideActive = isActive ? 'true' : 'false';
      });
    };

    // Run after paint; PagesTimeline renders asynchronously.
    const raf = requestAnimationFrame(() => sync());
    const t = setTimeout(() => sync(), 50);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [store, pagesKey]);

  return (
    <div className="flex" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <PagesTimeline store={store} />
    </div>
  );
});
