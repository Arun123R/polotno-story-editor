import React from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, Switch, Alignment } from '@blueprintjs/core';
import { Search } from '@blueprintjs/icons';
import { nanoid } from 'nanoid';

import { ImagesGrid, TemplatesSection as PolotnoTemplatesSection } from 'polotno/side-panel';
import { templateList } from 'polotno/utils/api';
import { useInfiniteAPI } from 'polotno/utils/use-api';
import { t } from 'polotno/utils/l10n';
import { forEveryChild } from 'polotno/model/group-model';

import { detectTemplatePreset, normalizeTemplateDesign } from '../../../utils/normalizeTemplate';
import { setStorePreset } from '../../../store/polotnoStore';
import { getStoreExportSize } from '../../../utils/scale';

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

    if (store.pages.length <= 1) {
      store.loadJSON(normalized, true);
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
  // so Story templates (1080×1920) are still visible while working canvas is 360×640.
  const exportSize = getStoreExportSize(store);
  const sizeKey = sameSize ? `${exportSize.width}x${exportSize.height}` : 'all';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InputGroup
        // leftIcon={<Search/>}
        placeholder="Search templates"
        type="search"
        onChange={(e) => setQuery(e.target.value)}
        className="relative mb-5"
        inputClassName="pl-10"
      />




      <Switch
        checked={sameSize}
        onChange={(e) => setSameSize(e.target.checked)}
        alignIndicator={Alignment.RIGHT}
        style={{ marginTop: '8px', marginBottom: '8px' }}
      >
        {t('sidePanel.searchTemplatesWithSameSize')}{' '}
      </Switch>

      <TemplatesGrid store={store} sizeQuery={`size=${sizeKey}`} query={query} />
    </div>
  );
});

export const TemplatesSection = {
  ...PolotnoTemplatesSection,
  Panel: ({ store }) => <NormalizedTemplatesPanel store={store} />,
};
