import { useEffect, useRef, useState } from 'react';

interface GlassSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string; sub?: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const GlassSelect: React.FC<GlassSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedIndex = options.findIndex(o => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = e => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // When opening, focus the active item so keyboard nav lands somewhere sane.
  useEffect(() => {
    if (open) {
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [open, selectedIndex]);

  // Decide whether to drop up when there isn't enough space below.
  useEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimated = Math.min(256, options.length * 44 + 8);
    setDropUp(spaceBelow < estimated && spaceAbove > spaceBelow);
  }, [open, options.length]);

  // Scroll the active option into view as it changes.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const commit = idx => {
    const opt = options[idx];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
  };

  const handleKey = e => {
    if (disabled) return;
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => Math.min(options.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        commit(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      default:
    }
  };

  return (
    <div ref={rootRef} className="relative flex-grow">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen(o => !o)}
        onKeyDown={handleKey}
        className={`flex w-full items-center justify-between gap-2 bg-primary-900/60 backdrop-blur-md text-accent border border-earth rounded-lg px-4 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-success disabled:opacity-50 disabled:cursor-not-allowed transition ${className}`}
      >
        <span className="">{selected ? selected.label : placeholder}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleKey}
          className={`absolute z-50 w-full max-h-64 overflow-auto bg-primary-white/80 backdrop-blur-lg border border-earth/60 rounded-lg shadow-xl shadow-primary-950/50 py-1 focus:outline-none ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}
        >
          {options.map((opt, i) => {
            const isSelected = i === selectedIndex;
            const isActive = i === activeIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                data-index={i}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={e => {
                  // mousedown so it fires before the outside-click handler closes us
                  e.preventDefault();
                  commit(i);
                }}
                className={`flex items-center justify-between gap-3 px-4 py-2 cursor-pointer transition ${
                  isActive ? 'bg-earth/30' : ''
                } ${isSelected ? 'text-success' : 'text-accent'}`}
              >
                <span className="flex flex-col min-w-0">
                  <span className="truncate">{opt.label}</span>
                  {opt.sub && (
                    <span className="text-xs text-accent/60 truncate">
                      {opt.sub}
                    </span>
                  )}
                </span>
                {isSelected && <Check />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`w-4 h-4 shrink-0 text-accent/70 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="w-4 h-4 shrink-0 text-success"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.296a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414L8.5 12.086l6.79-6.79a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default GlassSelect;