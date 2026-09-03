type LexicalNode = {
  type?: string
  text?: string
  children?: LexicalNode[]
}

type LexicalRoot = {
  root?: {
    children?: LexicalNode[]
  }
}

function walk(nodes: LexicalNode[] | undefined, parts: string[]): void {
  if (!nodes?.length) return

  for (const node of nodes) {
    if (typeof node.text === 'string' && node.text.length > 0) {
      parts.push(node.text)
    }
    if (node.children?.length) {
      walk(node.children, parts)
    }
  }
}

/** Extract plain text from a Payload Lexical rich-text value. */
export function lexicalToPlainText(value: unknown): string {
  if (!value || typeof value !== 'object') return ''

  const parts: string[] = []
  walk((value as LexicalRoot).root?.children, parts)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}
