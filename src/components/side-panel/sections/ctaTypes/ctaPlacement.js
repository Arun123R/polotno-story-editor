import {
  BASELINE_EXPORT,
  getStoreExportScale,
  getStoreExportSize,
  toCanvas,
} from '../../../../utils/scale';

function mapBaselineExportToCurrent(store, rectOrPoint) {
  const exportSize = getStoreExportSize(store);
  const sx = exportSize.width / BASELINE_EXPORT.width;
  const sy = exportSize.height / BASELINE_EXPORT.height;

  if (!rectOrPoint) return rectOrPoint;
  const out = { ...rectOrPoint };
  if (typeof out.x === 'number') out.x = out.x * sx;
  if (typeof out.y === 'number') out.y = out.y * sy;
  if (typeof out.width === 'number') out.width = out.width * sx;
  if (typeof out.height === 'number') out.height = out.height * sy;
  return out;
}

function toCanvasRect(store, exportRect) {
  const exportScale = getStoreExportScale(store);
  return {
    ...exportRect,
    x: toCanvas(exportRect.x, exportScale),
    y: toCanvas(exportRect.y, exportScale),
    width: toCanvas(exportRect.width, exportScale),
    height: toCanvas(exportRect.height, exportScale),
  };
}

export function getCanvasRectFromBaseline(store, dims, pos) {
  const exportDims = mapBaselineExportToCurrent(store, dims);
  const exportPos = mapBaselineExportToCurrent(store, pos);
  return toCanvasRect(store, { ...exportPos, ...exportDims });
}
