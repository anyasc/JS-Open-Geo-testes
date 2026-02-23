import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import { generateDxfJs, generateDXFMetro } from "../utils/dxfPalitoGenerator";
import { useEffect, useState } from "react";
import type { PalitoData } from "../types";
import { convertToPalitoData } from "../utils/downloadUtils";
import PalitoPreviewCard from "@/components/Palitos/PalitoPreviewCard";
import { toast } from "react-toastify";
import LeapfrogToJsonModal from "@/components/Palitos/LeapfrogToJsonModal";
import { useExtractionContext } from "@/contexts/ExtractionContext";
import { analytics } from "@/utils/analyticsUtils";

const DxfPage = () => {
  const { extractionState, updateExtractionState } = useExtractionContext();
  const { areas, extractedTexts, palitoData } = extractionState;
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("padrao-1");

  // Carregar JSON de teste do public
  const loadExtractedData = async () => {
    try {
      setIsLoading(true);
      const data = convertToPalitoData(areas, extractedTexts);
      if (data.length === 0) {
        toast.error("Não foram encontrados dados extraídos");
      } else {
        updateExtractionState({ palitoData: data });
        toast.success("Dados extraídos carregados com sucesso!");
        analytics.track("extracted_data_to_palito");
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao carregar dados de teste" });
      console.error("Erro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload de arquivo JSON
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        updateExtractionState({ palitoData: jsonData });
        toast.success("Arquivo JSON carregado com sucesso!");
      } catch (error) {
        toast.error("Erro ao processar arquivo JSON");
        console.error("Erro:", error);
      }
    };
    reader.readAsText(file);
  };

  // Gerar DXF
  const handleGenerateDXF = async () => {
    if (palitoData.length === 0) {
      toast.error("Nenhum dado carregado para gerar DXF");
      setMessage({
        type: "error",
        text: "Nenhum dado carregado para gerar DXF",
      });
      return;
    }

    try {
      setIsLoading(true);
      let result;
      switch (selectedVariant) {
        case "metro":
          result = await generateDXFMetro(palitoData);
          break;
        case "padrao-2":
          result = await generateDxfJs(palitoData, "padrao-2");
          break;
        default: // padrão 1
          result = await generateDxfJs(palitoData, "padrao-1");
          break;
      }
      if (result.processErrorNames.length > 0) {
        toast.warn(
          `DXF gerado! ${result.successCount}/${
            result.totalProcessed
          } palitos processados. Falhas: ${result.processErrorNames.join(", ")}`,
        );
      } else {
        toast.success("DXF gerado com sucesso!");
      }
      analytics.track("generate_dxf_count");
      analytics.track("generate_dxf_sondagens", palitoData.length);
    } catch (error) {
      toast.error("Erro ao gerar DXF");
      console.error("Erro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportLeapfrog = (data: PalitoData[]) => {
    if (data.length === 0) {
      toast.error("Nenhum dado foi processado");
      return;
    }

    updateExtractionState({ palitoData: data });
    toast.success(
      `${data.length} palito${data.length !== 1 ? "s" : ""} importado${
        data.length !== 1 ? "s" : ""
      } com sucesso!`,
    );
  };

  // Atualizar palito específico
  const handleUpdatePalito = (index: number, updatedPalito: PalitoData) => {
    const newData = palitoData.map((palito, i) =>
      index === i ? updatedPalito : palito,
    );
    updateExtractionState({ palitoData: newData });
  };

  const handleUpdateAllNspt = (newValue: number) => {
    const newData = palitoData.map((palito) => {
      return {
        ...palito,
        nspt: {
          ...palito.nspt,
          start_depth: newValue,
        },
      };
    });
    updateExtractionState({ palitoData: newData });
  };

  useEffect(() => {
    analytics.track("palitos_page_view");
  }, []);

  return (
    <Container fluid>
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card>
            <Card.Header>
              <h3 className="mb-0">Palitos de sondagem</h3>
            </Card.Header>
            <Card.Body>
              {/* Mensagens */}
              {message && (
                <Alert
                  variant={
                    message.type === "success"
                      ? "success"
                      : message.type === "warning"
                        ? "warning"
                        : "danger"
                  }
                  onClose={() => setMessage(null)}
                  dismissible
                >
                  {message.text}
                </Alert>
              )}

              {/* Seção de carregamento de dados */}
              <div className="mb-4">
                <Row>
                  <Col md={4}>
                    <Button
                      variant="outline-primary"
                      onClick={loadExtractedData}
                      disabled={isLoading}
                      className="w-100 mb-2"
                    >
                      {isLoading ? "Carregando..." : "Usar Dados Extraídos"}
                    </Button>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Upload de JSON:</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <LeapfrogToJsonModal
                      onDataProcessed={handleImportLeapfrog}
                    />
                  </Col>
                </Row>
              </div>

              {/* Botão de gerar DXF */}
              <div className="d-flex gap-3 justify-content-between align-items-center">
                <div>
                  <h6>Padrão do palito</h6>
                  <div>
                    <Form>
                      <Form.Check
                        className="small"
                        inline
                        type="radio"
                        name="palito-variant"
                        label="Padrão JS"
                        value="padrao-1"
                        checked={selectedVariant === "padrao-1"}
                        onChange={(e) => {
                          setSelectedVariant(e.target.value);
                        }}
                      />
                      <Form.Check
                        className="small"
                        inline
                        type="radio"
                        name="palito-variant"
                        label="Padrão 2 JS"
                        value="padrao-2"
                        checked={selectedVariant === "padrao-2"}
                        onChange={(e) => {
                          setSelectedVariant(e.target.value);
                        }}
                      />
                      <Form.Check
                        className="small"
                        inline
                        type="radio"
                        name="palito-variant"
                        label="Padrão Metrô"
                        value="metro"
                        checked={selectedVariant === "metro"}
                        onChange={(e) => {
                          setSelectedVariant(e.target.value);
                        }}
                      />
                    </Form>
                  </div>
                </div>
                <div>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleGenerateDXF}
                    disabled={isLoading || palitoData.length === 0}
                    className="w-100"
                  >
                    {isLoading
                      ? "Gerando..."
                      : `Gerar DXF (${palitoData.length} palito${
                          palitoData.length !== 1 ? "s" : ""
                        })`}
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={7}>
          <PalitoPreviewCard
            palitoData={palitoData}
            onUpdatePalito={handleUpdatePalito}
            onUpdateAllNspt={handleUpdateAllNspt}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default DxfPage;
