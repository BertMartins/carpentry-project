// ===========================================
// 👥 CLIENTS MODULE
// ===========================================
// Carrega lista, busca, CRUD completo e modal de edição
// ===========================================

import { DB, saveData, uid } from "../core/db.js";
import { openModal, closeModal } from "../core/modal.js";
import { notify } from "../core/ui.js";


// -------------------------------------------
// 🔄 INIT (chamado pelo ui.loadPage)
// -------------------------------------------
export function init() {
    renderClients();
    attachEvents();
}


// -------------------------------------------
// 🎧 EVENTOS
// -------------------------------------------
function attachEvents() {
    document.getElementById("btn-client-new")
        ?.addEventListener("click", () => openClientModal());

    document.getElementById("client-search")
        ?.addEventListener("input", () => renderClients());
}



// -------------------------------------------
// 🪟 TEMPLATE DO MODAL
// -------------------------------------------
function clientModalTemplate(client = {}) {
    return `
    <h2 class="text-xl font-semibold mb-4">
      ${client.id ? "Editar Cliente" : "Novo Cliente"}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

      <div>
        <label class="text-sm text-gray-600">Nome</label>
        <input id="cl-name"
               class="border rounded px-3 py-2 w-full"
               value="${client.name || ""}">
      </div>

      <div>
        <label class="text-sm text-gray-600">Telefone</label>
        <input id="cl-phone"
               class="border rounded px-3 py-2 w-full"
               value="${client.phone || ""}">
      </div>

      <div>
        <label class="text-sm text-gray-600">Email</label>
        <input id="cl-email"
               class="border rounded px-3 py-2 w-full"
               value="${client.email || ""}">
      </div>

      <div>
        <label class="text-sm text-gray-600">Endereço</label>
        <input id="cl-address"
               class="border rounded px-3 py-2 w-full"
               value="${client.address || ""}">
      </div>
    </div>

    <div class="mt-4">
      <label class="text-sm text-gray-600">Notas</label>
      <textarea id="cl-notes"
                class="border rounded px-3 py-2 w-full h-24">${client.notes || ""}</textarea>
    </div>

    <div class="mt-5 flex justify-end gap-2">
      <button class="px-4 py-2 border rounded" onclick="closeModal()">Cancelar</button>
      <button class="px-4 py-2 bg-amber-600 text-white rounded"
              onclick="window.__saveClient('${client.id || ""}')">
        Salvar
      </button>
    </div>
  `;
}



// -------------------------------------------
// 🪟 ABRIR MODAL
// -------------------------------------------
function openClientModal(id = null) {
    const client = id ? DB.clients.find(c => c.id === id) : null;
    openModal(clientModalTemplate(client));

    window.__saveClient = (id) => saveClient(id);
}



// -------------------------------------------
// 💾 SALVAR CLIENTE
// -------------------------------------------
function saveClient(id) {
    const name = document.getElementById("cl-name").value.trim();
    const phone = document.getElementById("cl-phone").value.trim();
    const email = document.getElementById("cl-email").value.trim();
    const address = document.getElementById("cl-address").value.trim();
    const notes = document.getElementById("cl-notes").value.trim();

    if (!name || !phone) {
        notify("Nome e telefone são obrigatórios!", "warning");
        return;
    }

    if (id) {
        // editar
        DB.clients = DB.clients.map(c =>
            c.id === id
                ? { ...c, name, phone, email, address, notes }
                : c
        );

        notify("Cliente atualizado!", "success");

    } else {
        // novo
        DB.clients.push({
            id: uid(),
            name,
            phone,
            email,
            address,
            notes,
            createdAt: new Date().toISOString()
        });

        notify("Cliente cadastrado!", "success");
    }

    saveData();
    closeModal();
    renderClients();
}



// -------------------------------------------
// 🗑️ EXCLUIR CLIENTE
// -------------------------------------------
function deleteClient(id) {
    if (!confirm("Excluir cliente?")) return;

    DB.clients = DB.clients.filter(c => c.id !== id);
    saveData();
    renderClients();
    notify("Cliente excluído!", "success");
}



// -------------------------------------------
// 📄 RENDER LISTA
// -------------------------------------------
function renderClients() {
    const container = document.getElementById("clients-list");
    if (!container) return;

    const search = (document.getElementById("client-search")?.value || "").toLowerCase();

    const filtered = DB.clients.filter(c =>
        c.name.toLowerCase().includes(search) ||
        (c.phone && c.phone.includes(search)) ||
        (c.email && c.email.toLowerCase().includes(search))
    );

    if (filtered.length === 0) {
        container.innerHTML = `
      <div class="p-6 text-center text-gray-500 border rounded bg-white">
        Nenhum cliente encontrado
      </div>
    `;
        return;
    }

    container.innerHTML = `
    <div class="table-wrapper">
      <table class="min-w-full bg-white rounded shadow">
        <thead class="bg-amber-700 text-white">
          <tr>
            <th class="px-4 py-2 text-left">Nome</th>
            <th class="px-4 py-2">Contato</th>
            <th class="px-4 py-2">Endereço</th>
            <th class="px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(rowTemplate).join("")}
        </tbody>
      </table>
    </div>
  `;
}



// -------------------------------------------
// Template da linha da tabela
// -------------------------------------------
function rowTemplate(c) {
    return `
    <tr class="border-b">
      <td class="px-4 py-2">
        <strong>${c.name}</strong>
        ${c.notes ? `<div class="text-xs text-gray-500">${c.notes}</div>` : ""}
      </td>

      <td class="px-4 py-2 text-sm">
        📱 ${c.phone}
        ${c.email ? `<br>📧 ${c.email}` : ""}
      </td>

      <td class="px-4 py-2">${c.address || "-"}</td>

      <td class="px-4 py-2 flex gap-2">
        <button class="px-2 py-1 bg-blue-600 text-white rounded"
                onclick="window.__editClient('${c.id}')">Editar</button>

        <button class="px-2 py-1 bg-red-600 text-white rounded"
                onclick="window.__deleteClient('${c.id}')">Del</button>
      </td>
    </tr>
  `;
}



// Expor ações globalmente (mas organizadas)
window.__editClient = openClientModal;
window.__deleteClient = deleteClient;

