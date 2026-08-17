export type InlineNode =
  | { type: 'text'; text: string }
  | { type: 'bold'; children: InlineNode[] }
  | { type: 'italic'; children: InlineNode[] }
  | { type: 'code'; text: string }
  | { type: 'link'; href: string; children: InlineNode[] }
  | { type: 'image'; src: string; alt: string };

export type BlockNode =
  | { type: 'heading'; level: number; children: InlineNode[] }
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'quote'; children: InlineNode[] }
  | { type: 'list'; ordered: boolean; items: InlineNode[][] }
  | { type: 'code'; text: string }
  | { type: 'hr' }
  | { type: 'table'; rows: InlineNode[][][] };

const TOKEN_RE =
  /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|`([^`]+)`|!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\))/;

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let rest = text;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(rest))) {
    if (match.index > 0) nodes.push({ type: 'text', text: rest.slice(0, match.index) });
    if (match[2] !== undefined) nodes.push({ type: 'bold', children: parseInline(match[2]) });
    else if (match[3] !== undefined) nodes.push({ type: 'bold', children: parseInline(match[3]) });
    else if (match[4] !== undefined) nodes.push({ type: 'italic', children: parseInline(match[4]) });
    else if (match[5] !== undefined) nodes.push({ type: 'italic', children: parseInline(match[5]) });
    else if (match[6] !== undefined) nodes.push({ type: 'code', text: match[6] });
    else if (match[7] !== undefined) nodes.push({ type: 'image', src: match[8], alt: match[7] });
    else if (match[9] !== undefined) nodes.push({ type: 'link', href: match[10], children: parseInline(match[9]) });
    rest = rest.slice(match.index + match[0].length);
  }
  if (rest) nodes.push({ type: 'text', text: rest });
  return nodes;
}

export function parseMarkdown(markdown: string): BlockNode[] {
  const lines = String(markdown ?? '').replace(/\r\n/g, '\n').split('\n');
  const blocks: BlockNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    // blank
    if (!line.trim()) {
      index += 1;
      continue;
    }

    // fenced code block
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push({ type: 'code', text: code.join('\n') });
      continue;
    }

    // heading
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, children: parseInline(heading[2]) });
      index += 1;
      continue;
    }

    // hr
    if (/^(\s*[-*_]\s*){3,}$/.test(line)) {
      blocks.push({ type: 'hr' });
      index += 1;
      continue;
    }

    // quote (consecutive lines)
    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push({ type: 'quote', children: parseInline(quote.join('\n')) });
      continue;
    }

    // list (consecutive items)
    const listStart = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
    if (listStart) {
      const ordered = /\d+\./.test(listStart[2]);
      const indent = listStart[1].length;
      const items: InlineNode[][] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
        if (!item || item[1].length !== indent) break;
        items.push(parseInline(item[3]));
        index += 1;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    // table (| a | b |)
    if (/^\|.+\|$/.test(line.trim())) {
      const rows: InlineNode[][][] = [];
      while (index < lines.length && /^\|.+\|$/.test(lines[index].trim())) {
        const cells = lines[index]
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((cell) => cell.trim());
        const isSeparator = cells.every((cell) => /^:?-+:?$/.test(cell));
        if (!isSeparator) rows.push(cells.map((cell) => parseInline(cell)));
        index += 1;
      }
      blocks.push({ type: 'table', rows });
      continue;
    }

    // plain paragraph (merge following non-empty, non-special lines)
    const para: string[] = [line];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index];
      if (
        /^(#{1,6})\s/.test(next) ||
        /^```/.test(next) ||
        /^>\s?/.test(next) ||
        /^(\s*[-*+]|\d+\.)\s+/.test(next) ||
        /^\|.+\|$/.test(next.trim())
      ) {
        break;
      }
      para.push(next);
      index += 1;
    }
    blocks.push({ type: 'paragraph', children: parseInline(para.join('\n')) });
  }

  return blocks;
}
