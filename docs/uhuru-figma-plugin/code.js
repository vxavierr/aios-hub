figma.showUI(__html__, { width: 360, height: 180 });

figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'create') return;

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

  const page = figma.currentPage;

  // ── CORES ──
  const C = {
    bg:      { r: 0.051, g: 0.051, b: 0.102 },
    surface: { r: 0.071, g: 0.082, b: 0.122 },
    border:  { r: 0.122, g: 0.157, b: 0.224 },
    text:    { r: 0.945, g: 0.957, b: 0.980 },
    muted:   { r: 0.392, g: 0.455, b: 0.545 },
    flux:    { r: 0.231, g: 0.510, b: 0.965 },
    nova:    { r: 0.545, g: 0.361, b: 0.965 },
    sage:    { r: 0.063, g: 0.725, b: 0.506 },
    finn:    { r: 0.961, g: 0.620, b: 0.043 },
    indigo:  { r: 0.310, g: 0.275, b: 0.898 },
  };

  function solid(color, opacity = 1) {
    return [{ type: 'SOLID', color, opacity }];
  }

  function makeRect(w, h) {
    const r = figma.createRectangle();
    r.resize(w, h);
    return r;
  }

  function makeText(content, size, weight, color, w) {
    const t = figma.createText();
    t.fontName = { family: "Inter", style: weight === 700 ? "Bold" : weight === 600 ? "Semi Bold" : "Regular" };
    t.fontSize = size;
    t.fills = solid(color);
    t.characters = content;
    if (w) { t.textAutoResize = "HEIGHT"; t.resize(w, t.height); }
    return t;
  }

  function makeFrame(w, h, name) {
    const f = figma.createFrame();
    f.resize(w, h);
    f.name = name || "Frame";
    f.fills = [];
    f.clipsContent = false;
    return f;
  }

  // ── FRAME PRINCIPAL ──
  const ROOT_W = 1560;
  const root = makeFrame(ROOT_W, 900, "Uhuru Squad — Organograma");
  root.fills = solid(C.bg);
  root.cornerRadius = 20;
  root.paddingTop = 40; root.paddingBottom = 40;
  root.paddingLeft = 40; root.paddingRight = 40;
  root.itemSpacing = 0;
  page.appendChild(root);

  let Y = 40;

  // ── HELPER: adicionar node ao root em posição absoluta ──
  function place(node, x, y) {
    root.appendChild(node);
    node.x = x;
    node.y = y;
  }

  // ─────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────
  const badge = makeText("SYNKRA AIOS · MARKETING SQUAD", 10, 400, C.muted, 300);
  badge.letterSpacing = { value: 3, unit: "PIXELS" };
  place(badge, ROOT_W / 2 - 140, Y);
  Y += 24;

  const title = makeText("Uhuru Squad", 40, 700, C.text, 400);
  place(title, ROOT_W / 2 - 180, Y);
  Y += 52;

  const subtitle = makeText("4 agentes · 16 tasks · 2 workflows · 4 clientes", 13, 400, C.muted, 400);
  place(subtitle, ROOT_W / 2 - 170, Y);
  Y += 48;

  // ─────────────────────────────────────────────
  // SQUAD ROOT NODE
  // ─────────────────────────────────────────────
  const rootCardW = 380;
  const rootCardX = ROOT_W / 2 - rootCardW / 2;

  const rootBg = makeRect(rootCardW, 110);
  rootBg.cornerRadius = 16;
  rootBg.fills = solid(C.surface);
  rootBg.strokes = solid(C.indigo, 0.6);
  rootBg.strokeWeight = 1;
  place(rootBg, rootCardX, Y);

  const rootIcon = makeText("🎯", 28, 400, C.text, 40);
  place(rootIcon, rootCardX + 165, Y + 10);

  const rootName = makeText("Uhuru Squad", 18, 700, C.text, 300);
  place(rootName, rootCardX + 130, Y + 42);

  const rootSub = makeText("Marketing Performance Agency", 12, 400, C.muted, 300);
  place(rootSub, rootCardX + 100, Y + 64);

  const rootTagMeta = makeText("Meta Ads", 10, 700, { r: 0.647, g: 0.706, b: 0.980 }, 70);
  const rootTagGoogle = makeText("Google Ads", 10, 700, { r: 0.647, g: 0.706, b: 0.980 }, 80);
  const rootTagLI = makeText("LinkedIn Ads", 10, 700, { r: 0.647, g: 0.706, b: 0.980 }, 90);
  place(rootTagMeta,   rootCardX + 42,  Y + 86);
  place(rootTagGoogle, rootCardX + 152, Y + 86);
  place(rootTagLI,     rootCardX + 272, Y + 86);

  Y += 130;

  // ── linha vertical do root ──
  const trunkLine = makeRect(2, 28);
  trunkLine.fills = solid(C.indigo);
  place(trunkLine, ROOT_W / 2 - 1, Y);
  Y += 28;

  // ── linha horizontal ──
  const hbarW = ROOT_W - 280;
  const hbarX = 140;
  const hBar = makeRect(hbarW, 2);
  hBar.fills = solid(C.border);
  place(hBar, hbarX, Y);

  // pontos coloridos nas extremidades
  const agentColors = [C.flux, C.nova, C.sage, C.finn];
  const agentXs = [hbarX, hbarX + Math.round(hbarW / 3), hbarX + Math.round(2 * hbarW / 3), hbarX + hbarW - 2];
  agentXs.forEach((ax, i) => {
    const dot = makeRect(2, 28);
    dot.fills = solid(agentColors[i]);
    place(dot, ax, Y + 2);
  });

  Y += 30;

  // ─────────────────────────────────────────────
  // AGENTES
  // ─────────────────────────────────────────────
  const agents = [
    {
      name: "Flux",
      id: "@flux",
      icon: "⚡",
      role: "Estratégia & Planejamento",
      color: C.flux,
      tasks: [
        { label: "Planejamento mensal",    cmd: "*planejar"   },
        { label: "Briefing de campanha",   cmd: "*briefing"   },
        { label: "Estratégia por canal",   cmd: "*estrategia" },
        { label: "Revisão de objetivos",   cmd: "*revisar"    },
      ],
      workflow: "Ciclo estratégico mensal",
    },
    {
      name: "Nova",
      id: "@nova",
      icon: "📊",
      role: "Análise de Performance",
      color: C.nova,
      tasks: [
        { label: "Analisar campanha",       cmd: "*analisar"    },
        { label: "Extrair dados",           cmd: "*extrair"     },
        { label: "Benchmark concorrentes",  cmd: "*benchmark"   },
        { label: "Diagnóstico criativos",   cmd: "*diagnostico" },
      ],
      workflow: "Análise de performance",
    },
    {
      name: "Sage",
      id: "@sage",
      icon: "📋",
      role: "Relatórios & Insights",
      color: C.sage,
      tasks: [
        { label: "Gerar relatório",        cmd: "*relatorio"   },
        { label: "Criar dashboard",        cmd: "*dashboard"   },
        { label: "Compilar insights",      cmd: "*insights"    },
        { label: "Apresentação cliente",   cmd: "*apresentar"  },
      ],
      workflow: "Relatório mensal cliente",
    },
    {
      name: "Finn",
      id: "@finn",
      icon: "💰",
      role: "Budget & Alocação",
      color: C.finn,
      tasks: [
        { label: "Alocar orçamento",      cmd: "*alocar"    },
        { label: "Monitorar gasto",       cmd: "*monitorar" },
        { label: "Otimizar bid",          cmd: "*otimizar"  },
        { label: "Forecast mensal",       cmd: "*forecast"  },
      ],
      workflow: "Revisão de orçamento",
    },
  ];

  const CARD_W = 330;
  const CARD_GAP = (ROOT_W - 80 - CARD_W * 4) / 3;
  const CARD_START_X = 40;

  agents.forEach((ag, i) => {
    const cx = CARD_START_X + i * (CARD_W + CARD_GAP);
    const CARD_H = 300;

    // Card background
    const cardBg = makeRect(CARD_W, CARD_H);
    cardBg.cornerRadius = 16;
    cardBg.fills = solid(C.surface);
    cardBg.strokes = solid(ag.color, 0.6);
    cardBg.strokeWeight = 1;
    place(cardBg, cx, Y);

    // Header background
    const headerH = 82;
    const headerBg = makeRect(CARD_W, headerH);
    headerBg.cornerRadius = 16;
    headerBg.fills = solid(ag.color, 0.08);
    place(headerBg, cx, Y);

    // Clip bottom corners of header
    const headerClip = makeRect(CARD_W, 8);
    headerClip.fills = solid(ag.color, 0.08);
    place(headerClip, cx, Y + headerH - 8);

    // Icon
    const icon = makeText(ag.icon, 24, 400, C.text, 36);
    place(icon, cx + 16, Y + 10);

    // Name
    const name = makeText(ag.name, 17, 700, C.text, 200);
    place(name, cx + 16, Y + 38);

    // Role
    const role = makeText(ag.role, 11, 400, C.muted, CARD_W - 20);
    place(role, cx + 16, Y + 58);

    // ID badge
    const idBadge = makeRect(60, 18);
    idBadge.cornerRadius = 9;
    idBadge.fills = solid(ag.color, 0.15);
    place(idBadge, cx + CARD_W - 76, Y + 14);
    const idText = makeText(ag.id, 10, 700, ag.color, 60);
    place(idText, cx + CARD_W - 73, Y + 18);

    // Tasks label
    let iy = Y + headerH + 12;
    const tasksLabel = makeText("TASKS", 9, 700, ag.color, 80);
    tasksLabel.letterSpacing = { value: 2, unit: "PIXELS" };
    place(tasksLabel, cx + 16, iy);
    iy += 18;

    // Task items
    ag.tasks.forEach((task) => {
      const taskBg = makeRect(CARD_W - 32, 26);
      taskBg.cornerRadius = 6;
      taskBg.fills = solid(C.text, 0.03);
      taskBg.strokes = solid(C.text, 0.06);
      taskBg.strokeWeight = 1;
      place(taskBg, cx + 16, iy);

      const dot = makeRect(6, 6);
      dot.cornerRadius = 3;
      dot.fills = solid(ag.color);
      place(dot, cx + 24, iy + 10);

      const taskText = makeText(task.label, 11, 400, C.text, 160);
      place(taskText, cx + 36, iy + 7);

      const cmdText = makeText(task.cmd, 10, 400, C.muted, 80);
      place(cmdText, cx + CARD_W - 96, iy + 8);

      iy += 30;
    });

    // Workflow
    iy += 4;
    const wfLabel = makeText("WORKFLOW", 9, 700, ag.color, 100);
    wfLabel.letterSpacing = { value: 2, unit: "PIXELS" };
    place(wfLabel, cx + 16, iy);
    iy += 16;

    const wfBg = makeRect(CARD_W - 32, 26);
    wfBg.cornerRadius = 6;
    wfBg.fills = solid(ag.color, 0.1);
    wfBg.strokes = solid(ag.color, 0.3);
    wfBg.strokeWeight = 1;
    place(wfBg, cx + 16, iy);

    const wfText = makeText("↻  " + ag.workflow, 11, 600, ag.color, CARD_W - 40);
    place(wfText, cx + 24, iy + 7);
  });

  Y += 320;

  // ─────────────────────────────────────────────
  // SHARED WORKFLOWS
  // ─────────────────────────────────────────────
  const sharedBg = makeRect(ROOT_W - 80, 160);
  sharedBg.cornerRadius = 16;
  sharedBg.fills = solid(C.surface);
  sharedBg.strokes = solid(C.border);
  sharedBg.strokeWeight = 1;
  place(sharedBg, 40, Y);

  const sharedLabel = makeText("WORKFLOWS COMPARTILHADOS", 9, 700, C.muted, 300);
  sharedLabel.letterSpacing = { value: 3, unit: "PIXELS" };
  place(sharedLabel, ROOT_W / 2 - 110, Y + 16);

  const workflows = [
    {
      icon: "🆕",
      name: "Onboarding de Cliente",
      cmd: "*new-client",
      desc: "Guia estruturado: Identificação → Operacional → Estratégia → Relacionamento → Cria pasta + profile",
    },
    {
      icon: "🔄",
      name: "Ciclo Mensal Completo",
      cmd: "*ciclo-mensal",
      desc: "Nova extrai → Nova analisa → Sage compila → Finn ajusta → Flux planeja → Sage apresenta",
    },
  ];

  const WF_W = (ROOT_W - 80 - 40) / 2 - 20;
  workflows.forEach((wf, i) => {
    const wx = 40 + 20 + i * (WF_W + 40);
    const wfCardBg = makeRect(WF_W, 112);
    wfCardBg.cornerRadius = 12;
    wfCardBg.fills = solid(C.text, 0.03);
    wfCardBg.strokes = solid(C.border);
    wfCardBg.strokeWeight = 1;
    place(wfCardBg, wx, Y + 36);

    const wfIcon = makeText(wf.icon, 22, 400, C.text, 30);
    place(wfIcon, wx + 16, Y + 46);

    const wfName = makeText(wf.name, 14, 700, C.text, WF_W - 60);
    place(wfName, wx + 50, Y + 46);

    const wfCmd = makeText(wf.cmd, 11, 400, C.indigo, 120);
    place(wfCmd, wx + 50, Y + 68);

    const wfDesc = makeText(wf.desc, 10, 400, C.muted, WF_W - 32);
    place(wfDesc, wx + 16, Y + 100);
  });

  Y += 180;

  // ─────────────────────────────────────────────
  // CLIENTES
  // ─────────────────────────────────────────────
  const clients = [
    { name: "Ocupacional",  channels: "Meta · Google · LinkedIn", color: C.flux },
    { name: "AssisteMed",   channels: "Meta · Google",             color: C.nova },
    { name: "Grupo BDG",    channels: "Meta · Google · LinkedIn",  color: C.sage },
    { name: "PRO DOMO",     channels: "Meta",                      color: C.finn },
  ];

  const clientsBg = makeRect(ROOT_W - 80, 68);
  clientsBg.cornerRadius = 12;
  clientsBg.fills = solid(C.text, 0.02);
  clientsBg.strokes = solid(C.border);
  clientsBg.strokeWeight = 1;
  place(clientsBg, 40, Y);

  const clientsLabel = makeText("CLIENTES ATIVOS", 9, 700, C.muted, 200);
  clientsLabel.letterSpacing = { value: 3, unit: "PIXELS" };
  place(clientsLabel, 56, Y + 8);

  const CL_W = 260;
  const CL_GAP = (ROOT_W - 80 - 4 * CL_W) / 5;
  clients.forEach((cl, i) => {
    const clx = 40 + CL_GAP + i * (CL_W + CL_GAP);

    const clDot = makeRect(8, 8);
    clDot.cornerRadius = 4;
    clDot.fills = solid(cl.color);
    place(clDot, clx, Y + 30);

    const clName = makeText(cl.name, 12, 700, C.text, 150);
    place(clName, clx + 16, Y + 26);

    const clCh = makeText(cl.channels, 10, 400, C.muted, 200);
    place(clCh, clx + 16, Y + 44);
  });

  // ── Ajustar altura do root ──
  root.resize(ROOT_W, Y + 100);

  figma.viewport.scrollAndZoomIntoView([root]);
  figma.ui.postMessage({ type: 'done' });
};
