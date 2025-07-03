const SUPABASE_URL = "https://hcestoffhvpbwczcrsgi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZXN0b2ZmaHZwYndjemNyc2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMjQ5NTUsImV4cCI6MjA2NjYwMDk1NX0.XxIrlBS2VKI0EVOWEJtziUHGERSBfnDxLdzCFoccP4Y";

let tempChart, humChart;

// Variables globales para mantener el filtro actual
let fechaFiltroInicio = null;
let fechaFiltroFin = null;

async function obtenerDatos(fechaInicio = null, fechaFin = null) {
  // Actualiza las fechas del filtro global
  fechaFiltroInicio = fechaInicio;
  fechaFiltroFin = fechaFin;

  let url = `${SUPABASE_URL}/rest/v1/lecturas?select=*`;
  if (fechaInicio && fechaFin) {
    // Convierte las fechas a ISO 8601 para supabase
    const desdeISO = new Date(fechaInicio).toISOString();
    const hastaISO = new Date(fechaFin).toISOString();

    url += `&fecha=gte.${encodeURIComponent(desdeISO)}&fecha=lte.${encodeURIComponent(hastaISO)}`;
  }

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  const datos = await response.json();
  if (!datos.length) {
    // Si no hay datos, limpia la gráfica y valores
    if (tempChart) tempChart.destroy();
    if (humChart) humChart.destroy();
    document.getElementById("ultimaTemp").textContent = "--";
    document.getElementById("ultimaHum").textContent = "--";
    return;
  }

  const etiquetas = datos.map(d => new Date(d.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const temperaturas = datos.map(d => d.temperatura);
  const humedades = datos.map(d => d.humedad);

  document.getElementById("ultimaTemp").textContent = temperaturas.at(-1);
  document.getElementById("ultimaHum").textContent = humedades.at(-1);

  renderizarChart("tempChart", "Temperatura (°C)", etiquetas, temperaturas, "rgb(255, 99, 132)", tempChart, c => tempChart = c);
  renderizarChart("humChart", "Humedad (%)", etiquetas, humedades, "rgb(54, 162, 235)", humChart, c => humChart = c);
}

function renderizarChart(canvasId, label, labels, data, color, chartRef, setChartRef) {
  if (chartRef) chartRef.destroy();
  const ctx = document.getElementById(canvasId).getContext("2d");
  setChartRef(new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderColor: color,
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: { mode: 'index', intersect: false },
        zoom: {
          pan: { enabled: true, mode: 'x' },
          zoom: { wheel: { enabled: true }, mode: 'x' }
        }
      },
      interaction: { mode: 'nearest', intersect: false },
      scales: { x: { display: true }, y: { beginAtZero: true } }
    }
  }));
}

function obtenerDatosFiltrados() {
  const desde = document.getElementById("fechaInicio").value;
  const hasta = document.getElementById("fechaFin").value;
  if (!desde || !hasta) {
    alert("Por favor, selecciona ambas fechas.");
    return;
  }
  obtenerDatos(desde, hasta);
}

function descargarCSV() {
  let url = `${SUPABASE_URL}/rest/v1/lecturas?select=*`;

  // Usa las fechas filtradas si existen
  if (fechaFiltroInicio && fechaFiltroFin) {
    const desdeISO = new Date(fechaFiltroInicio).toISOString();
    const hastaISO = new Date(fechaFiltroFin).toISOString();
    url += `&fecha=gte.${encodeURIComponent(desdeISO)}&fecha=lte.${encodeURIComponent(hastaISO)}`;
  }

  fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  })
  .then(res => res.json())
  .then(data => {
    if (!data.length) return alert("No hay datos para descargar.");

    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(k => `"${obj[k]}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "lecturas_filtradas.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

// Mostrar fecha de hoy en un elemento arriba del header
function mostrarFechaHoy() {
  const fechaHoy = new Date();
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  const texto = `Hoy es: ${fechaHoy.toLocaleDateString('es-ES', opciones)}`;

  // Crear un elemento para mostrar la fecha
  const contenedorFecha = document.createElement('div');
  contenedorFecha.style.textAlign = 'center';
  contenedorFecha.style.fontWeight = 'bold';
  contenedorFecha.style.margin = '10px 0';
  contenedorFecha.textContent = texto;

  // Insertarlo justo antes del header
  const body = document.body;
  const header = document.querySelector('header');
  body.insertBefore(contenedorFecha, header);
}

// Ejecutar funciones iniciales
mostrarFechaHoy();

// Carga inicial y refresco cada 5 minutos
obtenerDatos();
setInterval(() => obtenerDatos(), 300000);  // 300000 ms = 5 min




