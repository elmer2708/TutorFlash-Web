document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("tf-sidebar-shell-styles")) {
    const sidebarStyles = document.createElement("link");
    sidebarStyles.id = "tf-sidebar-shell-styles";
    sidebarStyles.rel = "stylesheet";
    sidebarStyles.href = "../css/sidebar-shell.css?v=tf-sidebar-shell-v1";
    document.head.append(sidebarStyles);
  }

  const sidebar = document.querySelector(
    ".tf-sidebar, .tutor-sidebar, .perfil-sidebar, .disponibilidad-sidebar, .admin-sidebar",
  );
  const esPaginaChat = document.body.classList.contains("chat-page");

  if ((!sidebar && !esPaginaChat) || document.querySelector(".tf-app-header")) {
    return;
  }

  const header = document.createElement("header");
  const toggle = document.createElement("button");
  const overlay = document.createElement("div");
  const brand = document.createElement("a");
  const actions = document.createElement("div");
  const mobileLogout = document.createElement("button");

  if (!document.getElementById("tf-app-header-styles")) {
    const styles = document.createElement("style");
    styles.id = "tf-app-header-styles";
    styles.textContent = `
      .tf-app-header {
        position: fixed;
        inset: 0 0 auto 0;
        z-index: 160;
        min-height: 60px;
        display: none;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 14px;
        padding: 8px 18px;
        background: rgba(255, 255, 255, 0.96);
        border-bottom: 1px solid rgba(7, 27, 61, 0.08);
        box-shadow: 0 12px 28px rgba(7, 27, 61, 0.1);
      }
      body.tf-has-app-header { padding-top: 0; }
      .tf-app-header .tf-menu-toggle,
      .tf-app-header-link {
        position: static;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        border: 0;
        border-radius: 14px;
        padding: 0 14px;
        background: #f4b942;
        color: #102a43;
        font: inherit;
        font-weight: 900;
        text-decoration: none;
        box-shadow: none;
        cursor: pointer;
      }
      .tf-app-header .tf-menu-toggle {
        width: 42px;
        padding: 0;
        font-size: 1.28rem;
      }
      .tf-app-header-link { background: #f8fafc; }
      .tf-app-header-brand {
        min-width: 0;
        color: #071b3d;
        font-size: 1.08rem;
        font-weight: 900;
        text-decoration: none;
      }
      .tf-app-header-actions {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
      }
      body.tf-has-app-header .tf-sidebar,
      body.tf-has-app-header .tutor-sidebar,
      body.tf-has-app-header .perfil-sidebar,
      body.tf-has-app-header .disponibilidad-sidebar,
      body.tf-has-app-header .admin-sidebar {
        top: 0;
        height: 100vh;
      }
      body.tf-has-app-header .tf-topbar,
      body.tf-has-app-header .tf-student-topbar,
      body.tf-has-app-header .tutor-topbar,
      body.tf-has-app-header .admin-topbar {
        display: flex;
      }
      body.tf-has-app-header .tf-student-main,
      body.tf-has-app-header .tutor-main,
      body.tf-has-app-header .perfil-main,
      body.tf-has-app-header .disponibilidad-main,
      body.tf-has-app-header .admin-content {
        padding-top: 0;
      }
      body.tf-has-app-header .chat-shell {
        min-height: 100vh;
      }
      body.tf-has-app-header .chat-layout {
        min-height: calc(100vh - 48px);
      }
      @media (max-width: 900px) {
        .tf-app-header {
          display: grid;
        }
        body.tf-has-app-header {
          padding-top: 60px;
        }
        body.tf-has-app-header .tf-sidebar,
        body.tf-has-app-header .tutor-sidebar,
        body.tf-has-app-header .perfil-sidebar,
        body.tf-has-app-header .disponibilidad-sidebar,
        body.tf-has-app-header .admin-sidebar {
          top: 60px;
          height: calc(100vh - 60px);
        }
        body.tf-has-app-header .tf-topbar,
        body.tf-has-app-header .tf-student-topbar,
        body.tf-has-app-header .tutor-topbar,
        body.tf-has-app-header .admin-topbar {
          display: none;
        }
        body.tf-has-app-header .tf-student-main,
        body.tf-has-app-header .tutor-main,
        body.tf-has-app-header .perfil-main,
        body.tf-has-app-header .disponibilidad-main,
        body.tf-has-app-header .admin-content {
          padding-top: 16px;
        }
        body.tf-has-app-header .chat-shell {
          min-height: calc(100vh - 60px);
        }
        body.tf-has-app-header .chat-layout {
          min-height: calc(100vh - 108px);
        }
      }
      @media (max-width: 760px) {
        body.tf-has-app-header .chat-layout {
          min-height: calc(100vh - 60px);
        }
      }
      @media (max-width: 620px) {
        .tf-app-header {
          grid-template-columns: auto minmax(96px, 1fr) auto;
          gap: 10px;
          padding-inline: 12px;
        }
        .tf-app-header .tf-user-meta small { display: none; }
        .tf-app-header .tf-user-chip {
          width: auto;
          max-width: 150px;
          padding-right: 8px;
        }
      }

      /* Contrato único del sidebar: escritorio desde 901 px, off-canvas hasta 900 px. */
      @media (min-width: 901px) {
        body.tf-has-app-header .tf-app-header {
          display: none !important;
        }
        body.tf-has-app-header .tf-sidebar-overlay,
        body.tf-has-app-header .tf-mobile-sidebar-logout {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        body.tf-has-app-header .tf-topbar,
        body.tf-has-app-header .tf-student-topbar,
        body.tf-has-app-header .tutor-topbar,
        body.tf-has-app-header .admin-topbar {
          display: flex !important;
        }
        body.tf-has-app-header.tf-student-page .tf-student-layout {
          width: 100% !important;
          max-width: none !important;
          padding: 12px 18px 12px 254px !important;
          display: block !important;
        }
        body.tf-has-app-header.tf-student-page .tf-sidebar {
          position: fixed !important;
          inset: 12px auto 12px 12px !important;
          width: 230px !important;
          height: auto !important;
          transform: none !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          border-radius: 24px !important;
        }
        body.tf-has-app-header.tf-student-page .tf-student-main {
          width: 100% !important;
          min-width: 0 !important;
          margin: 0 !important;
        }
      }

      @media (max-width: 900px) {
        html,
        body.tf-has-app-header {
          max-width: 100% !important;
          overflow-x: hidden !important;
        }
        body.tf-has-app-header.tf-sidebar-open {
          overflow: hidden !important;
        }
        body.tf-has-app-header .tf-app-header {
          z-index: 10000 !important;
        }
        body.tf-has-app-header .tf-student-layout,
        body.tf-has-app-header .admin-layout {
          width: 100% !important;
          max-width: 100% !important;
          grid-template-columns: minmax(0, 1fr) !important;
        }
        body.tf-has-app-header .tf-sidebar,
        body.tf-has-app-header .tutor-sidebar,
        body.tf-has-app-header .perfil-sidebar,
        body.tf-has-app-header .disponibilidad-sidebar,
        body.tf-has-app-header .admin-sidebar {
          position: fixed !important;
          inset: 60px auto 0 0 !important;
          z-index: 9999 !important;
          width: min(86vw, 320px) !important;
          max-width: 320px !important;
          height: calc(100dvh - 60px) !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 16px !important;
          display: flex !important;
          flex-direction: column !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          border-radius: 0 24px 24px 0 !important;
          transform: translateX(-110%) !important;
          transition: transform 0.25s ease !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        body.tf-has-app-header.tf-sidebar-open .tf-sidebar,
        body.tf-has-app-header.tf-sidebar-open .tutor-sidebar,
        body.tf-has-app-header.tf-sidebar-open .perfil-sidebar,
        body.tf-has-app-header.tf-sidebar-open .disponibilidad-sidebar,
        body.tf-has-app-header.tf-sidebar-open .admin-sidebar {
          transform: translateX(0) !important;
          visibility: visible !important;
          pointer-events: auto !important;
        }
        body.tf-has-app-header .tf-sidebar-menu,
        body.tf-has-app-header .sidebar-nav,
        body.tf-has-app-header .admin-menu {
          width: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          grid-template-columns: none !important;
        }
        body.tf-has-app-header .tf-sidebar-menu a,
        body.tf-has-app-header .sidebar-nav a,
        body.tf-has-app-header .admin-menu a {
          width: 100% !important;
          min-width: 0 !important;
          justify-content: flex-start !important;
        }
        body.tf-has-app-header .tf-sidebar-overlay {
          position: fixed !important;
          inset: 60px 0 0 !important;
          z-index: 9998 !important;
          display: block !important;
          background: rgba(6, 26, 58, 0.45) !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transition: opacity 0.25s ease, visibility 0.25s ease !important;
        }
        body.tf-has-app-header.tf-sidebar-open .tf-sidebar-overlay {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
        }
        body.tf-has-app-header .tf-mobile-sidebar-logout {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        body.tf-has-app-header.tf-sidebar-open .tf-mobile-sidebar-logout {
          display: inline-flex !important;
          visibility: visible !important;
          pointer-events: auto !important;
          flex: 0 0 auto !important;
          width: 100% !important;
          margin-top: auto !important;
        }
        body.tf-has-app-header .tf-student-main,
        body.tf-has-app-header .tutor-main,
        body.tf-has-app-header .perfil-main,
        body.tf-has-app-header .disponibilidad-main,
        body.tf-has-app-header .admin-content,
        body.tf-has-app-header .chat-shell {
          min-width: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          margin-left: 0 !important;
          box-sizing: border-box !important;
        }
      }

      @media (max-width: 390px) {
        .tf-app-header {
          grid-template-columns: 42px minmax(0, 1fr) auto !important;
          gap: 8px !important;
          padding-inline: 8px !important;
        }
        .tf-app-header-brand {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        .tf-app-header-link {
          min-height: 40px !important;
          padding-inline: 10px !important;
          font-size: 0.82rem !important;
        }
      }
    `;
    document.head.append(styles);
  }

  header.className = "tf-app-header";

  toggle.type = "button";
  toggle.className = "tf-menu-toggle";
  toggle.setAttribute("aria-label", sidebar ? "Abrir menú" : "Volver al panel");
  toggle.textContent = "☰";

  brand.className = "tf-app-header-brand";
  brand.href = "../index.html";
  brand.textContent = "TutorFlash";

  const esTutor = !!document.querySelector(".tutor-sidebar") || !!document.querySelector(".perfil-sidebar") || !!document.querySelector(".disponibilidad-sidebar");
  const esAdmin = !!document.querySelector(".admin-sidebar");
  const notificacionesHref = esAdmin ? "admin.html" : (esTutor ? "panel-tutor.html#reservas" : "notificaciones.html");
  const perfilHref = esAdmin ? "admin.html" : (esTutor ? "perfil-tutor.html" : "perfil-estudiante.html");
  const perfilLabel = esAdmin ? "Panel" : "Perfil";

  actions.className = "tf-app-header-actions";
  actions.innerHTML = `
    <a class="tf-app-header-link" href="${notificacionesHref}" aria-label="Acceso rápido">🔔</a>
    <a class="tf-app-header-link" href="${perfilHref}">${perfilLabel}</a>
  `;

  overlay.className = "tf-sidebar-overlay";

  mobileLogout.type = "button";
  mobileLogout.className = "tf-mobile-sidebar-logout";
  mobileLogout.innerHTML = '<span aria-hidden="true">⏻</span><span>Cerrar sesión</span>';
  mobileLogout.addEventListener("click", () => {
    const logoutButton = document.querySelector("#btnCerrarSesionPortal, #btnCerrarSesionAdmin, #btnCerrarSesionTutor");
    if (logoutButton) {
      logoutButton.click();
      return;
    }

    window.location.href = "cuenta.html";
  });

  if (sidebar && !sidebar.querySelector(".tf-mobile-sidebar-logout")) {
    sidebar.append(mobileLogout);
  }

  function cerrarMenu() {
    document.body.classList.remove("tf-sidebar-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", sidebar ? "Abrir menú" : "Volver al panel");
    toggle.textContent = "☰";
  }

  function alternarMenu() {
    if (!sidebar) {
      window.location.href = "estudiante.html";
      return;
    }

    const abierto = document.body.classList.toggle("tf-sidebar-open");
    toggle.setAttribute("aria-expanded", String(abierto));
    toggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    toggle.textContent = abierto ? "×" : "☰";
  }

  toggle.addEventListener("click", alternarMenu);
  overlay.addEventListener("click", cerrarMenu);

  toggle.setAttribute("aria-expanded", "false");

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("tf-sidebar-open")) {
      cerrarMenu();
      toggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) cerrarMenu();
  });

  sidebar?.querySelectorAll("a, button").forEach((elemento) => {
    elemento.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 900px)").matches) {
        cerrarMenu();
      }
    });
  });

  header.append(toggle, brand, actions);
  document.body.classList.add("tf-has-app-header");
  document.body.prepend(header);
  document.body.append(overlay);
});
