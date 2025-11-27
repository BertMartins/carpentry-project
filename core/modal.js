// =====================================
// 🪟 MODAL CORE
// =====================================
// Controle global de modal:
// - abrir
// - fechar
// - renderizar HTML dentro
// - fechar com ESC
// =====================================

const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");


// -------------------------------------
// 🔓 Abre modal
// -------------------------------------
export function openModal(html) {
    if (!modal) return;

    modalContent.innerHTML = html;
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    // trava scroll do fundo
    document.body.classList.add("overflow-hidden");
}


// -------------------------------------
// 🔒 Fecha modal
// -------------------------------------
export function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");

    modalContent.innerHTML = "";

    // destrava scroll
    document.body.classList.remove("overflow-hidden");
}


// -------------------------------------
// 🎯 Fechar ao clicar fora
// -------------------------------------
modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});


// -------------------------------------
// ⌨️ Fechar com ESC
// -------------------------------------
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
});

