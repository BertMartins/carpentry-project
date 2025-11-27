// ======================================================================
// 🧮 CALCULATOR MODULE (versão PRO com projetos completos)
// ======================================================================
// Cada projeto tem:
// - name
// - materials[]   → vários materiais, cada um com medidas
// - additionals[] → adicionais com quantity
//
// O cálculo final soma todas as áreas por material, aplica perda
// e compartilha chapas entre projetos.
//
// ======================================================================

import { DB, saveData, uid } from "../core/db.js";
import { notify } from "../core/ui.js";

let calcProjects = [];


// ======================================================================
// 🔄 INIT
// ======================================================================
export function init() {
    calcProjects = [];

    loadClientSelector();
    attachGlobalEvents();
    renderProjects();
    updateSummary();

    // Se veio uma duplicação de orçamento…
    loadDuplicatedBudget();
}



// ======================================================================
// 📥 Se o usuário duplicou um orçamento
// ======================================================================
function loadDuplicatedBudget() {
    const raw = localStorage.getItem("duplicate_budget_buffer");
    if (!raw) return;

    const data = JSON.parse(raw);
    localStorage.removeItem("duplicate_budget_buffer");

    document.getElementById("calc-client").value = data.clientId || "";
    document.getElementById("calc-project-name").value = data.projectName;
    document.getElementById("calc-notes").value = data.notes;

    calcProjects = data.projects || [];
    renderProjects();
    updateSummary();
}



// ======================================================================
// 🎧 GLOBAL EVENTS
// ======================================================================
function attachGlobalEvents() {
    document.getElementById("btn-add-project")
        ?.addEventListener("click", addProject);

    document.getElementById("btn-save-budget")
        ?.addEventListener("click", saveBudget);

    document.getElementById("btn-generate-pdf")
        ?.addEventListener("click", generatePDF);

    document.getElementById("btn-clear-calculator")
        ?.addEventListener("click", clearCalc);
}



// ======================================================================
// 📥 CARREGAR CLIENTES
// ======================================================================
function loadClientSelector() {
    const sel = document.getElementById("calc-client");
    sel.innerHTML =
        `<option value="">Selecione cliente</option>` +
        DB.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}



// ======================================================================
// ➕ PROJETO
// ======================================================================
function addProject() {
    calcProjects.push({
        id: uid(),
        name: "",
        materials: [],
        additionals: []
    });

    renderProjects();
}



// ======================================================================
// 🖨️ RENDERIZAR PROJETOS
// ======================================================================
function renderProjects() {
    const container = document.getElementById("projects-container");

    if (calcProjects.length === 0) {
        container.innerHTML = `<p class="text-gray-500">Nenhum projeto ainda.</p>`;
        updateSummary();
        return;
    }

    container.innerHTML = calcProjects.map(projectCard).join("");

    attachProjectEvents();
    updateSummary();
}



// ======================================================================
// 🎴 CARD DO PROJETO (UI)
// ======================================================================
function projectCard(p) {
    return `
    <div class="bg-white p-4 rounded shadow space-y-4">

      <!-- Nome do Projeto -->
      <div>
        <label class="text-sm">Nome do Projeto</label>
        <input class="border rounded w-full px-3 py-2"
               value="${p.name}"
               data-proj="${p.id}"
               data-field="name">
      </div>

      <h3 class="font-semibold mt-3">Materiais</h3>

      <div id="materials-${p.id}" class="space-y-2">
        ${p.materials.map(m => materialRow(p.id, m)).join("")}
      </div>

      <button class="bg-blue-600 text-white px-3 py-1 rounded"
              data-proj="${p.id}" data-action="add-material">
        + Material
      </button>

      <h3 class="font-semibold mt-3">Adicionais</h3>
      <div id="additionals-${p.id}" class="space-y-2">
        ${p.additionals.map(a => additionalRow(p.id, a)).join("")}
      </div>

      <button class="bg-amber-600 text-white px-3 py-1 rounded"
              data-proj="${p.id}" data-action="add-additional">
        + Adicional
      </button>

      <button class="bg-red-600 text-white px-3 py-2 rounded w-full mt-4"
              data-action="remove-project" data-proj="${p.id}">
        Remover Projeto
      </button>

    </div>
  `;
}



