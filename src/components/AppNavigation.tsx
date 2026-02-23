import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import styles from "./AppNavigation.module.css";
import changelogData from "@data/changelog.json";

const AppNavigation = () => {
  const pages: { name: string; route: string }[] = [
    { name: "Dados de sondagem", route: "/dados_de_sondagem" },
    { name: "Palitos de sondagem", route: "/palitos" },
    { name: "Ferramentas CAD/SIG", route: "/ferramentas" },
    { name: "Sobre", route: "/sobre" },
    { name: "Histórico de versões", route: "/changelog" },
  ];

  const currentVersion = changelogData.versions[0].version;

  return (
    <Navbar className="border-bottom">
      <Container fluid className="px-0">
        <Navbar.Brand className="text-dark fw-bold ps-3">
          <Link to="/" className="d-flex align-items-end text-decoration-none">
            <img
              src="js_open_geo_logo.png"
              alt="JS OpenGeo"
              style={{ height: "40px" }}
            />
            <span className="text-muted small mx-1">{currentVersion}</span>
          </Link>
        </Navbar.Brand>
        <Nav className="mx-auto">
          {pages.map((page) => (
            <NavLink
              key={page.name}
              to={page.route}
              className={({ isActive }) =>
                `px-4 ${isActive ? styles.navlinkActive : styles.navlink}`
              }
            >
              {page.name}
            </NavLink>
          ))}
        </Nav>
      </Container>
    </Navbar>
  );
};
export default AppNavigation;
