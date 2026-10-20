import { NavLink } from "react-router-dom";
import { MENU_ROUTES } from "../routes";

export default function NavMenu() {
  return (
    <nav className="nav">
      <h1>Astro</h1>
      {MENU_ROUTES.map((route) => (
        <NavLink
          key={route.path}
          to={route.path}
          className={({ isActive }) => (isActive ? "active" : "")}
          end
        >
          {route.label}
        </NavLink>
      ))}
    </nav>
  );
}
