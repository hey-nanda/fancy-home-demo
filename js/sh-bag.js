
/* =========================================
   FANCY HOME — SHOPPING BAG
   VERSÃO DEMO | VERCEL
========================================= */

(() => {
    "use strict";

    const BAG_KEY = "fancyBag";

    const FREE_SHIPPING_LIMIT = 200;
    const SHIPPING_PRICE = 18.50;

    // =========================================
    // ELEMENTOS
    // =========================================

    const bagList = document.querySelector(".itens__lista");
    const summaryList = document.querySelector(".resumo__lista");

    const subtotalElement = document.querySelector("#subtotal");
    const shippingElement = document.querySelector("#frete");
    const totalElement = document.querySelector("#total-final");
    const summaryTotalElement = document.querySelector("#resumo-total");

    const checkoutButton = document.querySelector(".confirmar");
    const checkoutForm = document.querySelector("#checkout");

    let products = [];
    let productsLoaded = false;

    // =========================================
    // FORMATAÇÃO
    // =========================================

    function formatPrice(value) {
        return Number(value).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    // Corrige imagens para funcionar em /demo/
    // e também na Vercel.

    function imageUrl(src) {
        if (!src) return "";

        if (src.startsWith("/src/")) {
            return "." + src;
        }

        return src;
    }

    // =========================================
    // LOCAL STORAGE
    // =========================================

    function getBag() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(BAG_KEY) || "[]"
            );

            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error("Erro ao ler sacola:", error);
            return [];
        }
    }

    function saveBag(items) {
        localStorage.setItem(
            BAG_KEY,
            JSON.stringify(items)
        );
    }

    // =========================================
    // PRODUTOS
    // =========================================

    function getProduct(productId) {
        return products.find(product =>
            String(product.id) === String(productId)
        );
    }

    function getValidBag() {
        const bag = getBag();

        // Não altera a sacola antes de carregar
        // corretamente o catálogo.

        if (!productsLoaded) {
            return [];
        }

        const validBag = bag
            .filter(item =>
                item &&
                getProduct(item.id)
            )
            .map(item => ({
                id: item.id,
                quantity: Math.max(
                    1,
                    Math.floor(Number(item.quantity) || 1)
                )
            }));

        // Atualiza somente quando necessário.

        if (JSON.stringify(bag) !== JSON.stringify(validBag)) {
            saveBag(validBag);
        }

        return validBag;
    }

    // =========================================
    // CÁLCULO DOS VALORES
    // =========================================

    function calculateTotals(bag) {
        const subtotal = bag.reduce((total, item) => {
            const product = getProduct(item.id);

            if (!product) return total;

            const price = Number(product.price) || 0;
            const quantity = Number(item.quantity) || 1;

            return total + price * quantity;
        }, 0);

        const shipping = subtotal === 0
            ? 0
            : subtotal > FREE_SHIPPING_LIMIT
                ? 0
                : SHIPPING_PRICE;

        return {
            subtotal,
            shipping,
            finalTotal: subtotal + shipping
        };
    }

    function updateTotals(bag) {
        const totals = calculateTotals(bag);

        if (subtotalElement) {
            subtotalElement.textContent =
                formatPrice(totals.subtotal);
        }

        if (shippingElement) {
            shippingElement.textContent =
                formatPrice(totals.shipping);
        }

        if (totalElement) {
            totalElement.textContent =
                formatPrice(totals.finalTotal);
        }

        if (summaryTotalElement) {
            summaryTotalElement.textContent =
                formatPrice(totals.finalTotal);
        }
    }

    // =========================================
    // RENDERIZAR SACOLA
    // =========================================

    function renderBag() {
        if (!bagList || !summaryList) return;

        if (!productsLoaded) {
            return;
        }

        const bag = getValidBag();

        bagList.innerHTML = "";
        summaryList.innerHTML = "";

        // -------------------------------------
        // SACOLA VAZIA
        // -------------------------------------

        if (bag.length === 0) {
            bagList.innerHTML = `
                <li class="sacola-vazia">
                    <p>Sua sacola está vazia.</p>
                    <a href="./shop.html">
                        Explorar produtos
                    </a>
                </li>
            `;

            summaryList.innerHTML = `
                <li class="resumo-vazio">
                    Nenhum produto adicionado.
                </li>
            `;

            updateTotals([]);

            if (checkoutButton) {
                checkoutButton.disabled = true;
            }

            return;
        }

        if (checkoutButton) {
            checkoutButton.disabled = false;
        }

        // -------------------------------------
        // PRODUTOS
        // -------------------------------------

        bag.forEach(item => {
            const product = getProduct(item.id);

            if (!product) return;

            const quantity = item.quantity;
            const price = Number(product.price) || 0;
            const itemTotal = price * quantity;

            const productName = escapeHTML(product.name);
            const productImage = escapeHTML(
                imageUrl(product.image)
            );

            const productId = escapeHTML(product.id);

            // ---------------------------------
            // ITEM DA SACOLA
            // ---------------------------------

            const listItem = document.createElement("li");

            listItem.innerHTML = `
                <button
                    type="button"
                    class="remover"
                    data-action="remove"
                    data-product-id="${productId}"
                    aria-label="Remover ${productName}"
                >
                    X
                </button>

                <img
                    src="${productImage}"
                    alt="${productName}"
                    loading="lazy"
                >

                <div class="item-detalhes">

                    <p class="item-nome">
                        ${productName}
                    </p>

                    <p class="item-preco">
                        ${formatPrice(price)}
                    </p>

                    <div class="quantidade">

                        <button
                            type="button"
                            data-action="decrease"
                            data-product-id="${productId}"
                            aria-label="Diminuir quantidade"
                        >
                            −
                        </button>

                        <span>${quantity}</span>

                        <button
                            type="button"
                            data-action="increase"
                            data-product-id="${productId}"
                            aria-label="Aumentar quantidade"
                        >
                            +
                        </button>

                    </div>

                </div>
            `;

            bagList.appendChild(listItem);

            // ---------------------------------
            // RESUMO DO PEDIDO
            // ---------------------------------

            const summaryItem = document.createElement("li");

            summaryItem.innerHTML = `
                <img
                    src="${productImage}"
                    alt="${productName}"
                    loading="lazy"
                >

                <div>

                    <p class="item-nome">
                        ${productName}
                    </p>

                    <p class="item-preco">
                        ${quantity} × ${formatPrice(price)}
                    </p>

                    <p class="item-preco">
                        Total: ${formatPrice(itemTotal)}
                    </p>

                </div>
            `;

            summaryList.appendChild(summaryItem);
        });

        updateTotals(bag);
    }

    // =========================================
    // AÇÕES DA SACOLA
    // =========================================

    if (bagList) {
        bagList.addEventListener("click", event => {
            const button = event.target.closest(
                "button[data-action]"
            );

            if (!button || !productsLoaded) return;

            const action = button.dataset.action;
            const productId = button.dataset.productId;

            const bag = getValidBag();

            const item = bag.find(product =>
                String(product.id) === String(productId)
            );

            if (!item) return;

            // REMOVER PRODUTO

            if (action === "remove") {
                const updatedBag = bag.filter(product =>
                    String(product.id) !== String(productId)
                );

                saveBag(updatedBag);
                renderBag();
                return;
            }

            // DIMINUIR QUANTIDADE

            if (action === "decrease") {
                item.quantity = Math.max(
                    1,
                    Number(item.quantity) - 1
                );
            }

            // AUMENTAR QUANTIDADE

            if (action === "increase") {
                item.quantity = Number(item.quantity) + 1;
            }

            saveBag(bag);
            renderBag();
        });
    }

    // =========================================
    // CHECKOUT — DEMONSTRAÇÃO
    // =========================================

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", event => {
            event.preventDefault();

            if (!productsLoaded) {
                alert("Aguarde o carregamento dos produtos.");
                return;
            }

            const bag = getValidBag();

            if (bag.length === 0) {
                alert("Sua sacola está vazia.");
                return;
            }

            const payment = checkoutForm.querySelector(
                'input[name="pagamento"]:checked'
            );

            if (!payment) {
                alert("Selecione uma forma de pagamento.");
                return;
            }

            alert(
                "Fancy Home — Demonstração\n\n" +
                "Este e-commerce foi desenvolvido " +
                "para fins de portfólio.\n\n" +
                "O checkout é demonstrativo. " +
                "Nenhuma compra ou cobrança será realizada."
            );

            // Mantém os itens na sacola.
            // Não envia dados e não registra pedidos.
        });
    }

    // =========================================
    // PAGAMENTO DEMONSTRATIVO
    // =========================================

    // Não coletar informações de cartão
    // na versão estática do portfólio.

    const cardFields = document.querySelectorAll(
        ".cartao input"
    );

    cardFields.forEach(input => {
        input.disabled = true;
        input.required = false;
        input.removeAttribute("name");
        input.removeAttribute("autocomplete");
        input.placeholder = "Indisponível na demonstração";
    });

    // =========================================
    // SINCRONIZAÇÃO ENTRE ABAS
    // =========================================

    window.addEventListener("storage", event => {
        if (event.key === BAG_KEY && productsLoaded) {
            renderBag();
        }
    });

    // =========================================
    // INICIALIZAÇÃO
    // =========================================

    async function initializeBag() {
        try {
            if (
                !window.productsReady ||
                typeof window.productsReady.then !== "function"
            ) {
                throw new Error(
                    "window.productsReady não foi encontrado."
                );
            }

            // Aguarda o catálogo carregado por product.js

            const loadedProducts = await window.productsReady;

            if (!Array.isArray(loadedProducts)) {
                throw new Error(
                    "O catálogo de produtos é inválido."
                );
            }

            products = loadedProducts;
            productsLoaded = true;

            console.log(
                "Fancy Home — catálogo carregado:",
                products.length,
                "produtos"
            );

            console.log(
                "Fancy Home — sacola:",
                getBag()
            );

            renderBag();

        } catch (error) {
            console.error(
                "Erro ao carregar a sacola:",
                error
            );

            // Não apaga o localStorage
            // quando ocorre um erro.

            if (bagList) {
                bagList.innerHTML = `
                    <li class="sacola-vazia">
                        Não foi possível carregar os produtos.
                        Tente atualizar a página.
                    </li>
                `;
            }

            if (checkoutButton) {
                checkoutButton.disabled = true;
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeBag
        );
    } else {
        initializeBag();
    }

})();
