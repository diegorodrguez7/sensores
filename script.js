const SUPABASE_URL = "https://hcestoffhvpbwczcrsgi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZXN0b2ZmaHZwYndjemNyc2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMjQ5NTUsImV4cCI6MjA2NjYwMDk1NX0.XxIrlBS2VKI0EVOWEJtziUHGERSBfnDxLdzCFoccP4Y";

let tempChart, humChart;

async function obtenerDatos(fechaInicio = null, fechaFin = null) {
  let url = `${SUPABASE_URL}/rest/v1/lecturas?select=*`;
  if (fechaInicio && fechaFin) {
    url += `&fecha=gte.${encodeURIComponent(fechaInicio)}&fecha=lte.${encodeURIComponent(fechaFin)}`;
  }

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  const datos = await response.json();
  if (!datos.length) return;

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
  if (!desde || !hasta) return;
  obtenerDatos(desde, hasta);
}

function descargarCSV() {
  fetch(`${SUPABASE_URL}/rest/v1/lecturas?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (!data.length) return;
      const headers = Object.keys(data[0]);
      const rows = data.map(obj => headers.map(k => obj[k]).join(","));
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lecturas.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
}

obtenerDatos();
setInterval(obtenerDatos, 30000);


