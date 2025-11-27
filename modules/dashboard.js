// ============================================================
// 📊 DASHBOARD MODULE (com GRÁFICOS Chart.js)
// ============================================================

import { DB } from "../core/db.js";

let chartMaterials = null;
let chartStatus = null;

export function init() {
    renderStats();
    renderMaterialsChart();
    renderStatusChart();
}



// -----------------------------------------------
// 🔢 Estatísticas rápidas
// -----------------------------------------------
function renderStats() {
    setHTML("stats-materials", DB.materials.length);
    setHTML("stats-clients", DB.clients.length);
    setHTML("stats-budgets", DB.budgets.length);
}



// -----------------------------------------------
// 🧱 Gráfico de Materiais mais usados (pizza)
// -----------------------------------------------
function renderMaterialsChart() {
    const ctx = document.getElementById("chart-materials");
    if (!ctx) return;

    // conta usos
    const usage = {};
    DB.budgets.forEach(b => {
        b.projects?.forEach(p => {
            usage[p.materialId] = (usage[p.materialId] || 0) + 1;
        });
    });

    const entries = Object.entries(usage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const labels = entries.map(([id]) => DB.materials.find(m => m.id === id)?.name || "Desconhecido");
    const values = entries.map(([, count]) => count);

    // destruir gráfico antigo para não duplicar
    if (chartMaterials) chartMaterials.destroy();

    chartMaterials = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        "#f59e0b", "#84cc16", "#3b82f6", "#ec4899", "#6366f1"
                    ]
                }
            ]
        },
        options: {
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });
}



// -----------------------------------------------
// 📊 Gráfico de orçamentos por status (barra)
// -----------------------------------------------
function renderStatusChart() {
    const ctx = document.getElementById("chart-status");
    if (!ctx) return;

    const counts = {
        pending: 0,
        accepted: 0,
        rejected: 0,
        negotiating: 0
    };

    DB.budgets.forEach(b => {
        counts[b.status] = (counts[b.status] || 0) + 1;
    });

    const labels = ["Pendente", "Aceito", "Rejeitado", "Negociação"];
    const values = [
        counts.pending,
        counts.accepted,
        counts.rejected,
        counts.negotiating
    ];

    // destruir gráfico antigo
    if (chartStatus) chartStatus.destroy();

    chartStatus = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Qtd.",
                    data: values,
                    backgroundColor: "#f59e0b"
                }
            ]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}



// -----------------------------------------------
// Helpers
// -----------------------------------------------
function setHTML(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = val;
}
