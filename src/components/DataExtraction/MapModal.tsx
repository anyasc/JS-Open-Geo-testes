import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import type { Area, PageTextData } from "@types";
import { Button, Form, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  convertGeographicCoordinates,
  DATUMS,
  generateKMLString,
  UTM_ZONES,
  type CoordinateSystem,
  type DatumType,
  type PointCoords,
  type ZoneType,
} from "@utils/mapUtils";
import JSZip from "jszip";
import LeafletMap from "./LeafletMap";
import { toast } from "react-toastify";
import { analytics } from "@/utils/analyticsUtils";

interface MapModalProps {
  extractedTexts: PageTextData[];
  areas: Area[];
}

const MapModal: React.FC<MapModalProps> = ({ extractedTexts, areas }) => {
  const [selectedDatum, setSelectedDatum] = useState<DatumType | undefined>(
    undefined,
  );
  const [selectedZone, setSelectedZone] = useState<ZoneType | undefined>(
    undefined,
  );
  const [show, setShow] = useState(false);
  const [points, setPoints] = useState<PointCoords[]>([]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Verifica se tem áreas de coordenadas configuradas
  const hasXCoord = areas.some(
    (area) => area.dataType === "x" && area.coordinates,
  );
  const hasYCoord = areas.some(
    (area) => area.dataType === "y" && area.coordinates,
  );
  const hasHoleId = areas.some(
    (area) => area.dataType === "hole_id" && area.coordinates,
  );
  const hasRequiredData = hasXCoord && hasYCoord && hasHoleId;

  // Conta quantos pontos seriam exportados
  const pointCount = extractedTexts.length;

  const handleDownloadKMZ = async () => {
    if (points.length === 0) return;
    const kmlString = generateKMLString(points);

    const zip = new JSZip();
    zip.file("doc.kml", kmlString);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sondagens.kmz";
    link.click();
    URL.revokeObjectURL(url);

    analytics.track("extraction_map_export");
  };

  const handlePlotPoints = async () => {
    if (!selectedDatum || (selectedDatum !== "WGS84" && !selectedZone)) return;
    const coordinateSystem: CoordinateSystem = {
      datum: selectedDatum,
      zone: selectedZone || "23S",
    };
    const validPoints: PointCoords[] = [];
    const invalidPoints: string[] = [];
    extractedTexts.forEach((data, index) => {
      const holeIdArea = areas.find((area) => area.dataType === "hole_id");
      const xArea = areas.find((area) => area.dataType === "x");
      const yArea = areas.find((area) => area.dataType === "y");
      const idValue = holeIdArea ? (data[holeIdArea.name][0] as string) : "";
      const xValue = xArea ? (data[xArea.name][0] as string) : "";
      const yValue = yArea ? (data[yArea.name][0] as string) : "";

      if (!idValue || idValue.trim() === "") {
        invalidPoints.push(`Ponto ${index + 1}`);
        return;
      }
      if (!xValue || xValue.trim() === "" || !yValue || yValue.trim() === "") {
        invalidPoints.push(idValue);
        return;
      }
      const x = parseFloat(xValue);
      const y = parseFloat(yValue);

      if (isNaN(x) || isNaN(y)) {
        invalidPoints.push(idValue);
        return;
      }

      let convertedCoords: [number, number];
      try {
        convertedCoords = convertGeographicCoordinates(
          [x, y],
          coordinateSystem,
        );
      } catch (error) {
        invalidPoints.push(idValue);
        return;
      }

      const [lon, lat] = convertedCoords;

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        lat < -90 ||
        lat > 90 ||
        lon < -180 ||
        lon > 180
      ) {
        invalidPoints.push(idValue);
        return;
      }

      validPoints.push({
        id: idValue,
        coords: convertedCoords,
      });
    });

    setPoints(validPoints);
    if (invalidPoints.length > 0) {
      toast.warn(
        validPoints.length === 0
          ? "Coordenadas inválidas para todos os pontos"
          : `Coordenadas inválidas para ${invalidPoints.length} ponto${
              invalidPoints.length > 1 ? "s" : ""
            }: ${invalidPoints.join(", ")}`,
      );
    }

    analytics.track("extraction_map_insert_data");
  };

  useEffect(() => {
    if (show) analytics.track("extraction_map_view");
  }, [show]);

  return (
    <>
      <OverlayTrigger
        overlay={
          <Tooltip id="json-tooltip">
            {!extractedTexts || extractedTexts.length === 0
              ? "Extraia os dados para ver as sondagens no mapa e exportar o KMZ"
              : "Ver coordenadas das sondagens em mapa e exportar KMZ"}
          </Tooltip>
        }
      >
        <span className="d-inline-block">
          <Button
            variant="secondary"
            onClick={handleShow}
            disabled={!extractedTexts || extractedTexts.length === 0}
          >
            Mapa
          </Button>
        </span>
      </OverlayTrigger>
      {/* Modal */}
      <Modal show={show} onHide={handleClose} size="xl">
        {/* Header */}
        <Modal.Header closeButton>
          <Modal.Title>Coordenadas das Sondagens</Modal.Title>
        </Modal.Header>

        {/* Body */}
        <Modal.Body className="p-4">
          {!hasRequiredData ? (
            // Mensagem de erro se não tem dados necessários
            <div className="alert alert-warning" role="alert">
              <h6>Dados insuficientes</h6>
              <p className="mb-2">
                Para exportar coordenadas, você precisa configurar:
              </p>
              <ul className="mb-0">
                {!hasHoleId && <li>Uma área como "ID da Sondagem"</li>}
                {!hasXCoord && <li>Uma área como "Coordenada X"</li>}
                {!hasYCoord && <li>Uma área como "Coordenada Y"</li>}
              </ul>
            </div>
          ) : (
            <>
              <div className="d-flex align-items-start gap-3">
                {/* Seleção de Datum */}
                <div style={{ width: "200px" }}>
                  <Form.Select
                    aria-label="Datum"
                    value={selectedDatum}
                    onChange={(e) =>
                      setSelectedDatum(e.target.value as DatumType)
                    }
                  >
                    <option value={undefined}>Datum</option>
                    {DATUMS.map((datum) => (
                      <option key={datum.value} value={datum.value}>
                        {datum.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                {/* Seleção de Zona UTM */}
                <div style={{ width: "200px" }}>
                  <Form.Select
                    aria-label="Zona UTM"
                    value={selectedZone}
                    onChange={(e) =>
                      setSelectedZone(e.target.value as ZoneType)
                    }
                    disabled={selectedDatum === "WGS84"}
                  >
                    <option value={undefined}>Zona UTM</option>
                    {UTM_ZONES.map((zone) => (
                      <option key={zone.value} value={zone.value}>
                        {zone.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                {/* Botões de ação */}
                <div>
                  <Button
                    className="btn btn-primary"
                    onClick={handlePlotPoints}
                    disabled={
                      pointCount === 0 ||
                      !selectedDatum ||
                      (selectedDatum !== "WGS84" && !selectedZone)
                    }
                  >
                    Visualizar mapa
                  </Button>
                </div>
                {points.length > 0 && (
                  <>
                    {/* Botão Download KMZ */}
                    <div>
                      <Button onClick={handleDownloadKMZ}>
                        <Download className="me-1" size={16} />
                        KMZ
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {points.length > 0 && (
                <>
                  {/* Mapa */}
                  <div>
                    <LeafletMap points={points} />
                  </div>
                </>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default MapModal;
