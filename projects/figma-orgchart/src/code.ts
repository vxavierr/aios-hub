/// <reference types="@figma/plugin-typings" />

import { PluginConfig, UIMessage, BackMessage, PositionedNode, NODE_W, NODE_H } from './types';
import { parseText } from './parser';
import { calculateLayout } from './layout';

figma.showUI(__html__, { width: 420, height: 580, title: 'Org Chart Generator' });

// ─── Font loader ──────────────────────────────────────────────────────────────

let _bold:    FontName = { family: 'Inter', style: 'Bold' };
let _medium:  FontName = { family: 'Inter', style: 'Medium' };
let _regular: FontName = { family: 'Inter', style: 'Regular' };

async function loadFonts(): Promise<void> {
  async function tryLoad(candidates: FontName[]): Promise<FontName> {
    for (const f of candidates) {
      try { await figma.loadFontAsync(f); return f; } catch { /* next */ }
    }
    throw new Error('Nenhuma fonte encontrada');
  }
  _bold    = await tryLoad([{ family: 'Inter', style: 'Bold' },   { family: 'Roboto', style: 'Bold' }]);
  _medium  = await tryLoad([{ family: 'Inter', style: 'Medium' }, { family: 'Roboto', style: 'Medium' }, { family: 'Inter', style: 'Bold' }]);
  _regular = await tryLoad([{ family: 'Inter', style: 'Regular' },{ family: 'Roboto', style: 'Regular' }]);
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  // Canvas / frame background — clean neutral gray (like Figma canvas)
  pageBg:    { r: 0.937, g: 0.937, b: 0.941 } as RGB, // #EFEFF0
  // Card
  cardBg:    { r: 1,     g: 1,     b: 1     } as RGB,
  border:    { r: 0.898, g: 0.898, b: 0.910 } as RGB, // #E5E5E8
  // Typography
  textPri:   { r: 0.094, g: 0.094, b: 0.110 } as RGB, // #18181C
  textSec:   { r: 0.447, g: 0.447, b: 0.478 } as RGB, // #72727A
  // Root card
  rootBg:    { r: 0.094, g: 0.094, b: 0.110 } as RGB, // #18181C
  // Connector lines
  connector: { r: 0.800, g: 0.800, b: 0.816 } as RGB, // #CCCCCC
  white:     { r: 1,     g: 1,     b: 1     } as RGB,
};

const AVATAR_SIZE = 44;

// ─── Department detection ─────────────────────────────────────────────────────

interface DeptStyle { bg: RGB; icon: RGB; label: string }

const DEPTS: [string[], DeptStyle][] = [
  [
    ['produto', 'product', ' pm', 'po ', 'product manager', 'performance', 'squad'],
    { bg: { r: 1.000, g: 0.918, b: 0.714 }, icon: { r: 0.490, g: 0.329, b: 0.000 }, label: 'Produto' },
  ],
  [
    ['eng', 'dev', 'tech', 'cto', 'frontend', 'backend', 'fullstack', 'full stack',
     'dados', 'data', 'analista', 'devops', 'sre', 'infra', 'platform'],
    { bg: { r: 0.796, g: 0.894, b: 1.000 }, icon: { r: 0.047, g: 0.278, b: 0.514 }, label: 'Eng' },
  ],
  [
    ['design', 'ux', 'ui', 'editor', 'conteúdo', 'conteudo', 'content',
     'social media', 'social', 'criativo', 'copywriter'],
    { bg: { r: 1.000, g: 0.820, b: 0.902 }, icon: { r: 0.502, g: 0.047, b: 0.251 }, label: 'Design' },
  ],
  [
    ['marketing', 'growth', 'tráfego', 'trafego', 'mídia', 'midia', 'campanha', 'branding'],
    { bg: { r: 0.796, g: 0.965, b: 0.855 }, icon: { r: 0.047, g: 0.361, b: 0.188 }, label: 'Mkt' },
  ],
  [
    ['sales', 'sdr', 'closer', 'vendas', 'comercial', 'revenue', 'bdr', 'account'],
    { bg: { r: 0.878, g: 0.855, b: 1.000 }, icon: { r: 0.259, g: 0.094, b: 0.514 }, label: 'Vendas' },
  ],
  [
    ['ops', 'operações', 'operacoes', 'coo', 'operations', 'suporte', 'customer success', 'cs '],
    { bg: { r: 1.000, g: 0.878, b: 0.820 }, icon: { r: 0.514, g: 0.157, b: 0.047 }, label: 'Ops' },
  ],
];

