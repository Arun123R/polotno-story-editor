import {
  PolotnoContainer,
  SidePanelWrap,
  WorkspaceWrap,
} from "polotno";

export const EditorLayout = ({ sidePanel, toolbar, canvas, footer, rightSidebar }) => {
  return (
  <div className="h-screen overflow-hidden">
    {/* TOP TOOLBAR (fixed height) */}
    <div className=" flex flex-row justify-between">
      <img src="\public\AppStorys_logo_white-Dy7IWqWA.png" alt="AppStorys_logo_white-Dy7IWqWA.png" className="p-2 h-12"></img>

      {toolbar}
    </div>
    <PolotnoContainer
      className="w-full overflow-hidden"
      style={{ display: "flex", height: "100vh" }}
    >
      {/* LEFT SIDEBAR */}
      <SidePanelWrap className="shrink-0" style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)' }}>
        {sidePanel}
      </SidePanelWrap>

      {/* CENTER AREA (Toolbar + Canvas + Footer) */}
      <WorkspaceWrap
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1, 
          minWidth: 0, 
          minHeight: 0, 
          overflow: 'hidden' 
        }}
      >
        {/* TOP TOOLBAR (fixed height) */}
        {/* <div className="shrink-0">
          {toolbar}
        </div> */}

        {/* MAIN CONTENT AREA (Canvas + RightSidebar) */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          minHeight: 0, 
          overflow: 'hidden' 
        }}>
          {/* CANVAS AREA (takes remaining space) */}
          <div 
          className="mb-0"
          style={{ 
            flex: 1, 
            minHeight: 0, 
            minWidth: 0,
            backgroundColor: 'var(--bg-tertiary)', 
            position: 'relative' 
          }}>
            {canvas}
          </div>

          {/* RIGHT SIDEBAR (fixed width) */}
          {rightSidebar && (
            <div className="shrink-0">
              {rightSidebar}
            </div>
          )}
        </div>

        {/* BOTTOM TIMELINE (fixed height) */}
        <div className="shrink-0">
          {footer}
        </div>
      </WorkspaceWrap>
    </PolotnoContainer>
  </div>
  );
};
