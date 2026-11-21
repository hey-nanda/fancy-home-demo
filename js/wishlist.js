
/* =========================================
   FANCY HOME — WISHLIST
========================================= */

(() => {

    const STORAGE_KEY = "fancyWishlist";
    const BAG_KEY = "fancyBag";

    
function imageUrl(src) {
    if (!src) return "";

    if (src.startsWith("/src/")) {
        return "." + src;
    }

    return src;
}


    // ---------- Produtos ----------

    let products = [];
    let productsLoaded = false;

    function getProducts() {
        return products;
    }

    function getProduct(id) {
        return getProducts().find(product =>
            String(product.id) === String(id)
        );
    }

    // ---------- LocalStorage ----------

    function getBag() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(BAG_KEY) || "[]"
            );

            return Array.isArray(saved) ? saved : [];
        } catch {
            return [];
        }
    }

    function saveBag(items) {
        localStorage.setItem(BAG_KEY, JSON.stringify(items));
    }

    function getWishlist() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            return Array.isArray(saved) ? saved : [];
        } catch {
            return [];
        }
    }

    function saveWishlist(ids) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(ids)
        );
    }

    function isFavorite(id) {
        return getWishlist().some(
            favoriteId => String(favoriteId) === String(id)
        );
    }

    // ---------- Formatação ----------

    function formatPrice(price) {
        return Number(price).toLocaleString("pt-BR", {
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

    // ---------- Corações dos produtos ----------

    function updateHeartButtons() {
        document.querySelectorAll(
            ".wishlist-toggle[data-product-id]"
        ).forEach(button => {

            const id = button.dataset.productId;
            const favorite = isFavorite(id);

            button.classList.toggle("is-favorite", favorite);
            button.setAttribute("aria-pressed", String(favorite));

            button.setAttribute(
                "aria-label",
                favorite
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"
            );
        });
    }

    // ---------- Adicionar / remover favoritos ----------

    function toggleFavorite(id) {

        if (!productsLoaded) {
            console.warn("Aguarde o carregamento dos produtos.");
            return;
        }

        const product = getProduct(id);

        if (!product) {
            console.error("Produto não encontrado:", id);
            return;
        }

        let favorites = getWishlist();

        if (isFavorite(id)) {
            favorites = favorites.filter(
                favoriteId => String(favoriteId) !== String(id)
            );
        } else {
            favorites.push(product.id);
        }

        saveWishlist(favorites);

        updateHeartButtons();
        renderWishlist();
    }

    // ---------- Miniaturas e painel ----------

    function renderWishlist() {

        const thumbnails = document.getElementById(
            "wishlist-thumbnails"
        );

        const panel = document.getElementById(
            "wishlist-panel"
        );

        const divider = document.querySelector(
            ".wishlist .divisor"
        );

        // Também é utilizada na página Product Details.
        if (!thumbnails || !panel) return;

        // Não renderiza antes de carregar os produtos.
        if (!productsLoaded) return;

        const favorites = getWishlist();

        const validProducts = favorites
            .map(id => getProduct(id))
            .filter(Boolean);

        // Se a API não retornou produtos, preserva os favoritos.
        if (products.length === 0 && favorites.length > 0) {

            thumbnails.innerHTML = "";
            thumbnails.hidden = true;

            panel.innerHTML = `
                <div class="wishlist__vazia">
                    <p>Não foi possível carregar seus favoritos.</p>
                    <span>Tente atualizar a página em alguns instantes.</span>
                </div>
            `;

            if (divider) divider.hidden = true;

            return;
        }

        // Remove apenas IDs de produtos que realmente não existem
        // após o carregamento bem-sucedido do catálogo.
        if (validProducts.length !== favorites.length) {
            saveWishlist(
                validProducts.map(product => product.id)
            );
        }

        // Wishlist vazia.
        if (validProducts.length === 0) {

            thumbnails.innerHTML = "";
            thumbnails.hidden = true;

            panel.innerHTML = `
                <div class="wishlist__vazia">
                    <p>Sua wishlist está vazia.</p>
                    <span>Explore nossa coleção e encontre seus favoritos!</span>
                    <a href="/shop.html" class="btn">
                        Explorar produtos
                    </a>
                </div>
            `;

            if (divider) divider.hidden = true;

            return;
        }

        thumbnails.hidden = false;

        if (divider) divider.hidden = false;

        // Mantém o produto selecionado.
        const selected = document.querySelector(
            'input[name="wishlist-selected"]:checked'
        );

        let selectedId = selected?.value;

        if (!validProducts.some(product =>
            String(product.id) === String(selectedId)
        )) {
            selectedId = String(validProducts[0].id);
        }

        // Cria os controles de seleção.
        const radios = validProducts.map((product, index) => `
            <input
                type="radio"
                id="w${index + 1}"
                name="wishlist-selected"
                value="${escapeHTML(product.id)}"
                ${String(product.id) === selectedId ? "checked" : ""}
                aria-label="Selecionar ${escapeHTML(product.name)}"
            >
        `).join("");

        // Cria as miniaturas.
        thumbnails.innerHTML = validProducts.map((product, index) => `
            <li class="${String(product.id) === selectedId ? "is-selected" : ""}">
                <label for="w${index + 1}">

                    <img
                        src="${escapeHTML(imageUrl(product.image))}"
                        alt="${escapeHTML(product.name)}"
                        loading="lazy"
                    >

                    <span class="miniaturas__nome">
                        ${escapeHTML(product.name)}
                    </span>

                    <span class="miniaturas__preco">
                        ${formatPrice(product.price)}
                    </span>

                </label>
            </li>
        `).join("");

        // Cria o painel de detalhes.
        panel.innerHTML = validProducts.map((product, index) => `
            <article class="item d${index + 1} ${String(product.id) === selectedId ? "is-selected" : ""}">

                <img
                    src="${escapeHTML(imageUrl(product.image))}"
                    alt="${escapeHTML(product.name)}"
                >

                <h2>${escapeHTML(product.name)}</h2>

                <p class="item__preco">
                    ${formatPrice(product.price)}
                </p>

                <button
                    type="button"
                    class="btn wishlist-add-cart"
                    data-product-id="${escapeHTML(product.id)}"
                >
                    Adicionar ao carrinho
                </button>

                <button
                    type="button"
                    class="btn btn--remover wishlist-remove"
                    data-product-id="${escapeHTML(product.id)}"
                >
                    Remover dos favoritos
                </button>

            </article>
        `).join("");

        // Os radios precisam ficar antes das miniaturas
        // para que os seletores CSS da wishlist funcionem.
        thumbnails.parentElement
            .querySelectorAll('input[name="wishlist-selected"]')
            .forEach(input => input.remove());

        thumbnails.insertAdjacentHTML("beforebegin", radios);
    }

    // ---------- Eventos de clique ----------

    document.addEventListener("click", event => {

        // Coração da página de produto.
        const heart = event.target.closest(
            ".wishlist-toggle[data-product-id]"
        );

        if (heart) {
            event.preventDefault();
            toggleFavorite(heart.dataset.productId);
            return;
        }

        // Remover da wishlist.
        const removeButton = event.target.closest(
            ".wishlist-remove"
        );

        if (removeButton) {
            toggleFavorite(removeButton.dataset.productId);
            return;
        }

        // Adicionar à sacola.
        const cartButton = event.target.closest(
            ".wishlist-add-cart"
        );

        if (cartButton) {

            const product = getProduct(
                cartButton.dataset.productId
            );

            if (!product) return;

            const bag = getBag();

            const existingProduct = bag.find(
                item => String(item.id) === String(product.id)
            );

            if (existingProduct) {
                existingProduct.quantity =
                    (Number(existingProduct.quantity) || 0) + 1;
            } else {
                bag.push({
                    id: product.id,
                    quantity: 1
                });
            }

            saveBag(bag);

            cartButton.textContent = "Adicionado à sacola!";
            cartButton.disabled = true;

            setTimeout(() => {
                cartButton.textContent = "Adicionar ao carrinho";
                cartButton.disabled = false;
            }, 1500);

            return;
        }
    });

    // ---------- Seleção das miniaturas ----------

    document.addEventListener("change", event => {

        if (!event.target.matches(
            'input[name="wishlist-selected"]'
        )) {
            return;
        }

        const selectedId = event.target.value;

        document.querySelectorAll(".miniaturas li").forEach(item => {
            const radio = item.querySelector("label")?.htmlFor;

            item.classList.toggle(
                "is-selected",
                radio === event.target.id
            );
        });

        document.querySelectorAll(".painel .item").forEach(item => {
            const index = Number(
                item.className.match(/\bd(\d+)\b/)?.[1]
            );

            const selectedRadio = document.getElementById(`w${index}`);

            item.classList.toggle(
                "is-selected",
                selectedRadio?.value === selectedId
            );
        });

    });

    // ---------- Inicialização ----------

    async function initializeWishlist() {

        try {

            if (!window.productsReady) {
                throw new Error(
                    "A Promise window.productsReady não foi encontrada."
                );
            }

            const loadedProducts = await window.productsReady;

            if (!Array.isArray(loadedProducts)) {
                throw new Error("A lista de produtos é inválida.");
            }

            products = loadedProducts;
            productsLoaded = true;

            console.log(
                "Wishlist conectada aos produtos:",
                products
            );

            renderWishlist();
            updateHeartButtons();

        } catch (error) {

            console.error(
                "Erro ao inicializar wishlist:",
                error
            );

            // Não altera nem apaga os favoritos salvos.
            const panel = document.getElementById("wishlist-panel");

            if (panel) {
                panel.innerHTML = `
                    <div class="wishlist__vazia">
                        <p>Não foi possível carregar seus favoritos.</p>
                        <span>Tente atualizar a página em alguns instantes.</span>
                    </div>
                `;
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeWishlist
        );
    } else {
        initializeWishlist();
    }

})();
