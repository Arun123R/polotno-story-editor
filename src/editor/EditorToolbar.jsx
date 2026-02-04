import { Toolbar } from 'polotno/toolbar/toolbar';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import { Document, Import, Media, Video } from '@blueprintjs/icons';
import { t } from 'polotno/utils/l10n';
import { downloadFile } from 'polotno/utils/download';
import { getAPI } from 'polotno/utils/api';
import { getKey } from 'polotno/utils/validate-key';
import { flags } from 'polotno/utils/flags';

import { getDefaultExportPixelRatio } from '../store/polotnoStore';

// Null component to disable toolbar controls
const None = () => null;

// Component overrides - disable EVERYTHING except History (Undo/Redo)
const toolbarComponents = {
  // Text components - ALL disabled (including animations)
  TextFontFamily: None,
  TextFontSize: None,
  TextFontVariant: None,
  TextFilters: None,
  TextTransform: None,
  TextFill: None,
  TextSpacing: None,
  TextAnimations: None,  // Disabled - moved to right sidebar
  TextAiWrite: None,

  // Image components - ALL disabled (including animations)
  ImageFlip: None,
  ImageFilters: None,
  ImageFitToBackground: None,
  ImageCrop: None,
  ImageClip: None,
  ImageRemoveBackground: None,
  ImageAnimations: None,  // Disabled - moved to right sidebar

  // SVG components - ALL disabled (including animations)
  SvgFlip: None,
  SvgFilters: None,
  SvgColors: None,
  SvgAnimations: None,  // Disabled - moved to right sidebar

  // Line components - ALL disabled (including animations)
  LineSettings: None,
  LineColor: None,
  LineHeads: None,
  LineAnimations: None,  // Disabled - moved to right sidebar

  // Figure components - ALL disabled (including animations)
  FigureFill: None,
  FigureStroke: None,
  FigureSettings: None,
  FigureFilters: None,
  FigureAnimations: None,  // Disabled - moved to right sidebar

  // Video components - ALL disabled (including animations)
  VideoTrim: None,
  VideoAnimations: None,  // Disabled - moved to right sidebar

  // Multi-select - ALL disabled (including animations)
  ManyAnimations: None,  // Disabled - moved to right sidebar

  // Page components - disabled
  PageDuration: None,
  PageBackground: None,

  // Common controls - disabled (except History which is not overridden)
  Group: None,
  Position: None,
  Opacity: None,
  CopyStyle: None,
  Lock: None,
  Duplicate: None,
  Remove: None,

  // History (Undo/Redo) - NOT overridden, keeps default behavior
  // History Button is handled by Polotno, no override provided here.
  // Download - override to ensure correct export pixelRatio without store monkey-patching.
  DownloadButton: observer(({ store }) => {
    const [loading, setLoading] = React.useState(false);

    const getActivePages = React.useCallback(() => {
      const pages = Array.isArray(store.pages) ? store.pages : [];
      return pages.filter((p) => p?.custom?.isActive !== false);
    }, [store]);

    const getActiveDesignJSON = React.useCallback(() => {
      const design = store.toJSON();
      const pages = Array.isArray(design.pages) ? design.pages : [];
      const activePages = pages.filter((p) => p?.custom?.isActive !== false);
      return { ...design, pages: activePages };
    }, [store]);

    const baseName = React.useMemo(() => {
      try {
        const tokens = [];
        store.pages.forEach((p) => {
          (p.children || []).forEach((el) => {
            if (el?.type === 'text' && typeof el.text === 'string') tokens.push(el.text);
          });
        });
        const name = tokens
          .join(' ')
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 6)
          .join(' ')
          .replace(/\s/g, '-')
          .toLowerCase();
        return name || 'polotno';
      } catch {
        return 'polotno';
      }
    }, [store]);

    const onSaveAsImage = () => {
      const pixelRatio = getDefaultExportPixelRatio(store);
      const pages = getActivePages();
      if (pages.length === 0) {
        alert('No active slides to export. Enable at least one slide.');
        return;
      }
      pages.forEach((p, idx) => {
        const suffix = pages.length > 1 ? `-${idx + 1}` : '';
        store.saveAsImage({ pageId: p.id, fileName: `${baseName}${suffix}.png`, pixelRatio });
      });
    };

    const onSaveAsPDF = async () => {
      setLoading(true);
      let fullDesign;
      try {
        fullDesign = store.toJSON();
        const activeDesign = getActiveDesignJSON();
        if (!Array.isArray(activeDesign.pages) || activeDesign.pages.length === 0) {
          alert('No active slides to export. Enable at least one slide.');
          return;
        }

        // Polotno's PDF export exports all pages from the current store.
        // Temporarily load only active pages for export.
        store.loadJSON(activeDesign, true);
        try {
          await store.saveAsPDF({ fileName: `${baseName}.pdf` });
        } finally {
          store.loadJSON(fullDesign, true);
        }
      } finally {
        setLoading(false);
      }
    };

    const onSaveAsVideo = async () => {
      setLoading(true);
      try {
        const design = getActiveDesignJSON();
        if (!Array.isArray(design.pages) || design.pages.length === 0) {
          alert('No active slides to export. Enable at least one slide.');
          return;
        }
        const api = getAPI();
        const key = getKey();

        const createRes = await fetch(`${api}/renders?KEY=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ design, pixelRatio: 1, format: 'mp4' }),
        });
        const created = await createRes.json();
        const renderId = created?.id;
        if (!renderId) throw new Error('Failed to start render');

        // Poll render status.
        // Keep it simple (same cadence as Polotno default behavior).
        while (true) {
          const statusRes = await fetch(`${api}/renders/${renderId}?KEY=${key}`);
          const status = await statusRes.json();
          if (status?.status === 'done') {
            downloadFile(status.output, `${baseName}.mp4`);
            break;
          }
          if (status?.status === 'error') {
            throw new Error('Failed to render video');
          }
          // Wait a bit before next poll.
          await new Promise((r) => setTimeout(r, 5000));
        }
      } catch (e) {
        // Keep same UX as Polotno: log + alert.
        console.error('Video export failed:', e);
        alert('Failed to export video. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <Popover
        position={Position.BOTTOM}
        content={
          <Menu>
            <MenuItem icon={<Media />} text={t('toolbar.saveAsImage')} onClick={onSaveAsImage} />
            <MenuItem icon={<Document />} text={t('toolbar.saveAsPDF')} onClick={onSaveAsPDF} />
            {flags.animationsEnabled ? <MenuItem icon={<Video />} text="Save as Video" onClick={onSaveAsVideo} /> : null}
          </Menu>
        }
      >
        <Button
          icon={<Import />}
          className="polotno-download-button"
          text={t('toolbar.download')}
          minimal
          loading={loading}
        />
      </Popover>
    );
  }),
};

export const EditorToolbar = ({ store }) => {
  return (
    <div style={{ backgroundColor: 'transparent', borderBottom: 'none' }}>
      <Toolbar store={store} components={toolbarComponents} />
    </div>
  );
};
