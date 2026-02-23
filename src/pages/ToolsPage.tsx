import { analytics } from "@/utils/analyticsUtils";
import { useEffect } from "react";
import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";

export const ToolsPage = () => {
  useEffect(() => {
    analytics.track("cadsig_tools_page_view");
  }, []);

  return (
    <Container fluid className="p-0">
      <div style={{ minHeight: "calc(100vh - 192px)" }}>
        <Outlet />
      </div>
    </Container>
  );
};
