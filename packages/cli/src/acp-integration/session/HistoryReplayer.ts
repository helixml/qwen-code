/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ChatRecord } from '@qwen-code/qwen-code-core';
import type { Content } from '@google/genai';
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
  private readonly messageEmitter: MessageEmitter;
  private readonly toolCallEmitter: ToolCallEmitter;

  // Queue of tool call IDs extracted from tool_result records
  // Used to ensure function calls use the same IDs as their results
  private toolCallIdQueue: string[] = [];

  constructor(ctx: SessionContext) {
    this.messageEmitter = new MessageEmitter(ctx);
    this.toolCallEmitter = new ToolCallEmitter(ctx);
  }

  /**
   * Replays all chat records from a loaded session.
   *
   * @param records - Array of chat records to replay
   */
  async replay(records: ChatRecord[]): Promise<void> {
    console.error(`🎬 [HISTORY REPLAYER] Replaying ${records.length} records`);

    // Pre-scan: Extract callIds from tool_result records in order
    // This ensures function calls use the SAME IDs as their results
    // (fixes "Tool call not found" error on resume)
    this.toolCallIdQueue = this.extractToolCallIds(records);
    console.error(
      `🎬 [HISTORY REPLAYER] Pre-scanned ${this.toolCallIdQueue.length} tool call IDs`,
    );

    let replayedCount = 0;
    for (const record of records) {
      console.error(
        `🎬 [HISTORY REPLAYER] Replaying record ${replayedCount + 1}/${records.length}: type=${record.type}`,
      );
      await this.replayRecord(record);
      replayedCount++;
    }
    console.error(
      `✅ [HISTORY REPLAYER] Finished replaying ${replayedCount} records`,
    );
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
    switch (record.type) {
      case 'user':
        if (record.message) {
          await this.replayContent(record.message, 'user');
        }
        break;

      case 'assistant':
        if (record.message) {
          await this.replayContent(record.message, 'assistant');
        }
        break;

      case 'tool_result':
        await this.replayToolResult(record);
        break;

      default:
        // Skip system records (compression, telemetry, slash commands)
        break;
    }
  }

  /**
   * Replays content from a message (user or assistant).
   * Handles text parts, thought parts, and function calls.
   */
  private async replayContent(
    content: Content,
    role: 'user' | 'assistant',
  ): Promise<void> {
    for (const part of content.parts ?? []) {
      // Text content
      if ('text' in part && part.text) {
        const isThought = (part as { thought?: boolean }).thought ?? false;
        await this.messageEmitter.emitMessage(part.text, role, isThought);
      }

      // Function call (tool start)
      if ('functionCall' in part && part.functionCall) {
        const functionName = part.functionCall.name ?? '';

        // Use the pre-scanned callId from the corresponding tool_result record
        // This fixes "Tool call not found" on resume - the callId must match
        // between tool_call (emitStart) and tool_call_update (emitResult)
        let callId = part.functionCall.id;
        if (!callId && this.toolCallIdQueue.length > 0) {
          // Pop the next ID from the queue (they're in order)
          callId = this.toolCallIdQueue.shift();
        }
        // Fallback to generated ID only if no pre-scanned ID available
        if (!callId) {
          callId = `${functionName}-${Date.now()}`;
        }

        await this.toolCallEmitter.emitStart({
          toolName: functionName,
          callId,
          args: part.functionCall.args as Record<string, unknown>,
        });
      }
    }
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
    });
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
}
