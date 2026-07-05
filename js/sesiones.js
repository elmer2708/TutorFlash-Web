import { observarUsuario, obtenerMisSesiones } from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const estadoSesiones = document.querySelector("#estadoSesiones");
  const listaMisSesiones = document.querySelector("#listaMisSesiones");

  function mostrarEstado(mensaje) {
    if (estadoSesiones) {
      estadoSesiones.textContent = mensaje;
    }
  }

  function mostrarSesiones(sesiones) {
    if (!listaMisSesiones) return;

    if (!sesiones.length) {
      listaMisSesiones.innerHTML = `
        <div class="sesion-card">
          <h3>Aún no tienes sesiones reservadas</h3>
          <p>Cuando reserves una tutoría, aparecerá en esta sección.</p>
        </div>
      `;
      return;
    }

    listaMisSesiones.innerHTML = sesiones
      .map(
        (sesion) => `
          <article class="sesion-card">
            <h3>${sesion.curso || "Tutoría"}</h3>
            <p><strong>Tutor:</strong> ${sesion.tutor || "No registrado"}</p>
            <p><strong>Fecha:</strong> ${sesion.fecha || "No registrada"}</p>
            <p><strong>Hora:</strong> ${sesion.hora || "No registrada"}</p>
            <p><strong>Duración:</strong> ${sesion.duracion || "No registrada"}</p>
            <p><strong>Modalidad:</strong> ${sesion.modalidad || "No registrada"}</p>
            <p><strong>Total:</strong> S/ ${sesion.total || "0"}</p>
            <p><strong>Pago:</strong> ${sesion.metodoPago || "Simulado"}</p>
            <p><strong>Estado:</strong> ${sesion.estado || "Confirmada"}</p>
          </article>
        `,
      )
      .join("");
  }

  async function cargarSesiones() {
    try {
      const sesiones = await obtenerMisSesiones();
      mostrarEstado("Sesiones reservadas");
      mostrarSesiones(sesiones);
    } catch (error) {
      console.error(error);
      mostrarEstado("No se pudieron cargar tus sesiones.");
    }
  }

  observarUsuario((usuario) => {
    if (!usuario) {
      mostrarEstado("Debes iniciar sesión para ver tus reservas.");

      listaMisSesiones.innerHTML = `
        <div class="sesion-card">
          <h3>Inicia sesión</h3>
          <p>Para ver tus sesiones reservadas, primero debes iniciar sesión.</p>
          <a href="cuenta.html" class="btn-volver">Iniciar sesión</a>
        </div>
      `;

      return;
    }

    cargarSesiones();
  });
});
