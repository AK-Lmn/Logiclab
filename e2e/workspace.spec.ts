import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('keeps primary and picker contrast through hover and focus, with reduced motion support', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Run code', 'Example program']) {
    const control = name === 'Run code' ? page.getByRole('button', { name, exact: true }) : page.getByRole('combobox', { name: /Example program/ });
    for (const state of ['default', 'hover', 'focus']) {
      await page.mouse.move(0, 0);
      await control.evaluate(element => (element as HTMLElement).blur());
      if (state === 'hover') await control.hover();
      if (state === 'focus') await control.focus();
      await control.evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished)); });
      const reading = await control.evaluate(element => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const context = canvas.getContext('2d')!;
        const rgb = (color: string) => { context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1); return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3); };
        const luminance = (color: number[]) => color.map(value => { const channel = value / 255; return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4; }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
        const style = getComputedStyle(element);
        const foreground = rgb(style.color), background = rgb(style.backgroundColor);
        const first = luminance(foreground), second = luminance(background);
        return { ratio: (Math.max(first, second) + .05) / (Math.min(first, second) + .05), foreground, background };
      });
      expect(reading.ratio, `${name} ${state}`).toBeGreaterThanOrEqual(7);
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const run = page.getByRole('button', { name: 'Run code', exact: true });
  await run.hover();
  expect(await run.evaluate(element => getComputedStyle(element).transform)).toBe('none');
  await page.getByRole('combobox', { name: /Example program/ }).click();
  expect(await page.getByRole('listbox').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  await page.getByRole('option', { name: 'Function Calls', exact: true }).click();
  expect(await page.getByRole('dialog').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('combobox')).toBeFocused();
});

test('runs real Python and explores its output from a cold browser', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('select')).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Python source code' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Python source code' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Python source code' })).not.toBeFocused();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Trace ready', { timeout: 60_000 });
  await page.getByRole('button', { name: 'Jump to end', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Execution complete', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Output', exact: true })).toContainText('Sum: 15');
  await page.screenshot({ path: test.info().outputPath('completed.png'), fullPage: true });
  await page.getByRole('button', { name: 'Previous step', exact: true }).click();
  await expect(page.locator('.cm-execution-line')).toHaveCount(1);
  await page.getByRole('button', { name: 'Edit code', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Python source code' })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Ready when you are', exact: true })).toBeVisible();
  await expect(page.locator('.cm-execution-line, .cm-error-line')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Output', exact: true })).toContainText('Printed output appears here.');
});

