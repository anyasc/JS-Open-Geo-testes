import { Col, Container, Row } from "react-bootstrap";
import changelogData from "@data/changelog.json";
import type { VersionsData } from "@types";
import { useEffect } from "react";
import { analytics } from "@/utils/analyticsUtils";

const ChangelogPage = () => {
  const { versions }: VersionsData = changelogData;
  const sections = [
    {
      key: "features",
      title: "Novos recursos",
    },
    {
      key: "improvements",
      title: "Melhorias",
    },
    {
      key: "bugfixes",
      title: "Correções de bugs",
    },
    {
      key: "known_issues",
      title: "Problemas conhecidos",
    },
  ];

  const formatDateToBR = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("pt-BR");
  };

  useEffect(() => {
    analytics.track("changelog_page_view");
  }, []);

  return (
    <Container className="mt-4">
      <div className="text-center mb-3">
        <h2>Histórico de Versões</h2>
      </div>

      {versions
        .filter((version) => !version.version.includes("alpha"))
        .map((version) => (
          <Row key={version.version} className="justify-content-center">
            <Col xs={10} lg={8} xl={6} className="mb-4 text-start">
              <div className="d-flex gap-3 mb-3 align-items-end">
                <h4 className="mb-0">
                  <a
                    target="_blanck"
                    href={`https://github.com/JS-Geologia-Aplicada/JS-Open-Geo/releases/tag/v${version.version}`}
                    className="text-decoration-none text-dark"
                    title={`Release v${version.version}`}
                  >
                    v{version.version}
                  </a>
                </h4>
                <span className="text-muted">
                  {formatDateToBR(version.date)}
                </span>
              </div>
              <h5>Visão geral</h5>
              <p>{version.summary}</p>
              {sections.map((section) => {
                const items = version[
                  section.key as keyof typeof version
                ] as string[];

                if (!items || items.length === 0) return null;

                return (
                  <div key={section.key} className="mb-3">
                    <h5>{section.title}</h5>
                    <ul>
                      {items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </Col>
          </Row>
        ))}
    </Container>
  );
};
export default ChangelogPage;
