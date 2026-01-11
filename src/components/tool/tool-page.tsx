import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { SEO } from '@/components/seo';
import { ToolView } from '@/components/tool/tool-view';
import { registry } from '@/plugins/registry';
import { useToolStore } from '@/store/tool-store';

export function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { selectedToolId, selectTool, selectedTool } = useToolStore();

  // Sync URL param with store
  useEffect(() => {
    if (!toolId) {
      // Home page - clear selected tool
      if (selectedToolId) {
        selectTool(null);
      }
      return;
    }

    const tool = registry.get(toolId);
    if (tool) {
      // Valid tool - select it if not already selected
      if (selectedToolId !== toolId) {
        selectTool(toolId);
      }
    } else {
      // Invalid tool ID - redirect to home
      void navigate('/', { replace: true });
    }
  }, [toolId, selectedToolId, selectTool, navigate]);

  // Generate SEO data from selected tool
  const seoData = selectedTool
    ? {
        title: selectedTool.label,
        description: selectedTool.description,
        keywords: selectedTool.keywords,
        canonical: `${globalThis.location.origin}/${selectedTool.id}`,
      }
    : {};

  return (
    <>
      <SEO {...seoData} />
      <ToolView />
    </>
  );
}
