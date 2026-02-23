import { TOOLS } from "@/data/tools";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";

type Props = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};
export const ToolsSidebar = ({ collapsed, onToggleCollapse }: Props) => {
  const tools = TOOLS;
  const { toolPath } = useParams<{ toolPath: string }>();

  return (
    <div
      style={{
        width: collapsed ? "70px" : "280px",
        height: "calc(100vh - 192px)",
        position: "fixed",
        top: "133.76px",
        left: 0,
        backgroundColor: "#f8f9fa",
        borderRight: "1px solid #dee2e6",
        transition: "width 0.3s ease",
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      {/* Header com botão de colapsar */}
      <div
        className="d-flex align-items-center justify-content-between p-3"
        style={{ borderBottom: "1px solid #dee2e6", height: "60px" }}
      >
        {!collapsed && (
          <h5
            className="mb-0"
            style={{
              whiteSpace: "nowrap",
              opacity: collapsed ? 0 : 1,
              transition: collapsed
                ? "opacity 0.1s ease"
                : "opacity 0.2s ease 0.2s",
            }}
          >
            Ferramentas
          </h5>
        )}
        <Button
          variant="link"
          onClick={onToggleCollapse}
          className="p-0"
          style={{ minWidth: "24px" }}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      {/* Lista de ferramentas */}
      <div className="d-flex flex-column">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            to={`/ferramentas/${tool.path}`}
            className={`px-3 py-${collapsed ? "3" : "2"}`}
            style={{
              cursor: "pointer",
              borderLeft:
                toolPath === tool.path
                  ? "3px solid #0d6efd"
                  : "3px solid transparent",
              whiteSpace: collapsed ? "nowrap" : "normal",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textDecoration: "none",
            }}
          >
            {collapsed ? (
              <img
                src={tool.icon}
                alt={`Ícone ${tool.name}`}
                style={{ maxWidth: "40px" }}
              />
            ) : (
              <div className="d-flex align-items-center gap-3">
                <img
                  src={tool.icon}
                  alt={`Ícone ${tool.name}`}
                  style={{
                    width: "40px",
                    height: "40px",
                    flexShrink: 0,
                    objectFit: "contain",
                  }}
                />
                <div
                  className="text-start"
                  style={{
                    flex: 1,
                    opacity: collapsed ? 0 : 1, // ← Esconde durante transição
                    transition: collapsed
                      ? "opacity 0.1s ease" // Rápido ao colapsar
                      : "opacity 0.2s ease 0.8s", // Delay ao expandir
                  }}
                >
                  <div
                    style={{
                      fontWeight: 500,
                      color: "black",
                      marginBottom: "4px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {tool.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#6c757d",
                      lineHeight: "1.3",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                    className="text-muted d-block mt-1"
                  >
                    {tool.description}
                  </div>
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};
