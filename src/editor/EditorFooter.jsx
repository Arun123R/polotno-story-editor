import { PagesTimeline } from "polotno/pages-timeline";

export const EditorFooter = ({ store }) => {
  return (
    <div className="flex" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <PagesTimeline store={store} />
    </div>
  );
};
