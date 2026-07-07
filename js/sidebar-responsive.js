document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(
    ".tf-sidebar, .tutor-sidebar, .perfil-sidebar, .disponibilidad-sidebar, .admin-sidebar",
  );

  if (!sidebar || document.querySelector(".tf-menu-toggle")) return;

  const toggle = document.createElement("button");
  const overlay = document.createElement("div");

  toggle.type = "button";
  toggle.className = "tf-menu-toggle";
  toggle.setAttribute("aria-label", "Abrir menú");
  toggle.textContent = "☰";

  overlay.className = "tf-sidebar-overlay";

  function cerrarMenu() {
    document.body.classList.remove("tf-sidebar-open");
    toggle.setAttribute("aria-label", "Abrir menú");
    toggle.textContent = "☰";
  }

  function alternarMenu() {
    const abierto = document.body.classList.toggle("tf-sidebar-open");
    toggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    toggle.textContent = abierto ? "×" : "☰";
  }

  toggle.addEventListener("click", alternarMenu);
  overlay.addEventListener("click", cerrarMenu);

  sidebar.querySelectorAll("a, button").forEach((elemento) => {
    elemento.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 900px)").matches) {
        cerrarMenu();
      }
    });
  });

  document.body.append(toggle, overlay);
});
