import { useEffect, useMemo, useRef, useState } from "react";
import { KARAKA_SECTIONS, karakaEntryMatches } from "../data/karakas";
import type { KarakaEntry, KarakaSectionId } from "../data/karakas";

export const OPEN_KARAKAM_EVENT = "astro:open-karakam";

export function openKarakamPopup() {
  window.dispatchEvent(new Event(OPEN_KARAKAM_EVENT));
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let from = 0;
  let at = lower.indexOf(needle, from);
  while (at !== -1) {
    if (at > from) parts.push(text.slice(from, at));
    parts.push(<mark key={at}>{text.slice(at, at + q.length)}</mark>);
    from = at + q.length;
    at = lower.indexOf(needle, from);
  }
  if (from < text.length) parts.push(text.slice(from));
  return <>{parts}</>;
}

function KarakaCard({ entry, query, forceOpen }: { entry: KarakaEntry; query: string; forceOpen: boolean }) {
  return (
    <details className="karakam-card" open={forceOpen || undefined}>
      <summary className="karakam-card__summary">
        <span className="karakam-card__titles">
          <span className="karakam-card__title">
            <Highlight text={entry.titleEnglish} query={query} />
          </span>
          <span className="karakam-card__title-ta tamil">
            <Highlight text={entry.titleTamil} query={query} />
          </span>
          <span className="karakam-card__subtitle">
            <Highlight text={entry.subtitle} query={query} />
          </span>
        </span>
        {entry.badge ? <span className="karakam-card__badge">{entry.badge}</span> : null}
      </summary>
      <div className="karakam-card__body">
        {entry.attributes.length > 0 ? (
          <dl className="karakam-attrs">
            {entry.attributes.map((attr) => (
              <div key={attr.label} className="karakam-attrs__row">
                <dt>
                  <Highlight text={attr.label} query={query} />
                </dt>
                <dd className="tamil">
                  <Highlight text={attr.value} query={query} />
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {entry.categories.map((group) => (
          <section key={group.category} className="karakam-group">
            <h4 className="karakam-group__title tamil">
              <Highlight text={group.category} query={query} />
            </h4>
            <ul className="karakam-group__list tamil">
              {group.items.map((item) => (
                <li key={item}>
                  <Highlight text={item} query={query} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </details>
  );
}

export default function KarakamPopup() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<KarakaSectionId>("graha");
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener(OPEN_KARAKAM_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_KARAKAM_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("karakam-open");
    searchRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("karakam-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const trimmed = query.trim();

  const results = useMemo(() => {
    if (!trimmed) {
      const section = KARAKA_SECTIONS.find((s) => s.id === activeSection)!;
      return [{ section, entries: section.entries }];
    }
    return KARAKA_SECTIONS.map((section) => ({
      section,
      entries: section.entries.filter((entry) => karakaEntryMatches(entry, trimmed)),
    })).filter((group) => group.entries.length > 0);
  }, [activeSection, trimmed]);

  const matchCount = results.reduce((sum, group) => sum + group.entries.length, 0);

  return (
    <>
      <button
        type="button"
        className="karakam-fab"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        title="Karakam reference"
      >
        <span className="tamil">காரகம்</span>
      </button>
      {open ? (
        <div className="karakam-overlay" onClick={() => setOpen(false)}>
          <div
            className="karakam-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="karakam-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="karakam-dialog__header">
              <div>
                <h2 id="karakam-title" className="karakam-dialog__title">
                  Karakam <span className="tamil">(காரகம்)</span>
                </h2>
                <p className="karakam-dialog__hint">Significations of Graha, Bhava, Rasi and Nakshatra</p>
              </div>
              <button
                type="button"
                className="karakam-dialog__close"
                onClick={() => setOpen(false)}
                aria-label="Close Karakam reference"
              >
                ✕
              </button>
            </header>

            <div className="karakam-dialog__controls">
              <input
                ref={searchRef}
                type="search"
                className="karakam-search"
                placeholder="Search all karakas (e.g. kidney, mother, தங்கம், surgeon)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="karakam-tabs" role="tablist">
                {KARAKA_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    role="tab"
                    aria-selected={!trimmed && activeSection === section.id}
                    className={`karakam-tab${!trimmed && activeSection === section.id ? " karakam-tab--active" : ""}`}
                    onClick={() => {
                      setQuery("");
                      setActiveSection(section.id);
                    }}
                  >
                    {section.label}
                    <span className="karakam-tab__ta tamil">{section.labelTamil}</span>
                  </button>
                ))}
              </div>
              {trimmed ? (
                <p className="karakam-dialog__hint">
                  {matchCount} match{matchCount === 1 ? "" : "es"} across all sections
                </p>
              ) : null}
            </div>

            <div className="karakam-dialog__body">
              {results.length === 0 ? <p className="karakam-empty">No karakas match “{trimmed}”.</p> : null}
              {results.map(({ section, entries }) => (
                <div key={section.id} className="karakam-section">
                  {trimmed ? (
                    <h3 className="karakam-section__title">
                      {section.label} <span className="tamil">— {section.labelTamil}</span>
                    </h3>
                  ) : null}
                  {entries.map((entry) => (
                    <KarakaCard key={entry.id} entry={entry} query={trimmed} forceOpen={Boolean(trimmed)} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
