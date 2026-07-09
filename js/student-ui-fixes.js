// TutorFlash - ajustes visuales del portal estudiante
// Cierra el menú "Mi cuenta" al hacer scroll y evita que quede flotando sobre el contenido.
// No modifica Firebase, Firestore ni datos.
(function () {
  const HIDDEN_CLASS = "oculto";

  function closeStudentFloatingMenus() {
    document
      .querySelectorAll("#menuUsuario, .tf-user-dropdown, .tf-user-menu, #panelNotificaciones, .tf-notifications-panel")
      .forEach((el) => {
        el.classList.add(HIDDEN_CLASS);
        el.classList.remove("is-open", "show", "active");
      });

    document
      .querySelectorAll("#btnUsuario, #btnNotificaciones, .tf-user-chip, .tf-user-btn")
      .forEach((btn) => btn.setAttribute("aria-expanded", "false"));
  }

  function isInsideMenuTarget(target) {
    return Boolean(
      target.closest("#menuUsuario, .tf-user-dropdown, .tf-user-menu, #btnUsuario, .tf-user-chip, .tf-user-btn, #btnNotificaciones, .tf-notification-btn")
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("#cerrarMenuUsuario, .tf-user-dropdown-close").forEach((btn) => {
      btn.addEventListener("click", closeStudentFloatingMenus);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeStudentFloatingMenus();
    });

    document.addEventListener("click", (event) => {
      if (!isInsideMenuTarget(event.target)) closeStudentFloatingMenus();
    });
  });

  window.addEventListener("scroll", closeStudentFloatingMenus, { passive: true });
  window.addEventListener("resize", closeStudentFloatingMenus, { passive: true });
})();
