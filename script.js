<script>
  // ====================== DATOS INICIALES ======================
  let puntos = parseInt(localStorage.getItem('ecoPuntos')) || 1240;
  let botellas = parseInt(localStorage.getItem('ecoBotellas')) || 124;

  // Tabla de niveles
  const niveles = [
    { nivel: 1, nombre: "Aprendiz Verde", min: 0, max: 199 },
    { nivel: 2, nombre: "Reciclador", min: 200, max: 499 },
    { nivel: 3, nombre: "Guardián del Planeta", min: 500, max: 999 },
    { nivel: 4, nombre: "Embajador Eco", min: 1000, max: 2499 },
    { nivel: 5, nombre: "Héroe del Reciclaje", min: 2500, max: Infinity }
  ];

  // ====================== FUNCIONES PRINCIPALES ======================

  function guardarDatos() {
    localStorage.setItem('ecoPuntos', puntos);
    localStorage.setItem('ecoBotellas', botellas);
  }

  function obtenerNivel() {
    return niveles.find(n => puntos >= n.min && puntos <= n.max);
  }

  function actualizarDashboard() {
    const nivelActual = obtenerNivel();
    const siguiente = niveles.find(n => n.nivel === nivelActual.nivel + 1);

    // Actualizar puntos
    document.querySelector('.puntos-card .numero').textContent = puntos.toLocaleString('es-ES');

    // Actualizar badge de nivel
    document.querySelector('.nivel-badge').textContent = `Nivel ${nivelActual.nivel} · ${nivelActual.nombre}`;

    // Barra de progreso
    let porcentaje = 100;
    let restantes = 0;

    if (siguiente) {
      const progreso = puntos - nivelActual.min;
      const totalNivel = siguiente.min - nivelActual.min;
      porcentaje = Math.min(100, Math.round((progreso / totalNivel) * 100));
      restantes = siguiente.min - puntos;
    }

    document.querySelector('.progreso-fill').style.width = porcentaje + '%';
    document.querySelector('.progreso div span:last-child').textContent = 
      siguientes ? `${restantes} pts restantes` : "¡Nivel máximo!";

    // Actualizar estadísticas
    document.querySelectorAll('.stat-item .valor')[0].textContent = botellas;
    document.querySelectorAll('.stat-item .valor')[1].textContent = (botellas * 0.03).toFixed(1) + " kg";
    document.querySelectorAll('.stat-item .valor')[2].textContent = (botellas * 0.066).toFixed(1) + " kg";
    document.querySelectorAll('.stat-item .valor')[3].textContent = Math.floor(botellas / 60);

    // Resaltar nivel actual
    document.querySelectorAll('.nivel-card').forEach(card => {
      card.classList.remove('activo');
      if (card.querySelector('.num').textContent == nivelActual.nivel) {
        card.classList.add('activo');
      }
    });

    guardarDatos();
  }

  // ====================== NOTIFICACIÓN ======================
  function mostrarNotificacion(mensaje, tipo = "exito") {
    // Eliminar notificación anterior si existe
    const anterior = document.querySelector('.notificacion');
    if (anterior) anterior.remove();

    const noti = document.createElement('div');
    noti.className = 'notificacion';
    noti.innerHTML = `
      <i class="fas ${tipo === 'exito' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
      <span>${mensaje}</span>
    `;

    document.body.appendChild(noti);

    // Animación de entrada
    setTimeout(() => noti.classList.add('mostrar'), 10);

    // Desaparecer después de 3.5 segundos
    setTimeout(() => {
      noti.classList.remove('mostrar');
      setTimeout(() => noti.remove(), 400);
    }, 3500);
  }

  // ====================== MODAL REGISTRAR RECICLAJE ======================
  function crearModalReciclaje() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modalReciclaje';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3><i class="fas fa-recycle"></i> Registrar reciclaje</h3>
          <button class="cerrar-modal">&times;</button>
        </div>
        <div class="modal-body">
          <label>Tipo de material</label>
          <select id="tipoMaterial">
            <option value="plastico">Botella de plástico (PET) — 10 pts</option>
            <option value="vidrio">Botella de vidrio — 15 pts</option>
            <option value="aluminio">Lata de aluminio — 12 pts</option>
          </select>

          <label style="margin-top:1rem;">Cantidad</label>
          <input type="number" id="cantidad" min="1" value="1" max="100">

          <label style="margin-top:1rem;">
            <input type="checkbox" id="puntoOficial"> 
            Lo entregué en un punto oficial (+5 pts extra por unidad)
          </label>
        </div>
        <div class="modal-footer">
          <button class="btn-cancelar">Cancelar</button>
          <button class="btn-confirmar">Registrar y ganar puntos</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Eventos del modal
    modal.querySelector('.cerrar-modal').onclick = cerrarModal;
    modal.querySelector('.btn-cancelar').onclick = cerrarModal;
    modal.querySelector('.btn-confirmar').onclick = confirmarReciclaje;
    modal.onclick = (e) => { if (e.target === modal) cerrarModal(); };
  }

  function abrirModalReciclaje() {
    document.getElementById('modalReciclaje').classList.add('activo');
  }

  function cerrarModal() {
    document.getElementById('modalReciclaje').classList.remove('activo');
  }

  function confirmarReciclaje() {
    const tipo = document.getElementById('tipoMaterial').value;
    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
    const oficial = document.getElementById('puntoOficial').checked;

    let puntosPorUnidad = 10;
    if (tipo === 'vidrio') puntosPorUnidad = 15;
    if (tipo === 'aluminio') puntosPorUnidad = 12;

    let total = cantidad * puntosPorUnidad;
    if (oficial) total += cantidad * 5;

    puntos += total;
    botellas += cantidad;

    actualizarDashboard();
    cerrarModal();
    mostrarNotificacion(`¡Genial! Has ganado <strong>${total} puntos</strong> 🎉`);
  }

  // ====================== CANJEAR RECOMPENSAS ======================
  function canjearRecompensa(nombre, costo, boton) {
    if (puntos < costo) {
      mostrarNotificacion(`Necesitas ${costo - puntos} puntos más para esta recompensa`, "error");
      return;
    }

    if (confirm(`¿Quieres canjear "${nombre}" por ${costo} puntos?`)) {
      puntos -= costo;
      actualizarDashboard();
      mostrarNotificacion(`¡Recompensa canjeada! Disfruta tu ${nombre} 🎁`);
      
      // Efecto visual en el botón
      boton.textContent = "¡Canjeado!";
      boton.disabled = true;
      boton.style.background = "#888";
    }
  }

  // ====================== MENÚ MÓVIL ======================
  function toggleMenu() {
    const nav = document.querySelector('nav');
    nav.classList.toggle('abierto');
  }

  // ====================== INICIALIZACIÓN ======================
  document.addEventListener('DOMContentLoaded', () => {
    // Crear modal
    crearModalReciclaje();

    // Actualizar dashboard al cargar
    actualizarDashboard();

    // Botón principal "Registrar reciclaje"
    document.querySelector('.btn-principal').addEventListener('click', abrirModalReciclaje);

    // Botones de canjear
    document.querySelectorAll('.btn-canjear').forEach(btn => {
      const card = btn.closest('.recompensa-card');
      const nombre = card.querySelector('h3').textContent;
      const costoTexto = card.querySelector('.costo').textContent;
      const costo = parseInt(costoTexto.replace(/\D/g, ''));

      btn.addEventListener('click', () => canjearRecompensa(nombre, costo, btn));
    });

    // Menú hamburguesa
    document.querySelector('.btn-menu').addEventListener('click', toggleMenu);

    // Smooth scroll
    document.querySelectorAll('nav a').forEach(enlace => {
      enlace.addEventListener('click', (e) => {
        e.preventDefault();
        const destino = document.querySelector(enlace.getAttribute('href'));
        if (destino) {
          destino.scrollIntoView({ behavior: 'smooth' });
          document.querySelector('nav').classList.remove('abierto');
        }
      });
    });
  });
</script>
