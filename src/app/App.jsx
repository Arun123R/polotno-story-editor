import { Editor } from "../editor/Editor";
// import { AuthGuard } from "../components/AuthGuard.jsx";

function App() {
  // Temporarily disabled AuthGuard - editor will load without auth
  // API calls may fail with 401 until you set tokens manually
  return <Editor />;

  /* 
  return (
    <AuthGuard
      onAuthError={(error) => {
        console.error('Authentication error:', error);
      }}
    >
      <Editor />
    </AuthGuard>
  );
  */
}

export default App;
