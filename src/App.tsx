import { Route, Routes } from "react-router-dom";
import NavMenu from "./components/NavMenu";
import PwaStatus from "./components/PwaStatus";
import ArudhaLagnaPage from "./pages/ArudhaLagnaPage";
import BirthChartPage from "./pages/BirthChartPage";
import DasaPage from "./pages/DasaPage";
import LiveTransitPage from "./pages/LiveTransitPage";
import PanchangamPage from "./pages/PanchangamPage";
import JyotishDepthPage from "./pages/JyotishDepthPage";
import PoruthamPage from "./pages/PoruthamPage";

export default function App() {
  return (
    <div className="app-shell">
      <NavMenu />
      <div className="main-column">
      <PwaStatus />
      <main className="content">
        <Routes>
          <Route path="/" element={<LiveTransitPage />} />
          <Route path="/birth-chart" element={<BirthChartPage />} />
          <Route path="/jamakkol-arudam" element={<ArudhaLagnaPage />} />
          <Route path="/dasa" element={<DasaPage />} />
          <Route path="/panchangam" element={<PanchangamPage />} />
          <Route path="/porutham" element={<PoruthamPage />} />
          <Route path="/jyotish-scope" element={<JyotishDepthPage />} />
        </Routes>
      </main>
      </div>
    </div>
  );
}
