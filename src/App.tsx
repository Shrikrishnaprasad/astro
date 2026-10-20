import { Route, Routes } from "react-router-dom";
import NavMenu from "./components/NavMenu";
import ArudhaLagnaPage from "./pages/ArudhaLagnaPage";
import BirthChartPage from "./pages/BirthChartPage";
import DasaPage from "./pages/DasaPage";
import LiveTransitPage from "./pages/LiveTransitPage";
import PanchangamPage from "./pages/PanchangamPage";
import PoruthamPage from "./pages/PoruthamPage";

export default function App() {
  return (
    <div className="app-shell">
      <NavMenu />
      <main className="content">
        <Routes>
          <Route path="/" element={<LiveTransitPage />} />
          <Route path="/birth-chart" element={<BirthChartPage />} />
          <Route path="/jamakkol-arudam" element={<ArudhaLagnaPage />} />
          <Route path="/dasa" element={<DasaPage />} />
          <Route path="/panchangam" element={<PanchangamPage />} />
          <Route path="/porutham" element={<PoruthamPage />} />
        </Routes>
      </main>
    </div>
  );
}
