const boton = document.getElementById('boton');
const contador = document.getElementById('contador');

let clics = 0;

const colores = ['#3182ce', '#38a169', '#d69e2e', '#e53e3e', '#805ad5'];

boton.addEventListener('click', () => {
  clics++;
  contador.textContent = `Clics: ${clics}`;

  // Cambia el color del botón de forma aleatoria
  const colorAleatorio = colores[Math.floor(Math.random() * colores.length)];
  boton.style.background = colorAleatorio;
});
