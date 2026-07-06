import {
  observarUsuario,
  cerrarSesion,
  obtenerPerfilUsuarioActual,
  obtenerTutoresActivos,
  guardarTutorFavorito,
  obtenerMisFavoritos,
} from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const tituloBienvenida = document.querySelector("#tituloBienvenida");

  const btnUsuario = document.querySelector("#btnUsuario");
  const menuUsuario = document.querySelector("#menuUsuario");
  const cerrarMenuUsuario = document.querySelector("#cerrarMenuUsuario");
  const btnCerrarSesionPortal = document.querySelector(
    "#btnCerrarSesionPortal",
  );

  const avatarIniciales = document.querySelector("#avatarIniciales");
  const avatarInicialesMenu = document.querySelector("#avatarInicialesMenu");
  const nombreUsuarioTop = document.querySelector("#nombreUsuarioTop");
  const correoUsuarioMenu = document.querySelector("#correoUsuarioMenu");
  const saludoUsuarioMenu = document.querySelector("#saludoUsuarioMenu");

  const btnNotificaciones = document.querySelector("#btnNotificaciones");
  const panelNotificaciones = document.querySelector("#panelNotificaciones");
  const cerrarNotificaciones = document.querySelector("#cerrarNotificaciones");

  const mensajeTutores = document.querySelector("#mensajeTutores");
  const listaTutores = document.querySelector("#listaTutores");

  function limpiarTexto(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizar(texto) {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function obtenerNombreUsuario(usuario, perfil) {
    return (
      perfil?.nombre ||
      perfil?.nombreCompleto ||
      perfil?.nombreUsuario ||
      usuario?.displayName ||
      "estudiante"
    );
  }

  function obtenerIniciales(nombre, correo) {
    const texto = String(nombre || correo || "Usuario").trim();
    const partes = texto.replace("@", " ").split(" ").filter(Boolean);

    const inicial1 = partes[0]?.charAt(0) || "U";
    const inicial2 = partes[1]?.charAt(0) || "";

    return `${inicial1}${inicial2}`.toUpperCase();
  }

  function obtenerInicial(nombre) {
    return (
      String(nombre || "Tutor")
        .trim()
        .charAt(0)
        .toUpperCase() || "T"
    );
  }

  function capitalizarTexto(texto) {
    return String(texto || "")
      .toLowerCase()
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((palabra, index) => {
        const palabrasMinusculas = ["de", "del", "la", "las", "el", "los", "y"];

        if (index > 0 && palabrasMinusculas.includes(palabra)) {
          return palabra;
        }

        return palabra.charAt(0).toUpperCase() + palabra.slice(1);
      })
      .join(" ");
  }

  const cursosCorregidos = {
    matematica: "Matemática",
    calculo: "Cálculo",
    algebra: "Álgebra",
    estadistica: "Estadística",
    quimica: "Química",
    fisica: "Física",
    ingles: "Inglés",
    programacion: "Programación",
    comunicacion: "Comunicación",
    economia: "Economía",
    contabilidad: "Contabilidad",
    biologia: "Biología",
    historia: "Historia",
    geografia: "Geografía",
    filosofia: "Filosofía",
    psicologia: "Psicología",
    computacion: "Computación",
    informatica: "Informática",
    administracion: "Administración",
    "matematica financiera": "Matemática financiera",
    "razonamiento matematico": "Razonamiento matemático",
    "razonamiento verbal": "Razonamiento verbal",
  };

  function corregirCurso(curso) {
    const clave = normalizar(curso);

    return cursosCorregidos[clave] || capitalizarTexto(curso);
  }

  function separarCursos(cursos) {
    if (Array.isArray(cursos)) {
      return cursos;
    }

    return String(cursos || "")
      .split(",")
      .map((curso) => curso.trim())
      .filter(Boolean);
  }

  function corregirListaCursos(cursos) {
    return cursos.map((curso) => corregirCurso(curso));
  }

  function obtenerPrecioTutor(tutor) {
    const precio = Number(tutor.precioHora || tutor.precio);

    if (Number.isFinite(precio) && precio > 0) {
      return precio;
    }

    return 25;
  }

  function obtenerRatingTutor(tutor) {
    return tutor.rating || tutor.calificacion || "4.8";
  }

  function obtenerDisponibilidadTutor(disponibilidad) {
    if (!disponibilidad) {
      return "Disponible hoy";
    }

    if (disponibilidad === "Mañana") {
      return "Disponible mañana";
    }

    if (disponibilidad === "Tarde") {
      return "Disponible hoy";
    }

    if (disponibilidad === "Noche") {
      return "Disponible hoy";
    }

    if (disponibilidad === "Fines de semana") {
      return "Disponible fines de semana";
    }

    return disponibilidad;
  }

  function tutorEstaEnLinea(tutor) {
    return tutor.estaEnLinea === true;
  }

  function mostrarDatosUsuario(usuario, perfil) {
    const nombre = obtenerNombreUsuario(usuario, perfil);
    const correo = usuario?.email || perfil?.correo || "correo@ejemplo.com";
    const iniciales = obtenerIniciales(nombre, correo);

    if (tituloBienvenida) {
      tituloBienvenida.textContent = `Tutores disponibles, ${nombre} 👨‍🏫`;
    }

    if (nombreUsuarioTop) {
      nombreUsuarioTop.textContent = nombre;
    }

    if (correoUsuarioMenu) {
      correoUsuarioMenu.textContent = correo;
    }

    if (saludoUsuarioMenu) {
      saludoUsuarioMenu.textContent = `¡Hola, ${nombre}!`;
    }

    if (avatarIniciales) {
      avatarIniciales.textContent = iniciales;
    }

    if (avatarInicialesMenu) {
      avatarInicialesMenu.textContent = iniciales;
    }
  }

  function crearTarjetaTutor(tutor) {
    const nombreTutor = capitalizarTexto(tutor.nombre || "Tutor");
    const cursos = corregirListaCursos(separarCursos(tutor.cursos));
    const cursoPrincipal = cursos[0] || "Curso general";

    const precio = obtenerPrecioTutor(tutor);
    const rating = obtenerRatingTutor(tutor);
    const disponibilidad = obtenerDisponibilidadTutor(tutor.disponibilidad);

    const modalidad = tutor.modalidad || "Modalidad no indicada";
    const nivel = tutor.nivel || "Nivel no indicado";
    const distrito = tutor.distrito || tutor.zona || "Zona no indicada";

    const presentacion =
      tutor.presentacion ||
      tutor.descripcion ||
      tutor.experiencia ||
      "Tutor disponible para ayudarte a reforzar tus cursos.";

    const estadoLinea = tutorEstaEnLinea(tutor)
      ? "🟢 En línea"
      : "⚪ Disponible";

    const cursoUrl = encodeURIComponent(cursoPrincipal);
    const tutorId = tutor.id || tutor.uid || tutor.tutorId || "";

    return `
      <article class="tf-tutor-card">
        <div class="tf-avatar">
          ${limpiarTexto(obtenerInicial(nombreTutor))}
        </div>

        <h3>${limpiarTexto(nombreTutor)}</h3>

        <p class="tf-tutor-courses">
          ${limpiarTexto(
            cursos.length > 0 ? cursos.join(", ") : "Cursos disponibles",
          )}
        </p>

        <p class="tf-tutor-description">
          ${limpiarTexto(presentacion)}
        </p>

        <div class="tf-tutor-tags">
          <span>${limpiarTexto(nivel)}</span>
          <span>${limpiarTexto(modalidad)}</span>
          <span>${limpiarTexto(distrito)}</span>
        </div>

        <span class="tf-tutor-meta">
          ⭐ ${limpiarTexto(rating)} · ${limpiarTexto(disponibilidad)}
        </span>

        <span class="tf-tutor-meta">
          ${limpiarTexto(estadoLinea)}
        </span>

        <strong class="tf-tutor-price">
          S/ ${precio.toFixed(2)} por hora
        </strong>

        <div class="tf-tutor-actions">
          <a class="tf-card-btn" href="buscar-tutor.html?curso=${cursoUrl}">
            Reservar tutoría
          </a>

          <button
  type="button"
  class="tf-favorite-btn"
  data-tutor-id="${limpiarTexto(tutorId)}"
>
  ♡ Guardar favorito
</button>


        </div>
      </article>
    `;
  }

  async function cargarTutores() {
    try {
      if (!listaTutores) return;

      const tutores = await obtenerTutoresActivos();
      const favoritos = await obtenerMisFavoritos();
      const favoritosIds = favoritos.map((favorito) => favorito.tutorId);

      if (!tutores.length) {
        listaTutores.innerHTML = `
          <div class="tf-empty-tutors">
            <h3>Aún no hay tutores activos</h3>
            <p>Cuando los tutores completen su perfil público, aparecerán aquí.</p>
          </div>
        `;

        if (mensajeTutores) {
          mensajeTutores.textContent = "Todavía no hay tutores activos.";
        }

        return;
      }

      listaTutores.innerHTML = tutores
        .map((tutor) => crearTarjetaTutor(tutor))
        .join("");

      if (mensajeTutores) {
        mensajeTutores.textContent = `Mostrando ${tutores.length} tutor(es) activos.`;
      }

      activarFavoritosVisuales(tutores, favoritosIds);
    } catch (error) {
      console.error("Error al cargar tutores:", error);

      if (mensajeTutores) {
        mensajeTutores.textContent = "No se pudieron cargar los tutores.";
      }

      if (listaTutores) {
        listaTutores.innerHTML = `
          <div class="tf-empty-tutors">
            <h3>Error al cargar tutores</h3>
            <p>Revisa la conexión o los permisos de Firebase.</p>
          </div>
        `;
      }
    }
  }

  function activarFavoritosVisuales(tutores, favoritosIds) {
    document.querySelectorAll(".tf-favorite-btn").forEach((boton) => {
      const tutorId = boton.dataset.tutorId;

      if (favoritosIds.includes(tutorId)) {
        boton.textContent = "♥ Guardado";
        boton.disabled = true;
        return;
      }

      boton.addEventListener("click", async () => {
        try {
          const tutor = tutores.find((item) => {
            const id = item.id || item.uid || item.tutorId;
            return id === tutorId;
          });

          if (!tutor) {
            alert("No se encontró la información del tutor.");
            return;
          }

          boton.disabled = true;
          boton.textContent = "Guardando...";

          await guardarTutorFavorito(tutor);

          boton.textContent = "♥ Guardado";
        } catch (error) {
          console.error("Error al guardar favorito:", error);
          boton.disabled = false;
          boton.textContent = "♡ Guardar favorito";
          alert("No se pudo guardar el tutor como favorito.");
        }
      });
    });
  }

  async function cargarUsuarioPortal(usuario) {
    try {
      const perfil = await obtenerPerfilUsuarioActual();
      mostrarDatosUsuario(usuario, perfil);
    } catch (error) {
      console.error(error);
      mostrarDatosUsuario(usuario, null);
    }
  }

  if (btnUsuario && menuUsuario) {
    btnUsuario.addEventListener("click", () => {
      menuUsuario.classList.toggle("oculto");

      if (panelNotificaciones) {
        panelNotificaciones.classList.add("oculto");
      }
    });
  }

  if (cerrarMenuUsuario && menuUsuario) {
    cerrarMenuUsuario.addEventListener("click", () => {
      menuUsuario.classList.add("oculto");
    });
  }

  if (btnNotificaciones && panelNotificaciones) {
    btnNotificaciones.addEventListener("click", () => {
      panelNotificaciones.classList.toggle("oculto");

      if (menuUsuario) {
        menuUsuario.classList.add("oculto");
      }
    });
  }

  if (cerrarNotificaciones && panelNotificaciones) {
    cerrarNotificaciones.addEventListener("click", () => {
      panelNotificaciones.classList.add("oculto");
    });
  }

  document.addEventListener("click", (evento) => {
    if (
      menuUsuario &&
      btnUsuario &&
      !menuUsuario.contains(evento.target) &&
      !btnUsuario.contains(evento.target)
    ) {
      menuUsuario.classList.add("oculto");
    }

    if (
      panelNotificaciones &&
      btnNotificaciones &&
      !panelNotificaciones.contains(evento.target) &&
      !btnNotificaciones.contains(evento.target)
    ) {
      panelNotificaciones.classList.add("oculto");
    }
  });

  if (btnCerrarSesionPortal) {
    btnCerrarSesionPortal.addEventListener("click", async () => {
      try {
        await cerrarSesion();
        window.location.href = "../index.html";
      } catch (error) {
        console.error(error);
        alert("No se pudo cerrar sesión.");
      }
    });
  }

  observarUsuario((usuario) => {
    if (!usuario) {
      window.location.href = "cuenta.html";
      return;
    }

    cargarUsuarioPortal(usuario);
  });

  cargarTutores();
});
