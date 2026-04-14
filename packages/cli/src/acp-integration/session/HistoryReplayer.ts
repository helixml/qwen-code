/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ChatRecord, AgentResultDisplay } from '@qwen-code/qwen-code-core';
import type {
  Content,
  GenerateContentResponseUsageMetadata,
} from '@google/genai';
import type { SessionContext } from './types.js';
import { MessageEmitter } from './emitters/MessageEmitter.js';
import { ToolCallEmitter } from './emitters/ToolCallEmitter.js';

/**
 * Handles replaying session history on session load.
 *
 * Uses the unified emitters to ensure consistency with normal flow.
 * This ensures that replayed history looks identical to how it would
 * have appeared during the original session.
 */
export class HistoryReplayer {
  private readonly ctx: SessionContext;
  private readonly messageEmitter: MessageEmitter;
  private readonly toolCallEmitter: ToolCallEmitter;

  // Queue of tool call IDs extracted from tool_result records
  // Used to ensure function calls use the same IDs as their results
  private toolCallIdQueue: string[] = [];

  constructor(ctx: SessionContext) {
    this.ctx = ctx;
    this.messageEmitter = new MessageEmitter(ctx);
    this.toolCallEmitter = new ToolCallEmitter(ctx);
  }

  /**
   * Replays all chat records from a loaded session.
   *
   * @param records - Array of chat records to replay
   */
  async replay(records: ChatRecord[]): Promise<void> {
    // Pre-scan: Extract callIds from tool_result records in order
    // This ensures function calls use the SAME IDs as their results
    // (fixes "Tool call not found" error on resume)
    this.toolCallIdQueue = this.extractToolCallIds(records);

    for (const record of records) {
      await this.replayRecord(record);
    }
  }

  /**
   * Pre-scans records to extract tool call IDs from tool_result records.
   * Returns them in order so they can be matched with function calls.
   */
  private extractToolCallIds(records: ChatRecord[]): string[] {
    const ids: string[] = [];
    for (const record of records) {
      if (record.type === 'tool_result') {
        const callId = record.toolCallResult?.callId ?? record.uuid;
        ids.push(callId);
      }
    }
    return ids;
  }

  /**
   * Replays a single chat record.
   */
  private async replayRecord(record: ChatRecord): Promise<void> {
    this.setActiveRecordId(record.uuid, record.timestamp);
    switch (record.type) {
      case 'user':
        if (record.message) {
          await this.replayContent(record.message, 'user', record.timestamp);
        }
        break;

      case 'assistant':
        if (record.message) {
          await this.replayContent(
            record.message,
            'assistant',
            record.timestamp,
          );
        }
        if (record.usageMetadata) {
          await this.replayUsageMetadata(record.usageMetadata);
        }
        break;

      case 'tool_result':
        await this.replayToolResult(record);
        break;

      default:
        // Skip system records (compression, telemetry, slash commands)
        break;
    }
    this.setActiveRecordId(null);
  }

  /**
   * Replays content from a message (user or assistant).
   * Handles text parts, thought parts, and function calls.
   *
   * @param content - The content to replay
   * @param role - The role (user or assistant)
   * @param timestamp - Optional server-side timestamp from the JSONL record
   */
  private async replayContent(
    content: Content,
    role: 'user' | 'assistant',
    timestamp?: string,
  ): Promise<void> {
    for (const part of content.parts ?? []) {
      // Text content
      if ('text' in part && part.text) {
        const isThought = (part as { thought?: boolean }).thought ?? false;
        await this.messageEmitter.emitMessage(
          part.text,
          role,
          isThought,
          timestamp,
        );
      }

      // Function call (tool start)
      if ('functionCall' in part && part.functionCall) {
        const functionName = part.functionCall.name ?? '';

        // CRITICAL: Always use the callId from the pre-scanned tool_result queue.
        // This ensures the callId matches between tool_call (emitStart) and
        // tool_call_update (emitResult), which prevents "Tool call not found" errors.
        //
        // The queue is populated in order from tool_result records, and we pop
        // one ID for each functionCall we encounter (they should be 1:1).
        //
        // Bug fix: Previously, if functionCall.id was present, we used it without
        // popping from the queue. This caused all subsequent callIds to be wrong
        // because the queue got out of sync with the message stream.
        let callId: string | undefined;

        if (this.toolCallIdQueue.length > 0) {
          // Pop the next ID from the queue (they're in order)
          callId = this.toolCallIdQueue.shift();

          // Use queue ID even if there's a mismatch with the message ID
        } else if (part.functionCall.id) {
          // Fallback: use the ID from the functionCall if queue is empty
          callId = part.functionCall.id;
        }

        // Last resort: generate an ID (shouldn't happen in well-formed history)
        // Last resort: generate an ID (shouldn't happen in well-formed history)
        if (!callId) {
          callId = `${functionName}-${Date.now()}`;
        }

        await this.toolCallEmitter.emitStart({
          toolName: functionName,
          callId,
          args: part.functionCall.args as Record<string, unknown>,
          status: 'in_progress',
          timestamp,
        });
      }
    }
  }

