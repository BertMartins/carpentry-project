// ===============================
// 📦 DB CORE
// ===============================
// Central responsável por:
// - armazenar dados
// - carregar/salvar no localStorage
// - fornecer helper de geração de ID
// - manter estrutura única de estado
// ===============================

export const DB = {
    materials: [],
    clients: [],
    budgets: [],
    settings: {
        profitMargin: 30,
        laborCost: 150,
        waste: 10,
        validity: 30,

        companyName: "Minha Marcenaria",
        phone: "",
        email: "",
        address: "",
        payment: "PIX, Dinheiro, Cartão, Dinheiro",

        theme: {
            primary: "#8B4513",
            secondary: "#D2691E",
            accent: "#DEB887",
        }
    }
};


// ===============================
// 🔧 LOCAL STORAGE
// ===============================

const STORAGE_KEY = "marcenasys_data";

export function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DB));
    } catch (err) {
        console.error("Erro ao salvar localStorage:", err);
    }
}

export function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw);

        DB.materials = parsed.materials || [];
        DB.clients = parsed.clients || [];
        DB.budgets = parsed.budgets || [];
        DB.settings = { ...DB.settings, ...(parsed.settings || {}) };
    } catch (err) {
        console.error("Erro ao carregar localStorage:", err);
    }
}


// ===============================
// 🔑 UTIL — Gera ID único
// ===============================

export function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}