// ======================================================================
// UI MATERIAL ROW
// ======================================================================
function materialRow(projectId, m) {
    return `
    <div class="border rounded p-3">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

        <div>
          <label class="text-sm">Material</label>
          <select class="border rounded w-full px-2 py-1"
                  data-proj="${projectId}"
                  data-material="${m.id}"
                  data-field="materialId">
            <option value="">Selecione</option>
            ${DB.materials.map(mat => `
              <option value="${mat.id}" ${mat.id === m.materialId ? "selected" : ""}>
                ${mat.name} — R$${mat.price}
              </option>
            `).join("")}
          </select>
        </div>

        <div>
          <label class="text-sm">Altura (cm)</label>
          <input type="number" class="border rounded w-full px-2 py-1"
                 value="${m.height}"
                 data-proj="${projectId}"
                 data-material="${m.id}"
                 data-field="height">
        </div>

        <div>
          <label class="text-sm">Largura (cm)</label>
          <input type="number" class="border rounded w-full px-2 py-1"
                 value="${m.width}"
                 data-proj="${projectId}"
                 data-material="${m.id}"
                 data-field="width">
        </div>

        <div>
          <label class="text-sm">Profundidade (cm)</label>
          <input type="number" class="border rounded w-full px-2 py-1"
                 value="${m.depth}"
                 data-proj="${projectId}"
                 data-material="${m.id}"
                 data-field="depth">
        </div>

      </div>

      <button class="bg-red-500 text-white px-2 py-1 rounded mt-2"
              data-proj="${projectId}"
              data-material="${m.id}"
              data-action="remove-material">
        Remover Material
      </button>
    </div>
  `;
}



// ======================================================================
// UI ADDITIONAL ROW
// ======================================================================
function additionalRow(projectId, a) {
    return `
    <div class="border rounded p-3">
      <div class="grid grid-cols-2 gap-3">

        <div>
          <label class="text-sm">Adicional</label>
          <select class="border rounded w-full px-2 py-1"
                  data-proj="${projectId}"
                  data-add="${a.id}"
                  data-field="additionalId">
            <option value="">Selecione</option>
            ${DB.additionals.map(x => `
              <option value="${x.id}" ${x.id === a.additionalId ? "selected" : ""}>
                ${x.name} — R$${x.price}
              </option>
            `).join("")}
          </select>
        </div>

        <div>
          <label class="text-sm">Qtd.</label>
          <input type="number" class="border rounded w-full px-2 py-1"
                 value="${a.quantity}"
                 data-proj="${projectId}"
                 data-add="${a.id}"
                 data-field="quantity">
        </div>

      </div>

      <button class="bg-red-500 text-white px-2 py-1 rounded mt-2"
              data-proj="${projectId}"
              data-add="${a.id}"
              data-action="remove-additional">
        Remover Adicional
      </button>
    </div>
  `;
}



// ======================================================================
// EVENTOS POR PROJETO
// ======================================================================
function attachProjectEvents() {
    document.querySelectorAll("[data-field]")
        .forEach(el => {
            el.addEventListener("input", () => {
                updateProjectField(el);
                updateSummary();
            });
        });

    document.querySelectorAll("[data-action='add-material']")
        .forEach(btn =>
            btn.addEventListener("click", () => addMaterial(btn.dataset.proj))
        );

    document.querySelectorAll("[data-action='add-additional']")
        .forEach(btn =>
            btn.addEventListener("click", () => addAdditional(btn.dataset.proj))
        );

    document.querySelectorAll("[data-action='remove-project']")
        .forEach(btn =>
            btn.addEventListener("click", () => removeProject(btn.dataset.proj))
        );

    document.querySelectorAll("[data-action='remove-material']")
        .forEach(btn =>
            btn.addEventListener("click", () =>
                removeMaterial(btn.dataset.proj, btn.dataset.material))
        );

    document.querySelectorAll("[data-action='remove-additional']")
        .forEach(btn =>
            btn.addEventListener("click", () =>
                removeAdditional(btn.dataset.proj, btn.dataset.add))
        );
}



// ======================================================================
// MANIPULAÇÃO DE PROJETO
// ======================================================================
function updateProjectField(el) {
    const proj = calcProjects.find(p => p.id === el.dataset.proj);
    if (!proj) return;

    // nome
    if (el.dataset.field === "name") {
        proj.name = el.value;
        return;
    }

    // material
    const material = proj.materials.find(m => m.id === el.dataset.material);
    if (material) {
        const field = el.dataset.field;
        material[field] = field === "materialId"
            ? el.value
            : parseFloat(el.value || 0);
    }

    // adicional
    const add = proj.additionals.find(a => a.id === el.dataset.add);
    if (add) {
        const field = el.dataset.field;
        add[field] = field === "additionalId"
            ? el.value
            : parseFloat(el.value || 0);
    }
}



// ======================================================================
// ➕ MATERIAL / ADICIONAL
// ======================================================================
function addMaterial(projectId) {
    const proj = calcProjects.find(p => p.id === projectId);
    proj.materials.push({
        id: uid(),
        materialId: "",
        height: 0,
        width: 0,
        depth: 0
    });
    renderProjects();
}

