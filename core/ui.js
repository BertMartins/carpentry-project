// ==========================================
// 🧠 UI CORE — Navegação, carregamento e UX
// ==========================================

import { loadData } from "./db.js";

// container onde o HTML das páginas será carregado
const pageContainer = document.getElementById("page-container");

// sidebar / mobile overlay
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const btnMenu = document.getElementById("btn-menu");


// ============================================================
// 🔵 Notificações globais
// ============================================================

export function notify(message, type = "info") {
    const div = document.createElement("div");
    div.className = `
    fixed top-6 right-6 px-4 py-3 rounded shadow text-white font-semibold z-[9999]
    ${type === "success" ? "bg-green-600" :
            type === "error" ? "bg-red-600" :
                type === "warning" ? "bg-yellow-600 text-black" :
                    "bg-blue-600"}
  `;

    div.textContent = message;
    document.body.appendChild(div);

    setTimeout(() => {
        div.style.opacity = "0";
        div.style.transition = "opacity 0.3s";
        setTimeout(() => div.remove(), 300);
    }, 2500);
}



// ============================================================
// 📄 Carregar páginas /web/*.html dinamicamente
// ============================================================

export const ui = {
    async loadPage(pageName) {
        try {
            // marca o menu ativo
            this.highlightNav(pageName);

            // carrega HTML da página
            const res = await fetch(`./web/${pageName}.html`);
            const html = await res.text();

            pageContainer.innerHTML = html;

            // tenta carregar o módulo equiv. (materials.js, clients.js, etc)
            await this.loadModuleFor(pageName);

        } catch (err) {
            console.error("Erro ao carregar página:", err);
            notify("Erro ao carregar página!", "error");
        }
    },


    // ============================================================
    // 🔌 Carrega automaticamente o módulo JS (materials.js, etc)
    // ============================================================

    async loadModuleFor(pageName) {
        try {
            const module = await import(`../modules/${pageName}.js`);
            if (module?.init) module.init();  // se o módulo tiver init(), chamamos
        } catch (err) {
            console.warn(`Nenhum módulo encontrado para ${pageName}`, err);
        }
    },


    // ============================================================
    // 🔦 Marca item do menu como ativo
    // ============================================================

    highlightNav(pageName) {
        document.querySelectorAll(".nav-item").forEach(el => {
            el.classList.remove("active");
        });

        const btn = document.querySelector(
            `.nav-item[onclick="ui.loadPage('${pageName}')"]`
        );

        btn?.classList.add("active");
    }
};



// ============================================================
// 📱 Controle da sidebar no mobile
// ============================================================

// abrir menu
btnMenu?.addEventListener("click", () => {
    sidebar.classList.remove("hidden");
    sidebarOverlay.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
});

// fechar clicando fora
sidebarOverlay?.addEventListener("click", closeSidebar);

export function closeSidebar() {
    sidebar.classList.add("hidden");
    sidebarOverlay.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
}



// ============================================================
// 🚀 Inicialização geral da interface
// ============================================================

function initUI() {
    loadData();           // carrega banco local
    ui.loadPage("dashboard"); // página inicial
}

document.addEventListener("DOMContentLoaded", initUI);