function getDept(title: string): DeptStyle | null {
  const t = ` ${title.toLowerCase()} `;
  for (const [keys, style] of DEPTS) {
    if (keys.some(k => t.includes(k))) return style;
  }
  return null;
}

// ─── Role icon detection ──────────────────────────────────────────────────────

const ICONS: [string[], string][] = [
  [['ceo', 'founder', 'co-founder', 'presidente', 'diretor geral', 'chief executive'], '👑'],
  [['cto', 'chief tech', 'engenharia', 'head of eng', 'vp eng'], '⚙️'],
  [['cpo', 'chief product', 'head of product', 'vp product'], '🎯'],
  [['cmo', 'chief marketing', 'head of marketing', 'vp marketing'], '📣'],
  [['coo', 'chief operating', 'operações', 'operations'], '🔩'],
  [['cfo', 'financ', 'finance', 'financeiro', 'chief financial'], '💰'],
  [['tech lead', 'engineering manager', 'staff eng', 'principal eng', 'tech lead'], '🔧'],
  [['pm', 'product manager', 'product owner', 'po', 'squad', 'performance'], '🎯'],
  [['devops', 'sre', 'infra', 'platform'], '🔩'],
  [['dev', 'developer', 'desenvolvedor', 'engineer', 'fullstack', 'full stack', 'frontend', 'backend'], '💻'],
  [['data', 'dados', 'analista de dados', 'analytics', 'scientist', 'business intel'], '📊'],
  [['analista'], '🔍'],
  [['designer', 'design', 'ux', 'ui'], '✏️'],
  [['editor', 'conteúdo', 'conteudo', 'content', 'copywriter', 'redator'], '✍️'],
  [['social media', 'social'], '📱'],
  [['marketing', 'growth', 'tráfego', 'trafego', 'mídia', 'gestor de tráfego'], '📣'],
  [['sdr', 'bdr', 'closer', 'sales', 'comercial', 'vendas', 'account'], '💼'],
  [['customer success', 'cs', 'suporte', 'support', 'atendimento'], '🤝'],
  [['gerente', 'manager', 'coordenador', 'supervisor'], '📋'],
];

