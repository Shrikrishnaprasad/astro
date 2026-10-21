export interface MenuRoute {
  path: string;
  label: string;
}

export const MENU_ROUTES: MenuRoute[] = [
  { path: "/", label: "Live Transit" },
  { path: "/birth-chart", label: "Birth / Rasi Chart" },
  { path: "/jamakkol-arudam", label: "Jamakkol Arudam" },
  { path: "/dasa", label: "Dasa - Bhukti" },
  { path: "/panchangam", label: "Panchangam" },
  { path: "/porutham", label: "Porutham" },
  { path: "/jyotish-scope", label: "Jyotish scope" },
  { path: "/accuracy", label: "Ephemeris accuracy" },
  { path: "/advanced-jyotish", label: "Advanced Jyotish" },
  { path: "/prasna", label: "Prasna" },
];
