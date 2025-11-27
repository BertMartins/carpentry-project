// ===========================================
// 🧱 MATERIALS MODULE
// ===========================================

import { DB, saveData, uid } from "../core/db.js";
import { openModal, closeModal } from "../core/modal.js";
import { notify } from "../core/ui.js";


// Called by ui.loadPage("materials")
export function init() {
    renderMaterials();
    attachEvents();
}


// -------------------------------------------
// EVENTS
// -------------------------------------------

function attachEvents() {
    document.getElementById("btn-material-new")
        ?.addEventListener("click", () => openMaterialModal());

    document.getElementById("material-search")
        ?.addEventListener("input", () => renderMaterials());
}


// -------------------------------------------
// MODAL HTML
// -------------------------------------------

function materialModalTemplate(material = {}) {
    return `
    <h2 class="text-xl font-semibold mb-4">
      ${material.id ? "Editar Material" : "Novo Material"}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

      <div>
        <label class="text-sm text-gray-600">Nome</label>
        <input id="mat-name" class="border rounded px-3 py-2 w-full"
               value="${material.name || ""}">
      </div>

      <div>
        <label class="text-sm text-gray-600">Categoria</label>
        <input id="mat-category" class="border rounded px-3 py-2 w-full"
               value="${material.category || ""}">
      </div>

      <div>
        <label class="text-sm text-gray-600">Espessura (mm)</label>
        <input id="mat-thickness" type="number"
               class="border rounded px-3 py-2 w-full"
               value="${material.thickness || ""}">
      </div>

      <div>
        <label class="text-sm text-gray-600">Largura (m)</label>
        <input id="mat-width" type="number" step="0.01"
               class="border rounded px-3 py-2 w-full"
               value="${material.width || ""}">
      </div>

      <div>
        <label class="text-sm text-gray-600">Altura (m)</label>
        <input id="mat-height" type="number" step="0.01"
               class="border rounded px-3 py-2 w-full"
               value="${material.height || ""}">
      </div>

      <div>
        <label class="text-sm text-gray-600">Preço (R$)</label>
        <input id="mat-price" type="number" step="0.01"
               class="border rounded px-3 py-2 w-full"
               value="${material.price || ""}">
      </div>

      <div>
        <label class="text-sm text-gray-600">Perda (%)</label>
        <input id="mat-waste" type="number"
               class="border rounded px-3 py-2 w-full"
               value="${material.waste || ""}">
      </div>

      <div>
        <label class="text-sm text-gray-600">Fornecedor</label>
        <input id="mat-supplier"
               class="border rounded px-3 py-2 w-full"
               value="${material.supplier || ""}">
      </div>

      <div>
        <label class="text-sm text-gray-600">Estoque</label>
        <input id="mat-stock" type="number"
               class="border rounded px-3 py-2 w-full"
               value="${material.stock || 0}">
      </div>

    </div>

    <div class="mt-4">
      <label class="text-sm text-gray-600">Observações</label>
      <textarea id="mat-notes"
                class="border rounded px-3 py-2 w-full h-24">${material.notes || ""}</textarea>
    </div>

    <div class="mt-5 flex justify-end gap-2">
      <button class="px-4 py-2 border rounded" onclick="closeModal()">Cancelar</button>
      <button class="px-4 py-2 bg-amber-600 text-white rounded"
              onclick="window.__saveMaterial('${material.id || ""}')">
        Salvar
      </button>
    </div>
  `;
}


// -------------------------------------------
// OPEN MODAL
// -------------------------------------------

function openMaterialModal(id = null) {
    const material = id ? DB.materials.find(m => m.id === id) : null;
    openModal(materialModalTemplate(material));

    // expose save function safely
    window.__saveMaterial = (id) => saveMaterial(id);
}


// -------------------------------------------
// SAVE MATERIAL
// -------------------------------------------

