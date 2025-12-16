/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

export const AGENT_METHODS = {
  authenticate: 'authenticate',
  initialize: 'initialize',
  session_cancel: 'session/cancel',
  session_load: 'session/load',
  session_new: 'session/new',
  session_prompt: 'session/prompt',
  session_list: 'session/list',
  session_set_mode: 'session/set_mode',
};

export const CLIENT_METHODS = {
  fs_read_text_file: 'fs/read_text_file',
  fs_write_text_file: 'fs/write_text_file',
  session_request_permission: 'session/request_permission',
  session_update: 'session/update',
};

export const PROTOCOL_VERSION = 1;

export type WriteTextFileRequest = z.infer<typeof writeTextFileRequestSchema>;

export type ReadTextFileRequest = z.infer<typeof readTextFileRequestSchema>;

export type PermissionOptionKind = z.infer<typeof permissionOptionKindSchema>;

export type Role = z.infer<typeof roleSchema>;

export type TextResourceContents = z.infer<typeof textResourceContentsSchema>;

export type BlobResourceContents = z.infer<typeof blobResourceContentsSchema>;

export type ToolKind = z.infer<typeof toolKindSchema>;

export type ToolCallStatus = z.infer<typeof toolCallStatusSchema>;

export type WriteTextFileResponse = z.infer<typeof writeTextFileResponseSchema>;

export type ReadTextFileResponse = z.infer<typeof readTextFileResponseSchema>;

export type RequestPermissionOutcome = z.infer<
  typeof requestPermissionOutcomeSchema
>;
export type SessionListItem = z.infer<typeof sessionListItemSchema>;
export type ListSessionsRequest = z.infer<typeof listSessionsRequestSchema>;
export type ListSessionsResponse = z.infer<typeof listSessionsResponseSchema>;

export type CancelNotification = z.infer<typeof cancelNotificationSchema>;

export type AuthenticateRequest = z.infer<typeof authenticateRequestSchema>;

export type AuthenticateResponse = z.infer<typeof authenticateResponseSchema>;

export type NewSessionResponse = z.infer<typeof newSessionResponseSchema>;

export type LoadSessionResponse = z.infer<typeof loadSessionResponseSchema>;

export type StopReason = z.infer<typeof stopReasonSchema>;

export type PromptResponse = z.infer<typeof promptResponseSchema>;

export type ToolCallLocation = z.infer<typeof toolCallLocationSchema>;

export type PlanEntry = z.infer<typeof planEntrySchema>;

export type PermissionOption = z.infer<typeof permissionOptionSchema>;

export type Annotations = z.infer<typeof annotationsSchema>;

export type RequestPermissionResponse = z.infer<
  typeof requestPermissionResponseSchema
>;

export type FileSystemCapability = z.infer<typeof fileSystemCapabilitySchema>;

export type EnvVariable = z.infer<typeof envVariableSchema>;

export type HttpHeader = z.infer<typeof httpHeaderSchema>;

export type McpServer = z.infer<typeof mcpServerSchema>;

export type AgentCapabilities = z.infer<typeof agentCapabilitiesSchema>;

export type AuthMethod = z.infer<typeof authMethodSchema>;

export type ModeInfo = z.infer<typeof modeInfoSchema>;

export type ModesData = z.infer<typeof modesDataSchema>;

export type AgentInfo = z.infer<typeof agentInfoSchema>;

export type PromptCapabilities = z.infer<typeof promptCapabilitiesSchema>;

export type ClientResponse = z.infer<typeof clientResponseSchema>;

export type ClientNotification = z.infer<typeof clientNotificationSchema>;

export type EmbeddedResourceResource = z.infer<
  typeof embeddedResourceResourceSchema
>;

export type NewSessionRequest = z.infer<typeof newSessionRequestSchema>;

export type LoadSessionRequest = z.infer<typeof loadSessionRequestSchema>;

export type InitializeResponse = z.infer<typeof initializeResponseSchema>;

export type ContentBlock = z.infer<typeof contentBlockSchema>;

export type ToolCallContent = z.infer<typeof toolCallContentSchema>;

export type ToolCall = z.infer<typeof toolCallSchema>;

export type ClientCapabilities = z.infer<typeof clientCapabilitiesSchema>;

export type PromptRequest = z.infer<typeof promptRequestSchema>;

export type SessionUpdate = z.infer<typeof sessionUpdateSchema>;

export type AgentResponse = z.infer<typeof agentResponseSchema>;

export type RequestPermissionRequest = z.infer<
  typeof requestPermissionRequestSchema
>;

export type InitializeRequest = z.infer<typeof initializeRequestSchema>;

