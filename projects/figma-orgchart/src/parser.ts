import { OrgNode } from './types';

let idCounter = 0;
function uid(): string {
  return `node_${++idCounter}_${Math.random().toString(36).slice(2, 7)}`;
}

interface RawItem {
  level: number;
  title: string;
  subtitle?: string;
}

function extractItems(input: string): RawItem[] {
  const lines = input
    .split('\n')
    .map(l => l.replace(/\r/, ''))
    .filter(l => l.trim() !== '');

  // Detect all unique leading-whitespace lengths to build level map
  const rawLines = lines.map(line => {
    const leading = line.match(/^(\s*)/)?.[1] ?? '';
    const stripped = line.replace(/^\s*[-*•]\s*/, '').trim();
    return { leadLen: leading.length, stripped };
  }).filter(x => x.stripped !== '');

  const uniqueLengths = [...new Set(rawLines.map(x => x.leadLen))].sort((a, b) => a - b);
  const lengthToLevel = new Map(uniqueLengths.map((len, i) => [len, i]));

  return rawLines.map(({ leadLen, stripped }) => {
    const parts = stripped.split(':');
    return {
      level: lengthToLevel.get(leadLen) ?? 0,
      title: parts[0].trim(),
      subtitle: parts[1]?.trim() || undefined,
    };
  });
}

export function parseText(input: string): OrgNode | null {
  // Try JSON first
  const trimmed = input.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as OrgNode;
      return assignIds(parsed);
    } catch {
      // fall through to text parser
    }
  }

  const items = extractItems(input);
  if (items.length === 0) return null;

  const root: OrgNode = {
    id: uid(),
    title: items[0].title,
    subtitle: items[0].subtitle,
    children: [],
  };

  const stack: { node: OrgNode; level: number }[] = [{ node: root, level: items[0].level }];

  for (let i = 1; i < items.length; i++) {
    const item = items[i];

    // Pop stack until we find a suitable parent
    while (stack.length > 1 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }

    const newNode: OrgNode = {
      id: uid(),
      title: item.title,
      subtitle: item.subtitle,
      children: [],
    };

    stack[stack.length - 1].node.children.push(newNode);
    stack.push({ node: newNode, level: item.level });
  }

  return root;
}

function assignIds(node: OrgNode): OrgNode {
  node.id = uid();
  node.children = (node.children || []).map(assignIds);
  return node;
}
