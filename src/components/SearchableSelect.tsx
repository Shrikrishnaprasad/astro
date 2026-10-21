import { useEffect, useId, useMemo, useRef, useState } from "react";

export default function SearchableSelect({
  label,
  value,
  options,
  onChange,
  searchPlaceholder = "Type to filter…",
  wide = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  searchPlaceholder?: string;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`searchable-select${wide ? " searchable-select--wide" : ""}`}
    >
      <span className="searchable-select__label">{label}</span>
      <div className="searchable-select__control">
        <button
          type="button"
          className="searchable-select__trigger"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="searchable-select__value">{value}</span>
          <span className="searchable-select__chevron" aria-hidden>
            ▾
          </span>
        </button>
        {open && (
          <div className="searchable-select__popover">
            <input
              ref={searchRef}
              type="search"
              className="searchable-select__search"
              value={query}
              placeholder={searchPlaceholder}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                }
                if (e.key === "Enter" && filtered[0]) {
                  e.preventDefault();
                  pick(filtered[0]);
                }
              }}
            />
            <ul id={listId} className="searchable-select__list" role="listbox">
              {filtered.map((option) => (
                <li key={option} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={option === value}
                    className={
                      option === value
                        ? "searchable-select__option searchable-select__option--active"
                        : "searchable-select__option"
                    }
                    onClick={() => pick(option)}
                  >
                    {option}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="searchable-select__empty" role="presentation">
                  No matches
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
