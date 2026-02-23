import { Container, Row, Image, Col, Card, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import changelogData from "@data/changelog.json";
import type { AnalyticsCounters } from "@/types/analyticsTypes";
import { useEffect, useMemo, useState } from "react";
import { getAnalyticsData } from "@/utils/analyticsUtils";

const HomePage = () => {
  const tools: { name: string; description: string; path: string }[] = [
    {
      name: "Dados de sondagem",
      path: "/dados_de_sondagem",
      description:
        "Faça upload de arquivos em PDF e extraia os dados de uma ou mais sondagens. Exporte em múltiplos formatos, incluindo XLSX, Leapfrog e AGS.",
    },
    {
      name: "Palitos de sondagem",
      path: "/palitos",
      description:
        "Utilize os dados extraídos na ferramenta de dados de sondagem ou seus próprios dados para criar um arquivo DXF com palitos de sondagem seguindo diferentes modelos.",
    },
    {
      name: "Ferramentas CAD/SIG",
      path: "/ferramentas",
      description:
        "Acesse uma variedade de ferramentas para operações e transformações de arquivos nos formatos DXF, XLSX, KML e KMZ.",
    },
  ];

  const [analytics, setAnalytics] = useState<Map<string, AnalyticsCounters>>();

  useEffect(() => {
    getAnalyticsData("gh-pages").then(setAnalytics);
  }, []);

  const shownAnalytics = useMemo(() => {
    if (!analytics) return null;

    let totalVisits = 0,
      monthlyVisits = 0,
      dataExtractions = 0,
      palitoToolUses = 0,
      totalGeneratedPalitos = 0,
      cadsigToolsUses = 0;

    for (const [day, data] of analytics) {
      const dataMonth = new Date(day).getMonth();
      const dataYear = new Date(day).getFullYear();
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      if (dataMonth === currentMonth && dataYear === currentYear) {
        monthlyVisits += data.pageview;
      }
      if (data.pageview) {
        totalVisits += data.pageview;
      }
      const totalExtractions =
        data.extract_preview +
        data.export_ags +
        data.export_csv +
        data.export_excel +
        data.export_json;
      dataExtractions += totalExtractions;
      palitoToolUses += data.generate_dxf_count;
      totalGeneratedPalitos += data.generate_dxf_sondagens;
      const totalToolUses =
        data.distance_tool +
        data.dxf_tools +
        data.kml_to_xlsx +
        data.xlsx_to_dxf_profile +
        data.xlsx_to_kml;
      cadsigToolsUses += totalToolUses;
    }

    return {
      totalVisits,
      monthlyVisits,
      dataExtractions,
      palitoToolUses,
      totalGeneratedPalitos,
      cadsigToolsUses,
    };
  }, [analytics]);

  const navigate = useNavigate();

  const currentVersion = changelogData.versions[0].version;

  const getTimeSaved = (boreholes: number) => {
    const totalMinutes = boreholes * 10;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours && minutes ? (
      <>
        <span className={styles.analyticsHighlight}>
          {hours} horas e {minutes} minutos
        </span>{" "}
        de trabalho economizados.
      </>
    ) : hours ? (
      <>
        <span className={styles.analyticsHighlight}>{hours} horas</span> de
        trabalho economizadas.
      </>
    ) : (
      <>
        <span className={styles.analyticsHighlight}>{minutes} minutos</span> de
        trabalho economizados.
      </>
    );
  };

  return (
    <>
      {/* Seção com logo e resumo */}
      <Container fluid className={styles.headerContainer}>
        <Row className="justify-content-center">
          <Col xs={6}>
            <div className={styles.headerHero}>
              <div className="d-flex flex-column align-items-end">
                <Image src="/JSOpenGeo_white.png" style={{ width: "100%" }} />
                <span
                  style={{
                    color: "#888",
                    paddingRight: "30px",
                    fontWeight: "600",
                    fontSize: "20px",
                    marginTop: "-20px",
                  }}
                >
                  {currentVersion}
                </span>
              </div>
              <p className="text-center" style={{ color: "#ddd" }}>
                Um programa totalmente on-line, gratuito e de código aberto da
                JS Geologia Aplicada, desenvolvido para facilitar e agilizar a
                organização e análise de dados geológico-geotécnicos.
              </p>
              <div
                className="d-flex justify-content-around"
                style={{ color: "#fff" }}
              >
                <Link className={styles.headerLink} to="/sobre">
                  Sobre
                </Link>
                <Link className={styles.headerLink} to="/changelog">
                  Histórico de versões
                </Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <Row className={styles.contentRow}>
        <Col xs={4} className={styles.statsColumn}>
          <h3>Uso do JS OpenGeo</h3>
          <p>
            O JS OpenGeo já foi acessado{" "}
            <span className={styles.analyticsHighlight}>
              {shownAnalytics?.totalVisits} vezes
            </span>
            , sendo{" "}
            <span className={styles.analyticsHighlight}>
              {shownAnalytics?.monthlyVisits} acessos
            </span>{" "}
            apenas neste mês.
            <br />
            Em todos esses acessos, tivemos:
          </p>
          <ul>
            <li>
              <span className={styles.analyticsHighlight}>
                {shownAnalytics?.dataExtractions} sondagens
              </span>{" "}
              processadas e com dados extraídos.
            </li>
            <li>
              <span className={styles.analyticsHighlight}>
                {shownAnalytics?.cadsigToolsUses} usos
              </span>{" "}
              de ferramentas CAD/SIG
            </li>
            <li>
              <span className={styles.analyticsHighlight}>
                {shownAnalytics?.palitoToolUses} usos
              </span>{" "}
              da ferramenta de geração de palitos,
              <br />
              <span className={styles.analyticsHighlight}>
                {shownAnalytics?.totalGeneratedPalitos} palitos
              </span>{" "}
              gerados no total e
              <br />
              {shownAnalytics &&
                getTimeSaved(shownAnalytics.totalGeneratedPalitos)}
            </li>
          </ul>
          <Row
            className="justify-content-center align-items-end"
            style={{ marginTop: "4rem", height: "100%" }}
          >
            <Col xs={12}>
              <Alert className={styles.socialAlert}>
                <div>
                  Acompanhe a JS Geologia Aplicada nas redes sociais para ficar
                  por dentro de novidades no JS OpenGeo, cursos e mais ações
                </div>
                <div className="d-flex justify-content-center align-items-center gap-3 mt-1">
                  <a
                    href="https://www.linkedin.com/company/js-geologia-aplicada"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none text-dark"
                    title="LinkedIn"
                  >
                    <i
                      className="bi bi-linkedin"
                      style={{ fontSize: "1.5rem" }}
                    ></i>
                  </a>
                  <a
                    href="https://www.instagram.com/js.geologia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none text-dark"
                    title="Instagram"
                  >
                    <i
                      className="bi bi-instagram"
                      style={{ fontSize: "1.5rem" }}
                    ></i>
                  </a>
                </div>
              </Alert>
            </Col>{" "}
          </Row>
        </Col>
        <Col xs={8} className={styles.toolsColumn}>
          <div className={styles.toolsContent}>
            <Row>
              <Col>
                <h2 className={styles.toolsTitle}>Ferramentas</h2>
              </Col>
            </Row>
            <Row>
              {tools.map((tool, index) => (
                <Col xs={12} lg={6} key={index}>
                  <Card
                    className={styles.toolCard}
                    onClick={() => navigate(tool.path)}
                  >
                    <Card.Title>{tool.name}</Card.Title>
                    <Card.Text className={styles.toolCardWrapper}>
                      <span className={styles.toolCardText}>
                        {tool.description}
                      </span>
                    </Card.Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default HomePage;
