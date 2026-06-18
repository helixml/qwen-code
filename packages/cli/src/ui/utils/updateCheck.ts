/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { UpdateInfo } from 'update-notifier';

export const FETCH_TIMEOUT_MS = 2000;

export interface UpdateObject {
  message: string;
  update: UpdateInfo;
}

// Helix fork: unconditionally disable update checks against npm registry.
// Our fork is not published to npm and should not phone home.
export async function checkForUpdates(): Promise<UpdateObject | null> {
  return null;
}
