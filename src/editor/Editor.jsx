import { store } from "../store/polotnoStore";
import { EditorLayout } from "./EditorLayout";
import { EditorSidePanel } from "./EditorSidePanel";
import { EditorToolbar } from "./EditorToolbar";
import { EditorWorkspace } from "./EditorWorkspace";
import { EditorFooter } from "./EditorFooter";
import { RightSidebar } from "../components/right-sidebar/RightSidebar";

export const Editor = () => {
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
