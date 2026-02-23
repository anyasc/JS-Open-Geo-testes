import { useEffect, useRef, useState } from "react";

import PdfViewer, {
  type PdfViewerRef,
} from "@components/DataExtraction/PdfViewer";
import Menu from "@components/DataExtraction/Menu";
import {
  type ExtractionProgress,
  type PageTextData,
  type SelectionArea,
} from "@types";
import {
  generateAreasFingerprint,
  updateAreaCoordinates,
} from "@utils/areaUtils";
import MenuCard from "@components/DataExtraction/MenuCard";
import { extractText } from "@utils/textExtractor";
import ExtractedDataPanel from "@components/DataExtraction/ExtractedDataPanel";
import ExtractButtons from "@/components/DataExtraction/ExtractButtons";
import { Col, Row } from "react-bootstrap";
import { useExtractionContext } from "@/contexts/ExtractionContext";
import { analytics } from "@/utils/analyticsUtils";

interface DataExtractionPageProps {
  onShowHelp: () => void;
}

function DataExtractionPage({ onShowHelp }: DataExtractionPageProps) {
  const { extractionState, updateExtractionState } = useExtractionContext();
  const {
    areas,
    selectedFile,
    isSelectionActive,
    activeAreaId,
    excludedPages,
  } = extractionState;
  // ref do pdfviewer para poder chamar função
  const pdfViewerRef = useRef<PdfViewerRef>(null);

  // state da extração de texto
  const [extractionProgress, setExtractionProgress] =
    useState<ExtractionProgress | null>(null);
  const [extractionStartTime, setExtractionStartTime] = useState<number>(0);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  // funções de seleção de área
  const finishAreaSelection = (
    coords: SelectionArea,
    resizedAreaId?: string,
  ) => {
    const areaId = resizedAreaId
      ? resizedAreaId
      : activeAreaId
        ? activeAreaId
        : null;
    if (areaId) {
      updateExtractionState({
        areas: updateAreaCoordinates(areas, areaId, coords),
      });
    }

    updateExtractionState({ activeAreaId: null });

    setTimeout(() => {
      updateExtractionState({ isSelectionActive: false });
    }, 10);
  };

  const [lastExtractedFingerprint, setLastExtractedFingerprint] =
    useState<string>("");
  const [cachedExtractedTexts, setCachedExtractedTexts] = useState<
    PageTextData[]
  >([]);

  // Função para verificar se precisa extrair novamente
  const needsReExtraction = (): boolean => {
    const currentFingerprint = generateAreasFingerprint(
      areas,
      selectedFile,
      excludedPages,
    );
    const needs =
      currentFingerprint !== lastExtractedFingerprint ||
      cachedExtractedTexts.length === 0;

    return needs;
  };

  // funções de extrair texto
  const handleExtraxtTexts = async (): Promise<PageTextData[]> => {
    if (!needsReExtraction()) {
      return cachedExtractedTexts;
    }

    const controller = new AbortController();
    setAbortController(controller);
    updateExtractionState({ isExtracting: true });
    setExtractionStartTime(Date.now());

    try {
      const pdfDocument = pdfViewerRef.current?.getDocument();
      const hasRepeatAreas = areas.some((area) => area.repeatInPages);
      const holeId = areas.find((area) => area.dataType === "hole_id");
      const areasWithoutCoords = areas
        .filter((area) => !area.coordinates)
        .map((area) => area.name);

      if (areasWithoutCoords.length > 0) {
        const proceed = confirm(
          "A(s) seguinte(s) área(s) não possue(m) coordenadas:\n" +
            areasWithoutCoords.join(", ") +
            "\n" +
            "Deseja continuar mesmo assim?",
        );
        if (!proceed) {
          throw new Error("Extração cancelada pelo usuário");
        }
      }
      if (!holeId && hasRepeatAreas) {
        const proceed = confirm(
          "Algumas áreas estão configuradas como 'Único' mas não há uma área de ID da Sondagem. " +
            "A função não vai funcionar corretamente. Deseja continuar mesmo assim?",
        );
        if (!proceed) {
          throw new Error("Extração cancelada pelo usuário");
        }
      }

      if (!pdfDocument) {
        throw new Error("PDF não carregado");
      }

      const extracted = await extractText(
        areas,
        pdfDocument,
        excludedPages,
        controller.signal,
        setExtractionProgress,
      );

      updateExtractionState({ extractedTexts: extracted });
      setCachedExtractedTexts(extracted);
      setLastExtractedFingerprint(
        generateAreasFingerprint(areas, selectedFile, excludedPages),
      );

      return extracted;
    } catch (error) {
      throw error;
    } finally {
      updateExtractionState({ isExtracting: false });
      setExtractionProgress(null);
      setAbortController(null);
    }
  };

  const handlePreview = async () => {
    try {
      updateExtractionState({ isExtracting: true });
      await handleExtraxtTexts();

      // Analytics
      analytics.track("extract_preview");
      if (excludedPages.size > 0)
        analytics.track("extraction_exclude_page_use");
    } catch (error) {
      console.error("Erro na extração: ", error);
    } finally {
      updateExtractionState({ isExtracting: false });
    }
  };

  // Cancelar seleção
  const cancelSelection = () => {
    updateExtractionState({ isSelectionActive: false, activeAreaId: null });
  };

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSelectionActive) {
        cancelSelection();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const pdfContainer = document.querySelector(".pdf-container");
      if (isSelectionActive && !pdfContainer?.contains(e.target as Node)) {
        cancelSelection();
      }
    };
    document.addEventListener("keydown", handleEscKey);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSelectionActive]);

  // Reordenando AreaItems com DragNDrop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    if (startIndex === endIndex) return;

    const newAreas = Array.from(areas);
    const [movedItem] = newAreas.splice(startIndex, 1);
    newAreas.splice(endIndex, 0, movedItem);

    const updatedAreas = newAreas.map((area, index) => ({
      ...area,
      order: index + 1,
    }));

    updateExtractionState({ areas: updatedAreas });
  };

  const handleCancelExtraction = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  useEffect(() => {
    analytics.track("extraction_page_view");
  }, []);

  return (
    <>
      {isSelectionActive && <div className="selection-mode-overlay" />}

      <Row className="justify-content-center">
        <Col
          xs={12}
          lg={6}
          xxl={4}
          style={{ maxWidth: "450px", minWidth: "300px" }}
        >
          <MenuCard
            areasMenu={
              <Menu onDragEnd={handleDragEnd} onShowHelp={onShowHelp} />
            }
            extractMenu={
              <ExtractButtons
                onPreview={handlePreview}
                onExtractTexts={handleExtraxtTexts}
                onCancelExtraction={handleCancelExtraction}
                extractionProgress={extractionProgress}
                extractionStartTime={extractionStartTime}
              />
            }
          ></MenuCard>
        </Col>
        <Col xs={12} lg={6} xxl={5} xxxl={4}>
          <PdfViewer
            ref={pdfViewerRef}
            onFinishSelection={finishAreaSelection}
          />
        </Col>
        <Col xs={12} lg={6} xxl={3} xxxl={4}>
          <ExtractedDataPanel />
        </Col>
      </Row>
    </>
  );
}

export default DataExtractionPage;
