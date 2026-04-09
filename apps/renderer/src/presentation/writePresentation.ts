import type pptxgen from 'pptxgenjs';
import { ensureDirForFile } from '../utils/fileSystem.js';

export async function writePresentation(pres: pptxgen, outputPath: string): Promise<string> {
  ensureDirForFile(outputPath);
  await pres.writeFile({ fileName: outputPath });
  return outputPath;
}
