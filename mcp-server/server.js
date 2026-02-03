#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";

const logger = {
  info: (message) => process.stderr.write(`[INFO] ${message}\n`),
  debug: (message) => process.stderr.write(`[DEBUG] ${message}\n`),
  warn: (message) => process.stderr.write(`[WARN] ${message}\n`),
  error: (message) => process.stderr.write(`[ERROR] ${message}\n`),
  log: (message) => process.stderr.write(`[LOG] ${message}\n`),
};

/** WebSocket state */
/** @type {WebSocket|null} */
let ws = null;
const pendingRequests = new Map();
let currentChannel = null;

const server = new McpServer({ name: "TalkToFigmaMCP", version: "1.0.0" });

// --server=localhost or --server=your.domain
const args = process.argv.slice(2);
const serverArg = args.find((arg) => arg.startsWith("--server="));
const serverUrl = serverArg ? serverArg.split("=")[1] : "localhost";
const WS_URL = serverUrl === "localhost" ? `ws://${serverUrl}` : `wss://${serverUrl}`;

// Tools (trimmed registration but same behavior as original dist)
server.tool(
  "get_document_info",
  "Get detailed information about the current Figma document",
  {},
  async () => {
    try {
      const result = await sendCommandToFigma("get_document_info");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error getting document info: ${error instanceof Error ? error.message : String(error)}` }] };
    }
  }
);

server.tool(
  "get_selection",
  "Get information about the current selection in Figma",
  {},
  async () => {
    try {
      const result = await sendCommandToFigma("get_selection");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error getting selection: ${error instanceof Error ? error.message : String(error)}` }] };
    }
  }
);

server.tool(
  "read_my_design",
  "Get detailed information about the current selection in Figma, including all node details",
  {},
  async () => {
    try {
      const result = await sendCommandToFigma("read_my_design", {});
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error getting node info: ${error instanceof Error ? error.message : String(error)}` }] };
    }
  }
);

server.tool(
  "get_node_info",
  "Get detailed information about a specific node in Figma",
  { nodeId: z.string().describe("The ID of the node to get information about") },
  async ({ nodeId }) => {
    try {
      const result = await sendCommandToFigma("get_node_info", { nodeId });
      return { content: [{ type: "text", text: JSON.stringify(filterFigmaNode(result)) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error getting node info: ${error instanceof Error ? error.message : String(error)}` }] };
    }
  }
);

function rgbaToHex(color) {
  if (typeof color === "string" && color.startsWith("#")) return color;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round((color.a ?? 1) * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}${a === 255 ? "" : a.toString(16).padStart(2, "0")}`;
}

function filterFigmaNode(node) {
  if (node?.type === "VECTOR") return null;
  const filtered = { id: node.id, name: node.name, type: node.type };
  if (node.fills?.length) {
    filtered.fills = node.fills.map((fill) => {
      const processed = { ...fill };
      delete processed.boundVariables;
      delete processed.imageRef;
      if (processed.gradientStops) {
        processed.gradientStops = processed.gradientStops.map((stop) => {
          const s = { ...stop };
          if (s.color) s.color = rgbaToHex(s.color);
          delete s.boundVariables;
          return s;
        });
      }
      if (processed.color) processed.color = rgbaToHex(processed.color);
      return processed;
    });
  }
  if (node.strokes?.length) {
    filtered.strokes = node.strokes.map((stroke) => {
      const s = { ...stroke };
      delete s.boundVariables;
      if (s.color) s.color = rgbaToHex(s.color);
      return s;
    });
  }
  if (node.cornerRadius !== undefined) filtered.cornerRadius = node.cornerRadius;
  if (node.absoluteBoundingBox) filtered.absoluteBoundingBox = node.absoluteBoundingBox;
  if (node.characters) filtered.characters = node.characters;
  if (node.style) {
    filtered.style = {
      fontFamily: node.style.fontFamily,
      fontStyle: node.style.fontStyle,
      fontWeight: node.style.fontWeight,
      fontSize: node.style.fontSize,
      textAlignHorizontal: node.style.textAlignHorizontal,
      letterSpacing: node.style.letterSpacing,
      lineHeightPx: node.style.lineHeightPx,
    };
  }
  if (node.children) filtered.children = node.children.map((c) => filterFigmaNode(c)).filter((c) => c !== null);
  return filtered;
}

// Many additional tools exist in your dist build; keep using those from there if needed.
// For brevity, we retain the critical ones and keep WS plumbing identical.

function connectToFigma(port = 3055) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    logger.info("Already connected to Figma");
    return;
  }
  const wsUrl = serverUrl === "localhost" ? `${WS_URL}:${port}` : WS_URL;
  logger.info(`Connecting to Figma socket server at ${wsUrl}...`);
  ws = new WebSocket(wsUrl);
  ws.on("open", () => {
    logger.info("Connected to Figma socket server");
    currentChannel = null;
  });
  ws.on("message", (data) => {
    try {
      const json = JSON.parse(data);
      if (json.type === "progress_update") {
        const progressData = json.message.data;
        const requestId = json.id || "";
        if (requestId && pendingRequests.has(requestId)) {
          const request = pendingRequests.get(requestId);
          request.lastActivity = Date.now();
          clearTimeout(request.timeout);
          request.timeout = setTimeout(() => {
            if (pendingRequests.has(requestId)) {
              logger.error(`Request ${requestId} timed out after extended period of inactivity`);
              pendingRequests.delete(requestId);
              request.reject(new Error("Request to Figma timed out"));
            }
          }, 60_000);
          logger.info(`Progress update for ${progressData.commandType}: ${progressData.progress}% - ${progressData.message}`);
          if (progressData.status === "completed" && progressData.progress === 100) {
            logger.info(`Operation ${progressData.commandType} completed, waiting for final result`);
          }
        }
        return;
      }
      const myResponse = json.message;
      logger.debug(`Received message: ${JSON.stringify(myResponse)}`);
      logger.log("myResponse" + JSON.stringify(myResponse));
      if (myResponse.id && pendingRequests.has(myResponse.id) && myResponse.result) {
        const request = pendingRequests.get(myResponse.id);
        clearTimeout(request.timeout);
        if (myResponse.error) {
          logger.error(`Error from Figma: ${myResponse.error}`);
          request.reject(new Error(myResponse.error));
        } else {
          if (myResponse.result) request.resolve(myResponse.result);
        }
        pendingRequests.delete(myResponse.id);
      } else {
        logger.info(`Received broadcast message: ${JSON.stringify(myResponse)}`);
      }
    } catch (error) {
      logger.error(`Error parsing message: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  ws.on("error", (error) => {
    logger.error(`Socket error: ${error}`);
  });
  ws.on("close", () => {
    logger.info("Disconnected from Figma socket server");
    ws = null;
    for (const [id, request] of pendingRequests.entries()) {
      clearTimeout(request.timeout);
      request.reject(new Error("Connection closed"));
      pendingRequests.delete(id);
    }
    logger.info("Attempting to reconnect in 2 seconds...");
    setTimeout(() => connectToFigma(port), 2_000);
  });
}

