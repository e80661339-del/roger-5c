
// ====================== DATOS INICIALES ======================

function obtenerNumeroGuardado(clave, valorInicial) {
  try {
    const valor = localStorage.getItem(clave);
    const numero = Number(valor);

    return valor !== null && Number.isFinite(numero) && numero >= 0
      ? Math.floor(numero)
      : valorInicial;
  } catch (error) {
    console.warn("No se pudieron recuperar los datos:", error);
    return valorInicial;
  }
}

let puntos = obtenerNumeroGuardado("ecoPuntos", 1240);
let botellas = obtenerNumeroGuardado("ecoBotellas", 124);

// Tabla de niveles
const niveles = [
  { nivel: 1, nombre: "Aprendiz Verde", min: 0, max: 199 },
  { nivel: 2, nombre: "Reciclador", min: 200, max: 499 },
  { nivel: 3, nombre: "Guardián del Planeta", min: 500, max: 999 },
  { nivel: 4, nombre: "Embajador Eco", min: 1000, max: 2499 },
  { nivel: 5, nombre: "Héroe del Reciclaje", min: 2500, max: Infinity }
];

let temporizadorNotificacion = null;

// ====================== GUARDAR DATOS ======================

function guardarDatos() {
  try {
    localStorage.setItem("ecoPuntos", String(puntos));
    localStorage.setItem("ecoBotellas", String(botellas));
  } catch (error) {
    console.error("No se pudieron guardar los datos:", error);
    mostrarNotificacion("No se pudieron guardar los cambios.", "error");
  }
}

// ====================== OBTENER NIVEL ======================

function obtenerNivel() {
  return niveles.find(n => puntos >= n.min && puntos <= n.max)
    || niveles[niveles.length - 1];
}

// ====================== ACTUALIZAR DASHBOARD ======================

function actualizarDashboard() {
  const nivelActual = obtenerNivel();

  const siguiente = niveles.find(
    n => n.nivel === nivelActual.nivel + 1
  );

  // Actualizar puntos
  document.querySelector(".puntos-card .numero").textContent =
    puntos.toLocaleString("es-ES");

  // Actualizar nivel
  document.querySelector(".nivel-badge").textContent =
    `Nivel ${nivelActual.nivel} · ${nivelActual.nombre}`;

  // Actualizar progreso
  let porcentaje = 100;
  let restantes = 0;

  if (siguiente) {
    const progreso = puntos - nivelActual.min;
    const totalNivel = siguiente.min - nivelActual.min;

    porcentaje = Math.min(
      100,
      Math.max(0, Math.round((progreso / totalNivel) * 100))
    );

    restantes = Math.max(0, siguiente.min - puntos);
  }

  document.querySelector(".progreso-fill").style.width =
    porcentaje + "%";

  document.querySelector(
    ".progreso div span:last-child"
  ).textContent = siguiente
    ? `${restantes.toLocaleString("es-ES")} pts restantes`
    : "¡Nivel máximo!";

  // Actualizar estadísticas
  const estadisticas = document.querySelectorAll(
    ".stat-item .valor"
  );

  estadisticas[0].textContent = botellas;
  estadisticas[1].textContent =
    (botellas * 0.03).toFixed(1) + " kg";
  estadisticas[2].textContent =
    (botellas * 0.066).toFixed(1) + " kg";
  estadisticas[3].textContent =
    Math.floor(botellas / 60);

  // Actualizar niveles visualmente
  document.querySelectorAll(".nivel-card").forEach(card => {
    card.classList.toggle(
      "activo",
      Number(card.querySelector(".num").textContent) ===
        nivelActual.nivel
    );
  });

  guardarDatos();
}

// ====================== NOTIFICACIONES ======================

function mostrarNotificacion(mensaje, tipo = "exito") {
  const anterior = document.querySelector(".notificacion");

  if (anterior) {
    anterior.remove();
  }

  clearTimeout(temporizadorNotificacion);

  const notificacion = document.createElement("div");
  notificacion.className = "notificacion";

  const icono = document.createElement("i");
  icono.className = tipo === "exito"
    ? "fas fa-check-circle"
    : "fas fa-exclamation-circle";

  const texto = document.createElement("span");
  texto.textContent = mensaje;

  notificacion.append(icono, texto);
  document.body.appendChild(notificacion);

  requestAnimationFrame(() => {
    notificacion.classList.add("mostrar");
  });

  temporizadorNotificacion = setTimeout(() => {
    notificacion.classList.remove("mostrar");

    setTimeout(() => {
      notificacion.remove();
    }, 400);
  }, 3500);
}

// ====================== MODAL DE RECICLAJE ======================

