import { useState, useEffect } from "react";
import { Button, Col, Form, Modal, Row, ProgressBar } from "react-bootstrap";
import { useExtractionContext } from "@/contexts/ExtractionContext";
import {
  generateAllThumbnails,
  type ThumbnailData,
} from "@/utils/pageThumbnails";
import PageThumbnail from "./PageThumbnail";
import { Minus, Plus } from "lucide-react";
import { formatPageRanges, parsePageRanges } from "@/utils/pageExclusionUtils";
import { analytics } from "@/utils/analyticsUtils";

interface PageExclusionModalProps {
  show: boolean;
  onClose: () => void;
}

const PageExclusionModal = ({ show, onClose }: PageExclusionModalProps) => {
  const { extractionState, updateExtractionState } = useExtractionContext();
  const { excludedPages, selectedFile, thumbnailsCache } = extractionState;

  const [originalExcludedPages, setOriginalExcludedPages] = useState<
    Set<number>
  >(new Set());
  const [inputValue, setInputValue] = useState("");
  const [isInputValid, setIsInputValid] = useState(true);
  const [thumbnails, setThumbnails] = useState<ThumbnailData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 0,
  });

  const [thumbnailSize, setThumbnailSize] = useState(120);

  // Salva páginas ignoradas ao abrir o modal
  useEffect(() => {
    if (show) {
      setOriginalExcludedPages(excludedPages);
      analytics.track("extraction_exclude_page_open");
    }
  }, [show]);

  // Gerar thumbnails quando modal abre
  useEffect(() => {
    if (!show || !selectedFile) return;

    const cacheKey = getCacheKey(selectedFile);
    const cached = thumbnailsCache.get(cacheKey);

    if (cached) {
      // Usar cache
      setThumbnails(cached);
      setIsLoading(false);
    } else {
      // Gerar e cachear
      setIsLoading(true);

      generateAllThumbnails(selectedFile, 400, (current, total) => {
        setLoadingProgress({ current, total });
      })
        .then((generatedThumbnails) => {
          setThumbnails(generatedThumbnails);

          // Salvar no cache
          const newCache = new Map(thumbnailsCache);
          newCache.set(cacheKey, generatedThumbnails);
          updateExtractionState({ thumbnailsCache: newCache });

          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao gerar thumbnails:", error);
          setIsLoading(false);
        });
    }
  }, [show, selectedFile]);

  // Gera chave única baseada no arquivo
  const getCacheKey = (file: File) => {
    return `${file.name}-${file.size}-${file.lastModified}`;
  };

  // Sincronizar inputValue com excludedPages
  useEffect(() => {
    if (show) {
      const newInputValue = formatPageRanges(excludedPages);
      setInputValue(newInputValue);
    }
  }, [show, excludedPages]);

  // Limapar thumbnails ao mudar de arquivo
  useEffect(() => {
    setThumbnails([]);
    setInputValue("");
    setIsLoading(false);
    setLoadingProgress({ current: 0, total: 0 });
  }, [selectedFile]);

  const hasChanges = () => {
    if (excludedPages.size !== originalExcludedPages.size) return true;

    for (const page of excludedPages) {
      if (!originalExcludedPages.has(page)) return true;
    }

    return false;
  };

  const handleCancel = () => {
    updateExtractionState({ excludedPages: originalExcludedPages });
    onClose();
  };

  const handleClose = () => {
    if (hasChanges()) {
      const apply = confirm("Há alterações não aplicadas. Deseja mantê-las?");
      if (!apply) {
        updateExtractionState({ excludedPages: originalExcludedPages });
      }
    }
    onClose();
  };

  const handleApply = () => {
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const { isValid } = parsePageRanges(value, thumbnails.length);
    setIsInputValid(isValid);
  };

  const handleInputBlur = () => {
    if (isInputValid) {
      const { pages } = parsePageRanges(inputValue, thumbnails.length);
      updateExtractionState({ excludedPages: pages });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const handleSelectOdd = () => {
    const oddPages = new Set<number>();
    for (let i = 1; i <= thumbnails.length; i += 2) {
      oddPages.add(i);
    }
    updateExtractionState({ excludedPages: oddPages });
  };

  const handleSelectEven = () => {
    const evenPages = new Set<number>();
    for (let i = 2; i <= thumbnails.length; i += 2) {
      evenPages.add(i);
    }
    updateExtractionState({ excludedPages: evenPages });
  };

  const handleClear = () => {
    updateExtractionState({ excludedPages: new Set<number>() });
    setInputValue("");
  };

  if (!selectedFile) return null;

  const totalPages = thumbnails.length;
  const progressPercentage =
    loadingProgress.total > 0
      ? (loadingProgress.current / loadingProgress.total) * 100
      : 0;

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Selecionar páginas para ignorar</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row>
          {/* Coluna Esquerda - Seleção Rápida */}
          <Col md={4}>
            <h6 className="mb-3">Seleção rápida</h6>

            <div className="d-grid gap-2 mb-3">
              <Button variant="outline-secondary" onClick={handleSelectOdd}>
                Páginas Ímpares
              </Button>
              <Button variant="outline-secondary" onClick={handleSelectEven}>
                Páginas Pares
              </Button>
              <Button variant="outline-danger" onClick={handleClear}>
                Limpar Seleção
              </Button>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Páginas (ex: 1-5, 7, 9-11):</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                placeholder="Digite os números das páginas..."
                isInvalid={!isInputValid}
              />
              <Form.Control.Feedback type="invalid">
                Digite uma entrada válida (ex: 1-5, 7, 9-11)
              </Form.Control.Feedback>
            </Form.Group>

            <div className="text-muted small">
              <div>Total de páginas: {totalPages}</div>
              <div>Páginas ignoradas: {excludedPages.size}</div>
            </div>
          </Col>

          {/* Coluna Direita - Miniaturas */}
          <Col md={8}>
            <h6 className="mb-3">Páginas</h6>
            {isLoading ? (
              <div className="text-center py-5">
                <div className="mb-3">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                </div>
                <div className="mb-2">
                  Gerando miniaturas: {loadingProgress.current} /{" "}
                  {loadingProgress.total} ({progressPercentage.toFixed(1)}%)
                </div>
                <ProgressBar
                  now={progressPercentage}
                  animated={false}
                  style={{
                    width: "400px",
                    margin: "0 auto",
                    transition: "none",
                  }}
                />
              </div>
            ) : (
              <div
                className="border rounded"
                style={{
                  height: "50vh",
                  backgroundColor: "#f8f9fa",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Barra de Zoom */}
                <div
                  className="d-flex align-items-center justify-content-between px-3 gap-3"
                  style={{
                    backgroundColor: "#3b3b3b",
                    color: "white",
                    borderTopLeftRadius: "0.375rem",
                    borderTopRightRadius: "0.375rem",
                  }}
                >
                  <div>Tamanho das miniaturas: </div>
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      onClick={() => {
                        setThumbnailSize((prev) => prev - 20);
                      }}
                    >
                      <Minus size={32} />
                    </button>
                    <Form.Range
                      min={80}
                      max={400}
                      value={thumbnailSize}
                      onChange={(e) =>
                        setThumbnailSize(parseFloat(e.target.value))
                      }
                      style={{ width: "150px" }}
                    />
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      onClick={() => {
                        setThumbnailSize((prev) => prev + 20);
                      }}
                    >
                      <Plus size={32} />
                    </button>
                  </div>
                </div>
                {/* Grid com Scroll */}
                <div
                  className="p-3"
                  style={{
                    flex: 1,
                    overflowY: "auto",
                  }}
                >
                  <div className="d-flex flex-wrap gap-2">
                    {thumbnails.map((thumbnail) => (
                      <PageThumbnail
                        key={thumbnail.pageNumber}
                        pageNumber={thumbnail.pageNumber}
                        thumbnailUrl={thumbnail.dataUrl}
                        size={thumbnailSize}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleApply}
          disabled={isLoading || !hasChanges()}
        >
          Aplicar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PageExclusionModal;
