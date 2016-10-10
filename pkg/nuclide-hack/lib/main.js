'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  BusySignalProviderBase as BusySignalProviderBaseType,
} from '../../nuclide-busy-signal';
import type {Provider} from '../../nuclide-quick-open/lib/types';

import {HackSymbolProvider} from './HackSymbolProvider';
import {CompositeDisposable} from 'atom';
import {
  HackDiagnosticsProvider,
  ObservableDiagnosticProvider,
} from './HackDiagnosticsProvider';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {BusySignalProviderBase} from '../../nuclide-busy-signal';
import {hackLanguageService, resetHackLanguageService} from './HackLanguage';
import {getConfig} from './config';


let subscriptions: ?CompositeDisposable = null;
let hackDiagnosticsProvider;
let observableDiagnosticsProvider;
let busySignalProvider;

const diagnosticService = 'nuclide-diagnostics-provider';

export function activate() {
  subscriptions = new CompositeDisposable();
  hackLanguageService.activate();

  if (getConfig().useIdeConnection) {
    subscriptions.add(
      atom.packages.serviceHub.provide(
        diagnosticService, '0.2.0', provideObservableDiagnostics()));
  } else {
    subscriptions.add(
      atom.packages.serviceHub.provide(
        diagnosticService, '0.1.0', provideDiagnostics()));
  }
}

function provideDiagnostics() {
  if (!hackDiagnosticsProvider) {
    const busyProvider = provideBusySignal();
    hackDiagnosticsProvider = new HackDiagnosticsProvider(false, busyProvider);
  }
  return hackDiagnosticsProvider;
}

function provideObservableDiagnostics() {
  if (observableDiagnosticsProvider == null) {
    observableDiagnosticsProvider = new ObservableDiagnosticProvider();
  }
  return observableDiagnosticsProvider;
}

export function deactivate(): void {
  if (subscriptions) {
    subscriptions.dispose();
    subscriptions = null;
  }
  if (hackDiagnosticsProvider) {
    hackDiagnosticsProvider.dispose();
    hackDiagnosticsProvider = null;
  }
  resetHackLanguageService();
}

function provideBusySignal(): BusySignalProviderBaseType {
  if (busySignalProvider == null) {
    busySignalProvider = new BusySignalProviderBase();
  }
  return busySignalProvider;
}

export function registerQuickOpenProvider(): Provider {
  return HackSymbolProvider;
}
