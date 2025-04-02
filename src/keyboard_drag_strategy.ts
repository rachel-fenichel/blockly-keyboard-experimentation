/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {dragging} from 'blockly';

export enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}
export class KeyboardDragStrategy extends dragging.BlockDragStrategy {}
