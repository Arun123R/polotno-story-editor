import { observer } from 'mobx-react-lite';
import { TrashIcon } from '../shared/CommonControls';

/**
 * Multi-element selection settings panel - Storyly-inspired dark theme
 */
export const MultiSelectSettings = observer(({ store }) => {
  const selectedElements = store.selectedElements;

  if (selectedElements.length <= 1) return null;

  const handleAlignLeft = () => {
    const minX = Math.min(...selectedElements.map(el => el.x));
    selectedElements.forEach(el => el.set({ x: minX }));
  };

  const handleAlignCenter = () => {
    const centers = selectedElements.map(el => el.x + el.width / 2);
    const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
    selectedElements.forEach(el => el.set({ x: avgCenter - el.width / 2 }));
  };

  const handleAlignRight = () => {
    const maxRight = Math.max(...selectedElements.map(el => el.x + el.width));
    selectedElements.forEach(el => el.set({ x: maxRight - el.width }));
  };

  const handleAlignTop = () => {
    const minY = Math.min(...selectedElements.map(el => el.y));
    selectedElements.forEach(el => el.set({ y: minY }));
  };

  const handleAlignMiddle = () => {
    const centers = selectedElements.map(el => el.y + el.height / 2);
    const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
    selectedElements.forEach(el => el.set({ y: avgCenter - el.height / 2 }));
  };

  const handleAlignBottom = () => {
    const maxBottom = Math.max(...selectedElements.map(el => el.y + el.height));
    selectedElements.forEach(el => el.set({ y: maxBottom - el.height }));
  };

  const handleDeleteAll = () => {
    store.deleteElements(selectedElements.map(el => el.id));
  };

  const handleDuplicateAll = () => {
    selectedElements.forEach(el => el.clone());
  };

  return (
    <div className="settings-panel multi-select-settings">
      {/* Tab Navigation */}
      <div className="sidebar-tabs">
        <button className="sidebar-tab active">General</button>
        <button className="sidebar-tab">Animation</button>
      </div>

      <div className="settings-content">
        {/* Selection Info */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--sidebar-bg-secondary)',
          borderRadius: '8px',
          marginBottom: '16px',
          textAlign: 'center',
          fontSize: '13px'
        }}>
          <strong>{selectedElements.length}</strong> elements selected
        </div>

        <div className="section">
          <div className="section-title">Alignment</div>

          {/* Horizontal Alignment */}
          <div className="control-row">
            <span className="control-label">Horizontal</span>
            <div className="control-value">
              <div className="alignment-group">
                <button className="align-btn" onClick={handleAlignLeft} title="Align Left">⬅</button>
                <button className="align-btn" onClick={handleAlignCenter} title="Align Center">↔</button>
                <button className="align-btn" onClick={handleAlignRight} title="Align Right">➡</button>
              </div>
            </div>
          </div>

          {/* Vertical Alignment */}
          <div className="control-row">
            <span className="control-label">Vertical</span>
            <div className="control-value">
              <div className="alignment-group">
                <button className="align-btn" onClick={handleAlignTop} title="Align Top">⬆</button>
                <button className="align-btn" onClick={handleAlignMiddle} title="Align Middle">↕</button>
                <button className="align-btn" onClick={handleAlignBottom} title="Align Bottom">⬇</button>
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">Common Properties</div>

          {/* Opacity (apply to all) */}
          <div className="control-row">
            <span className="control-label">Opacity</span>
            <div className="control-value">
              <div className="slider-container">
                <input
                  type="number"
                  className="slider-input"
                  value={100}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    const opacity = (isNaN(value) ? 0 : value) / 100;
                    selectedElements.forEach(el => el.set({ opacity }));
                  }}
                  min={0}
                  max={100}
                />
                <div className="slider-track">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={100}
                    onChange={(e) => {
                      const opacity = parseInt(e.target.value) / 100;
                      selectedElements.forEach(el => el.set({ opacity }));
                    }}
                  />
                  <div className="slider-fill" style={{ width: '100%' }}>
                    <div className="slider-thumb" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="settings-footer">
        <div className="action-buttons">
          <button className="action-btn save" onClick={handleDuplicateAll}>
            <span>📋</span> Duplicate All
          </button>
          <button className="action-btn delete" onClick={handleDeleteAll}>
            <span><TrashIcon /></span> Delete All
          </button>
        </div>
      </div>
    </div>
  );
});