function saveMaterial(id) {
    const name = document.getElementById("mat-name").value.trim();
    const category = document.getElementById("mat-category").value.trim();
    const thickness = parseFloat(document.getElementById("mat-thickness").value) || 0;
    const width = parseFloat(document.getElementById("mat-width").value);
    const height = parseFloat(document.getElementById("mat-height").value);
    const price = parseFloat(document.getElementById("mat-price").value);
    const waste = parseFloat(document.getElementById("mat-waste").value) || 0;
    const supplier = document.getElementById("mat-supplier").value.trim();
    const stock = parseInt(document.getElementById("mat-stock").value) || 0;
    const notes = document.getElementById("mat-notes").value.trim();

    if (!name || !width || !height || !price) {
        notify("Preencha todos os campos obrigatórios!", "warning");
        return;
    }

    if (id) {
        // editar
        DB.materials = DB.materials.map(m =>
            m.id === id
                ? { ...m, name, category, thickness, width, height, price, waste, supplier, notes, stock }
                : m
        );
        notify("Material atualizado!", "success");
    } else {
        // novo
        DB.materials.push({
            id: uid(),
            name,
            category,
            thickness,
            width,
            height,
            price,
            waste,
            supplier,
            notes,
            stock
        });
        notify("Material cadastrado!", "success");
    }

    saveData();
    closeModal();
    renderMaterials();
}


// -------------------------------------------
// DELETE MATERIAL
// -------------------------------------------

function deleteMaterial(id) {
    if (!confirm("Excluir material?")) return;

    DB.materials = DB.materials.filter(m => m.id !== id);
    saveData();
    renderMaterials();
    notify("Material excluído!", "success");
}


// -------------------------------------------
// RENDER LIST
// -------------------------------------------

function renderMaterials() {
    const list = document.getElementById("materials-list");
    if (!list) return;

    const search = (document.getElementById("material-search")?.value || "").toLowerCase();

    const materials = DB.materials.filter(m =>
        m.name.toLowerCase().includes(search) ||
        m.category.toLowerCase().includes(search)
    );

    if (materials.length === 0) {
        list.innerHTML = `
      <div class="p-6 text-center text-gray-500 border rounded bg-white">
        Nenhum material encontrado
      </div>
    `;
        return;
    }

    list.innerHTML = `
    <div class="table-wrapper">
      <table class="min-w-full bg-white rounded shadow">
        <thead class="bg-amber-700 text-white">
          <tr>
            <th class="px-4 py-2 text-left">Nome</th>
            <th class="px-4 py-2">Categoria</th>
            <th class="px-4 py-2">Tamanho</th>
            <th class="px-4 py-2">Preço</th>
            <th class="px-4 py-2">Estoque</th>
            <th class="px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${materials.map(rowTemplate).join("")}
        </tbody>
      </table>
    </div>
  `;
}


function rowTemplate(m) {
    return `
    <tr class="border-b">
      <td class="px-4 py-2">
        <strong>${m.name}</strong>
        ${m.notes ? `<div class="text-xs text-gray-500">${m.notes}</div>` : ""}
      </td>

      <td class="px-4 py-2">${m.category}</td>

      <td class="px-4 py-2">${m.width}m × ${m.height}m</td>

      <td class="px-4 py-2 text-amber-700 font-semibold">
        R$ ${m.price.toFixed(2)}
      </td>

      <td class="px-4 py-2">${m.stock || 0}</td>

      <td class="px-4 py-2 flex gap-2">
        <button class="px-2 py-1 bg-blue-600 text-white rounded"
                onclick="window.__editMaterial('${m.id}')">Editar</button>
        <button class="px-2 py-1 bg-red-600 text-white rounded"
                onclick="window.__deleteMaterial('${m.id}')">Del</button>
      </td>
    </tr>
  `;
}


// Expose helpers globally safely
window.__editMaterial = openMaterialModal;
window.__deleteMaterial = deleteMaterial;
