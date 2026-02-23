import { useState } from "react";
import { ToolsSidebar } from "./ToolsSidebar";
import { useParams } from "react-router-dom";
import { TOOLS } from "@/data/tools";

const ToolPageLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toolPath } = useParams<{ toolPath: string }>();
  const selectedToolData = TOOLS.find((tool) => tool.path === toolPath);

  const SelectedComponent = selectedToolData?.component;

  return (
    <div className="d-flex">
      <ToolsSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div
        className="flex-grow-1 overflow-auto"
        style={{
          marginLeft: sidebarCollapsed ? "60px" : "280px",
          transition: "margin-left 0.3s ease",
        }}
      >
        {SelectedComponent && <SelectedComponent />}
      </div>
    </div>
  );
};

export default ToolPageLayout;