test('makes running the same program again visibly replay its execution', async ({ page }) => {
  await page.setViewportSize({ width: 886, height: 929 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Trace ready', { timeout: 60_000 });
  await expect(page.locator('.step-count')).toHaveText('Step 1 of 8');
  await expect(page.locator('.execution-status strong')).toHaveText('Execution paused');
  await page.getByRole('button', { name: 'Run again', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Trace ready');
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible({ timeout: 5000 });
  await expect(page.locator('.execution-status strong')).toHaveText('Playing execution');
  await expect(page.getByRole('button', { name: 'Running…', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Run again', exact: true })).toHaveCount(0);
  await page.screenshot({ path: test.info().outputPath('playing-886.png'), fullPage: true });
  await expect(page.locator('.step-count')).not.toHaveText('Step 1 of 8');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.locator('.execution-status strong')).toHaveText('Execution paused');
  await expect(page.getByRole('button', { name: 'Run again', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Jump to end', exact: true }).click();
  await expect(page.locator('.execution-status strong')).toHaveText('Execution complete');
  await page.getByRole('button', { name: 'Run again', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Playing execution');
  await expect(page.getByRole('button', { name: 'Running…', exact: true })).toBeDisabled();
  await expect(page.locator('.step-count')).not.toHaveText('Step 1 of 8');
  await expect(page.locator('.execution-status strong')).toHaveText('Execution complete');
  await expect(page.getByRole('button', { name: 'Run again', exact: true })).toBeEnabled();
  await expect(page.getByRole('region', { name: 'Output', exact: true })).toContainText('Printed text');
  await page.screenshot({ path: test.info().outputPath('completed-886.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 929 });
  await page.screenshot({ path: test.info().outputPath('completed-390.png'), fullPage: true });
});

test('cancels replacement and preserves a partial trace after a runtime error', async ({ page }) => {
  await page.goto('/');
  const picker = page.getByRole('combobox', { name: /Example program/ });
  const editor = page.getByRole('textbox', { name: 'Python source code' });
  const original = await editor.textContent() || '';
  await picker.click();
  await page.getByRole('option', { name: 'Runtime Error', exact: true }).click();
  await page.getByRole('button', { name: 'Keep my code' }).click();
  await expect(picker).toBeFocused();
  await expect(picker).toContainText('Variables & Arithmetic');
  await expect(editor).toHaveText(original);
  await picker.click();
  await page.getByRole('option', { name: 'Runtime Error', exact: true }).click();
  await page.getByRole('button', { name: 'Replace code', exact: true }).click();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('main', { name: 'Python workspace' }).getByRole('alert')).toContainText('ZeroDivisionError', { timeout: 60_000 });
  await page.getByRole('button', { name: 'Jump to end', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Execution stopped', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Previous step', exact: true })).toBeEnabled();
  await expect(page.getByRole('heading', { name: 'Execution complete', exact: true })).toHaveCount(0);
  await page.screenshot({ path: test.info().outputPath('runtime-error.png'), fullPage: true });
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'wcag2aaa']).analyze()).violations).toEqual([]);
});

test('shows startup progress, recovers from a network failure, and clears old results on edit', async ({ page }) => {
  let releaseStartup!: () => void;
  const startup = new Promise<void>(resolve => { releaseStartup = resolve; });
  const runtimeUrl = 'https://cdn.jsdelivr.net/pyodide/**';
  await page.route(runtimeUrl, async route => { await startup; await route.abort(); });
  await page.goto('/');
  try {
    await page.getByRole('button', { name: 'Run code', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Preparing Python', exact: true })).toBeVisible();
    await expect(page.locator('.execution-status strong')).toHaveText('Preparing Python');
    const notice = await page.getByRole('status').boundingBox();
    const editor = await page.getByRole('group', { name: 'Python editor' }).boundingBox();
    expect(notice!.y + notice!.height).toBeLessThanOrEqual(editor!.y);
  } finally { releaseStartup(); }
  const alert = page.getByRole('main', { name: 'Python workspace' }).getByRole('alert');
  await expect(alert).toContainText('Try Run again. Your code is preserved.');
  await expect(alert).not.toContainText('Line 1.');
  await expect(page.locator('.cm-error-line')).toHaveCount(0);
  await page.unroute(runtimeUrl);
  await page.getByRole('button', { name: 'Run again', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Trace ready', { timeout: 60_000 });
  await expect(alert).toHaveCount(0);
  await page.getByRole('button', { name: 'Edit code', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ready when you are', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Python source code' })).toBeFocused();
});

test('reflows and keeps controls usable at phone, tablet, and desktop widths', async ({ page }) => {
  for (const width of [320, 390, 768, 820, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const dimensions = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    expect(dimensions.content, `overflow at ${width}`).toBeLessThanOrEqual(dimensions.viewport);
    for (const control of await page.locator('button:visible:not([disabled]), a:visible, summary:visible').all()) {
      const box = await control.boundingBox();
      if (box) { expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44); }
    }
    await page.getByRole('combobox', { name: /Example program/ }).focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('End');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('combobox')).toBeFocused();
  }
});

test('has no detected WCAG accessibility violations in editing and dialog states', async ({ page }) => {
  await page.goto('/');
  const scan = () => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'wcag2aaa']).analyze();
  expect((await scan()).violations).toEqual([]);
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Function Calls', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect((await scan()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('combobox')).toBeFocused();
});

test('scrolls long source and decorates the document line after jumping to the end', async ({ page }) => {
  await page.goto('/');
  const code = Array.from({ length: 140 }, (_, index) => `value_${index} = ${index}`).join('\n');
  await page.getByRole('textbox', { name: 'Python source code' }).fill(code);
  const scroller = page.locator('.cm-scroller');
  const dimensions = await scroller.evaluate(element => ({ height: element.clientHeight, content: element.scrollHeight }));
  expect(dimensions.height).toBeLessThanOrEqual(400);
  expect(dimensions.content).toBeGreaterThan(dimensions.height);
  await page.getByRole('textbox', { name: 'Python source code' }).press('Control+z');
  await expect(page.getByRole('textbox', { name: 'Python source code' })).toContainText('Sum:');
  await page.getByRole('textbox', { name: 'Python source code' }).press('Control+y');
  await expect(page.getByRole('textbox', { name: 'Python source code' })).toContainText('value_0');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Trace ready', { timeout: 60_000 });
  await page.getByRole('button', { name: 'Jump to end', exact: true }).click();
  await expect(page.locator('.cm-execution-line')).toContainText('value_139');
  const pointer = page.locator('.execution-pointer');
  await expect(pointer).toBeVisible();
  await expect.poll(async () => {
    const lineBox = await page.locator('.cm-execution-line').boundingBox();
    const pointerBox = await pointer.boundingBox();
    return lineBox && pointerBox ? Math.abs(pointerBox.y + pointerBox.height / 2 - lineBox.y - lineBox.height / 2) : Infinity;
  }).toBeLessThan(2);
  await page.getByRole('button', { name: 'Edit code', exact: true }).click();
  await expect(pointer).toBeHidden();
});
