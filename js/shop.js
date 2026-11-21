
/* =========================================
   FANCY HOME — SHOP
   VERSÃO DEMO | VERCEL

   Pesquisa, filtros e ordenação
   Catálogo integrado ao products.json
========================================= */

(() => {
    "use strict";

    // =========================================
    // ELEMENTOS
    // =========================================

    const searchInput = document.querySelector("#searchInput");
    const categoryFilter = document.querySelector("#categoryFilter");
    const priceFilter = document.querySelector("#priceFilter");
    const sortFilter = document.querySelector("#sortFilter");

    const productGrid = document.querySelector("#productGrid");
    const resultsCount = document.querySelector("#resultsCount");
    const emptyMessage = document.querySelector("#emptyMessage");
    const clearFilters = document.querySelector("#clearFilters");

    // Executa somente na página Shop.

    if (
        !searchInput ||
        !categoryFilter ||
        !priceFilter ||
        !sortFilter ||
        !productGrid ||
        !resultsCount ||
        !emptyMessage ||
        !clearFilters
    ) {
        return;
    }

    let products = [];
    let productsLoaded = false;

    // =========================================
    // FORMATAÇÃO
    // =========================================

    function normalizeText(text) {
        return String(text ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function formatPrice(price) {
        return Number(price).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    // Corrige imagens para a pasta demo.

    function imageUrl(src) {
        if (!src) return "";

        if (src.startsWith("./src/")) {
            return "." + src;
        }

        return src;
    }

    // =========================================
    // RENDERIZAR PRODUTOS
    // =========================================

    function renderProducts(filteredProducts) {
        productGrid.innerHTML = "";

        const fragment = document.createDocumentFragment();

        filteredProducts.forEach(product => {
            const item = document.createElement("li");

            const link = document.createElement("a");

            link.href =
                `../product-details.html?id=${encodeURIComponent(product.id)}`;

            // Imagem

            const image = document.createElement("img");

            image.src = imageUrl(product.image);
            image.alt = product.name;
            image.loading = "lazy";

            // Nome

            const name = document.createElement("h2");
            name.textContent = product.name;

            // Preço

            const price = document.createElement("p");
            price.textContent = formatPrice(product.price);

            // Montagem

            link.append(image, name, price);
            item.appendChild(link);

            fragment.appendChild(item);
        });

        productGrid.appendChild(fragment);
    }

    // =========================================
    // FILTRAR PRODUTOS
    // =========================================

    function filterProducts() {
        if (!productsLoaded) return;

        const search = normalizeText(searchInput.value);
        const category = categoryFilter.value;
        const price = priceFilter.value;
        const sort = sortFilter.value;

        let filtered = products.filter(product => {

            // Pesquisa por nome, descrição e tags.

            const tags = Array.isArray(product.tags)
                ? product.tags.join(" ")
                : "";

            const searchableText = normalizeText(
                `${product.name} ${product.description || ""} ${tags}`
            );

            const matchesSearch =
                !search || searchableText.includes(search);

            // Categoria

            const matchesCategory =
                category === "all" ||
                product.category === category;

            // Preço

            const productPrice = Number(product.price) || 0;

            let matchesPrice = true;

            if (price !== "all") {
                const [min, max] = price
                    .split("-")
                    .map(Number);

                if (price === "0-50") {
                    matchesPrice =
                        productPrice >= min &&
                        productPrice <= max;
                } else {
                    matchesPrice =
                        productPrice > min &&
                        productPrice <= max;
                }
            }

            return (
                matchesSearch &&
                matchesCategory &&
                matchesPrice
            );
        });

        // =====================================
        // ORDENAÇÃO
        // =====================================

        switch (sort) {
            case "lowest":
                filtered.sort(
                    (a, b) =>
                        Number(a.price) - Number(b.price)
                );
                break;

            case "highest":
                filtered.sort(
                    (a, b) =>
                        Number(b.price) - Number(a.price)
                );
                break;

            case "az":
                filtered.sort(
                    (a, b) =>
                        a.name.localeCompare(b.name, "pt-BR")
                );
                break;

            case "za":
                filtered.sort(
                    (a, b) =>
                        b.name.localeCompare(a.name, "pt-BR")
                );
                break;

            // Relevância mantém a ordem do JSON.
        }

        // =====================================
        // ATUALIZAR RESULTADOS
        // =====================================

        renderProducts(filtered);

        const count = filtered.length;

        resultsCount.textContent =
            `${count} ${count === 1
                ? "produto encontrado"
                : "produtos encontrados"}`;

        emptyMessage.hidden = count !== 0;

        if (count === 0) {
            emptyMessage.textContent =
                "Nenhum produto encontrado. Tente outra pesquisa.";
        }
    }

    // =========================================
    // EVENTOS
    // =========================================

    // Pesquisa em tempo real.

    searchInput.addEventListener(
        "input",
        filterProducts
    );

    // Categoria

    categoryFilter.addEventListener(
        "change",
        filterProducts
    );

    // Preço

    priceFilter.addEventListener(
        "change",
        filterProducts
    );

    // Ordenação

    sortFilter.addEventListener(
        "change",
        filterProducts
    );

    // =========================================
    // LIMPAR FILTROS
    // =========================================

    clearFilters.addEventListener("click", () => {
        searchInput.value = "";
        categoryFilter.value = "all";
        priceFilter.value = "all";
        sortFilter.value = "default";

        // Remove os parâmetros de pesquisa da URL.

        const cleanUrl = new URL(
            "./shop.html",
            window.location.href
        );

        window.history.replaceState(
            {},
            "",
            cleanUrl
        );

        filterProducts();
    });

    // =========================================
    // PARÂMETROS DA URL
    // =========================================

    const params = new URLSearchParams(
        window.location.search
    );

    const searchTerm = params.get("q") || "";
    const requestedCategory =
        params.get("category") || "all";

    const validCategories = [
        "all",
        "furniture",
        "decoration",
        "lighting",
        "kitchen",
        "organization"
    ];

    // Preenche a pesquisa com o texto da URL.

    searchInput.value = searchTerm;

    // Seleciona a categoria solicitada.

    categoryFilter.value =
        validCategories.includes(requestedCategory)
            ? requestedCategory
            : "all";

    // Preenche também a pesquisa do cabeçalho.

    const headerSearch = document.querySelector(
        ".topo .busca input[name='q']"
    );

    if (headerSearch) {
        headerSearch.value = searchTerm;
    }

    // =========================================
    // CARREGAR CATÁLOGO JSON
    // =========================================

    async function initializeShop() {
        try {
            if (
                !window.productsReady ||
                typeof window.productsReady.then !== "function"
            ) {
                throw new Error(
                    "window.productsReady não foi encontrado."
                );
            }

            // Aguarda product.js carregar products.json.

            const loadedProducts =
                await window.productsReady;

            if (!Array.isArray(loadedProducts)) {
                throw new Error(
                    "O catálogo retornado é inválido."
                );
            }

            products = loadedProducts;
            productsLoaded = true;

            console.log(
                "Fancy Home — Shop carregada:",
                products.length,
                "produtos"
            );

            filterProducts();

        } catch (error) {
            console.error(
                "Erro ao inicializar Shop:",
                error
            );

            productGrid.innerHTML = "";

            resultsCount.textContent =
                "Não foi possível carregar os produtos.";

            emptyMessage.textContent =
                "Ocorreu um erro ao carregar os produtos. Tente novamente.";

            emptyMessage.hidden = false;
        }
    }

    // =========================================
    // INICIALIZAÇÃO
    // =========================================

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeShop
        );
    } else {
        initializeShop();
    }

})();