function getRoleIcon(title: string): string {
  const t = ` ${title.toLowerCase()} `;
  for (const [keys, icon] of ICONS) {
    if (keys.some(k => t.includes(k))) return icon;
  }
  return '👤';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(text: TextNode, maxW: number): void {
  if (text.width > maxW) {
    text.resize(maxW, text.height);
    text.textAutoResize = 'HEIGHT';
  }
}

function makeText(chars: string, font: FontName, size: number, color: RGB, opacity?: number): TextNode {
  const t = figma.createText();
  t.fontName = font;
  t.fontSize = size;
  t.characters = chars;
  t.fills = [{ type: 'SOLID', color, opacity: opacity ?? 1 }];
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  return t;
}

// ─── Dept chip (compact pill) ─────────────────────────────────────────────────

function addChip(parent: FrameNode, dept: DeptStyle, x: number, y: number): void {
  const label = makeText(dept.label, _medium, 9, dept.icon);
  const chipW = Math.max(28, Math.ceil(label.width) + 12);
  const chipH = 16;

  const chip = figma.createFrame();
  chip.resize(chipW, chipH);
  chip.cornerRadius = chipH / 2;
  chip.fills = [{ type: 'SOLID', color: dept.bg }];
  chip.x = x;
  chip.y = y;

  chip.appendChild(label);
  label.x = Math.round((chipW - label.width) / 2);
  label.y = Math.round((chipH - label.height) / 2);

  parent.appendChild(chip);
}

// ─── Avatar circle ────────────────────────────────────────────────────────────

function addAvatar(parent: FrameNode, iconChar: string, dept: DeptStyle | null, x: number, y: number): void {
  // Circle background
  const circle = figma.createEllipse();
  circle.resize(AVATAR_SIZE, AVATAR_SIZE);
  circle.x = x;
  circle.y = y;

  // Pick avatar color: dept-specific or default warm gray
  const avatarBg  = dept ? dept.bg   : { r: 0.902, g: 0.902, b: 0.918 } as RGB;
  const avatarIcon = dept ? dept.icon : { r: 0.353, g: 0.353, b: 0.396 } as RGB;
  circle.fills = [{ type: 'SOLID', color: avatarBg }];
  circle.strokes = [{ type: 'SOLID', color: avatarIcon, opacity: 0.12 }];
  circle.strokeWeight = 1;
  parent.appendChild(circle);

  // Emoji centered inside circle
  const iconEl = makeText(iconChar, _regular, 18, avatarIcon);
  iconEl.x = Math.round(x + (AVATAR_SIZE - iconEl.width)  / 2);
  iconEl.y = Math.round(y + (AVATAR_SIZE - iconEl.height) / 2);
  parent.appendChild(iconEl);
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function addCard(parent: FrameNode, posNode: PositionedNode, depth: number): void {
  const { title, subtitle } = posNode.node;
  const isRoot = depth === 0;

  const card = figma.createFrame();
  card.name = title;
  card.x = posNode.x;
  card.y = posNode.y;
  card.resize(NODE_W, NODE_H);
  card.cornerRadius = 10;
  card.setPluginData('orgchart_node_id', posNode.node.id);

  // ── Root card ──────────────────────────────────────────────────────────────
  if (isRoot) {
    card.fills = [{ type: 'SOLID', color: C.rootBg }];
    card.effects = [
      {
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.28 },
        offset: { x: 0, y: 4 },
        radius: 20,
        spread: -4,
        visible: true,
        blendMode: 'NORMAL',
      },
    ];

    // Icon
    const icon = makeText('👑', _regular, 18, C.white);
    card.appendChild(icon);
    icon.x = 16;
    icon.y = subtitle ? 18 : Math.round((NODE_H - icon.height) / 2);

    // Title
    const titleEl = makeText(title, _bold, 14, C.white);
    card.appendChild(titleEl);
    titleEl.x = 44;
    titleEl.y = subtitle ? 17 : Math.round((NODE_H - titleEl.height) / 2);
    clamp(titleEl, NODE_W - 56);

    if (subtitle) {
      const subEl = makeText(subtitle, _regular, 11, C.white, 0.50);
      card.appendChild(subEl);
      subEl.x = 44;
      subEl.y = 38;
      clamp(subEl, NODE_W - 56);
    }

    parent.appendChild(card);
    return;
  }

  // ── Branch / leaf card ─────────────────────────────────────────────────────
  card.fills = [{ type: 'SOLID', color: C.cardBg }];
  card.strokes = [{ type: 'SOLID', color: C.border }];
  card.strokeWeight = 1;
  card.effects = [
    {
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.07 },
      offset: { x: 0, y: 2 },
      radius: 8,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL',
    },
  ];

  const dept     = getDept(title);
  const iconChar = getRoleIcon(title);

  // ── Avatar (left side) ────────────────────────────────────────────────────
  const avatarX = 14;
  const avatarY = Math.round((NODE_H - AVATAR_SIZE) / 2);
  addAvatar(card, iconChar, dept, avatarX, avatarY);

  // ── Text (right of avatar) ────────────────────────────────────────────────
  const textX   = avatarX + AVATAR_SIZE + 12;  // 14 + 44 + 12 = 70
  const textMaxW = NODE_W - textX - 12;         // right padding

  const hasSubtitle = !!subtitle;
  const hasChip     = dept !== null;

  // Vertical alignment of text block inside card
  let blockH = 16; // title height estimate
  if (hasSubtitle) blockH += 4 + 13; // gap + subtitle
  if (hasChip)     blockH += 4 + 17; // gap + chip

  let curY = Math.round((NODE_H - blockH) / 2);

  // Title
  const titleEl = makeText(title, _bold, 13, C.textPri);
  clamp(titleEl, textMaxW);
  card.appendChild(titleEl);
  titleEl.x = textX;
  titleEl.y = curY;
  curY += Math.round(titleEl.height) + 4;

  // Subtitle
  if (hasSubtitle) {
    const subEl = makeText(subtitle!, _regular, 11, C.textSec);
    clamp(subEl, textMaxW);
    card.appendChild(subEl);
    subEl.x = textX;
    subEl.y = curY;
    curY += Math.round(subEl.height) + 5;
  }

  // Dept chip
  if (hasChip) {
    addChip(card, dept!, textX, curY);
  }

  parent.appendChild(card);
}

// ─── Connector (right-angle elbow) ───────────────────────────────────────────

