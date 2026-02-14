import React from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, Checkbox, Alignment } from '@blueprintjs/core';
import { Search } from '@blueprintjs/icons';
import { nanoid } from 'nanoid';

import { ImagesGrid, TemplatesSection as PolotnoTemplatesSection } from 'polotno/side-panel';
import { templateList } from 'polotno/utils/api';
import { useInfiniteAPI } from 'polotno/utils/use-api';
import { t } from 'polotno/utils/l10n';
import { forEveryChild } from 'polotno/model/group-model';

import { detectTemplatePreset, normalizeTemplateDesign } from '../../../utils/normalizeTemplate';
import { isSystemPage, SYSTEM_PAGE_TYPES, setStorePreset } from '../../../store/polotnoStore';
import { getStoreExportSize } from '../../../utils/scale';
import { inferSlideBackgroundFromPage } from '../../../utils/slideBackground';

const useUpdateEffect = (effect, deps) => {
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

const TemplatesGrid = observer(({ store, sizeQuery, query }) => {
  const { setQuery, loadMore, hasMore, data, isLoading, reset, error } = useInfiniteAPI({
    getAPI: ({ page, query: q }) => templateList({ page, query: q, sizeQuery }),
    getSize: (result) => result.totalPages,
  });

  useUpdateEffect(() => {
    reset();
  }, [sizeQuery]);

  useUpdateEffect(() => {
    setQuery(query);
  }, [query]);

  const images = data?.map((p) => p.items).flat() || [];

  const onSelect = async (item) => {
    const res = await fetch(item.json);
    const design = await res.json();

    const detected = detectTemplatePreset(design);
    if (detected?.preset) {
      // Switch the editor preset to match the incoming template preset.
      // This keeps the working canvas correct for square/wide templates too.
      setStorePreset(store, detected.preset, { rescaleExisting: false });
    }

    const normalized = normalizeTemplateDesign(design, { preset: detected?.preset });

    // Ensure page backgrounds are preserved and properly structured
    if (Array.isArray(normalized.pages)) {
      normalized.pages.forEach((page, idx) => {
        const originalPage = design.pages?.[idx];
        
        // Preserve background from original if missing in normalized
        if (originalPage?.background && !page.background) {
          page.background = originalPage.background;
        }
        
        // Set up custom.background structure from page.background if it exists
        if (page.background && !page.custom?.background) {
          const inferredBg = inferSlideBackgroundFromPage({ background: page.background });
          page.custom = { ...(page.custom || {}), background: inferredBg };
        }
      });
    }

    const systemPage = store.pages.find((p) => isSystemPage(p, SYSTEM_PAGE_TYPES.SYSTEM_START_PAGE));
    const isSystemStartActive = isSystemPage(store.activePage, SYSTEM_PAGE_TYPES.SYSTEM_START_PAGE);

    if (store.pages.length <= 1 && !systemPage) {
      store.loadJSON(normalized, true);
      return;
    }

    if (systemPage && isSystemStartActive) {
      const current = JSON.parse(JSON.stringify(store.toJSON()));

      if (current.width !== normalized.width || current.height !== normalized.height) {
        (normalized.pages || []).forEach((p) => {
          p.width = p.width || normalized.width;
          p.height = p.height || normalized.height;
        });
      }

      forEveryChild({ children: normalized.pages }, (node) => {
        node.id = nanoid(10);
      });

      const systemIndex = current.pages.findIndex((p) => p?.id === systemPage.id);
      const insertIndex = systemIndex >= 0 ? systemIndex : current.pages.length;
      current.pages.splice(insertIndex, 0, ...(normalized.pages || []));

      store.loadJSON(current, true);
      return;
    }

    // When editor has multiple pages, Polotno inserts template pages into the design.
    // We keep the same behavior but ensure the inserted pages are normalized.
    const current = JSON.parse(JSON.stringify(store.toJSON()));

    if (current.width !== normalized.width || current.height !== normalized.height) {
      (normalized.pages || []).forEach((p) => {
        p.width = p.width || normalized.width;
        p.height = p.height || normalized.height;
      });
    }

    forEveryChild({ children: normalized.pages }, (node) => {
      node.id = nanoid(10);
    });

    const pageIndex = store.pages.indexOf(store.activePage);
    current.pages.splice(pageIndex, 1, ...(normalized.pages || []));

    store.loadJSON(current, true);
  };

  return (
    <ImagesGrid
      images={images}
      getPreview={(it) => it.preview}
      isLoading={isLoading}
      onSelect={onSelect}
      loadMore={hasMore ? loadMore : null}
      error={error}
    />
  );
});

const NormalizedTemplatesPanel = observer(({ store }) => {
  const [sameSize, setSameSize] = React.useState(true);
  const [query, setQuery] = React.useState('');

  // Templates in Polotno are commonly authored at export resolution.
  // When user enables "same size" filtering, use current preset export size
  // Templates and canvas are now both in 1080px-based resolution
  const exportSize = getStoreExportSize(store);
  const sizeKey = sameSize ? `${exportSize.width}x${exportSize.height}` : 'all';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InputGroup

        // leftIcon={
        //   <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-full text-gray-400 pointer-events-none">
        //     <Search size={16} />
        //   </span>
        // }

        placeholder="Search templates..."
        type="search"
        onChange={(e) => setQuery(e.target.value)}
        className="relative mb-5"
        style={{ width: '240px', marginTop: '20px' }}
        inputClassName="pl-10"
      />




      <Checkbox
        checked={sameSize}
        onChange={(e) => setSameSize(e.target.checked)}
        className="polotno-match-size-checkbox"
        style={{
          marginTop: '8px',
          marginBottom: '20px',
          marginLeft: '-10px', /* Shift to the left for card alignment */
          width: '270px',
          paddingLeft: '16px', /* Ensure space for the checkbox indicator */
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          minHeight: '24px',
          fontSize: '13px'
        }}
      >
        <span style={{ marginLeft: '4px' }}>
          {t('sidePanel.searchTemplatesWithSameSize')}
        </span>
      </Checkbox>

      <TemplatesGrid store={store} sizeQuery={`size=${sizeKey}`} query={query} />
    </div>
  );
});

export const TemplatesSection = {
  ...PolotnoTemplatesSection,
  Panel: ({ store }) => <NormalizedTemplatesPanel store={store} />,
};
