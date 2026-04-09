import { readFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';

/**
 * Tiny dependency-free ZIP reader tuned for .pptx files.
 *
 * We only need to extract the central directory so we can iterate over the
 * slide XML files and media entries. .pptx files are standard ZIPs whose
 * individual entries are deflate-compressed (method 8) or stored (method 0).
 *
 * This is not a full ZIP implementation (no ZIP64, no encryption, no
 * multi-disk) but it handles every .pptx produced by PowerPoint, Keynote,
 * LibreOffice and pptxgenjs.
 */
export interface ZipEntry {
  name: string;
  data: Buffer;
}

const EOCD_SIGNATURE = 0x06054b50;
const CDIR_SIGNATURE = 0x02014b50;
const LFH_SIGNATURE = 0x04034b50;

export function readPptxEntries(filePath: string): ZipEntry[] {
  const buf = readFileSync(filePath);
  const eocdOffset = findEocd(buf);
  if (eocdOffset === -1) {
    throw new Error('Invalid .pptx: end-of-central-directory record not found');
  }

  const centralDirSize = buf.readUInt32LE(eocdOffset + 12);
  const centralDirOffset = buf.readUInt32LE(eocdOffset + 16);
  const entryCount = buf.readUInt16LE(eocdOffset + 10);

  const entries: ZipEntry[] = [];
  let p = centralDirOffset;
  const end = centralDirOffset + centralDirSize;

  for (let i = 0; i < entryCount && p < end; i++) {
    const sig = buf.readUInt32LE(p);
    if (sig !== CDIR_SIGNATURE) break;
    const compressionMethod = buf.readUInt16LE(p + 10);
    const compressedSize = buf.readUInt32LE(p + 20);
    const uncompressedSize = buf.readUInt32LE(p + 24);
    const fileNameLength = buf.readUInt16LE(p + 28);
    const extraFieldLength = buf.readUInt16LE(p + 30);
    const fileCommentLength = buf.readUInt16LE(p + 32);
    const localHeaderOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + fileNameLength);

    // Jump to the local file header to find the actual file data.
    const lfhSig = buf.readUInt32LE(localHeaderOffset);
    if (lfhSig !== LFH_SIGNATURE) {
      p += 46 + fileNameLength + extraFieldLength + fileCommentLength;
      continue;
    }
    const lfhFileNameLen = buf.readUInt16LE(localHeaderOffset + 26);
    const lfhExtraLen = buf.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + lfhFileNameLen + lfhExtraLen;
    const compressed = buf.subarray(dataStart, dataStart + compressedSize);
    let data: Buffer;
    if (compressionMethod === 0) {
      data = Buffer.from(compressed);
    } else if (compressionMethod === 8) {
      data = Buffer.from(inflateRawSync(compressed));
    } else {
      data = Buffer.alloc(0); // unsupported method - skip but keep the entry.
    }
    if (uncompressedSize > 0 && data.length !== uncompressedSize && compressionMethod === 8) {
      // Length mismatch can happen with data descriptors; we keep what we got.
    }
    entries.push({ name, data });

    p += 46 + fileNameLength + extraFieldLength + fileCommentLength;
  }

  return entries;
}

function findEocd(buf: Buffer): number {
  // Search backwards through at most 64KB + 22 bytes (max comment + record size).
  const maxBack = Math.min(buf.length, 65557);
  const start = buf.length - maxBack;
  for (let i = buf.length - 22; i >= start; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIGNATURE) return i;
  }
  return -1;
}
