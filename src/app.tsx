import { Route, Routes } from 'react-router-dom';

import { Layout } from '@/components/layout/layout';
import { ToolPage } from '@/components/tool/tool-page';

// Initialize plugins (side effect - registers all plugins)
import '@/plugins';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Home page - shows welcome screen */}
        <Route index element={<ToolPage />} />
        {/* Tool routes */}
        <Route path=":toolId" element={<ToolPage />} />
      </Route>
    </Routes>
  );
}

export default App;
