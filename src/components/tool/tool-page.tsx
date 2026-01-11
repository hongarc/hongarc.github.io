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

  // Build canonical URL dynamically (works for local dev and any deployment)
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const baseUrl = `${globalThis.location.origin}${basePath}`;

  // Generate SEO data from selected tool or home page
  const seoData = selectedTool
    ? {
        title: selectedTool.label,
        description: `${selectedTool.description} - Free online ${selectedTool.label.toLowerCase()} tool for developers.`,
        keywords: selectedTool.keywords,
        canonical: `${baseUrl}/${selectedTool.id}`,
      }
    : {
        canonical: baseUrl,
      };

  return (
    <>
      <SEO {...seoData} />
      <ToolView />
    </>
  );
}
