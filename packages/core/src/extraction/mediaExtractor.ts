import { mkdirSync, writeFileSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import type { ExtractedMedia } from '@presentation-studio/schema';
import type { ZipEntry } from './pptxZip.js';

/**
 * Write every media entry of a pptx archive to disk and return metadata.
 */
export function extractMedia(entries: ZipEntry[], targetDir: string): ExtractedMedia[] {
  const out: ExtractedMedia[] = [];
  const mediaDir = join(targetDir, 'media');
  mkdirSync(mediaDir, { recursive: true });
  for (const entry of entries) {
    if (!entry.name.startsWith('ppt/media/')) continue;
    if (entry.data.length === 0) continue;
    const filename = basename(entry.name);
    const outPath = join(mediaDir, filename);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, entry.data);
    out.push({
      path: entry.name,
      filename,
      content_type: inferContentType(filename),
      size_bytes: entry.data.length,
      extracted_to: outPath,
    });
  }
  return out;
}

function inferContentType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.bmp')) return 'image/bmp';
  if (lower.endsWith('.tif') || lower.endsWith('.tiff')) return 'image/tiff';
  return 'application/octet-stream';
}
