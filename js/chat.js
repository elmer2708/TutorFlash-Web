import {
  observarUsuario,
  obtenerUsuarioActual,
  obtenerResumenChats,
  obtenerMensajesChat,
  enviarMensajeChat,
  marcarChatLeido,
} from "./firebase-service.js";
import { mostrarAviso } from "./mensajes-ui.js";

document.addEventListener("DOMContentLoaded", () => {
  const esPaginaChat = document.body.classList.contains("chat-page");
  let chatsActuales = [];
  let chatActivo = null;
  let enviando = false;

  const listaConversaciones = document.getElementById("chatListaConversaciones");
  const chatMensajes = document.getElementById("chatMensajes");
  const chatTitulo = document.getElementById("chatTitulo");
  const chatCurso = document.getElementById("chatCurso");
  const chatForm = document.getElementById("chatForm");
  const chatTexto = document.getElementById("chatTexto");
  const chatEnviar = document.getElementById("chatEnviar");
  let miniChatBadge = null;

  function limpiarTexto(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function obtenerIniciales(nombre) {
    return String(nombre || "?")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join("") || "?";
  }

  function obtenerNombreChat(chat) {
    const usuario = obtenerUsuarioActual();

    if (!usuario) return "Conversacion";

    return chat.tutorId === usuario.uid
      ? chat.estudianteNombre || "Estudiante"
      : chat.tutorNombre || "Tutor";
  }

  function esErrorSesion(error) {
    return /iniciar sesi/i.test(error?.message || "");
  }

  function esErrorRol(error) {
    return /detectar tu rol/i.test(error?.message || "");
  }

  function esErrorPermisos(error) {
    const mensaje = String(error?.message || error?.code || "");
    return /permission|permiso|insufficient/i.test(mensaje);
  }

  function obtenerMensajeCargaChat(error) {
    if (esErrorPermisos(error)) {
      return "No tienes permiso para cargar este chat. Revisa la sesión o las reglas de Firestore.";
    }

    return "No se pudo cargar el chat. Intenta nuevamente.";
  }

  function formatearFechaMensaje(fecha) {
    try {
      const fechaReal = fecha?.toDate ? fecha.toDate() : new Date(fecha);

      if (!fechaReal || Number.isNaN(fechaReal.getTime())) {
        return "";
      }

      return fechaReal.toLocaleString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  }

  function pintarEstadoChat(contenedor, titulo, detalle = "") {
    if (!contenedor) return;

    contenedor.innerHTML = `
      <div class="chat-empty">
        <strong>${limpiarTexto(titulo)}</strong>
        ${detalle ? `<p>${limpiarTexto(detalle)}</p>` : ""}
      </div>
    `;
  }

  function actualizarFormularioChat(habilitado) {
    if (chatTexto) chatTexto.disabled = !habilitado;
    if (chatEnviar) chatEnviar.disabled = !habilitado;
  }

  function pintarEstadoInicialChat(resumen, contenedor) {
    if (!resumen.tieneReservas) {
      pintarEstadoChat(
        contenedor,
        "Primero necesitas una reserva para iniciar un chat.",
        "Cuando tengas una tutoría reservada, podrás conversar desde aquí.",
      );
      return;
    }

    pintarEstadoChat(
      contenedor,
      "Aún no tienes conversaciones.",
      "Cuando tengas una tutoría reservada, podrás conversar desde aquí.",
    );
  }

  function obtenerTotalNoLeidos(chats = chatsActuales) {
    return chats.filter((chat) => chat.noLeido).length;
  }

  function actualizarBadgeMiniChat(total = obtenerTotalNoLeidos()) {
    if (!miniChatBadge) return;

    if (total > 0) {
      miniChatBadge.textContent = total > 99 ? "99+" : String(total);
      miniChatBadge.hidden = false;
      return;
    }

    miniChatBadge.hidden = true;
    miniChatBadge.textContent = "";
  }

  function obtenerTextoResumenChat(chat) {
    if (chat.noLeido) {
      return chat.ultimoMensaje || "Nuevo mensaje";
    }

    return chat.ultimoMensaje || "Sin mensajes todavía";
  }

  function pintarLista(contenedor, chats, compacto = false, resumen = null) {
    if (!contenedor) return;

    if (!chats.length) {
      if (resumen) {
        pintarEstadoInicialChat(resumen, contenedor);
      } else {
        pintarEstadoChat(
          contenedor,
          "Aún no tienes conversaciones.",
          "Cuando tengas una tutoría reservada, podrás conversar desde aquí.",
        );
      }
      return;
    }

    contenedor.innerHTML = chats
      .map((chat) => {
        const nombreChat = obtenerNombreChat(chat);
        return `
        <button class="chat-item ${chatActivo?.id === chat.id ? "active" : ""} ${chat.noLeido ? "unread" : ""}" type="button" data-chat-id="${limpiarTexto(chat.id)}">
          <span class="chat-item-avatar">${limpiarTexto(obtenerIniciales(nombreChat))}</span>
          <span class="chat-item-body">
            <span class="chat-item-title">
              <strong>${limpiarTexto(nombreChat)}</strong>
              ${chat.noLeido ? '<span class="chat-unread-dot" aria-label="Conversación no leída"></span>' : ""}
            </span>
            <span class="chat-item-course">${limpiarTexto(chat.curso || "Tutoría")}</span>
            <span class="chat-item-preview">
              ${chat.noLeido ? '<strong class="chat-new-label">Nuevo mensaje</strong>' : ""}
              ${limpiarTexto(obtenerTextoResumenChat(chat))}
            </span>
          </span>
        </button>
      `;
      })
      .join("");

    if (compacto) {
      contenedor.querySelectorAll(".chat-item").forEach((boton) => {
        boton.addEventListener("click", () => {
          window.location.href = `chat.html?chat=${encodeURIComponent(boton.dataset.chatId)}`;
        });
      });
    }
  }

  async function cargarChats() {
    const resumen = await obtenerResumenChats();
    chatsActuales = resumen.chats;
    actualizarBadgeMiniChat(resumen.totalNoLeidos);

    if (esPaginaChat) {
      pintarLista(listaConversaciones, chatsActuales, false, resumen);

      const chatUrl = new URLSearchParams(window.location.search).get("chat");
      const inicial = chatsActuales.find((chat) => chat.id === chatUrl) || chatsActuales[0];

      if (inicial) {
        await seleccionarChat(inicial.id);
      } else {
        chatActivo = null;
        if (chatTitulo) chatTitulo.textContent = "Aún no hay chat abierto";
        if (chatCurso) chatCurso.textContent = "Selecciona una conversación";
        pintarEstadoInicialChat(resumen, chatMensajes);
        actualizarFormularioChat(false);
      }
    }
  }

  async function seleccionarChat(chatId) {
    chatActivo = chatsActuales.find((chat) => chat.id === chatId) || null;

    if (!chatActivo) return;

    pintarLista(listaConversaciones, chatsActuales);

    if (chatTitulo) chatTitulo.textContent = obtenerNombreChat(chatActivo);
    if (chatCurso) chatCurso.textContent = chatActivo.curso || "Tutoría";
    actualizarFormularioChat(true);

    const mensajes = await obtenerMensajesChat(chatActivo.id);
    await marcarChatLeido(chatActivo.id);
    chatsActuales = chatsActuales.map((chat) =>
      chat.id === chatActivo.id ? { ...chat, noLeido: false } : chat,
    );
    chatActivo = { ...chatActivo, noLeido: false };
    pintarLista(listaConversaciones, chatsActuales);
    actualizarBadgeMiniChat();

    if (!chatMensajes) return;

    if (!mensajes.length) {
      pintarEstadoChat(chatMensajes, "Aún no tienes mensajes.");
      return;
    }

    const usuario = obtenerUsuarioActual();

    chatMensajes.innerHTML = mensajes
      .map((mensaje) => {
        const fechaMensaje = formatearFechaMensaje(mensaje.fecha);

        return `
        <div class="chat-message ${mensaje.autorId === usuario?.uid ? "mine" : ""}">
          <p>${limpiarTexto(mensaje.texto)}</p>
          <small>${limpiarTexto(mensaje.autorRol || "usuario")}${fechaMensaje ? ` · ${limpiarTexto(fechaMensaje)}` : ""}</small>
        </div>
      `;
      })
      .join("");
    chatMensajes.scrollTop = chatMensajes.scrollHeight;
  }

  function crearMiniChat() {
    if (esPaginaChat || document.querySelector(".tf-mini-chat-button")) return;

    const boton = document.createElement("button");
    boton.className = "tf-mini-chat-button";
    boton.type = "button";
    boton.setAttribute("aria-label", "Abrir chat");
    boton.innerHTML = `
      <span class="tf-mini-chat-icon">💬</span>
      <span class="tf-mini-chat-text">Chat</span>
      <span class="tf-mini-chat-badge" hidden></span>
    `;

    const panel = document.createElement("section");
    panel.className = "tf-mini-chat-panel oculto";
    panel.innerHTML = `
      <div class="tf-mini-chat-head">
        <strong>Mensajes</strong>
        <button class="tf-mini-chat-close" type="button">×</button>
      </div>
      <div class="tf-mini-chat-list">
        <div class="chat-empty"><strong>Cargando mensajes...</strong></div>
      </div>
      <div class="tf-mini-chat-foot">
        <a href="chat.html" class="tf-mini-chat-link">Abrir chat completo</a>
      </div>
    `;

    document.body.append(boton, panel);
    miniChatBadge = boton.querySelector(".tf-mini-chat-badge");

    const lista = panel.querySelector(".tf-mini-chat-list");
    const cerrar = panel.querySelector(".tf-mini-chat-close");

    async function cargarMiniChat() {
      try {
        const resumen = await obtenerResumenChats();
        chatsActuales = resumen.chats;
        actualizarBadgeMiniChat(resumen.totalNoLeidos);
        pintarLista(lista, resumen.chats, true, resumen);
      } catch (error) {
        if (esErrorSesion(error)) {
          pintarEstadoChat(lista, "Inicia sesión para ver tus conversaciones.");
          return;
        }

        if (esErrorRol(error)) {
          pintarEstadoChat(
            lista,
            "No se pudo detectar tu rol.",
            "Ingresa nuevamente para cargar tus conversaciones.",
          );
          return;
        }

        console.error("Error al cargar mini chat:", error);
        pintarEstadoChat(lista, obtenerMensajeCargaChat(error));
      }
    }

    boton.addEventListener("click", async () => {
      panel.classList.toggle("oculto");

      if (!panel.classList.contains("oculto")) {
        await cargarMiniChat();
      }
    });

    cerrar?.addEventListener("click", () => panel.classList.add("oculto"));
    cargarMiniChat();
  }

  listaConversaciones?.addEventListener("click", async (event) => {
    const boton = event.target.closest("[data-chat-id]");
    if (!boton) return;

    try {
      await seleccionarChat(boton.dataset.chatId);
    } catch (error) {
      console.error("Error al abrir chat:", error);
      mostrarAviso(error.message || "No se pudo abrir el chat.", "error");
    }
  });

  chatForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!chatActivo || enviando) return;

    const texto = chatTexto?.value.trim() || "";

    if (!texto) {
      mostrarAviso("Escribe un mensaje antes de enviarlo.", "advertencia");
      return;
    }

    try {
      enviando = true;
      if (chatEnviar) {
        chatEnviar.disabled = true;
        chatEnviar.textContent = "Enviando...";
      }

      await enviarMensajeChat(chatActivo.id, texto);
      if (chatTexto) chatTexto.value = "";
      await cargarChats();
      await seleccionarChat(chatActivo.id);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      mostrarAviso(error.message || "No se pudo enviar el mensaje.", "error");
    } finally {
      enviando = false;
      if (chatEnviar) {
        chatEnviar.disabled = false;
        chatEnviar.textContent = "Enviar";
      }
    }
  });

  observarUsuario(async (usuario) => {
    if (!usuario) {
      if (esPaginaChat) window.location.href = "cuenta.html";
      return;
    }

    try {
      actualizarFormularioChat(false);

      if (esPaginaChat) {
        await cargarChats();
      } else {
        crearMiniChat();
      }
    } catch (error) {
      if (esPaginaChat) {
        if (esErrorSesion(error)) {
          pintarEstadoChat(
            listaConversaciones,
            "Inicia sesión para ver tus conversaciones.",
          );
          pintarEstadoChat(
            chatMensajes,
            "Inicia sesión para ver tus conversaciones.",
          );
          return;
        }

        if (esErrorRol(error)) {
          pintarEstadoChat(
            listaConversaciones,
            "No se pudo detectar tu rol.",
            "Ingresa nuevamente para cargar tus conversaciones.",
          );
          pintarEstadoChat(
            chatMensajes,
            "No se pudo detectar tu rol.",
            "Ingresa nuevamente para cargar tus conversaciones.",
          );
          return;
        }

        console.error("Error al iniciar chat:", error);
        pintarEstadoChat(listaConversaciones, obtenerMensajeCargaChat(error));
        pintarEstadoChat(chatMensajes, obtenerMensajeCargaChat(error));
        mostrarAviso(obtenerMensajeCargaChat(error), "error");
      }
    }
  });
});
