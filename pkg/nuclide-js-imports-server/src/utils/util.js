/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint-next-line untyped-type-import:off
import type {Position, IPosition, IRange} from 'vscode-languageserver-types';

import {Point, Range} from 'simple-text-buffer';

export function lspPositionToAtomPoint(lspPosition: IPosition): atom$Point {
  return new Point(lspPosition.line, lspPosition.character);
}

export function atomPointToLSPPosition(atomPoint: atom$PointObject): IPosition {
  return {
    line: atomPoint.row,
    character: atomPoint.column,
  };
}

export function babelLocationToAtomRange(location: Object): atom$Range {
  return new Range(
    new Point(location.start.line - 1, location.start.col),
    new Point(location.end.line - 1, location.end.col),
  );
}

export function atomRangeToLSPRange(atomRange: atom$Range): IRange {
  return {
    start: atomPointToLSPPosition(atomRange.start),
    end: atomPointToLSPPosition(atomRange.end),
  };
}

export function lspRangeToAtomRange(lspRange: IRange): atom$RangeObject {
  return {
    start: lspPositionToAtomPoint(lspRange.start),
    end: lspPositionToAtomPoint(lspRange.end),
  };
}

export function compareLspPosition(a: Position, b: Position): number {
  return a.line - b.line || a.character - b.character;
}

export function compareLspRange(a: IRange, b: IRange): number {
  return (
    compareLspPosition(a.start, b.start) || compareLspPosition(a.end, b.end)
  );
}

function importPathToPriority(path: string): number {
  /* For now, sort in the following order: (TODO: explore other sorting options)
        - Modules
        - Local paths (./*)
        - Relative paths in other directories (../*)
  */
  if (path.startsWith('..')) {
    return 1;
  }
  if (path.startsWith('.')) {
    return 0;
  }
  return -1;
}

export function compareImportPaths(path1: string, path2: string): number {
  const diff = importPathToPriority(path1) - importPathToPriority(path2);
  if (diff !== 0) {
    return diff;
  }
  // Prefer shorter paths.
  return path1.length - path2.length;
}
