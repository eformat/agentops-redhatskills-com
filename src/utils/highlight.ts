type Token = { type: string; value: string };

const KEYWORDS = new Set([
  'import', 'export', 'from', 'default', 'function', 'return', 'const', 'let', 'var',
  'if', 'else', 'for', 'while', 'class', 'extends', 'new', 'this', 'typeof', 'instanceof',
  'interface', 'type', 'as', 'async', 'await',
]);

const CONSTANTS = new Set(['true', 'false', 'null', 'undefined']);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Whitespace
    if (/\s/.test(code[i])) {
      let value = '';
      while (i < code.length && /\s/.test(code[i])) {
        value += code[i++];
      }
      tokens.push({ type: 'whitespace', value });
      continue;
    }

    // Single-line comment
    if (code[i] === '/' && code[i + 1] === '/') {
      let value = '';
      while (i < code.length && code[i] !== '\n') {
        value += code[i++];
      }
      tokens.push({ type: 'comment', value });
      continue;
    }

    // Multi-line comment
    if (code[i] === '/' && code[i + 1] === '*') {
      let value = '/*';
      i += 2;
      while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) {
        value += code[i++];
      }
      value += '*/';
      i += 2;
      tokens.push({ type: 'comment', value });
      continue;
    }

    // String (single or double quotes)
    if (code[i] === "'" || code[i] === '"') {
      const quote = code[i];
      let value = quote;
      i++;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === '\\') {
          value += code[i++];
        }
        value += code[i++];
      }
      if (i < code.length) value += code[i++];
      tokens.push({ type: 'string', value });
      continue;
    }

    // Template literal
    if (code[i] === '`') {
      let value = '`';
      i++;
      while (i < code.length && code[i] !== '`') {
        if (code[i] === '\\') {
          value += code[i++];
        }
        value += code[i++];
      }
      if (i < code.length) value += code[i++];
      tokens.push({ type: 'string', value });
      continue;
    }

    // Numbers
    if (/[0-9]/.test(code[i])) {
      let value = '';
      while (i < code.length && /[0-9.]/.test(code[i])) {
        value += code[i++];
      }
      tokens.push({ type: 'number', value });
      continue;
    }

    // JSX tag: < followed by uppercase or lowercase
    if (code[i] === '<') {
      const isClosing = code[i + 1] === '/';
      const start = isClosing ? i + 2 : i + 1;
      if (start < code.length && /[A-Za-z]/.test(code[start])) {
        let tagName = '';
        let j = start;
        while (j < code.length && /[A-Za-z0-9.]/.test(code[j])) {
          tagName += code[j++];
        }
        if (tagName) {
          tokens.push({ type: 'punctuation', value: isClosing ? '</' : '<' });
          i = isClosing ? i + 2 : i + 1;
          const isComponent = /[A-Z]/.test(tagName[0]);
          tokens.push({ type: isComponent ? 'component' : 'tag', value: tagName });
          i = j;
          continue;
        }
      }
      tokens.push({ type: 'punctuation', value: '<' });
      i++;
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_$]/.test(code[i])) {
      let value = '';
      while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) {
        value += code[i++];
      }

      // Check if it's a JSX attribute (followed by =)
      let j = i;
      while (j < code.length && code[j] === ' ') j++;
      if (code[j] === '=' && code[j + 1] !== '=') {
        tokens.push({ type: 'attr', value });
        continue;
      }

      if (KEYWORDS.has(value)) {
        tokens.push({ type: 'keyword', value });
      } else if (CONSTANTS.has(value)) {
        tokens.push({ type: 'number', value });
      } else {
        tokens.push({ type: 'identifier', value });
      }
      continue;
    }

    // Operators and punctuation
    tokens.push({ type: 'punctuation', value: code[i] });
    i++;
  }

  return tokens;
}

const COLOR_MAP: Record<string, string> = {
  keyword: 'var(--color-syntax-keyword)',
  string: 'var(--color-syntax-string)',
  comment: 'var(--color-syntax-comment)',
  tag: 'var(--color-syntax-tag)',
  component: 'var(--color-syntax-entity)',
  attr: 'var(--color-syntax-attr)',
  number: 'var(--color-syntax-number)',
};

export function highlight(code: string): string {
  const tokens = tokenize(code);
  return tokens
    .map((token) => {
      const escaped = escapeHtml(token.value);
      const color = COLOR_MAP[token.type];
      if (color) {
        return `<span style="color:${color}">${escaped}</span>`;
      }
      return escaped;
    })
    .join('');
}
