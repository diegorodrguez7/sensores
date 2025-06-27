const SUPABASE_URL = "https://hcestoffhvpbwczcrsgi.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZXN0b2ZmaHZwYndjemNyc2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMjQ5NTUsImV4cCI6MjA2NjYwMDk1NX0.XxIrlBS2VKI0EVOWEJtziUHGERSBfnDxLdzCFoccP4Y";

async function obtenerDatos() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/lecturas?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  const datos = await response.json();

  const etiquetas = datos.map(d =>
    new Date(d.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const temperaturas = datos.map(d => d.temperatura);
  const humedades = datos.map(d => d.humedad);

  new Chart(document.getElementById("tempChart"), {
    type: "line",
    data: {
      labels: etiquetas,
      datasets: [{
        label: "Temperatura (°C)",
        data: temperaturas,
        borderColor: "rgb(255, 99, 132)",
        fill: false,
        tension: 0.3,
      }],
    },
  });

  new Chart(document.getElementById("humChart"), {
    type: "line",
    data: {
      labels: etiquetas,
      datasets: [{
        label: "Humedad (%)",
        data: humedades,
        borderColor: "rgb(54, 162, 235)",
        fill: false,
        tension: 0.3,
      }],
    },
  });
}

obtenerDatos();

