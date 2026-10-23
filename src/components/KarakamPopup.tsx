import { useEffect, useMemo, useRef, useState } from "react";
import { KARAKA_SECTIONS, karakaEntryMatches } from "../data/karakas";
import type { KarakaEntry, KarakaLanguage, KarakaSection, KarakaSectionId } from "../data/karakas";
import { UI_TEXT, categoryText, contentText, labelText, titleText } from "../data/karakas/language";

export const OPEN_KARAKAM_EVENT = "astro:open-karakam";

const LANGUAGE_STORAGE_KEY = "astro.karakam.language";

const LANGUAGE_OPTIONS: Array<{ value: KarakaLanguage; label: string }> = [
  { value: "bi", label: "தமிழ் + English" },
  { value: "ta", label: "தமிழ்" },
  { value: "en", label: "English" },
];

export function openKarakamPopup() {
  window.dispatchEvent(new Event(OPEN_KARAKAM_EVENT));
}

function readStoredLanguage(): KarakaLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "bi" || stored === "ta" || stored === "en") return stored;
  } catch {
    // Storage can be unavailable (private mode); fall back to bilingual.
  }
  return "bi";
}

function sectionLabel(section: KarakaSection, lang: KarakaLanguage): string {
  if (lang === "ta") return section.labelTamil;
  return section.label;
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

function KarakaCard({
  entry,
  query,
  forceOpen,
  lang,
}: {
  entry: KarakaEntry;
  query: string;
  forceOpen: boolean;
  lang: KarakaLanguage;
}) {
  const title = titleText(entry, lang);
  const badge = entry.badge ? contentText(entry.badge, entry.badgeTa, lang) : undefined;
  return (
    <details className="karakam-card" open={forceOpen || undefined}>
      <summary className="karakam-card__summary">
        <span className="karakam-card__titles">
          {title ? (
            <span className="karakam-card__title">
              <Highlight text={title} query={query} />
            </span>
          ) : null}
          {lang !== "en" ? (
            <span className={title ? "karakam-card__title-ta tamil" : "karakam-card__title tamil"}>
              <Highlight text={entry.titleTamil} query={query} />
            </span>
          ) : null}
          <span className="karakam-card__subtitle">
            <Highlight text={contentText(entry.subtitle, entry.subtitleTa, lang)} query={query} />
          </span>
        </span>
        {badge ? <span className="karakam-card__badge">{badge}</span> : null}
      </summary>
      <div className="karakam-card__body">
        {entry.attributes.length > 0 ? (
          <dl className="karakam-attrs">
            {entry.attributes.map((attr) => (
              <div key={attr.label} className="karakam-attrs__row">
                <dt>
                  <Highlight text={labelText(attr.label, lang)} query={query} />
                </dt>
                <dd className="tamil">
                  <Highlight text={contentText(attr.value, attr.valueTa, lang)} query={query} />
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {entry.categories.map((group) => {
          const items =
            lang === "ta" && group.itemsTa ? group.itemsTa : group.items.map((item) => contentText(item, undefined, lang));
          return (
            <section key={group.category} className="karakam-group">
              <h4 className="karakam-group__title tamil">
                <Highlight text={categoryText(group, lang)} query={query} />
              </h4>
              <ul className="karakam-group__list tamil">
                {items.map((item, i) => (
                  <li key={i}>
                    <Highlight text={item} query={query} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </details>
  );
}

export default function KarakamPopup() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<KarakaSectionId>("graha");
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<KarakaLanguage>(readStoredLanguage);
  const searchRef = useRef<HTMLInputElement>(null);
  const ui = UI_TEXT[lang];

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener(OPEN_KARAKAM_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_KARAKAM_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Ignore storage failures; the choice still applies for this session.
    }
  }, [lang]);

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
                  {lang === "ta" ? (
                    <span className="tamil">காரகம்</span>
                  ) : lang === "en" ? (
                    "Karakam"
                  ) : (
                    <>
                      Karakam <span className="tamil">(காரகம்)</span>
                    </>
                  )}
                </h2>
                <p className="karakam-dialog__hint">{ui.hint}</p>
              </div>
              <button type="button" className="karakam-dialog__close" onClick={() => setOpen(false)} aria-label={ui.close}>
                ✕
              </button>
            </header>

            <div className="karakam-dialog__controls">
              <div className="karakam-lang" role="radiogroup" aria-label={ui.languageLabel}>
                <span className="karakam-lang__label tamil">{ui.languageLabel}:</span>
                {LANGUAGE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`karakam-lang__option tamil${lang === option.value ? " karakam-lang__option--active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="karakam-language"
                      value={option.value}
                      checked={lang === option.value}
                      onChange={() => setLang(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              <input
                ref={searchRef}
                type="search"
                className="karakam-search"
                placeholder={ui.searchPlaceholder}
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
                    <span className={lang === "ta" ? "tamil" : undefined}>{sectionLabel(section, lang)}</span>
                    {lang === "bi" ? <span className="karakam-tab__ta tamil">{section.labelTamil}</span> : null}
                  </button>
                ))}
              </div>
              {trimmed ? <p className="karakam-dialog__hint">{ui.matches(matchCount)}</p> : null}
            </div>

            <div className="karakam-dialog__body">
              {results.length === 0 ? <p className="karakam-empty">{ui.noMatch(trimmed)}</p> : null}
              {results.map(({ section, entries }) => (
                <div key={section.id} className="karakam-section">
                  {trimmed ? (
                    <h3 className="karakam-section__title">
                      {lang === "ta" ? (
                        <span className="tamil">{section.labelTamil}</span>
                      ) : lang === "en" ? (
                        section.label
                      ) : (
                        <>
                          {section.label} <span className="tamil">— {section.labelTamil}</span>
                        </>
                      )}
                    </h3>
                  ) : null}
                  {entries.map((entry) => (
                    <KarakaCard key={entry.id} entry={entry} query={trimmed} forceOpen={Boolean(trimmed)} lang={lang} />
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
