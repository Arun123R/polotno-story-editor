import { useEffect } from "react";
import { store } from "../store/polotnoStore";
import { EditorLayout } from "./EditorLayout";
import { EditorSidePanel } from "./EditorSidePanel";
import { EditorToolbar } from "./EditorToolbar";
import { EditorWorkspace } from "./EditorWorkspace";
import { EditorFooter } from "./EditorFooter";
import { RightSidebar } from "../components/right-sidebar/RightSidebar";
import { initSidebarTooltips } from "../utils/sidebarTooltips";

export const Editor = () => {
  useEffect(() => {
    // Initialize tooltips after component mounts
    initSidebarTooltips();

    // Re-initialize on any updates (in case tabs change)
    const interval = setInterval(initSidebarTooltips, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <EditorLayout
      store={store}
      sidePanel={<EditorSidePanel store={store} />}
      toolbar={<EditorToolbar store={store} />}
      canvas={<EditorWorkspace store={store} />}
      footer={<EditorFooter store={store} />}
      rightSidebar={<RightSidebar store={store} />}
    />
  );
};
