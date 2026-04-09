export interface RendererLogger {
  info: (msg: string, meta?: Record<string, unknown>) => void;
  warn: (msg: string, meta?: Record<string, unknown>) => void;
  error: (msg: string, meta?: Record<string, unknown>) => void;
}

export const silentLogger: RendererLogger = {
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

export const consoleLogger: RendererLogger = {
  info: (msg, meta) => console.log(`[renderer] ${msg}`, meta ?? ''),
  warn: (msg, meta) => console.warn(`[renderer] ${msg}`, meta ?? ''),
  error: (msg, meta) => console.error(`[renderer] ${msg}`, meta ?? ''),
};
