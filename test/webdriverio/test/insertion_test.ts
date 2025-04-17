/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as chai from 'chai';
import * as Blockly from 'blockly';
import {
  testSetup,
  testFileLocations,
  PAUSE_TIME,
  getBlockElementById,
  clickBlock,
} from './test_setup.js';
import {
  ClickOptions,
  Key,
} from 'webdriverio';

suite('Insertion', function () {
  // Setting timeout to unlimited as these tests take a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  setup(async function () {
    // TODO: Reload the workspace between tests instead of reloading the page.
    this.browser = await testSetup(testFileLocations.BASE);
    await this.browser.pause(PAUSE_TIME);
  });

  test('Insert below', async function () {
    // Get to a useful block
    const block = await getBlockElementById(this.browser, 'draw_circle_1');
    await clickBlock(this.browser, block, {button: 1} as ClickOptions);

    await this.browser.keys(['i', Key.ArrowRight, Key.Enter, Key.Enter]);
    await this.browser.pause(PAUSE_TIME);

    const nextBlockType = await this.browser.execute(() => {
      const drawBlock =
        Blockly.getMainWorkspace().getBlockById('draw_circle_1');
      return drawBlock?.nextConnection?.targetBlock()?.type;
    });
    chai.assert.equal(nextBlockType, 'controls_if');
  });

  test('Insert if, true', async function () {
    // Get to a useful block
    const block = await getBlockElementById(this.browser, 'draw_circle_1');
    await clickBlock(this.browser, block, {button: 1} as ClickOptions);

    // Insert the if block
    // TODO: Do this setup by loading serialized blocks instead.
    await this.browser.keys(['i', Key.ArrowRight, Key.Enter, Key.Enter]);
    await this.browser.pause(PAUSE_TIME);

    // Navigate to the first value input
    await this.browser.keys([Key.ArrowRight]);
    await this.browser.pause(PAUSE_TIME);

    // Insert a "true" block
    // TODO: Add a helper to insert the nth block of the mth toolbox category.
    await this.browser.keys([
      'i',
      Key.ArrowRight,
      Key.ArrowDown,
      Key.ArrowDown,
      Key.ArrowDown,
      Key.ArrowDown,
      Key.Enter,
      Key.Enter,
    ]);
    await this.browser.pause(PAUSE_TIME);

    // TODO: Write a better helper for this.
    const connectedBlockType = await this.browser.execute(() => {
      const drawBlock =
        Blockly.getMainWorkspace().getBlockById('draw_circle_1');
      const nextBlock = drawBlock?.nextConnection?.targetBlock();
      const inputBlock = nextBlock?.inputList[0].connection?.targetBlock();
      return inputBlock?.type;
    });
    chai.assert.equal(connectedBlockType, 'logic_true');
  });
  test('Insert if, true, not', async function () {
    // Get to a useful block
    const block = await getBlockElementById(this.browser, 'draw_circle_1');
    await clickBlock(this.browser, block, {button: 1} as ClickOptions);

    // Insert the if block
    // TODO: Do this setup by loading serialized blocks instead.
    await this.browser.keys(['i', Key.ArrowRight, Key.Enter, Key.Enter]);
    await this.browser.pause(PAUSE_TIME);

    // Navigate to the first value input
    await this.browser.keys([Key.ArrowRight]);
    await this.browser.pause(PAUSE_TIME);

    // Insert a "true" block
    // TODO: Add a helper to insert the nth block of the mth toolbox category.
    await this.browser.keys([
      'i',
      Key.ArrowRight,
      Key.ArrowDown,
      Key.ArrowDown,
      Key.ArrowDown,
      Key.ArrowDown,
      Key.Enter,
      Key.Enter,
    ]);
    await this.browser.pause(PAUSE_TIME);

    // Insert a "not" block
    // TODO: Add a helper to insert the nth block of the mth toolbox category.
    await this.browser.keys([
      'i',
      Key.ArrowRight,
      Key.ArrowDown,
      Key.ArrowDown,
      Key.ArrowDown,
      Key.Enter,
      Key.Enter,
    ]);
    await this.browser.pause(PAUSE_TIME);

    // TODO: Write a better helper for this.
    const connectedBlockType = await this.browser.execute(() => {
      const drawBlock =
        Blockly.getMainWorkspace().getBlockById('draw_circle_1');
      const nextBlock = drawBlock?.nextConnection?.targetBlock();
      const inputBlock = nextBlock?.inputList[0].connection?.targetBlock();
      return inputBlock?.type;
    });
    chai.assert.equal(connectedBlockType, 'logic_negate');
  });
});
