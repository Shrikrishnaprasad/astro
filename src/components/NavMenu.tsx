import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MENU_ROUTES } from "../routes";
import { openKarakamPopup } from "./KarakamPopup";

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
        <span className="mobile-header-title">Astro</span>
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
        <h1 className="nav-brand">Astro</h1>
        {MENU_ROUTES.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) => (isActive ? "active" : "")}
            end
            onClick={() => setOpen(false)}
          >
            {route.label}
          </NavLink>
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