function addAdditional(projectId) {
    const proj = calcProjects.find(p => p.id === projectId);
    proj.additionals.push({
        id: uid(),
        additionalId: "",
        quantity: 1
    });
    renderProjects();
}



// ======================================================================
// ➖ REMOVER ITENS
// ======================================================================
function removeProject(id) {
    calcProjects = calcProjects.filter(p => p.id !== id);
    renderProjects();
}

function removeMaterial(projectId, materialId) {
    const proj = calcProjects.find(p => p.id === projectId);
    proj.materials = proj.materials.filter(m => m.id !== materialId);
    renderProjects();
}

function removeAdditional(projectId, addId) {
    const proj = calcProjects.find(p => p.id === projectId);
    proj.additionals = proj.additionals.filter(x => x.id !== addId);
    renderProjects();
}



// ======================================================================
// 🧮 CÁLCULO GERAL
// ======================================================================
function calculateTotals() {
    let totals = {
        materials: {},
        additionals: 0,
        totalMat: 0,
        totalLabor: 0,
        subtotal: 0,
        marginValue: 0,
        total: 0
    };

    // --- SOMAR ÁREA TOTAL DE MATERIAIS EM TODOS PROJETOS
    calcProjects.forEach(p => {
        p.materials.forEach(mItem => {
            if (!mItem.materialId) return;

            const mat = DB.materials.find(x => x.id === mItem.materialId);
            if (!mat) return;

            const area = (
                (mItem.height * mItem.width * 2) +
                (mItem.height * mItem.depth * 2) +
                (mItem.width * mItem.depth * 2)
            ) / 10000;

            totals.materials[mItem.materialId] =
                (totals.materials[mItem.materialId] || 0) + area;
        });

        // --- ADICIONAIS
        p.additionals.forEach(a => {
            const ad = DB.additionals.find(x => x.id === a.additionalId);
            if (!ad) return;

            totals.additionals += ad.price * (a.quantity || 1);
        });
    });

    // --- CALCULAR CHAPAS COMPARTILHADAS
    Object.entries(totals.materials).forEach(([matId, area]) => {
        const mat = DB.materials.find(x => x.id === matId);
        if (!mat) return;

        const loss = mat.waste || DB.settings.waste;
        const areaComPerda = area * (1 + loss / 100);
        const chapaArea = mat.width * mat.height;

        const chapas = Math.ceil(areaComPerda / chapaArea);
        const custo = chapas * mat.price;

        totals.totalMat += custo;
    });

    // --- MÃO DE OBRA
    // mo = area total * custo
    const areaTotal = Object.values(totals.materials)
        .reduce((s, v) => s + v, 0);

    totals.totalLabor =
        areaTotal * (DB.settings.laborCost || 150);

    // --- SUBTOTAL
    totals.subtotal =
        totals.totalMat + totals.totalLabor + totals.additionals;

    // --- MARGEM
    totals.marginValue =
        totals.subtotal * (DB.settings.profitMargin / 100);

    // --- TOTAL FINAL
    totals.total =
        totals.subtotal + totals.marginValue;

    return totals;
}



// ======================================================================
// RECAP RESUMO
// ======================================================================
function updateSummary() {
    const t = calculateTotals();

    document.getElementById("summary-material").textContent = t.totalMat.toFixed(2);
    document.getElementById("summary-labor").textContent = t.totalLabor.toFixed(2);
    document.getElementById("summary-additionals").textContent = t.additionals.toFixed(2);
    document.getElementById("summary-subtotal").textContent = t.subtotal.toFixed(2);
    document.getElementById("summary-margin").textContent = t.marginValue.toFixed(2);
    document.getElementById("summary-total").textContent = t.total.toFixed(2);
    document.getElementById("summary-margin-percent").textContent =
        DB.settings.profitMargin;
}



// ======================================================================
// 💾 SALVAR ORÇAMENTO
// ======================================================================
function saveBudget() {
    const clientId = document.getElementById("calc-client").value;
    const projectName = document.getElementById("calc-project-name").value.trim();
    const notes = document.getElementById("calc-notes").value.trim();

    if (!clientId || !projectName) {
        notify("Cliente e nome do orçamento são obrigatórios!", "warning");
        return;
    }

    if (calcProjects.length === 0) {
        notify("Adicione pelo menos 1 projeto!", "warning");
        return;
    }

    const totals = calculateTotals();

    DB.budgets.push({
        id: uid(),
        clientId,
        projectName,
        notes,
        projects: structuredClone(calcProjects),
        ...totals,
        status: "pending",
        date: new Date().toISOString()
    });

    saveData();
    notify("Orçamento salvo com sucesso!", "success");
    clearCalc();
}