  /**
   * Replays usage metadata.
   * @param usageMetadata - The usage metadata to replay
   */
  private async replayUsageMetadata(
    usageMetadata: GenerateContentResponseUsageMetadata,
  ): Promise<void> {
    await this.messageEmitter.emitUsageMetadata(usageMetadata);
  }

  /**
   * Replays a tool result record.
   */
  private async replayToolResult(record: ChatRecord): Promise<void> {
    // message is required - skip if not present
    if (!record.message?.parts) {
      return;
    }

    const result = record.toolCallResult;
    const callId = result?.callId ?? record.uuid;

    // Extract tool name from the function response in message if available
    const toolName = this.extractToolNameFromRecord(record);

    await this.toolCallEmitter.emitResult({
      toolName,
      callId,
      success: !result?.error,
      message: record.message.parts,
      resultDisplay: result?.resultDisplay,
      // For TodoWriteTool fallback, try to extract args from the record
      // Note: args aren't stored in tool_result records by default
      args: undefined,
      timestamp: record.timestamp,
    });

    // Special handling: Task tool execution summary contains token usage
    const { resultDisplay } = result ?? {};
    if (
      !!resultDisplay &&
      typeof resultDisplay === 'object' &&
      'type' in resultDisplay &&
      (resultDisplay as { type?: unknown }).type === 'task_execution'
    ) {
      await this.emitTaskUsageFromResultDisplay(
        resultDisplay as AgentResultDisplay,
      );
    }
  }

  /**
   * Emits token usage from a AgentResultDisplay execution summary, if present.
   */
  private async emitTaskUsageFromResultDisplay(
    resultDisplay: AgentResultDisplay,
  ): Promise<void> {
    const summary = resultDisplay.executionSummary;
    if (!summary) {
      return;
    }

    const usageMetadata: GenerateContentResponseUsageMetadata = {};

    if (Number.isFinite(summary.inputTokens)) {
      usageMetadata.promptTokenCount = summary.inputTokens;
    }
    if (Number.isFinite(summary.outputTokens)) {
      usageMetadata.candidatesTokenCount = summary.outputTokens;
    }
    if (Number.isFinite(summary.thoughtTokens)) {
      usageMetadata.thoughtsTokenCount = summary.thoughtTokens;
    }
    if (Number.isFinite(summary.cachedTokens)) {
      usageMetadata.cachedContentTokenCount = summary.cachedTokens;
    }
    if (Number.isFinite(summary.totalTokens)) {
      usageMetadata.totalTokenCount = summary.totalTokens;
    }

    // Only emit if we captured at least one token metric
    if (Object.keys(usageMetadata).length > 0) {
      await this.messageEmitter.emitUsageMetadata(usageMetadata);
    }
  }

  /**
   * Extracts tool name from a chat record's function response.
   */
  private extractToolNameFromRecord(record: ChatRecord): string {
    // Try to get from functionResponse in message
    if (record.message?.parts) {
      for (const part of record.message.parts) {
        if ('functionResponse' in part && part.functionResponse?.name) {
          return part.functionResponse.name;
        }
      }
    }
    return '';
  }

  private setActiveRecordId(recordId: string | null, timestamp?: string): void {
    const context = this.ctx as unknown as {
      setActiveRecordId?: (id: string | null, timestamp?: string) => void;
    };
    if (typeof context.setActiveRecordId === 'function') {
      context.setActiveRecordId(recordId, timestamp);
    }
  }
}