export type SessionNotification = z.infer<typeof sessionNotificationSchema>;

export type ClientRequest = z.infer<typeof clientRequestSchema>;

export type AgentRequest = z.infer<typeof agentRequestSchema>;

export type AgentNotification = z.infer<typeof agentNotificationSchema>;

export type ApprovalModeValue = z.infer<typeof approvalModeValueSchema>;

export type SetModeRequest = z.infer<typeof setModeRequestSchema>;

export type SetModeResponse = z.infer<typeof setModeResponseSchema>;

export type AvailableCommandInput = z.infer<typeof availableCommandInputSchema>;

export type AvailableCommand = z.infer<typeof availableCommandSchema>;

export type AvailableCommandsUpdate = z.infer<
  typeof availableCommandsUpdateSchema
>;

export const writeTextFileRequestSchema = z.object({
  content: z.string(),
  path: z.string(),
  sessionId: z.string(),
});

export const readTextFileRequestSchema = z.object({
  limit: z.number().optional().nullable(),
  line: z.number().optional().nullable(),
  path: z.string(),
  sessionId: z.string(),
});

export const permissionOptionKindSchema = z.union([
  z.literal('allow_once'),
  z.literal('allow_always'),
  z.literal('reject_once'),
  z.literal('reject_always'),
]);

export const roleSchema = z.union([z.literal('assistant'), z.literal('user')]);

export const textResourceContentsSchema = z.object({
  mimeType: z.string().optional().nullable(),
  text: z.string(),
  uri: z.string(),
});

export const blobResourceContentsSchema = z.object({
  blob: z.string(),
  mimeType: z.string().optional().nullable(),
  uri: z.string(),
});

export const toolKindSchema = z.union([
  z.literal('read'),
  z.literal('edit'),
  z.literal('delete'),
  z.literal('move'),
  z.literal('search'),
  z.literal('execute'),
  z.literal('think'),
  z.literal('fetch'),
  z.literal('switch_mode'),
  z.literal('other'),
]);

export const toolCallStatusSchema = z.union([
  z.literal('pending'),
  z.literal('in_progress'),
  z.literal('completed'),
  z.literal('failed'),
]);

export const writeTextFileResponseSchema = z.null();

export const readTextFileResponseSchema = z.object({
  content: z.string(),
});

export const requestPermissionOutcomeSchema = z.union([
  z.object({
    outcome: z.literal('cancelled'),
  }),
  z.object({
    optionId: z.string(),
    outcome: z.literal('selected'),
  }),
]);

export const cancelNotificationSchema = z.object({
  sessionId: z.string(),
});

export const approvalModeValueSchema = z.union([
  z.literal('plan'),
  z.literal('default'),
  z.literal('auto-edit'),
  z.literal('yolo'),
]);

export const setModeRequestSchema = z.object({
  sessionId: z.string(),
  modeId: approvalModeValueSchema,
});

export const setModeResponseSchema = z.object({
  modeId: approvalModeValueSchema,
});

export const authenticateRequestSchema = z.object({
  methodId: z.string(),
});

export const authenticateResponseSchema = z.null();

export const newSessionResponseSchema = z.object({
  sessionId: z.string(),
});

export const loadSessionResponseSchema = z.null();

// SessionInfo schema following official ACP protocol v0.10.0
// See: https://agentclientprotocol.com/protocol/session-setup#listing-sessions
// NOTE: ACP uses camelCase for JSON keys (serde rename_all = "camelCase")
export const sessionListItemSchema = z.object({
  sessionId: z.string(),
  cwd: z.string(),
  title: z.string().optional(),
  updatedAt: z.string().optional(),
});

// ListSessionsResponse schema following official ACP protocol v0.10.0
export const listSessionsResponseSchema = z.object({
  sessions: z.array(sessionListItemSchema),
  nextCursor: z.string().optional(),
});

export const listSessionsRequestSchema = z.object({
  cursor: z.number().optional(),
  cwd: z.string(),
  size: z.number().optional(),
});

export const stopReasonSchema = z.union([
  z.literal('end_turn'),
  z.literal('max_tokens'),
  z.literal('refusal'),
  z.literal('cancelled'),
]);

export const promptResponseSchema = z.object({
  stopReason: stopReasonSchema,
});

export const toolCallLocationSchema = z.object({
  line: z.number().optional().nullable(),
  path: z.string(),
});

export const planEntrySchema = z.object({
  content: z.string(),
  priority: z.union([z.literal('high'), z.literal('medium'), z.literal('low')]),
  status: z.union([
    z.literal('pending'),
    z.literal('in_progress'),
    z.literal('completed'),
  ]),
});