// ======================================================================
// 🔄 LIMPAR CALCULADORA
// ======================================================================
function clearCalc() {
    calcProjects = [];
    renderProjects();
    updateSummary();
    document.getElementById("calc-project-name").value = "";
    document.getElementById("calc-notes").value = "";
    document.getElementById("calc-client").value = "";
}



// ======================================================================
// 📄 PDF MODERNO (pdfMake)
// ======================================================================

function generatePDF() {
    const clientId = document.getElementById("calc-client").value;
    const client = DB.clients.find(c => c.id === clientId);

    const projectName = document.getElementById("calc-project-name").value.trim();
    const notes = document.getElementById("calc-notes").value.trim();

    const totals = calculateTotals();

    // Monta lista de projetos/materiais
    const projectSections = calcProjects.map(p => {
        return [
            { text: p.name || "Projeto sem nome", style: "projectTitle" },
            {
                table: {
                    widths: ["*", "auto", "auto", "auto"],
                    body: [
                        [
                            { text: "Material", style: "tableHeader" },
                            { text: "Alt.", style: "tableHeader" },
                            { text: "Larg.", style: "tableHeader" },
                            { text: "Prof.", style: "tableHeader" }
                        ],
                        ...p.materials.map(m => {
                            const mat = DB.materials.find(x => x.id === m.materialId);
                            return [
                                mat ? mat.name : "-",
                                m.height + " cm",
                                m.width + " cm",
                                m.depth + " cm"
                            ];
                        })
                    ]
                },
                layout: "lightHorizontalLines",
                margin: [0, 5, 0, 10]
            },
            p.additionals.length > 0
                ? {
                    table: {
                        widths: ["*", "auto"],
                        body: [
                            [
                                { text: "Adicional", style: "tableHeader" },
                                { text: "Qtd", style: "tableHeader" }
                            ],
                            ...p.additionals.map(a => {
                                const ad = DB.additionals.find(x => x.id === a.additionalId);
                                return [ad ? ad.name : "-", a.quantity];
                            })
                        ]
                    },
                    layout: "lightHorizontalLines",
                    margin: [0, 0, 0, 10]
                }
                : ""
        ];
    });

    // Estrutura do PDF
    const doc = {
        content: [
            { text: "ORÇAMENTO", style: "title" },

            {
                text: `${projectName}`,
                style: "subtitle",
                margin: [0, -5, 0, 10]
            },

            {
                text: `Cliente: ${client ? client.name : "-"}`,
                style: "client"
            },

            { text: " " },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 520, y2: 0, lineWidth: 1 }] },
            { text: " " },

            // PROJETOS
            ...projectSections.flat(),

            { text: " " },
            { text: "RESUMO DO ORÇAMENTO", style: "subtitle" },

            {
                table: {
                    widths: ["*", "auto"],
                    body: [
                        ["Materiais", `R$ ${totals.totalMat.toFixed(2)}`],
                        ["Mão de obra", `R$ ${totals.totalLabor.toFixed(2)}`],
                        ["Adicionais", `R$ ${totals.additionals.toFixed(2)}`],
                        [{ text: "Subtotal", bold: true }, `R$ ${totals.subtotal.toFixed(2)}`],
                        [
                            `Margem (${DB.settings.profitMargin}%)`,
                            `R$ ${totals.marginValue.toFixed(2)}`
                        ],
                        [
                            { text: "TOTAL", style: "grandTotal" },
                            { text: `R$ ${totals.total.toFixed(2)}`, style: "grandTotalVal" }
                        ]
                    ]
                },
                layout: "lightHorizontalLines",
                margin: [0, 10, 0, 20]
            },

            notes
                ? {
                    text: `Observações:\n${notes}`,
                    style: "notes",
                    margin: [0, 10, 0, 0]
                }
                : ""
        ],

        styles: {
            title: {
                fontSize: 22,
                bold: true,
                alignment: "center",
                color: "#444"
            },
            subtitle: {
                fontSize: 14,
                bold: true,
                margin: [0, 10, 0, 5],
                color: "#555"
            },
            client: {
                fontSize: 12,
                color: "#444"
            },
            projectTitle: {
                fontSize: 13,
                bold: true,
                margin: [0, 10, 0, 4],
                color: "#333"
            },
            tableHeader: {
                bold: true,
                fillColor: "#eee"
            },
            notes: {
                italics: true,
                color: "#666"
            },
            grandTotal: {
                bold: true,
                fontSize: 14
            },
            grandTotalVal: {
                bold: true,
                fontSize: 16,
                color: "#c2410c" /* Amber-700 */
            }
        },

        defaultStyle: {
            fontSize: 10
        }
    };

    pdfMake.createPdf(doc).download(`Orcamento-${projectName}.pdf`);
}

