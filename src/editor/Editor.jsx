/**
 * Editor Component
 * 
 * Main editor wrapper that:
 * 1. Provides EditorContext for campaign/slide data
 * 2. Renders the editor layout
 * 
 * Hydration flow:
 * - EditorContext fetches campaign ONCE
 * - useSlideHydration loads canvas when slideId changes
 * - CTA state is managed separately from Polotno
 */

import { useEffect } from "react";
import { store } from "../store/polotnoStore";
import { EditorLayout } from "./EditorLayout";
import { EditorSidePanel } from "./EditorSidePanel";
import { EditorToolbar } from "./EditorToolbar";
import { EditorWorkspace } from "./EditorWorkspace";
import { EditorFooter } from "./EditorFooter";
import { RightSidebar } from "../components/right-sidebar/RightSidebar";
import { initSidebarTooltips } from "../utils/sidebarTooltips";
import { EditorContextProvider, useEditorContext } from "../context/EditorContext";
import { storyGroupId, slideId } from "../editorBootstrap";

/**
 * Inner Editor Component (consumes context)
 */
const EditorInner = () => {
  const {
    currentGroupId,
    currentSlideId,
    isHydrating,
    isCampaignLoading,
    campaignError,
    refetchCampaign,
  } = useEditorContext();

  useEffect(() => {
    // Initialize tooltips after component mounts
    initSidebarTooltips();

    // Re-initialize on any updates (in case tabs change)
    const interval = setInterval(initSidebarTooltips, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show loading state while campaign is being fetched
  if (isCampaignLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--border-primary)] border-t-[var(--accent-primary)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading campaign...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (campaignError) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center text-[var(--text-danger)]">
          <p className="font-semibold mb-2">Failed to load campaign</p>
          <p className="text-sm opacity-70 mb-4">{campaignError}</p>
          <button
            onClick={() => refetchCampaign()}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded hover:opacity-90 transition-opacity"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <EditorLayout
      store={store}
      groupId={currentGroupId || storyGroupId}
      slideId={currentSlideId || slideId}
      sidePanel={<EditorSidePanel store={store} />}
      toolbar={<EditorToolbar store={store} />}
      canvas={<EditorWorkspace store={store} />}
      footer={<EditorFooter store={store} />}
      rightSidebar={<RightSidebar store={store} />}
    />
  );
};

/**
 * Main Editor Component (provides context)
 */
export const Editor = () => {
  return (
    <EditorContextProvider>
      <EditorInner />
    </EditorContextProvider>
  );
};
