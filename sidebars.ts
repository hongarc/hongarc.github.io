import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Tutorial - Basics',
      items: [
        'tutorial-basics/create-a-page',
        'tutorial-basics/create-a-document',
        'tutorial-basics/create-a-blog-post',
        'tutorial-basics/markdown-features',
        'tutorial-basics/deploy-your-site',
        'tutorial-basics/congratulations',
      ],
    },
    {
      type: 'category',
      label: 'Tutorial - Extras',
      items: [
        'tutorial-extras/manage-docs-versions',
        'tutorial-extras/translate-your-site',
      ],
    },
  ],
  converterSidebar: [
    'converter/index',
    'converter/data-format-converters',
    'converter/id-generators',
    'converter/timestamp-converters',
    'converter/color-converters',
    'converter/byte-size-converters',
    {
      type: 'category',
      label: 'String Converters',
      link: {
        type: 'doc',
        id: 'converter/string-converter/index',
      },
      items: [
        'converter/string-converter/lowercase',
        'converter/string-converter/uppercase',
        'converter/string-converter/camelcase',
        'converter/string-converter/kebabcase',
        'converter/string-converter/snakecase',
        'converter/string-converter/startcase',
        'converter/string-converter/capitalize',
        'converter/string-converter/trim',
        'converter/string-converter/deburr',
        'converter/string-converter/escape',
        'converter/string-converter/unescape',
      ],
    },
    'converter/class-to-named-function',
  ],
};

export default sidebars;
