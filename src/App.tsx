import { useEffect, useState } from "react";
import DataExtractionPage from "./pages/DataExtractionPage";
import AppHeader from "./components/AppHeader";
import DxfPage from "./pages/DxfPage";
import AppNavigation from "./components/AppNavigation";
import { Col, Container, Row } from "react-bootstrap";
import HelpModal from "./components/HelpModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AboutPage from "./pages/AboutPage";
import ChangelogPage from "./pages/ChangelogPage";
import AppFooter from "./components/AppFooter";
import { ToolsPage } from "./pages/ToolsPage";
import { analytics } from "./utils/analyticsUtils";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { ToolsGrid } from "./components/Tools/ToolsGrid";
import ToolPageLayout from "./components/Tools/ToolPageLayout";
import styles from "./App.module.css";

function App() {
  // Lidando com o Modal de ajuda
  const [openHelpOnLoad, setOpenHelpOnLoad] = useState(() => {
    const saved = localStorage.getItem("showHelpOnLoad");
    return saved !== "false";
  });
  const [showHelp, setShowHelp] = useState(openHelpOnLoad);
  const handleShowHelp = () => {
    setShowHelp(true);
  };
  const toggleShowHelpOnLoad = (show: boolean) => {
    setOpenHelpOnLoad(show);
    localStorage.setItem("showHelpOnLoad", show.toString());
  };

  const currentPath = () => {
    const location = useLocation();
    return location.pathname;
  };

  useEffect(() => {
    // 1. Envia dados órfãos de sessão anterior (se houver)
    const pending = analytics.getPendingData();
    if (pending) {
      analytics.flush();
    }

    // 2. Registra pageview
    analytics.track("pageview");

    const lastView = localStorage.getItem("lastView");
    const today = new Date().toISOString().split("T")[0];
    if (!lastView || lastView !== today) {
      analytics.track("unique_daily_view");
      localStorage.setItem("lastView", today);
    }

    // 3. Setup do beforeunload
    const handleUnload = () => {
      analytics.flushSync();
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return (
    <div className={styles.appContainer}>
      <div className={styles.mainContent}>
        <Container fluid className="text-center p-0">
          <ToastContainer
            position="top-right"
            autoClose={6000}
            hideProgressBar={false}
          />
          <HelpModal
            showOnLoad={openHelpOnLoad}
            onToggleShowOnLoad={toggleShowHelpOnLoad}
            show={showHelp}
            setShow={setShowHelp}
          />
          <Row className="justify-content-center">
            <Col className="px-0">
              <AppHeader />
            </Col>
          </Row>
          {currentPath() !== "/" && (
            <Row className="justify-content-center">
              <Col className="px-0">
                <AppNavigation />
              </Col>
            </Row>
          )}
        </Container>

        <div className={styles.routesContainer}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/dados_de_sondagem"
              element={<DataExtractionPage onShowHelp={handleShowHelp} />}
            />
            <Route path="/palitos" element={<DxfPage />} />
            <Route path="/ferramentas" element={<ToolsPage />}>
              <Route index element={<ToolsGrid />} />
              <Route path=":toolPath" element={<ToolPageLayout />} />
            </Route>
            <Route path="/sobre" element={<AboutPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="*" element={<div>Erro: página não encontrada</div>} />
          </Routes>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}

export default App;
