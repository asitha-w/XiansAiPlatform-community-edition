import React from 'react';
import ContractLink from './ContractLink';

export interface UIComponentData {
  name: string;
  properties: Record<string, unknown>;
}

export interface UIComponentProps {
  properties: Record<string, unknown>;
}

// Registry mapping component names to their implementations
const componentRegistry: Record<string, React.FC<UIComponentProps>> = {
  ContractLink,
  // Add more components here as needed
  // ExampleComponent: ExampleComponent,
};

interface UIComponentRendererProps {
  data: UIComponentData;
}

const UIComponentRenderer: React.FC<UIComponentRendererProps> = ({ data }) => {
  const Component = componentRegistry[data.name];

  if (!Component) {
    console.warn(`[UIComponentRenderer] Unknown component: ${data.name}`);
    return null;
  }

  return <Component properties={data.properties} />;
};

export default UIComponentRenderer;