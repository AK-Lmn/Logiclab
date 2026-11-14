'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface SelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
}

export function Select({ label, value, options, onChange, placeholder = 'Choose an option', disabled = false, compact = false }: SelectProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const search = useRef({ value: '', at: 0 });
  const selected = options.findIndex(option => option.value === value);
  const expanded = open && !disabled;

  useEffect(() => {
    if (!expanded) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [expanded]);

  useEffect(() => {
    if (expanded) document.getElementById(`${id}-option-${active}`)?.scrollIntoView?.({ block: 'nearest' });
  }, [active, expanded, id]);

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    setOpen(false);
    trigger.current?.focus();
    onChange(option.value);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!options.length) return;
    if (event.key === 'Tab') { setOpen(false); return; }
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return; }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (expanded) choose(active);
      else { setActive(Math.max(selected, 0)); setOpen(true); }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const start = expanded ? active : Math.max(selected, 0);
      setActive(event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 :
        expanded ? (start + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length : start);
      setOpen(true);
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      const text = now - search.current.at > 700 ? event.key : search.current.value + event.key;
      search.current = { value: text.toLowerCase(), at: now };
      const match = options.findIndex(option => option.label.toLowerCase().startsWith(search.current.value));
      if (match >= 0) { event.preventDefault(); setActive(match); setOpen(true); }
    }
  }

  return (
    <div className={`select-field${compact ? ' select-field--compact' : ''}`} ref={root}>
      <span className="field-label" id={`${id}-label`}>{label}</span>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-expanded={expanded}
        aria-haspopup="listbox"
        aria-controls={expanded ? `${id}-list` : undefined}
        aria-activedescendant={expanded ? `${id}-option-${active}` : undefined}
        disabled={disabled || !options.length}
        className="btn btn--secondary select-trigger"
        onClick={() => { setActive(Math.max(selected, 0)); setOpen(!expanded); }}
        onKeyDown={onKeyDown}
        onBlur={event => { if (!root.current?.contains(event.relatedTarget as Node)) setOpen(false); }}
      >
        <span id={`${id}-value`}>{options[selected]?.label || placeholder}</span>
        <ChevronDown className="select-chevron" aria-hidden="true" />
      </button>
      {expanded && (
        <ul className="select-options" id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`}>
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              className={`select-option${active === index ? ' is-active' : ''}`}
              onPointerMove={() => setActive(index)}
              onPointerDown={event => event.preventDefault()}
              onClick={() => choose(index)}
            >
              <span>{option.label}</span>
              {option.value === value && <Check aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