export const permissionOptionSchema = z.object({
  kind: permissionOptionKindSchema,
  name: z.string(),
  optionId: z.string(),
});

export const annotationsSchema = z.object({
  audience: z.array(roleSchema).optional().nullable(),
  lastModified: z.string().optional().nullable(),
  priority: z.number().optional().nullable(),
});

export const requestPermissionResponseSchema = z.object({
  outcome: requestPermissionOutcomeSchema,
});

export const fileSystemCapabilitySchema = z.object({
  readTextFile: z.boolean(),
  writeTextFile: z.boolean(),
});

export const envVariableSchema = z.object({
  name: z.string(),
  value: z.string(),
});

// HTTP header for MCP servers
// See: https://agentclientprotocol.com/protocol/draft/schema#httpheader
export const httpHeaderSchema = z.object({
  name: z.string(),
  value: z.string(),
});

// Stdio MCP server configuration (untagged in ACP spec)
// See: https://agentclientprotocol.com/protocol/draft/schema#mcpserverstdio
export const mcpServerStdioSchema = z.object({
  name: z.string(),
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.array(envVariableSchema).optional(),
});

// HTTP MCP server configuration (tagged with type: "http")
// See: https://agentclientprotocol.com/protocol/draft/schema#mcpserverhttp
export const mcpServerHttpSchema = z.object({
  type: z.literal('http'),
  name: z.string(),
  url: z.string(),
  headers: z.array(httpHeaderSchema),
});

// SSE MCP server configuration (tagged with type: "sse")
// See: https://agentclientprotocol.com/protocol/draft/schema#mcpserversse
export const mcpServerSseSchema = z.object({
  type: z.literal('sse'),
  name: z.string(),
  url: z.string(),
  headers: z.array(httpHeaderSchema),
});

// MCP server configuration - discriminated union matching ACP spec.
// HTTP and SSE use tagged format with "type" field.
// Stdio is untagged (no "type" field) - must be checked last in the union.
export const mcpServerSchema = z.union([
  mcpServerHttpSchema,
  mcpServerSseSchema,
  mcpServerStdioSchema,
]);

export const promptCapabilitiesSchema = z.object({
  audio: z.boolean().optional(),
  embeddedContext: z.boolean().optional(),
  image: z.boolean().optional(),
});

// SessionListCapabilities: empty object indicates session/list is supported
export const sessionListCapabilitiesSchema = z.object({});

// SessionCapabilities: advertise which session features are supported
export const sessionCapabilitiesSchema = z.object({
  list: sessionListCapabilitiesSchema.optional(),
});

export const agentCapabilitiesSchema = z.object({
  loadSession: z.boolean().optional(),
  promptCapabilities: promptCapabilitiesSchema.optional(),
  sessionCapabilities: sessionCapabilitiesSchema.optional(),
});

export const authMethodSchema = z.object({
  description: z.string().nullable(),
  id: z.string(),
  name: z.string(),
});

export const clientResponseSchema = z.union([
  writeTextFileResponseSchema,
  readTextFileResponseSchema,
  requestPermissionResponseSchema,
]);

export const clientNotificationSchema = cancelNotificationSchema;

export const embeddedResourceResourceSchema = z.union([
  textResourceContentsSchema,
  blobResourceContentsSchema,
]);

export const newSessionRequestSchema = z.object({
  cwd: z.string(),
  mcpServers: z.array(mcpServerSchema),
});

export const loadSessionRequestSchema = z.object({
  cwd: z.string(),
  mcpServers: z.array(mcpServerSchema),
  sessionId: z.string(),
});

export const modeInfoSchema = z.object({
  id: approvalModeValueSchema,
  name: z.string(),
  description: z.string(),
});

export const modesDataSchema = z.object({
  currentModeId: approvalModeValueSchema,
  availableModes: z.array(modeInfoSchema),
});

export const agentInfoSchema = z.object({
  name: z.string(),
  title: z.string(),
  version: z.string(),
});

export const initializeResponseSchema = z.object({
  agentCapabilities: agentCapabilitiesSchema,
  agentInfo: agentInfoSchema,
  authMethods: z.array(authMethodSchema),
  modes: modesDataSchema,
  protocolVersion: z.number(),
});

