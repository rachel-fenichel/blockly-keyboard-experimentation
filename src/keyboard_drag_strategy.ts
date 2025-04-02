/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  ASTNode,
  BlockSvg,
  RenderedConnection,
  NEXT_STATEMENT,
  PREVIOUS_STATEMENT,
  utils,
  dragging,
} from 'blockly';
import {LineCursor} from './line_cursor';

/** Represents a nearby valid connection. */
interface ConnectionCandidate {
  /** A connection on the dragging stack that is compatible with neighbour. */
  local: RenderedConnection;

  /** A nearby connection that is compatible with local. */
  neighbour: RenderedConnection;

  /** The distance between the local connection and the neighbour connection. */
  distance: number;
}

export enum DragDirection {
  Up = 1,
  Down,
  Left,
  Right,
};

// @ts-expect-error KeyboardDragStrategy overrides a private method.
export class KeyboardDragStrategy extends dragging.BlockDragStrategy {
  private searchNode: ASTNode | null = null;
  private localConns: RenderedConnection[] = [];
  /**
   * Returns all of the connections we might connect to blocks on the workspace.
   *
   * Includes any connections on the dragging block, and any last next
   * connection on the stack (if one exists).
   */
  private getLocalConnectionsConstrained(draggingBlock: BlockSvg) {
    const available = draggingBlock.getConnections_(false);
    // TODO: why is there a filter here?
    available.filter((conn) => {
      return conn.type == PREVIOUS_STATEMENT || conn.type == NEXT_STATEMENT;
    });
    const lastOnStack = draggingBlock.lastConnectionInStack(true);
    if (lastOnStack && lastOnStack !== draggingBlock.nextConnection) {
      available.push(lastOnStack);
    }
    this.localConns = available;
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

    this.getLocalConnectionsConstrained(draggingBlock);
    const connectionChecker = draggingBlock.workspace.connectionChecker;

    let candidateConnection: ConnectionCandidate | null = null;

    let potential: ASTNode | null = initialNode;
    while (potential && !candidateConnection) {
      if (delta.x == 0 && delta.y == -1) {
        potential = cursor!.getPreviousNode(potential, (node) => {
          // @ts-expect-error isConnectionType is private.
          return node && ASTNode.isConnectionType(node.getType());
        });
      } else if (delta.x == 0 && delta.y == 1) {
        potential = cursor!.getNextNode(potential, (node) => {
          // @ts-expect-error isConnectionType is private.
          return node && ASTNode.isConnectionType(node.getType());
        });
      }

      this.localConns.forEach((conn) => {
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

  override getConnectionCandidate(
    draggingBlock: BlockSvg,
    delta: utils.Coordinate,
  ): ConnectionCandidate | null {
    // TODO: Check the delta and decide whether to do constrained or unconstrained.
    return this.getConstrainedConnectionCandidate(draggingBlock, delta);
  }
}
