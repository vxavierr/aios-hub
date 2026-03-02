import { OrgNode, PositionedNode, PluginConfig, NODE_W, NODE_H } from './types';

// --- Top-Down layout (Reingold-Tilford simplified) ---

function subtreeWidth(node: OrgNode, hGap: number): number {
  if (node.children.length === 0) return NODE_W;
  const childrenW = node.children.reduce((sum, c) => sum + subtreeWidth(c, hGap), 0)
    + (node.children.length - 1) * hGap;
  return Math.max(NODE_W, childrenW);
}

function layoutTopDown(
  node: OrgNode,
  x: number,
  y: number,
  hGap: number,
  vGap: number,
): PositionedNode {
  const sw = subtreeWidth(node, hGap);
  const nodeX = x + (sw - NODE_W) / 2;

  const positioned: PositionedNode = { node, x: nodeX, y, children: [] };

  let childX = x;
  const childY = y + NODE_H + vGap;

  for (const child of node.children) {
    const csw = subtreeWidth(child, hGap);
    positioned.children.push(layoutTopDown(child, childX, childY, hGap, vGap));
    childX += csw + hGap;
  }

  return positioned;
}

// --- Left-Right layout ---

function subtreeHeight(node: OrgNode, vGap: number): number {
  if (node.children.length === 0) return NODE_H;
  const childrenH = node.children.reduce((sum, c) => sum + subtreeHeight(c, vGap), 0)
    + (node.children.length - 1) * vGap;
  return Math.max(NODE_H, childrenH);
}

function layoutLeftRight(
  node: OrgNode,
  x: number,
  y: number,
  hGap: number,
  vGap: number,
): PositionedNode {
  const sh = subtreeHeight(node, vGap);
  const nodeY = y + (sh - NODE_H) / 2;

  const positioned: PositionedNode = { node, x, y: nodeY, children: [] };

  let childY = y;
  const childX = x + NODE_W + hGap;

  for (const child of node.children) {
    const csh = subtreeHeight(child, vGap);
    positioned.children.push(layoutLeftRight(child, childX, childY, hGap, vGap));
    childY += csh + vGap;
  }

  return positioned;
}

export function calculateLayout(root: OrgNode, config: PluginConfig): PositionedNode {
  if (config.direction === 'top-down') {
    return layoutTopDown(root, 0, 0, config.hSpacing, config.vSpacing);
  } else {
    return layoutLeftRight(root, 0, 0, config.hSpacing, config.vSpacing);
  }
}
