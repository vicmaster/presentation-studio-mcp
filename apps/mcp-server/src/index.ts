#!/usr/bin/env node
/**
 * presentation-studio-mcp - MCP server entry point.
 *
 * Wires up the PresentationStudioService, registers all tools and resources,
 * and exposes them via MCP (stdio transport) using the official SDK. If the
 * SDK is unavailable at runtime we still expose a JSON-RPC compatible loop
 * over stdin/stdout so the binary keeps working during local development.
 */
import { PresentationStudioService } from './server.js';
import { ToolRegistry } from './toolRegistry.js';
import { ResourceRegistry } from './resourceRegistry.js';
import { findRepoRootFromImportMeta } from './util/repo.js';

import { createBriefTool } from './tools/createBrief.js';
import { planDeckTool } from './tools/planDeck.js';
import { normalizeDeckSpecTool } from './tools/normalizeDeckSpec.js';
import { prepareAssetsTool } from './tools/prepareAssets.js';
import { renderDeckTool } from './tools/renderDeck.js';
import { previewDeckTool } from './tools/previewDeck.js';
import { auditDeckTool } from './tools/auditDeck.js';
import { updateSlideTool } from './tools/updateSlide.js';
import { extractFromPptxTool } from './tools/extractFromPptx.js';
import { listTemplatesTool } from './tools/listTemplates.js';
import { listBrandsTool } from './tools/listBrands.js';
import { getDeckSpecTool } from './tools/getDeckSpec.js';
import { saveDeckSpecTool } from './tools/saveDeckSpec.js';

import { brandResourceProvider } from './resources/brandResource.js';
import { templateResourceProvider } from './resources/templateResource.js';
import { currentDeckResource } from './resources/deckResource.js';
import { currentPreviewResource } from './resources/previewResource.js';
import { currentAuditResource } from './resources/auditResource.js';

function buildService(): {
  service: PresentationStudioService;
  tools: ToolRegistry;
  resources: ResourceRegistry;
} {
  const repoRoot = findRepoRootFromImportMeta();
  const service = new PresentationStudioService({ repoRoot });

  const tools = new ToolRegistry();
  tools.register(createBriefTool);
  tools.register(planDeckTool);
  tools.register(normalizeDeckSpecTool);
  tools.register(prepareAssetsTool);
  tools.register(renderDeckTool);
  tools.register(previewDeckTool);
  tools.register(auditDeckTool);
  tools.register(updateSlideTool);
  tools.register(extractFromPptxTool);
  tools.register(listTemplatesTool);
  tools.register(listBrandsTool);
  tools.register(getDeckSpecTool);
  tools.register(saveDeckSpecTool);

  const resources = new ResourceRegistry();
  // Dynamic providers: one resource per brand / template currently registered.
  resources.registerDynamic(brandResourceProvider);
  resources.registerDynamic(templateResourceProvider);
  // Static resources bound to the session's current deck.
  resources.registerStatic(currentDeckResource);
  resources.registerStatic(currentPreviewResource);
  resources.registerStatic(currentAuditResource);

  return { service, tools, resources };
}

async function startWithMcpSdk(): Promise<boolean> {
  try {
    const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
    const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
    const {
      ListToolsRequestSchema,
      CallToolRequestSchema,
      ListResourcesRequestSchema,
      ReadResourceRequestSchema,
    } = await import('@modelcontextprotocol/sdk/types.js');

    const { service, tools, resources } = buildService();
    const server = new Server(
      { name: 'presentation-studio-mcp', version: '0.1.0' },
      { capabilities: { tools: {}, resources: {} } },
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: tools.list(),
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;
      try {
        const result = await tools.call(service, name, args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: err instanceof Error ? err.message : String(err),
            },
          ],
        };
      }
    });

    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: resources.list(service),
    }));

    server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
      const uri = request.params.uri as string;
      const { mimeType, text } = await resources.read(service, uri);
      return { contents: [{ uri, mimeType, text }] };
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
    // eslint-disable-next-line no-console
    console.error(`[presentation-studio-mcp] MCP server ready via stdio`);
    return true;
  } catch (err) {
    console.error(
      `[presentation-studio-mcp] MCP SDK unavailable, starting fallback stdio loop: ${err instanceof Error ? err.message : String(err)}`,
    );
    return false;
  }
}

/**
 * Minimal JSON-RPC 2.0 fallback so the server still responds to the four
 * core methods even if @modelcontextprotocol/sdk is not installed.
 * Supported methods: tools/list, tools/call, resources/list, resources/read.
 */
async function startFallback(): Promise<void> {
  const { service, tools, resources } = buildService();
  process.stdin.setEncoding('utf-8');
  let buffer = '';
  const send = (msg: unknown): void => {
    process.stdout.write(JSON.stringify(msg) + '\n');
  };

  process.stdin.on('data', async (chunk) => {
    buffer += chunk;
    let nl = buffer.indexOf('\n');
    while (nl >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      nl = buffer.indexOf('\n');
      if (!line) continue;
      let req: any;
      try {
        req = JSON.parse(line);
      } catch (err) {
        send({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null });
        continue;
      }
      const { id, method, params } = req;
      try {
        if (method === 'tools/list') {
          send({ jsonrpc: '2.0', id, result: { tools: tools.list() } });
        } else if (method === 'tools/call') {
          const result = await tools.call(service, params?.name, params?.arguments);
          send({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            },
          });
        } else if (method === 'resources/list') {
          send({ jsonrpc: '2.0', id, result: { resources: resources.list(service) } });
        } else if (method === 'resources/read') {
          const { mimeType, text } = await resources.read(service, params?.uri);
          send({
            jsonrpc: '2.0',
            id,
            result: { contents: [{ uri: params?.uri, mimeType, text }] },
          });
        } else {
          send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
        }
      } catch (err) {
        send({
          jsonrpc: '2.0',
          id,
          error: { code: -32000, message: err instanceof Error ? err.message : String(err) },
        });
      }
    }
  });

  process.stdin.on('end', () => process.exit(0));
  console.error(`[presentation-studio-mcp] fallback stdio loop ready (no MCP SDK)`);
}

async function main(): Promise<void> {
  const ok = await startWithMcpSdk();
  if (!ok) await startFallback();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
