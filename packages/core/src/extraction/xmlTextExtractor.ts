/**
 * Minimal XML text extraction for .pptx slides.
 *
 * A .pptx slide is OOXML - we don't need a full DOM parser. We stream the
 * XML, accumulate text inside <a:t>...</a:t> elements, and group the text
 * by enclosing <a:p>...</a:p> paragraph.
 *
 * The title is detected by looking for the first <p:sp> whose <p:nvSpPr>
 * block contains a <p:ph type="title"/> or <p:ph type="ctrTitle"/>.
 */
export interface ParsedSlideText {
  title?: string;
  blocks: string[];
}

export function extractTextFromSlideXml(xml: string): ParsedSlideText {
  const blocks: string[] = [];
  const shapeRegex = /<p:sp\b[\s\S]*?<\/p:sp>/g;
  let title: string | undefined;

  let match: RegExpExecArray | null;
  while ((match = shapeRegex.exec(xml)) !== null) {
    const shapeXml = match[0];
    const isTitle = /<p:ph[^>]*type="(title|ctrTitle)"/i.test(shapeXml);
    const paragraphs = extractParagraphs(shapeXml);
    const joined = paragraphs.join('\n').trim();
    if (!joined) continue;
    if (isTitle && !title) {
      title = joined;
    } else {
      blocks.push(joined);
    }
  }

  // If the file has no <p:sp> tags (edge cases), fall back to any <a:t>.
  if (blocks.length === 0 && !title) {
    const all = extractAllTextRuns(xml);
    if (all.length > 0) blocks.push(all.join(' '));
  }

  return { title, blocks };
}

function extractParagraphs(shapeXml: string): string[] {
  const paragraphs: string[] = [];
  const paragraphRegex = /<a:p\b[\s\S]*?<\/a:p>/g;
  let m: RegExpExecArray | null;
  while ((m = paragraphRegex.exec(shapeXml)) !== null) {
    const runs = extractRuns(m[0]);
    const text = runs.join('').trim();
    if (text) paragraphs.push(text);
  }
  return paragraphs;
}

function extractRuns(paragraphXml: string): string[] {
  const runs: string[] = [];
  const runRegex = /<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g;
  let m: RegExpExecArray | null;
  while ((m = runRegex.exec(paragraphXml)) !== null) {
    runs.push(decodeXmlEntities(m[1] ?? ''));
  }
  return runs;
}

function extractAllTextRuns(xml: string): string[] {
  const runs: string[] = [];
  const runRegex = /<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g;
  let m: RegExpExecArray | null;
  while ((m = runRegex.exec(xml)) !== null) {
    const text = decodeXmlEntities(m[1] ?? '').trim();
    if (text) runs.push(text);
  }
  return runs;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(parseInt(n, 10)));
}

/** Extract <dc:title>...</dc:title> and friends from docProps/core.xml. */
export function extractCoreMetadata(coreXml: string): Record<string, string> {
  const grab = (tag: string): string | undefined => {
    const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`).exec(coreXml);
    return m ? decodeXmlEntities(m[1] ?? '').trim() : undefined;
  };
  return stripUndefined({
    title: grab('dc:title'),
    creator: grab('dc:creator'),
    last_modified_by: grab('cp:lastModifiedBy'),
    created: grab('dcterms:created'),
    modified: grab('dcterms:modified'),
    revision: grab('cp:revision'),
    application: grab('Application'),
  });
}

function stripUndefined(obj: Record<string, string | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/** Parse the slide rels file and return the list of media targets used by a slide. */
export function extractSlideMediaRefs(relsXml: string): string[] {
  const refs: string[] = [];
  const relRegex = /<Relationship\s+[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = relRegex.exec(relsXml)) !== null) {
    const tag = m[0];
    const typeMatch = /Type="([^"]+)"/.exec(tag);
    const targetMatch = /Target="([^"]+)"/.exec(tag);
    if (!typeMatch || !targetMatch) continue;
    if (typeMatch[1]!.includes('image') || typeMatch[1]!.includes('media')) {
      refs.push(targetMatch[1]!);
    }
  }
  return refs;
}
