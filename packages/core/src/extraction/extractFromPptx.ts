import { existsSync, mkdirSync } from 'node:fs';
import { basename } from 'node:path';
import type {
  ExtractionResult,
  ExtractedSlide,
  ExtractionMetadata,
} from '@presentation-studio/schema';
import { readPptxEntries, type ZipEntry } from './pptxZip.js';
import {
  extractTextFromSlideXml,
  extractCoreMetadata,
  extractSlideMediaRefs,
} from './xmlTextExtractor.js';
import { extractMedia } from './mediaExtractor.js';

export interface ExtractFromPptxOptions {
  pptxPath: string;
  outputDir: string;
  extractMedia?: boolean;
}

/**
 * Extracts structured content from a `.pptx` file.
 *
 * What we extract:
 *  - number of slides
 *  - per-slide title (best effort)
 *  - per-slide text blocks
 *  - media files (optional, extracted to disk)
 *  - core metadata (author, created, etc.)
 *
 * What we do NOT extract:
 *  - full layout reconstruction
 *  - shapes, colors, typography
 *
 * These are beyond the scope of basic reuse; we document this limitation in
 * README and extraction docs.
 */
export function extractFromPptx(opts: ExtractFromPptxOptions): ExtractionResult {
  if (!existsSync(opts.pptxPath)) {
    throw new Error(`.pptx file not found: ${opts.pptxPath}`);
  }
  const entries = readPptxEntries(opts.pptxPath);
  const warnings: string[] = [];

  mkdirSync(opts.outputDir, { recursive: true });

  // --- metadata ---
  const coreEntry = entries.find((e) => e.name === 'docProps/core.xml');
  const appEntry = entries.find((e) => e.name === 'docProps/app.xml');
  let metadata: ExtractionMetadata = {};
  if (coreEntry) {
    try {
      metadata = extractCoreMetadata(coreEntry.data.toString('utf8')) as ExtractionMetadata;
    } catch (err) {
      warnings.push(`Failed to parse docProps/core.xml: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    warnings.push('docProps/core.xml not present');
  }
  if (appEntry && !metadata.application) {
    try {
      const appXml = appEntry.data.toString('utf8');
      const appMatch = /<Application>([^<]+)<\/Application>/.exec(appXml);
      if (appMatch) metadata.application = appMatch[1];
    } catch {
      // ignore
    }
  }

  // --- slides ---
  const slideEntries = entries
    .filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.name))
    .sort((a, b) => {
      const na = Number((/slide(\d+)\.xml/.exec(a.name) ?? [])[1] ?? '0');
      const nb = Number((/slide(\d+)\.xml/.exec(b.name) ?? [])[1] ?? '0');
      return na - nb;
    });

  const slides: ExtractedSlide[] = [];
  for (let i = 0; i < slideEntries.length; i++) {
    const entry = slideEntries[i]!;
    const xml = entry.data.toString('utf8');
    let text;
    try {
      text = extractTextFromSlideXml(xml);
    } catch (err) {
      warnings.push(`Failed to parse ${entry.name}: ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }
    const relsEntry = entries.find((e) => e.name === `ppt/slides/_rels/${basename(entry.name)}.rels`);
    const media_refs = relsEntry ? extractSlideMediaRefs(relsEntry.data.toString('utf8')) : [];
    slides.push({
      index: i,
      slide_file: entry.name,
      title: text.title,
      text_blocks: text.blocks,
      notes: extractNotes(entries, i + 1),
      media_refs,
    });
  }

  // --- media ---
  const media = opts.extractMedia === false ? [] : extractMedia(entries, opts.outputDir);

  return {
    pptx_path: opts.pptxPath,
    slide_count: slides.length,
    slides,
    media,
    metadata,
    warnings,
    extracted_at: new Date().toISOString(),
  };
}

function extractNotes(entries: ZipEntry[], slideNumber: number): string | undefined {
  const notesEntry = entries.find((e) => e.name === `ppt/notesSlides/notesSlide${slideNumber}.xml`);
  if (!notesEntry) return undefined;
  const xml = notesEntry.data.toString('utf8');
  const parsed = extractTextFromSlideXml(xml);
  const text = parsed.blocks.join('\n').trim();
  return text || undefined;
}