function crearModalReciclaje() {
  if (document.getElementById("modalReciclaje")) return;

  const modal = document.createElement("div");

  modal.className = "modal-overlay";
  modal.id = "modalReciclaje";

  modal.innerHTML = `
    <div class="modal" role="dialog"
         aria-modal="true"
         aria-labelledby="tituloModal">

      <div class="modal-header">
        <h3 id="tituloModal">
          <i class="fas fa-recycle"></i>
          Registrar reciclaje
        </h3>
        <button class="cerrar-modal"
                type="button"
                aria-label="Cerrar">&times;</button>
      </div>

      <div class="modal-body">

        <label for="tipoMaterial">Tipo de material</label>

        <select id="tipoMaterial">
          <option value="plastico">
            Botella de plástico (PET) — 10 pts
          </option>
          <option value="vidrio">
            Botella de vidrio — 15 pts
          </option>
          <option value="aluminio">
            Lata de aluminio — 12 pts
          </option>
        </select>

        <label for="cantidad" style="margin-top:1rem;">
          Cantidad
        </label>

        <input type="number"
               id="cantidad"
               min="1"
               max="100"
               step="1"
               value="1"
               required>

        <label style="margin-top:1rem;">
          <input type="checkbox" id="puntoOficial">
          Lo entregué en un punto oficial
          (+5 pts extra por unidad)
        </label>

      </div>

      <div class="modal-footer">
        <button class="btn-cancelar" type="button">
          Cancelar
        </button>

        <button class="btn-confirmar" type="button">
          Registrar y ganar puntos
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".cerrar-modal")
    .addEventListener("click", cerrarModal);

  modal.querySelector(".btn-cancelar")
    .addEventListener("click", cerrarModal);

  modal.querySelector(".btn-confirmar")
    .addEventListener("click", confirmarReciclaje);

  modal.addEventListener("click", event => {
    if (event.target === modal) cerrarModal();
  });
}

function abrirModalReciclaje() {
  const modal = document.getElementById("modalReciclaje");

  if (modal) {
    modal.classList.add("activo");
    document.getElementById("cantidad").focus();
  }
}

function cerrarModal() {
  const modal = document.getElementById("modalReciclaje");

  if (modal) {
    modal.classList.remove("activo");
  }
}

// ====================== REGISTRAR RECICLAJE ======================

function confirmarReciclaje() {
  const tipo = document.getElementById("tipoMaterial").value;

  const campoCantidad = document.getElementById("cantidad");

  const cantidad = Number(campoCantidad.value);

  const oficial = document.getElementById("puntoOficial").checked;

  // Validar cantidad
  if (
    !Number.isInteger(cantidad) ||
    cantidad < 1 ||
    cantidad > 100
  ) {
    mostrarNotificacion(
      "Introduce una cantidad válida entre 1 y 100.",
      "error"
    );

    campoCantidad.focus();
    return;
  }

  // Puntos por material
  const puntosMaterial = {
    plastico: 10,
    vidrio: 15,
    aluminio: 12
  };

  const puntosPorUnidad = puntosMaterial[tipo];

  if (!puntosPorUnidad) {
    mostrarNotificacion("Selecciona un material válido.", "error");
    return;
  }

  let total = cantidad * puntosPorUnidad;

  // Bono por punto oficial
  if (oficial) {
    total += cantidad * 5;
  }

  // Actualizar datos
  puntos += total;
  botellas += cantidad;

  actualizarDashboard();
  cerrarModal();

  mostrarNotificacion(
    `¡Genial! Has ganado ${total} puntos. ¡Gracias por reciclar!`
  );

  // Restablecer formulario
  campoCantidad.value = 1;
  document.getElementById("puntoOficial").checked = false;
  document.getElementById("tipoMaterial").value = "plastico";
}

// ====================== CANJEAR RECOMPENSAS ======================

function canjearRecompensa(nombre, costo, boton) {
  if (puntos < costo) {
    mostrarNotificacion(
      `Necesitas ${costo - puntos} puntos más para esta recompensa.`,
      "error"
    );
    return;
  }

  if (!confirm(
    `¿Quieres canjear "${nombre}" por ${costo} puntos?`
  )) {
    return;
  }

  puntos -= costo;

  actualizarDashboard();

  mostrarNotificacion(
    `¡Recompensa canjeada! Disfruta tu ${nombre}.`
  );

  boton.textContent = "¡Canjeado!";
  boton.disabled = true;
  boton.style.background = "#888";
}

// ====================== MENÚ MÓVIL ======================

function toggleMenu() {
  const nav = document.querySelector("nav");
  const boton = document.querySelector(".btn-menu");

  const abierto = nav.classList.toggle("abierto");

  boton.setAttribute("aria-expanded", String(abierto));
}

// ====================== INICIALIZACIÓN ======================

document.addEventListener("DOMContentLoaded", () => {

  // Crear modal
  crearModalReciclaje();

  // Actualizar información inicial
  actualizarDashboard();

  // Botón de registrar reciclaje
  document.querySelector(".btn-principal")
    .addEventListener("click", abrirModalReciclaje);

  // Botones de recompensas
  document.querySelectorAll(".btn-canjear").forEach(boton => {

    const tarjeta = boton.closest(".recompensa-card");

    const nombre = tarjeta.querySelector("h3").textContent.trim();

    const costoTexto = tarjeta.querySelector(".costo").textContent;

    const costo = Number(costoTexto.replace(/[^\d]/g, ""));

    boton.addEventListener("click", () => {
      canjearRecompensa(nombre, costo, boton);
    });

  });

  // Menú hamburguesa
  const botonMenu = document.querySelector(".btn-menu");

  botonMenu.setAttribute("aria-expanded", "false");

  botonMenu.setAttribute("aria-label", "Abrir menú");

  botonMenu.addEventListener("click", toggleMenu);

  // Navegación suave
  document.querySelectorAll("nav a").forEach(enlace => {

    enlace.addEventListener("click", event => {

      const href = enlace.getAttribute("href");

      if (!href || !href.startsWith("#") || href === "#") {
        return;
      }

      const destino = document.getElementById(href.substring(1));

      if (destino) {
        event.preventDefault();

        destino.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        document.querySelector("nav").classList.remove("abierto");

        botonMenu.setAttribute("aria-expanded", "false");
      }

    });

  });

  // Cerrar modal y menú con Escape
  document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
      cerrarModal();

      document.querySelector("nav").classList.remove("abierto");

      botonMenu.setAttribute("aria-expanded", "false");
    }

  });

});
