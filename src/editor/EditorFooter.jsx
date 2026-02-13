import { PagesTimeline } from "polotno/pages-timeline";
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { isSystemPage, SYSTEM_PAGE_TYPES } from '../store/polotnoStore';

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
        const isSystemStart = isSystemPage(page, SYSTEM_PAGE_TYPES.SYSTEM_START_PAGE);
        node.dataset.slideActive = isActive ? 'true' : 'false';
        node.dataset.systemStart = isSystemStart ? 'true' : 'false';

        // Also mark the parent container (which contains the context menu)
        const container = node.closest('.polotno-page-container');
        if (container) {
          container.dataset.systemStart = isSystemStart ? 'true' : 'false';
        }

        // Prevent reordering/dragging and hide per-page controls on SYSTEM_START_PAGE.
        if (isSystemStart) {
          try {
            node.setAttribute('draggable', 'false');
          } catch {
            // ignore
          }

          // Hide any page controls inside the thumbnail (duplicate/delete/others).
          // We do NOT remove nodes (avoid React reconciliation issues).
          const buttons = node.querySelectorAll('button');
          buttons.forEach((btn) => {
            btn.dataset.systemHidden = 'true';
            btn.setAttribute('aria-hidden', 'true');
            btn.setAttribute('tabindex', '-1');
            btn.disabled = true;
          });

          // Block drag handlers and prevent selecting this thumbnail.
          if (!node.__systemStartGuardsAttached) {
            const stopDrag = (e) => {
              e.preventDefault();
              e.stopPropagation();
            };
            const stopSelect = (e) => {
              e.preventDefault();
              e.stopPropagation();
            };
            node.addEventListener('dragstart', stopDrag, true);
            node.addEventListener('pointerdown', stopSelect, true);
            node.__systemStartGuardsAttached = true;
            node.__systemStartGuardsStop = { stopDrag, stopSelect };
          }
        } else {
          // Restore hidden buttons for normal pages.
          const hiddenButtons = node.querySelectorAll('button[data-system-hidden="true"]');
          hiddenButtons.forEach((btn) => {
            delete btn.dataset.systemHidden;
            btn.removeAttribute('aria-hidden');
            btn.removeAttribute('tabindex');
            btn.disabled = false;
          });

          // Remove guards if previously attached.
          if (node.__systemStartGuardsAttached && node.__systemStartGuardsStop) {
            const { stopDrag, stopSelect } = node.__systemStartGuardsStop;
            if (typeof stopDrag === 'function') {
              node.removeEventListener('dragstart', stopDrag, true);
            }
            if (typeof stopSelect === 'function') {
              node.removeEventListener('pointerdown', stopSelect, true);
            }
            node.__systemStartGuardsAttached = false;
            node.__systemStartGuardsStop = null;
          }
        }
      });
    };

    // Run after paint; PagesTimeline renders asynchronously.
    const raf = requestAnimationFrame(() => sync());
    const t = setTimeout(() => sync(), 50);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, pagesKey]);

  return (
    <div className="flex" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <PagesTimeline store={store} />
    </div>
  );
});
