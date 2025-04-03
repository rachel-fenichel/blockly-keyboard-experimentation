/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ASTNode,
  BlockSvg,
  dragging,
  NEXT_STATEMENT,
  PREVIOUS_STATEMENT,
  RenderedConnection,
  utils,
} from 'blockly';
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

export function getDirectionFromTilt(e: PointerEvent): Direction | null {
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
  return null;
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

  hasMoved: boolean = false;

  private searchNode: ASTNode | null = null;

  override startDrag(e?: PointerEvent) {
    super.startDrag(e);
    // @ts-expect-error block and startLoc are private.
    this.block.moveDuringDrag(this.startLoc);
    // TODO: Now update the moveInfo for this drag to have the correct totalDelta.
    // @ts-expect-error startParentConn is private.
    this.searchNode = ASTNode.createConnectionNode(this.startParentConn);
  }

  override drag(newLoc: utils.Coordinate, e?: PointerEvent): void {
    if (!e) return;
    this.lastDirection = getDirectionFromTilt(e);
    super.drag(newLoc);
    this.hasMoved = true;
    // Move to new location if it's near a connection.
    // @ts-expect-error connectionCandidate is private
    const candidate = this.connectionCandidate;
    // if (candidate) {
    //     const candidateLocation = candidate.neighbour;
    //     const offsetLocation = new utils.Coordinate(candidateLocation.x + 10,
    //         candidateLocation.y + 10);
    //     // @ts-expect-error this.block is private.
    //     this.block.moveDuringDrag(offsetLocation);
    //     // TODO: Now update the moveInfo for this drag to have the correct totalDelta.
    // }
  }
  private getLocalConnections(draggingBlock: BlockSvg) {
    const available = draggingBlock.getConnections_(false);
    // TODO: why is there a filter here?
    if (this.lastDirection) {
      available.filter((conn) => {
        return conn.type == PREVIOUS_STATEMENT || conn.type == NEXT_STATEMENT;
      });
    }
    const lastOnStack = draggingBlock.lastConnectionInStack(true);
    if (lastOnStack && lastOnStack !== draggingBlock.nextConnection) {
      available.push(lastOnStack);
    }
    return available;
  }

  private getConstrainedConnectionCandidate(
    draggingBlock: BlockSvg,
    delta: utils.Coordinate,
  ): ConnectionCandidate | null {
    const cursor = draggingBlock.workspace.getCursor() as LineCursor;
    // @ts-expect-error startParentConn is private.
    if (!this.startParentConn) return null;

    const initialNode = this.searchNode; //ASTNode.createConnectionNode(this.startParentConn);
    if (!initialNode) return null;

    const localConns = this.getLocalConnections(draggingBlock);
    const connectionChecker = draggingBlock.workspace.connectionChecker;

    let candidateConnection: ConnectionCandidate | null = null;

    let potential: ASTNode | null = initialNode;
    while (potential && !candidateConnection) {
      if (
        this.lastDirection === Direction.Up ||
        this.lastDirection === Direction.Left
      ) {
        potential = cursor!.getPreviousNode(potential, (node) => {
          // @ts-expect-error isConnectionType is private.
          return node && ASTNode.isConnectionType(node.getType());
        });
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
    // Build and return a ConnectionCandidate.

    if (candidateConnection) {
      this.searchNode = ASTNode.createConnectionNode(
        (candidateConnection as ConnectionCandidate).neighbour,
      );
    }
    return candidateConnection;
  }

  override currCandidateIsBetter(
    currCandidate: ConnectionCandidate,
    delta: utils.Coordinate,
    newCandidate: ConnectionCandidate,
  ): boolean {
    if (this.lastDirection) {
      return false;
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
