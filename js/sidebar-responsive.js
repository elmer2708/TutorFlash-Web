document.addEventListener("DOMContentLoaded", () => {
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
  const existingActions = document.querySelector(
    ".tf-topbar-actions, .tutor-user-area, .admin-topbar-actions",
  );

  if (!document.getElementById("tf-app-header-styles")) {
    const styles = document.createElement("style");
    styles.id = "tf-app-header-styles";
    styles.textContent = `
      .tf-app-header {
        position: fixed;
        inset: 0 0 auto 0;
        z-index: 160;
        min-height: 60px;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 14px;
        padding: 8px 18px;
        background: rgba(255, 255, 255, 0.96);
        border-bottom: 1px solid rgba(7, 27, 61, 0.08);
        box-shadow: 0 12px 28px rgba(7, 27, 61, 0.1);
      }
      body.tf-has-app-header { padding-top: 60px; }
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
        top: 60px;
        height: calc(100vh - 60px);
      }
      body.tf-has-app-header .tf-topbar,
      body.tf-has-app-header .tutor-topbar,
      body.tf-has-app-header .admin-topbar {
        display: none;
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

  actions.className = "tf-app-header-actions";

  if (existingActions) {
    actions.append(existingActions);

    if (!actions.querySelector(".tf-notification-btn")) {
      actions.insertAdjacentHTML(
        "afterbegin",
        '<a class="tf-app-header-link" href="notificaciones.html" aria-label="Ver notificaciones">🔔</a>',
      );
    }

    if (!actions.querySelector(".tf-user-chip")) {
      actions.insertAdjacentHTML(
        "beforeend",
        '<a class="tf-app-header-link" href="perfil-estudiante.html">Perfil</a>',
      );
    }
  } else {
    actions.innerHTML = `
      <a class="tf-app-header-link" href="notificaciones.html" aria-label="Ver notificaciones">🔔</a>
      <a class="tf-app-header-link" href="perfil-estudiante.html">Perfil</a>
    `;
  }

  overlay.className = "tf-sidebar-overlay";

  function cerrarMenu() {
    document.body.classList.remove("tf-sidebar-open");
    toggle.setAttribute("aria-label", sidebar ? "Abrir menú" : "Volver al panel");
    toggle.textContent = "☰";
  }

  function alternarMenu() {
    if (!sidebar) {
      window.location.href = "estudiante.html";
      return;
    }

    const abierto = document.body.classList.toggle("tf-sidebar-open");
    toggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    toggle.textContent = abierto ? "×" : "☰";
  }

  toggle.addEventListener("click", alternarMenu);
  overlay.addEventListener("click", cerrarMenu);

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
