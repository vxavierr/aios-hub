export interface OrgNode {
  id: string;
  title: string;
  subtitle?: string;
  children: OrgNode[];
}

export interface PluginConfig {
  direction: 'top-down' | 'left-right';
  hSpacing: number;
  vSpacing: number;
  theme: 'light' | 'dark';
}

export interface PositionedNode {
  node: OrgNode;
  x: number;
  y: number;
  children: PositionedNode[];
}

export interface UIMessage {
  type: 'generate' | 'update' | 'clear';
  text?: string;
  config?: PluginConfig;
}

export interface BackMessage {
  type: 'success' | 'error';
  message: string;
}

export const NODE_W = 220;
export const NODE_H = 88;
