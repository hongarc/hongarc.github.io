import { Route, Routes } from 'react-router-dom';

import { BlogListPage, BlogPostPage } from '@/components/blog';
import { Layout } from '@/components/layout/layout';
import { ToolPage } from '@/components/tool/tool-page';

// Initialize plugins (side effect - registers all plugins)
import '@/plugins';

// Initialize blog (side effect - registers all blog posts)
import '@/blog/init';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Home page - shows welcome screen */}
        <Route index element={<ToolPage />} />

        {/* Blog routes */}
        <Route path="blog" element={<BlogListPage />} />
        <Route path="blog/tag/:tagName" element={<BlogListPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />

        {/* Tool routes */}
        <Route path=":toolId" element={<ToolPage />} />
      </Route>
    </Routes>
  );
}

export default App;
