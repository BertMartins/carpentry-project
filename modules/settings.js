// ============================================================
// ⚙️ SETTINGS MODULE
// ============================================================
// Responsável por:
// - Carregar configurações da empresa
// - Salvar alterações
// - Atualizar tema global
// ============================================================

import { DB, saveData } from "../core/db.js";
import { notify } from "../core/ui.js";


// ------------------------------------------------------------
// 🔄 INIT
// ------------------------------------------------------------
export function init() {
    loadSettingsIntoUI();
    attachEvents();
}



// ------------------------------------------------------------
// 🔧 EVENTOS
// ------------------------------------------------------------
function attachEvents() {
    document
        .getElementById("btn-save-settings")
        ?.addEventListener("click", saveSettings);
}



// ------------------------------------------------------------
// 📥 Carregar valores no formulário
// ------------------------------------------------------------
function loadSettingsIntoUI() {
    const s = DB.settings;

    setValue("settings-company-name", s.companyName);
    setValue("settings-phone", s.phone);
    setValue("settings-email", s.email);
    setValue("settings-address", s.address);

    setValue("settings-profit-margin", s.profitMargin);
    setValue("settings-labor-cost", s.laborCost);
    setValue("settings-waste", s.waste);
    setValue("settings-validity", s.validity);

    // Tema
    setValue("theme-primary", s.theme.primary);
    setValue("theme-secondary", s.theme.secondary);
    setValue("theme-accent", s.theme.accent);
}

function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
}



// ------------------------------------------------------------
// 💾 SALVAR CONFIGURAÇÕES
// ------------------------------------------------------------
function saveSettings() {
    const s = DB.settings;

    s.companyName = getVal("settings-company-name");
    s.phone = getVal("settings-phone");
    s.email = getVal("settings-email");
    s.address = getVal("settings-address");

    s.profitMargin = num("settings-profit-margin", s.profitMargin);
    s.laborCost = num("settings-labor-cost", s.laborCost);
    s.waste = num("settings-waste", s.waste);
    s.validity = num("settings-validity", s.validity);

    // Tema
    s.theme.primary = getVal("theme-primary") || s.theme.primary;
    s.theme.secondary = getVal("theme-secondary") || s.theme.secondary;
    s.theme.accent = getVal("theme-accent") || s.theme.accent;

    applyTheme();

    saveData();
    notify("Configurações salvas!", "success");
}



function getVal(id) {
    return document.getElementById(id)?.value?.trim();
}

function num(id, fallback) {
    const n = parseFloat(document.getElementById(id)?.value);
    return isNaN(n) ? fallback : n;
}



// ------------------------------------------------------------
// 🎨 APLICAR TEMA GLOBAL
// ------------------------------------------------------------
function applyTheme() {
    const root = document.documentElement;
    const t = DB.settings.theme;

    root.style.setProperty("--primary", t.primary);
    root.style.setProperty("--secondary", t.secondary);
    root.style.setProperty("--accent", t.accent);
}