function addConnector(
  parent: FrameNode,
  px: number, py: number,
  cx: number, cy: number,
  direction: 'top-down' | 'left-right',
): void {
  let x1: number, y1: number, dx: number, dy: number;

  if (direction === 'top-down') {
    x1 = px + NODE_W / 2; y1 = py + NODE_H;
    dx = (cx + NODE_W / 2) - x1;
    dy = cy - y1;
  } else {
    x1 = px + NODE_W; y1 = py + NODE_H / 2;
    dx = cx - x1;
    dy = (cy + NODE_H / 2) - y1;
  }

  // Right-angle elbow path
  const pathData = direction === 'top-down'
    ? `M 0 0 L 0 ${dy * 0.5} L ${dx} ${dy * 0.5} L ${dx} ${dy}`
    : `M 0 0 L ${dx * 0.5} 0 L ${dx * 0.5} ${dy} L ${dx} ${dy}`;

  const vec = figma.createVector();
  vec.name = 'connector';
  vec.x = x1;
  vec.y = y1;
  vec.vectorPaths = [{ windingRule: 'NONE', data: pathData }];
  vec.strokes = [{ type: 'SOLID', color: C.connector }];
  vec.strokeWeight = 1.5;
  vec.strokeCap = 'ROUND';
  vec.strokeJoin = 'ROUND';
  vec.fills = [];
  parent.appendChild(vec);
}

// ─── Two-pass render ──────────────────────────────────────────────────────────

function renderConnectors(
  parent: FrameNode,
  node: PositionedNode,
  direction: 'top-down' | 'left-right',
  parentNode?: PositionedNode,
): void {
  if (parentNode) addConnector(parent, parentNode.x, parentNode.y, node.x, node.y, direction);
  node.children.forEach(c => renderConnectors(parent, c, direction, node));
}

function renderCards(parent: FrameNode, node: PositionedNode, depth: number): void {
  addCard(parent, node, depth);
  node.children.forEach(c => renderCards(parent, c, depth + 1));
}

// ─── Frame fit ────────────────────────────────────────────────────────────────

function fitFrame(frame: FrameNode, pad = 56): void {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const child of frame.children) {
    const n = child as SceneNode & { x: number; y: number; width: number; height: number };
    minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + n.width); maxY = Math.max(maxY, n.y + n.height);
  }
  if (!isFinite(minX)) return;
  for (const child of frame.children) {
    const n = child as SceneNode & { x: number; y: number };
    n.x += -minX + pad; n.y += -minY + pad;
  }
  frame.resize(maxX - minX + pad * 2, maxY - minY + pad * 2);
}

// ─── Generate ─────────────────────────────────────────────────────────────────

const DATA_KEY = 'orgchart_v4_frame_id';

async function generate(text: string, config: PluginConfig, isUpdate: boolean): Promise<void> {
  await loadFonts();

  const root = parseText(text);
  if (!root) {
    reply({ type: 'error', message: 'Formato inválido. Use recuo + traços para hierarquia.' });
    return;
  }

  const layout = calculateLayout(root, config);

  let frame: FrameNode | null = null;
  if (isUpdate) {
    const id = figma.root.getPluginData(DATA_KEY);
    if (id) {
      const found = figma.getNodeById(id);
      if (found?.type === 'FRAME') {
        frame = found as FrameNode;
        [...frame.children].forEach(c => c.remove());
      }
    }
  }

  if (!frame) {
    frame = figma.createFrame();
    frame.x = figma.viewport.center.x - 500;
    frame.y = figma.viewport.center.y - 300;
  }

  const ts = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  frame.name = `Organograma · ${ts}`;
  frame.fills = [{ type: 'SOLID', color: C.pageBg }];
  frame.clipsContent = false;

  renderConnectors(frame, layout, config.direction);
  renderCards(frame, layout, 0);
  fitFrame(frame);

  figma.root.setPluginData(DATA_KEY, frame.id);
  figma.viewport.scrollAndZoomIntoView([frame]);

  const count = (function count(n: PositionedNode): number {
    return 1 + n.children.reduce((s, c) => s + count(c), 0);
  })(layout);

  reply({ type: 'success', message: `✓ ${count} nós gerados.` });
}

async function clearChart(): Promise<void> {
  const id = figma.root.getPluginData(DATA_KEY);
  if (id) {
    figma.getNodeById(id)?.remove();
    figma.root.setPluginData(DATA_KEY, '');
  }
  reply({ type: 'success', message: 'Organograma removido.' });
}

function reply(msg: BackMessage): void { figma.ui.postMessage(msg); }

// ─── Entry ────────────────────────────────────────────────────────────────────

figma.ui.onmessage = async (msg: UIMessage) => {
  try {
    if (msg.type === 'generate') await generate(msg.text!, msg.config!, false);
    else if (msg.type === 'update')   await generate(msg.text!, msg.config!, true);
    else if (msg.type === 'clear')    await clearChart();
  } catch (err) {
    reply({ type: 'error', message: `Erro: ${err instanceof Error ? err.message : String(err)}` });
  }
};
