document.addEventListener("DOMContentLoaded", function () {

    const dropdownBtn = document.querySelector(".dropdown-button");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    const items = document.querySelectorAll(".dropdown-item");
    const selectedText = document.querySelector(".selected-enfermedad");

    if (!dropdownBtn || !dropdownMenu || !selectedText) return;

    dropdownBtn.setAttribute("aria-haspopup", "listbox");
    dropdownBtn.setAttribute("aria-expanded", "false");

    // abrir / cerrar menú
    dropdownBtn.addEventListener("click", function () {
        dropdownMenu.classList.toggle("show");
        dropdownBtn.setAttribute("aria-expanded", String(dropdownMenu.classList.contains("show")));
    });

    items.forEach(item => {
        item.addEventListener("click", function () {

            const enfermedad = this.getAttribute("data-enfermedad");

            // cambiar texto del botón
            selectedText.textContent = this.textContent;

            // ocultar todos los contenidos
            document.querySelectorAll(".estado-content").forEach(content => {
                content.classList.remove("active");
            });

            // mostrar el seleccionado
            const content = document.getElementById("content-" + enfermedad);
            if (content) {
                content.classList.add("active");
            }

            dropdownMenu.classList.remove("show");
            dropdownBtn.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".custom-dropdown")) {
            dropdownMenu.classList.remove("show");
            dropdownBtn.setAttribute("aria-expanded", "false");
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            dropdownMenu.classList.remove("show");
            dropdownBtn.setAttribute("aria-expanded", "false");
            dropdownBtn.focus();
        }
    });

});
