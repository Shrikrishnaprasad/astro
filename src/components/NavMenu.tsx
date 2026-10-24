import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MENU_ROUTES } from "../routes";
import { openKarakamPopup } from "./KarakamPopup";

const NAV_GROUPS: { label: string; paths: string[] }[] = [
  { label: "Today", paths: ["/", "/panchangam", "/muhurta"] },
  {
    label: "Charts",
    paths: ["/birth-chart", "/divisional-charts", "/ashtakavarga", "/jamakkol-arudam"],
  },
  { label: "Timing & match", paths: ["/dasa", "/porutham"] },
  { label: "Methods", paths: ["/kp", "/degree-system", "/prasna", "/advanced-jyotish"] },
  { label: "Reference", paths: ["/ephemeris", "/accuracy", "/jyotish-scope"] },
];

function BrandMark() {
  return (
    <div className="nav-brand">
      <span className="nav-mark" aria-hidden="true" />
      <span>
        <span className="nav-brand__name">Astro</span>
        <span className="nav-brand__tag">Vedic · Tamil</span>
      </span>
    </div>
  );
}

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("nav-drawer-open", open);
    return () => document.body.classList.remove("nav-drawer-open");
  }, [open]);

  return (
    <>
      <header className="mobile-header">
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="app-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle-bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="nav-toggle-label">{open ? "Close" : "Menu"}</span>
        </button>
        <span className="mobile-header-title">
          <span className="nav-mark" aria-hidden="true" />
          Astro
        </span>
      </header>
      {open ? (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <nav id="app-nav" className={`nav${open ? " nav-open" : ""}`}>
        <BrandMark />
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="nav-group">{group.label}</div>
            {group.paths.map((path) => {
              const route = MENU_ROUTES.find((item) => item.path === path);
              if (!route) return null;
              return (
                <NavLink
                  key={route.path}
                  to={route.path}
                  className={({ isActive }) => (isActive ? "active" : "")}
                  end
                  onClick={() => setOpen(false)}
                >
                  {route.label}
                </NavLink>
              );
            })}
          </div>
        ))}
        <button
          type="button"
          className="nav-karakam"
          onClick={() => {
            setOpen(false);
            openKarakamPopup();
          }}
        >
          Karakam reference <span className="tamil">(காரகம்)</span>
        </button>
      </nav>
    </>
  );
}
