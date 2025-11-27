// ============================================================
// 📜 BUDGET MODULE — Histórico de Orçamentos
// ============================================================
// Funções:
//  - renderizar lista
//  - filtrar
//  - visualizar detalhes
//  - alterar status
//  - excluir
//  - duplicar (pronto p/ calculator.js carregar)
// ============================================================

import { DB, saveData } from "../core/db.js";
import { notify } from "../core/ui.js";
import { openModal, closeModal } from "../core/modal.js";


// ------------------------------------------------------------
// 🔄 INIT
// ------------------------------------------------------------
export function init() {
    loadFilterClients();
    renderHistory();
    attachEvents();
}



// ------------------------------------------------------------
// 🎧 EVENTOS
// ------------------------------------------------------------
function attachEvents() {
    document.getElementById("history-search")
        ?.addEventListener("input", renderHistory);

    document.getElementById("history-client")
        ?.addEventListener("change", renderHistory);

    document.getElementById("history-status")
        ?.addEventListener("change", renderHistory);
}



// ------------------------------------------------------------
// 📥 Carregar lista de clientes no filtro
// ------------------------------------------------------------
function loadFilterClients() {
    const sel = document.getElementById("history-client");
    if (!sel) return;

    sel.innerHTML =
        `<option value="">Todos os clientes</option>` +
        DB.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}



// ------------------------------------------------------------
// 📄 Renderizar lista
// ------------------------------------------------------------
function renderHistory() {
    const list = document.getElementById("history-list");
    if (!list) return;

    const search = document.getElementById("history-search")?.value.toLowerCase() || "";
    const filterClient = document.getElementById("history-client")?.value || "";
    const filterStatus = document.getElementById("history-status")?.value || "";

    let budgets = DB.budgets;

    // filtro de busca
    if (search) {
        budgets = budgets.filter(b =>
            b.projectName.toLowerCase().includes(search) ||
            (DB.clients.find(c => c.id === b.clientId)?.name.toLowerCase().includes(search))
        );
    }

    // filtro cliente
    if (filterClient) {
        budgets = budgets.filter(b => b.clientId === filterClient);
    }

    // filtro status
    if (filterStatus) {
        budgets = budgets.filter(b => b.status === filterStatus);
    }

    if (budgets.length === 0) {
        list.innerHTML = `
      <div class="p-6 text-center text-gray-500 border rounded bg-white">
        Nenhum orçamento encontrado.
      </div>`;
        return;
    }

    // ordenar por data desc
    budgets = budgets.sort((a, b) => new Date(b.date) - new Date(a.date));

    list.innerHTML = `
    <div class="table-wrapper">
      <table class="min-w-full bg-white rounded shadow">
        <thead class="bg-amber-700 text-white">
          <tr>
            <th class="px-4 py-2 text-left">Projeto</th>
            <th class="px-4 py-2">Cliente</th>
            <th class="px-4 py-2">Data</th>
            <th class="px-4 py-2">Total</th>
            <th class="px-4 py-2">Status</th>
            <th class="px-4 py-2">Ações</th>
          </tr>
        </thead>

        <tbody>
          ${budgets.map(rowTemplate).join("")}
        </tbody>
      </table>
    </div>
  `;
}



// ------------------------------------------------------------
// Template de linha
// ------------------------------------------------------------
function rowTemplate(b) {
    const client = DB.clients.find(c => c.id === b.clientId);

    return `
    <tr class="border-b">
      <td class="px-4 py-2">
        <strong>${b.projectName}</strong>
      </td>

      <td class="px-4 py-2">
        ${client ? client.name : "-"}
      </td>

      <td class="px-4 py-2">
        ${new Date(b.date).toLocaleDateString("pt-BR")}
      </td>

      <td class="px-4 py-2 text-amber-700 font-semibold">
        R$ ${b.total.toFixed(2)}
      </td>

      <td class="px-4 py-2">
        ${badge(b.status)}
      </td>

      <td class="px-4 py-2 flex gap-2">
        <button class="px-2 py-1 bg-blue-600 text-white rounded"
                onclick="window.__viewBudget('${b.id}')">Ver</button>

        <button class="px-2 py-1 bg-green-600 text-white rounded"
                onclick="window.__duplicateBudget('${b.id}')">Copiar</button>

        <select class="border rounded px-2 py-1 text-sm"
                onchange="window.__changeStatus('${b.id}', this.value)">
          <option value="">Status</option>
          <option value="pending"     ${b.status === "pending" ? "selected" : ""}>Pendente</option>
          <option value="accepted"    ${b.status === "accepted" ? "selected" : ""}>Aceito</option>
          <option value="rejected"    ${b.status === "rejected" ? "selected" : ""}>Rejeitado</option>
          <option value="negotiating" ${b.status === "negotiating" ? "selected" : ""}>Negociação</option>
        </select>

        <button class="px-2 py-1 bg-red-600 text-white rounded"
                onclick="window.__deleteBudget('${b.id}')">Del</button>
      </td>
    </tr>
  `;
}