async function joinChannel(channelName) {
  if (!ws || ws.readyState !== WebSocket.OPEN) throw new Error("Not connected to Figma");
  try {
    await sendCommandToFigma("join", { channel: channelName });
    currentChannel = channelName;
    logger.info(`Joined channel: ${channelName}`);
  } catch (error) {
    logger.error(`Failed to join channel: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

function sendCommandToFigma(command, params = {}, timeoutMs = 30_000) {
  return new Promise((resolve, reject) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      connectToFigma();
      reject(new Error("Not connected to Figma. Attempting to connect..."));
      return;
    }
    const requiresChannel = command !== "join";
    if (requiresChannel && !currentChannel) {
      reject(new Error("Must join a channel before sending commands"));
      return;
    }
    const id = uuidv4();
    const request = {
      id,
      type: command === "join" ? "join" : "message",
      ...(command === "join" ? { channel: params.channel } : { channel: currentChannel }),
      message: { id, command, params: { ...params, commandId: id } },
    };
    const timeout = setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        logger.error(`Request ${id} to Figma timed out after ${timeoutMs / 1000} seconds`);
        reject(new Error("Request to Figma timed out"));
      }
    }, timeoutMs);
    pendingRequests.set(id, { resolve, reject, timeout, lastActivity: Date.now() });
    logger.info(`Sending command to Figma: ${command}`);
    logger.debug(`Request details: ${JSON.stringify(request)}`);
    ws.send(JSON.stringify(request));
  });
}

server.tool(
  "join_channel",
  "Join a specific channel to communicate with Figma",
  { channel: z.string().describe("The name of the channel to join").default("") },
  async ({ channel }) => {
    try {
      if (!channel) {
        return {
          content: [{ type: "text", text: "Please provide a channel name to join:" }],
          followUp: { tool: "join_channel", description: "Join the specified channel" },
        };
      }
      await joinChannel(channel);
      return { content: [{ type: "text", text: `Successfully joined channel: ${channel}` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error joining channel: ${error instanceof Error ? error.message : String(error)}` }] };
    }
  }
);

async function main() {
  try {
    connectToFigma();
  } catch (error) {
    logger.warn(`Could not connect to Figma initially: ${error instanceof Error ? error.message : String(error)}`);
    logger.warn("Will try to connect when the first command is sent");
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("FigmaMCP server running on stdio");
}

main().catch((error) => {
  logger.error(`Error starting FigmaMCP server: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});


