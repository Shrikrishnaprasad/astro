import { Route, Routes } from "react-router-dom";
import { EphemerisSettingsProvider } from "./context/EphemerisSettingsContext";
import NavMenu from "./components/NavMenu";
import PwaStatus from "./components/PwaStatus";
import ArudhaLagnaPage from "./pages/ArudhaLagnaPage";
import BirthChartPage from "./pages/BirthChartPage";
import DivisionalChartsPage from "./pages/DivisionalChartsPage";
import AshtakavargaPage from "./pages/AshtakavargaPage";
import DasaPage from "./pages/DasaPage";
import LiveTransitPage from "./pages/LiveTransitPage";
import PanchangamPage from "./pages/PanchangamPage";
import MuhurtaPage from "./pages/MuhurtaPage";
import AdvancedJyotishPage from "./pages/AdvancedJyotishPage";
import EphemerisAccuracyPage from "./pages/EphemerisAccuracyPage";
import EphemerisPage from "./pages/EphemerisPage";
import PrasnaPage from "./pages/PrasnaPage";
import JyotishDepthPage from "./pages/JyotishDepthPage";
import PoruthamPage from "./pages/PoruthamPage";

export default function App() {
  return (
    <EphemerisSettingsProvider>
    <div className="app-shell">
      <NavMenu />
      <div className="main-column">
      <PwaStatus />
      <main className="content">
        <Routes>
          <Route path="/" element={<LiveTransitPage />} />
          <Route path="/birth-chart" element={<BirthChartPage />} />
          <Route path="/divisional-charts" element={<DivisionalChartsPage />} />
          <Route path="/ashtakavarga" element={<AshtakavargaPage />} />
          <Route path="/jamakkol-arudam" element={<ArudhaLagnaPage />} />
          <Route path="/dasa" element={<DasaPage />} />
          <Route path="/panchangam" element={<PanchangamPage />} />
          <Route path="/muhurta" element={<MuhurtaPage />} />
          <Route path="/porutham" element={<PoruthamPage />} />
          <Route path="/jyotish-scope" element={<JyotishDepthPage />} />
          <Route path="/ephemeris" element={<EphemerisPage />} />
          <Route path="/accuracy" element={<EphemerisAccuracyPage />} />
          <Route path="/advanced-jyotish" element={<AdvancedJyotishPage />} />
          <Route path="/prasna" element={<PrasnaPage />} />
        </Routes>
      </main>
      </div>
    </div>
    </EphemerisSettingsProvider>
  );
}