// ------------------------------------------------------------
// Badge visual
// ------------------------------------------------------------
function badge(status) {
    const cls =
        status === "accepted" ? "bg-green-600 text-white" :
            status === "rejected" ? "bg-red-600 text-white" :
                status === "negotiating" ? "bg-blue-600 text-white" :
                    "bg-yellow-500 text-black"; // pending

    const text =
        status === "accepted" ? "Aceito" :
            status === "rejected" ? "Rejeitado" :
                status === "negotiating" ? "Negociação" :
                    "Pendente";

    return `<span class="px-2 py-1 text-xs rounded ${cls}">${text}</span>`;
}



// ------------------------------------------------------------
// 🔍 Detalhes (modal)
// ------------------------------------------------------------
function viewBudget(id) {
    const b = DB.budgets.find(x => x.id === id);
    if (!b) return;

    const client = DB.clients.find(c => c.id === b.clientId);

    openModal(`
    <h2 class="text-xl font-semibold mb-3">${b.projectName}</h2>

    <p class="text-sm text-gray-600 mb-4">
      Criado em ${new Date(b.date).toLocaleDateString("pt-BR")}
    </p>

    <h3 class="font-semibold">Cliente</h3>
    <p>${client ? client.name : "-"}</p>
    <p class="text-sm">${client?.phone || ""}</p>

    <hr class="my-3">

    <h3 class="font-semibold mb-2">Projetos</h3>
    ${b.projects.map(projectDetails).join("")}

    <hr class="my-3">

    <h3 class="font-semibold mb-2">Valores</h3>
    <p>Material: R$ ${b.totalMat?.toFixed(2) ?? "?"}</p>
    <p>Mão de obra: R$ ${b.totalLabor?.toFixed(2) ?? "?"}</p>
    <p>Subtotal: R$ ${b.subtotal.toFixed(2)}</p>
    <p>Margem: R$ ${b.marginValue.toFixed(2)}</p>

    <p class="text-xl font-bold text-amber-700 mt-2">
      Total: R$ ${b.total.toFixed(2)}
    </p>

    ${b.notes ? `<hr class="my-3"><p class="text-sm">${b.notes}</p>` : ""}

    <div class="mt-6 flex gap-2 justify-end">
      <button class="px-4 py-2 bg-green-600 text-white rounded"
              onclick="window.__duplicateBudget('${b.id}'); closeModal();">
        Duplicar
      </button>

      <button class="px-4 py-2 border rounded" onclick="closeModal()">
        Fechar
      </button>
    </div>
  `);
}

function projectDetails(p) {
    return `
    <div class="p-2 border rounded mb-2 text-sm">
      <strong>${getMaterialName(p.materialId)}</strong><br>
      ${p.height} × ${p.width} × ${p.depth} cm
    </div>
  `;
}

function getMaterialName(id) {
    return DB.materials.find(m => m.id === id)?.name || "-";
}



// ------------------------------------------------------------
// 🔁 Duplicar orçamento → calculator.js vai reconstruir projetos
// ------------------------------------------------------------
function duplicateBudget(id) {
    const b = DB.budgets.find(x => x.id === id);
    if (!b) return;

    // salva o orçamento atual para ser lido pela calculadora
    localStorage.setItem("duplicate_budget_buffer", JSON.stringify(b));

    notify("Orçamento carregado na calculadora!", "success");

    // troca de página
    window.ui.loadPage("calculator");
}



// ------------------------------------------------------------
// 🔄 Alterar status
// ------------------------------------------------------------
function changeStatus(id, status) {
    if (!status) return;

    const b = DB.budgets.find(x => x.id === id);
    if (!b) return;

    b.status = status;

    saveData();
    notify("Status atualizado!", "success");
    renderHistory();
}



// ------------------------------------------------------------
// 🗑️ Excluir
// ------------------------------------------------------------
function deleteBudget(id) {
    if (!confirm("Excluir orçamento?")) return;

    DB.budgets = DB.budgets.filter(b => b.id !== id);

    saveData();
    notify("Orçamento excluído!", "success");
    renderHistory();
}



// ------------------------------------------------------------
// Expor ações globais com prefixo
// ------------------------------------------------------------
window.__viewBudget = viewBudget;
window.__deleteBudget = deleteBudget;
window.__changeStatus = changeStatus;
window.__duplicateBudget = duplicateBudget;