export const contentBlockSchema = z.union([
  z.object({
    annotations: annotationsSchema.optional().nullable(),
    text: z.string(),
    type: z.literal('text'),
  }),
  z.object({
    annotations: annotationsSchema.optional().nullable(),
    data: z.string(),
    mimeType: z.string(),
    type: z.literal('image'),
  }),
  z.object({
    annotations: annotationsSchema.optional().nullable(),
    data: z.string(),
    mimeType: z.string(),
    type: z.literal('audio'),
  }),
  z.object({
    annotations: annotationsSchema.optional().nullable(),
    description: z.string().optional().nullable(),
    mimeType: z.string().optional().nullable(),
    name: z.string(),
    size: z.number().optional().nullable(),
    title: z.string().optional().nullable(),
    type: z.literal('resource_link'),
    uri: z.string(),
  }),
  z.object({
    annotations: annotationsSchema.optional().nullable(),
    resource: embeddedResourceResourceSchema,
    type: z.literal('resource'),
  }),
]);

export const toolCallContentSchema = z.union([
  z.object({
    content: contentBlockSchema,
    type: z.literal('content'),
  }),
  z.object({
    newText: z.string(),
    oldText: z.string().nullable(),
    path: z.string(),
    type: z.literal('diff'),
  }),
]);

export const toolCallSchema = z.object({
  content: z.array(toolCallContentSchema).optional(),
  kind: toolKindSchema,
  locations: z.array(toolCallLocationSchema).optional(),
  rawInput: z.unknown().optional(),
  status: toolCallStatusSchema,
  title: z.string(),
  toolCallId: z.string(),
});

export const clientCapabilitiesSchema = z.object({
  fs: fileSystemCapabilitySchema,
});

export const promptRequestSchema = z.object({
  prompt: z.array(contentBlockSchema),
  sessionId: z.string(),
});

export const availableCommandInputSchema = z.object({
  hint: z.string(),
});

export const availableCommandSchema = z.object({
  description: z.string(),
  input: availableCommandInputSchema.nullable().optional(),
  name: z.string(),
});

export const availableCommandsUpdateSchema = z.object({
  availableCommands: z.array(availableCommandSchema),
  sessionUpdate: z.literal('available_commands_update'),
});

export const currentModeUpdateSchema = z.object({
  sessionUpdate: z.literal('current_mode_update'),
  modeId: approvalModeValueSchema,
});

export type CurrentModeUpdate = z.infer<typeof currentModeUpdateSchema>;

export const sessionUpdateSchema = z.union([
  z.object({
    content: contentBlockSchema,
    sessionUpdate: z.literal('user_message_chunk'),
  }),
  z.object({
    content: contentBlockSchema,
    sessionUpdate: z.literal('agent_message_chunk'),
  }),
  z.object({
    content: contentBlockSchema,
    sessionUpdate: z.literal('agent_thought_chunk'),
  }),
  z.object({
    content: z.array(toolCallContentSchema).optional(),
    kind: toolKindSchema,
    locations: z.array(toolCallLocationSchema).optional(),
    rawInput: z.unknown().optional(),
    sessionUpdate: z.literal('tool_call'),
    status: toolCallStatusSchema,
    title: z.string(),
    toolCallId: z.string(),
  }),
  z.object({
    content: z.array(toolCallContentSchema).optional().nullable(),
    kind: toolKindSchema.optional().nullable(),
    locations: z.array(toolCallLocationSchema).optional().nullable(),
    rawInput: z.unknown().optional(),
    rawOutput: z.unknown().optional(),
    sessionUpdate: z.literal('tool_call_update'),
    status: toolCallStatusSchema.optional().nullable(),
    title: z.string().optional().nullable(),
    toolCallId: z.string(),
  }),
  z.object({
    entries: z.array(planEntrySchema),
    sessionUpdate: z.literal('plan'),
  }),
  currentModeUpdateSchema,
  availableCommandsUpdateSchema,
]);

export const agentResponseSchema = z.union([
  initializeResponseSchema,
  authenticateResponseSchema,
  newSessionResponseSchema,
  loadSessionResponseSchema,
  promptResponseSchema,
  listSessionsResponseSchema,
  setModeResponseSchema,
]);

export const requestPermissionRequestSchema = z.object({
  options: z.array(permissionOptionSchema),
  sessionId: z.string(),
  toolCall: toolCallSchema,
});

export const initializeRequestSchema = z.object({
  clientCapabilities: clientCapabilitiesSchema,
  protocolVersion: z.number(),
});

export const sessionNotificationSchema = z.object({
  sessionId: z.string(),
  update: sessionUpdateSchema,
});

export const clientRequestSchema = z.union([
  writeTextFileRequestSchema,
  readTextFileRequestSchema,
  requestPermissionRequestSchema,
]);

export const agentRequestSchema = z.union([
  initializeRequestSchema,
  authenticateRequestSchema,
  newSessionRequestSchema,
  loadSessionRequestSchema,
  promptRequestSchema,
  listSessionsRequestSchema,
  setModeRequestSchema,
]);

export const agentNotificationSchema = sessionNotificationSchema;
