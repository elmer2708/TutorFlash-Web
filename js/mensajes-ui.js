export function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function mostrarAviso(mensaje, tipo = "info") {
  const aviso = document.createElement("div");
  const iconos = {
    exito: "OK",
    error: "!",
    advertencia: "!",
    info: "i",
    carga: "...",
  };

  aviso.className = `tf-toast tf-toast-${tipo}`;
  aviso.setAttribute("role", tipo === "error" ? "alert" : "status");
  aviso.setAttribute("aria-live", tipo === "error" ? "assertive" : "polite");

  const icono = document.createElement("span");
  icono.textContent = iconos[tipo] || iconos.info;

  const texto = document.createElement("p");
  texto.textContent = String(
    mensaje || "Ocurrio un problema. Intenta nuevamente.",
  );

  aviso.append(icono, texto);
  document.body.appendChild(aviso);

  window.setTimeout(() => {
    aviso.classList.add("is-hiding");
    aviso.addEventListener("transitionend", () => aviso.remove(), {
      once: true,
    });
  }, 3600);
}
