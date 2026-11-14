import React, { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../components/Select';

const options = [{ value: 'a', label: 'Arithmetic' }, { value: 'f', label: 'Functions' }, { value: 'r', label: 'Recursion' }];
function Fixture() {
  const [value, setValue] = useState('a');
  return <><Select label="Example program" value={value} onChange={setValue} options={options} /><button type="button">After picker</button></>;
}
afterEach(cleanup);

describe('Select-only combobox', () => {
  it('supports keyboard selection and exposes its committed value', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const trigger = screen.getByRole('combobox', { name: /Example program Arithmetic/ });
    trigger.focus();
    await user.keyboard('{Enter}{End}{Enter}');
    expect(trigger).toHaveAccessibleName('Example program Recursion');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('dismisses with Escape without changing the value', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    await user.keyboard('{End}{Escape}');
    expect(trigger).toHaveAccessibleName('Example program Arithmetic');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('supports typeahead and Tab without a keyboard trap', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('fun{Enter}');
    expect(trigger).toHaveAccessibleName('Example program Functions');
    await user.keyboard('{ArrowDown}{Tab}');
    expect(screen.getByRole('button', { name: 'After picker' })).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
