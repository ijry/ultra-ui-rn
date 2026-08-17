export type ParseNode =
  | { type: 'text'; text: string }
  | { type: 'element'; tag: string; attrs: Record<string, string>; children: ParseNode[] };

const VOID_TAGS = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source']);

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
  copy: '\u00a9',
  reg: '\u00ae',
  times: '\u00d7',
  middot: '\u00b7',
  hellip: '\u2026',
};

function decodeEntities(text: string): string {
  return text.replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (whole, entity: string) => {
    if (entity[0] === '#') {
      const code = entity[1] === 'x' || entity[1] === 'X' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[entity.toLowerCase()] ?? whole;
  });
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([\w-]+)\s*=\s*"([^"]*)"|([\w-]+)\s*=\s*'([^']*)'|([\w-]+)(?=\s|$)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw))) {
    if (match[1]) attrs[match[1]] = decodeEntities(match[2]);
    else if (match[3]) attrs[match[3]] = decodeEntities(match[4]);
    else if (match[5]) attrs[match[5]] = '';
  }
  return attrs;
}

const TAG_RE = /<\/?([a-zA-Z][\w-]*)((?:\s+[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[\w.-]+))?)*)\s*\/?>/g;

export function parseHtml(html: string): ParseNode[] {
  const root: ParseNode[] = [];
  const stack: ParseNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const pushText = (text: string) => {
    if (!text) return;
    const decoded = decodeEntities(text);
    const parent = stack[stack.length - 1];
    const node: ParseNode = { type: 'text', text: decoded };
    if (parent && parent.type === 'element') parent.children.push(node);
    else root.push(node);
  };

  while ((match = TAG_RE.exec(html))) {
    pushText(html.slice(lastIndex, match.index));
    lastIndex = TAG_RE.lastIndex;
    const raw = match[0];
    const tag = match[1].toLowerCase();
    const closing = raw[1] === '/';
    const selfClosing = VOID_TAGS.has(tag) || /\/>$/.test(raw.trim());

    if (closing) {
      // pop until matching tag
      for (let i = stack.length - 1; i >= 0; i -= 1) {
        const top = stack[i];
        if (top.type === 'element' && top.tag === tag) {
          stack.length = i;
          break;
        }
      }
      continue;
    }

    const node: ParseNode = { type: 'element', tag, attrs: parseAttrs(match[2] ?? ''), children: [] };
    const parent = stack[stack.length - 1];
    if (parent && parent.type === 'element') parent.children.push(node);
    else root.push(node);
    if (!selfClosing) stack.push(node);
  }

  pushText(html.slice(lastIndex));
  return root;
}
