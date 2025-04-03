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
import {Direction, getDirectionFromXY} from './drag_direction';

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
    this.lastDirection = getDirectionFromXY({x: e.tiltX, y: e.tiltY});
    super.drag(newLoc);
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
    if (this.isConstrainedMovement()) {
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

    const initialNode = this.searchNode;
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

  isConstrainedMovement(): boolean {
    return !!this.lastDirection;
  }

  override currCandidateIsBetter(
    currCandidate: ConnectionCandidate,
    delta: utils.Coordinate,
    newCandidate: ConnectionCandidate,
  ): boolean {
    if (this.isConstrainedMovement()) {
      return false; // New connection is always better during a constrained drag.
    }
    // @ts-expect-error currCandidateIsBetter is private.
    return super.currCandidateIsBetter(currCandidate, delta, newCandidate);
  }

  override getConnectionCandidate(
    draggingBlock: BlockSvg,
    delta: utils.Coordinate,
  ): ConnectionCandidate | null {
    if (this.isConstrainedMovement()) {
      return this.getConstrainedConnectionCandidate(draggingBlock, delta);
    }
    // @ts-expect-error getConnctionCandidate is private.
    return super.getConnectionCandidate(draggingBlock, delta);
  }
}
