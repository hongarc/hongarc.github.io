import Layout from '@theme/Layout';
import React from 'react';

import StyledExample from '../components/styled-example';

export default function StyledExamplePage(): React.JSX.Element {
  return (
    <Layout title='Styled Components Example'>
      <main style={{ padding: '2rem' }}>
        <h1>CSS-in-JS with Styled Components</h1>
        <p>
          This page demonstrates the use of styled-components for CSS-in-JS
          styling. The component below uses styled-components instead of inline
          styles.
        </p>

        <StyledExample
          title='Styled Components Demo'
          description='This component uses styled-components for all styling instead of inline styles.'
        />

        <div style={{ marginTop: '2rem' }}>
          <h2>Benefits of CSS-in-JS</h2>
          <ul>
            <li>
              <strong>Type Safety:</strong> TypeScript support for props and
              themes
            </li>
            <li>
              <strong>Dynamic Styling:</strong> Styles can change based on props
              or state
            </li>
            <li>
              <strong>Scoped Styles:</strong> No CSS class name conflicts
            </li>
            <li>
              <strong>Better Developer Experience:</strong> Co-located styles
              with components
            </li>
            <li>
              <strong>Theme Support:</strong> Easy integration with design
              systems
            </li>
          </ul>
        </div>
      </main>
    </Layout>
  );
}
