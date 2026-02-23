import { analytics } from "@/utils/analyticsUtils";
import { useEffect } from "react";
import { Alert, Col, Container, Row } from "react-bootstrap";

const AboutPage = () => {
  useEffect(() => {
    analytics.track("about_page_view");
  }, []);

  return (
    <Container fluid>
      <Row className="justify-content-center">
        <Col xs={10} lg={8} xxl={6} className="text-start mt-2">
          <h4 className="text-center">Sobre o JS Open Geo</h4>
          <p>
            O JS OpenGeo é um programa totalmente on-line, gratuito e de código
            aberto da JS Geologia Aplicada, desenvolvido para facilitar e
            agilizar a organização e análise de dados geológico-geotécnicos. O
            programa é composto por módulos para automatizar a extração de
            informações de relatórios de sondagem e outros documentos técnicos e
            de ferramentas para conversão e trabalho com arquivos CAD (DXF), SIG
            (KML) e planilhas (XLSX).
          </p>
          <p>
            A digitalização de dados geológico-geotécnicos é uma necessidade
            cada vez maior em projetos por conta do desenvolvimento em formato
            BIM (<i>Building Information Modeling</i>). Sem dados digitalizados,
            as disciplinas de geologia e geotecnia tem muita dificuldade em
            serem incorporadas no fluxo de desenvolvimento de um projeto em BIM,
            gerando perda de informação e nos piores casos, problemas de
            projeto.
          </p>
          <h4>Segurança de dados</h4>
          <p>
            Seus dados estão seguros ao utilizar o JS OpenGeo, pois o
            processamento é feito 100% localmente no seu computador. Isso
            significa que:{" "}
          </p>
          <ul>
            <li>Seus arquivos e dados não são enviados para nenhum servidor</li>
            <li>Nada é armazenado em nuvem ou bancos de dados</li>
            <li>Não utilizamos nenhuma ferramenta de rastreamento</li>
            <li>
              Após o carregamento inicial da página, é possível utilizar o
              programa mesmo sem acesso à internet
            </li>
          </ul>
          <p>
            Além disso, o código completo do JS OpenGeo é aberto, hospedado
            publicamente no{" "}
            <a
              href="https://github.com/JS-Geologia-Aplicada/JS-Open-Geo"
              target="_blank"
              title="Repositório JS OpenGeo"
            >
              GitHub
            </a>
          </p>
          <p>
            Caso sua empresa tenha restrições com relação ao uso de ferramentas
            online, é possível realizar uma cópia do código para o GitHub da
            própria empresa, ou mesmo baixar e hospedar o programa localmente
            seguindo as instruções disponíveis{" "}
            <a
              href="https://github.com/JS-Geologia-Aplicada/JS-Open-Geo?tab=readme-ov-file#executar-localmente"
              target="_blank"
              title="Intruções hospedagem local"
            >
              aqui
            </a>
            .
          </p>
          <p>
            Os dados aqui tratados estão seguros, pois eles não são salvos após
            o processamento. Com relação a isso você pode confiar na JS Geologia
            Aplicada, uma empresa de 8 anos de atuação no mercado de geologia de
            engenharia, com diversos clientes e projetos relevantes no Brasil e
            no exterior.
          </p>
          <h5>Por que gratuito?</h5>
          <p>
            O mercado de engenharia e de geologia de engenharia no Brasil tem um
            enorme atraso e precariedade quando o assunto são os dados
            geológico-geotécnicos de obras e projetos: dados não digitalizados e
            sem formato padronizado, o que leva a falta de rastreabilidade.
            Consequentemente, tempo, recursos e informações são perdidos, as
            vezes ao longo de um mesmo projeto.
          </p>
          <p>
            Por mais que algumas empresas e projetos atualmente forneçam dados
            digitalizados, o fato é que existe uma herança de dados em formato
            de PDF ou imagem que será parte das informações necessárias para
            projetos e obras por muitos anos, o que justifica a existência de
            uma ferramenta como o JS OpenGeo.
          </p>
          <p>
            Pensando nisso, a JS adotou a missão de contribuir com a melhoria
            desta situação, disponibilizando ferramentas que auxiliem na
            digitalização e organização de dados. Temos diversas funções
            planejadas para que o programa seja uma solução cada vez mais
            completa de extração e tratamento de dados.
          </p>
          <p className="fw-bold">
            A disponibilização de forma gratuita tem 2 motivos:
          </p>
          <ol>
            <li>
              Muito do conhecimento geológico-geotécnico é transmitido de
              profissional para profissional, seja no dia a dia do trabalho,
              seja em eventos ou em formato de publicações. A disponibilização
              deste programa é uma retribuição da JS à toda comunidade
              geológico-geotécnica brasileira que até hoje se esforçou em
              transmitir o conhecimento adiante.
            </li>
            <li>
              Mesmo com o motivo acima, acreditamos que a engenharia brasileira
              precisa de uma mudança de cultura e de novos hábitos com relação a
              compartilhamento de informações: normas deveriam ser públicas e
              gratuitas e dados de obras públicas não são facilmente
              encontrados. Todos podem contribuir para novos hábitos e culturas,
              portanto esta é a nossa parte.
            </li>
          </ol>
          <div className="d-flex gap-3">
            <Alert variant="info" className="text-center">
              <div>
                Encontrou alguma falha, problema ou bug? Precisa de informações
                ou tem sugestões de melhoria? Entre em contato pelo nosso
                Linkedin, Instagram ou por e-mail.
              </div>
              <div className="d-flex justify-content-center align-items-center gap-3 mt-1">
                <a
                  href="mailto:contato@jsgeo.com.br"
                  className="text-decoration-none text-dark"
                  title="Email"
                >
                  contato@jsgeo.com.br
                </a>
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
            <Alert variant="secondary">
              <div className="mt-2 text-center">
                Você também pode acessar o código fonte do programa no link
                abaixo. Mesmo se não souber programar, você poderá postar
                dúvidas, pedidos e sugestões de melhorias, além de reportar bugs
                e problemas.
              </div>
              <div className="d-flex justify-content-center mt-1">
                <a
                  href="https://github.com/JS-Geologia-Aplicada"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none text-dark"
                  title="Repositório"
                >
                  https://github.com/JS-Geologia-Aplicada
                </a>
              </div>
            </Alert>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage;
