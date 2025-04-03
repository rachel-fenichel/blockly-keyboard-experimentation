/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ASTNode, BlockSvg, dragging, RenderedConnection, utils} from 'blockly';
import {LineCursor} from './line_cursor';

export enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}

export function getTiltFromDirection(dir: Direction | undefined): {
  x: number;
  y: number;
} {
  if (!dir) {
    return {x: 0, y: 0};
  }
  switch (dir) {
    case Direction.Up:
      return {x: 0, y: -1};
    case Direction.Down:
      return {x: 0, y: 1};
    case Direction.Left:
      return {x: -1, y: 0};
    case Direction.Right:
      return {x: 1, y: 0};
  }
}

export function getDirectionFromTilt(e: PointerEvent): Direction {
  const x = e.tiltX;
  const y = e.tiltY;

  if (x == 0) {
    if (y == -1) {
      return Direction.Up;
    } else if (y == 1) {
      return Direction.Down;
    }
  } else if (y == 0) {
    if (x == -1) {
      return Direction.Left;
    } else if (x == 1) {
      return Direction.Right;
    }
  }
  throw new Error('Could not get direction from tilt information');
}

/** Represents a nearby valid connection. */
interface ConnectionCandidate {
  /** A connection on the dragging stack that is compatible with neighbour. */
  local: RenderedConnection;

  /** A nearby connection that is compatible with local. */
  neighbour: RenderedConnection;

  /** The distance between the local connection and the neighbour connection. */
  distance: number;
}

// @ts-expect-error overrides a private function.
export class KeyboardDragStrategy extends dragging.BlockDragStrategy {
  lastDirection: Direction | null = null;

  override startDrag(e?: PointerEvent) {
    super.startDrag(e);
    // @ts-expect-error block and startLoc are private.
    this.block.moveDuringDrag(this.startLoc);
  }

  override drag(newLoc: utils.Coordinate, e?: PointerEvent): void {
    if (!e) return;
    if (e.tiltX || e.tiltY) {
      this.lastDirection = getDirectionFromTilt(e);
    }
    super.drag(newLoc);
  }

  private getConstrainedConnectionCandidate(
    draggingBlock: BlockSvg,
    delta: utils.Coordinate,
  ): ConnectionCandidate | null {
    const cursor = draggingBlock.workspace.getCursor() as LineCursor;
    // @ts-expect-error startParentConn is private.
    if (!this.startParentConn) return null;

    // @ts-expect-error getLocalConnections is private
    const localConns = this.getLocalConnections(draggingBlock);
    const connectionChecker = draggingBlock.workspace.connectionChecker;
    let candidateConnection: ConnectionCandidate | null = null;

    let potentialConnection: RenderedConnection =
      // @ts-expect-error connectionCandidate is private.
      this.connectionCandidate ?? this.startParentConn;

    let potential: ASTNode | null =
      ASTNode.createConnectionNode(potentialConnection);
    while (potential && !candidateConnection) {
      //if (delta.x == 0 && delta.y < 0) {
      if (
        this.lastDirection === Direction.Up ||
        this.lastDirection === Direction.Left
      ) {
        potential = cursor!.getPreviousNode(potential, (node) => {
          // @ts-expect-error isConnectionType is private.
          return node && ASTNode.isConnectionType(node.getType());
        });
        //} else if (delta.x == 0 && delta.y > 0) {
      } else if (
        this.lastDirection === Direction.Down ||
        this.lastDirection === Direction.Right
      ) {
        potential = cursor!.getNextNode(potential, (node) => {
          // @ts-expect-error isConnectionType is private.
          return node && ASTNode.isConnectionType(node.getType());
        });
      }

      localConns.forEach((conn: RenderedConnection) => {
        const potentialLocation =
          potential?.getLocation() as RenderedConnection;
        if (connectionChecker.canConnect(conn, potentialLocation, true, 2000)) {
          candidateConnection = {
            local: conn,
            neighbour: potentialLocation,
            distance: 0,
          };
        }
      });
    }
    return candidateConnection;
  }

  override currCandidateIsBetter(
    currCandidate: ConnectionCandidate,
    delta: utils.Coordinate,
    newCandidate: ConnectionCandidate,
  ): boolean {
    if (this.lastDirection) {
      return true;
    }
    // @ts-expect-error currCandidateIsBetter is private.
    return super.currCandidateIsBetter(currCandidate, delta, newCandidate);
  }

  override getConnectionCandidate(
    draggingBlock: BlockSvg,
    delta: utils.Coordinate,
  ): ConnectionCandidate | null {
    if (this.lastDirection) {
      return this.getConstrainedConnectionCandidate(draggingBlock, delta);
    }
    // @ts-expect-error getConnctionCandidate is private.
    return super.getConnectionCandidate(draggingBlock, delta);
  }
}
