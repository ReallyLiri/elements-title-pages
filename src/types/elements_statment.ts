export type ElementsStatementCode = {
  book: number;
  type?: "Proposition" | "Definition" | "Postulate" | "CommonNotion" | null;
  number?: number | null;
  note?: string | null;
}

export function toDisplay(code: ElementsStatementCode): string {
  const bookRoman = toRoman(code.book)
  if (!code.type) return bookRoman

  const typeAbbr = {
    Proposition: "Prop",
    Definition: "Def",
    Postulate: "Post",
    CommonNotion: "CN",
  }[code.type]

  let result = `${bookRoman}.${typeAbbr}`
  if (code.number != null) result += `.${code.number}`
  if (code.note) result += ` (${code.note})`

  return result
}

function toRoman(num: number): string {
  const map: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ]
  let result = ""
  for (const [value, numeral] of map) {
    while (num >= value) {
      result += numeral
      num -= value
    }
  }
  return result
}

function fromRoman(roman: string): number {
  const map: Record<string, number> = {
    M: 1000, CM: 900, D: 500, CD: 400,
    C: 100, XC: 90, L: 50, XL: 40,
    X: 10, IX: 9, V: 5, IV: 4, I: 1,
  }
  let i = 0, n = 0
  const s = roman.toUpperCase()
  while (i < s.length) {
    const two = s.slice(i, i + 2)
    if (map[two]) {
      n += map[two];
      i += 2;
      continue
    }
    const one = s[i]
    if (!map[one]) break
    n += map[one];
    i += 1
  }
  return n
}

export function parseElementsStatementCode(input: string): ElementsStatementCode {
  const raw = input.trim()
  const lower = raw.toLowerCase()

  // Book: try b<digits>, else leading Roman numerals like "iii."
  let book = NaN
  const bNum = lower.match(/b\s*(\d+)/)
  if (bNum) {
    book = parseInt(bNum[1], 10)
  } else {
    const rom = raw.match(/^\s*([IVXLCDM]+)\b/i)
    if (rom) book = fromRoman(rom[1])
  }

  // Type: accept p, d, po, cn, and dotted words prop, def, post, cn
  // We also capture number if it immediately follows
  const typeMap: Record<string, ElementsStatementCode["type"]> = {
    p: "Proposition",
    prop: "Proposition",
    d: "Definition",
    def: "Definition",
    po: "Postulate",
    post: "Postulate",
    cn: "CommonNotion",
  }

  let type: ElementsStatementCode["type"] = null
  let number: number | null = null

  // Try compact form like b6p6 or b1cn2
  let m = lower.match(/(cn|po|p|d)\s*\.?\s*(\d+)?/)
  if (!m) {
    // Try dotted word form like "III.Def.4" or "I.Prop.47"
    m = lower.match(/\b(prop|def|post|cn)\s*\.?\s*(\d+)?/)
  }
  if (m) {
    type = typeMap[m[1]]
    if (m[2] !== undefined) number = parseInt(m[2], 10)
  }

  // Note: anything in trailing parentheses
  let note: string | null = null
  const noteMatch = raw.match(/\(([^)]*)\)\s*$/)
  if (noteMatch) note = noteMatch[1].trim() || null

  return {book, type, number, note}
}

const TYPE_ORDER: Record<NonNullable<ElementsStatementCode["type"]>, number> = {
  Definition: 0,
  Postulate: 1,
  CommonNotion: 2,
  Proposition: 3,
}

export function compare(a: ElementsStatementCode, b: ElementsStatementCode): number {
  if (a.book == null && b.book == null) return 0
  if (a.book == null) return 1
  if (b.book == null) return -1

  // 1) book
  if (a.book !== b.book) return a.book - b.book

  // 2) type (entries with no type come first)
  const aHasType = a.type != null
  const bHasType = b.type != null
  if (aHasType !== bHasType) return aHasType ? 1 : -1
  if (aHasType && bHasType) {
    const ta = TYPE_ORDER[a.type!]
    const tb = TYPE_ORDER[b.type!]
    if (ta !== tb) return ta - tb
  }

  // 3) number (entries with no number come first)
  const aHasNum = a.number != null
  const bHasNum = b.number != null
  if (aHasNum !== bHasNum) return aHasNum ? 1 : -1
  if (aHasNum && bHasNum && a.number! !== b.number!) return a.number! - b.number!

  // 4) note (lexicographic, empty last)
  const an = a.note?.trim() ?? ""
  const bn = b.note?.trim() ?? ""
  if (an === bn) return 0
  if (!an) return 1
  if (!bn) return -1
  return an.localeCompare(bn, undefined, {numeric: true, sensitivity: "base"})
}

export const compareElementsStatementCode = (a: unknown, b: unknown): number => {
  return compare(parseElementsStatementCode(a as string), parseElementsStatementCode(b as string))
};
