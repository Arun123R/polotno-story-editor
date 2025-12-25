import { PagesTimeline } from "polotno/pages-timeline";

export const EditorFooter = ({ store }) => {
  return (
    <div className="flex items-center" style={{ backgroundColor: 'var(--bg-secondary)', height: '130px' }}>
      <PagesTimeline store={store} />
    </div>
  );
};
