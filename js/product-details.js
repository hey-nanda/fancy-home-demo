
/* ========================================
   FANCY HOME — PRODUCT DETAILS DEMO
   Catálogo estático JSON
======================================== */

(() => {
    "use strict";

    // ---------- Elementos ----------

    const title = document.getElementById("product-title");
    const description = document.getElementById("productDescription");
    const price = document.getElementById("productPrice");

    const mainImage = document.getElementById("productImage");
    const thumbnails = document.getElementById("productThumbnails");

    const favoriteButton = document.getElementById("favoriteButton");
    const addToBagButton = document.getElementById("addToBag");

    const feedback = document.getElementById("productFeedback");
    const recommended = document.getElementById("recommendedProducts");

    const requiredElements = [
        title, description, price, mainImage, thumbnails,
        favoriteButton, addToBagButton, feedback, recommended
    ];

    if (requiredElements.some(element => !element)) {
        console.error("Elementos da página de produto não encontrados.");
        return;
    }

    // ---------- Caminhos da demonstração ----------

    // Funciona tanto em / no Live Server quanto
    // na raiz do site publicado na Vercel.
    const pageUrl = id =>
        `/product-details.html?id=${encodeURIComponent(id)}`;

    function imageUrl(src) {
        if (!src) return "";

        if (src.startsWith("/src/")) {
            return "." + src;
        }

        return src;
    }

    // ---------- ID do produto ----------

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    // ---------- Formatar preço ----------

    const formatPrice = value =>
        Number(value).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    // ---------- Feedback ----------

    function showFeedback(message) {
        feedback.textContent = message;
    }

    // ---------- Produto não encontrado ----------

    function showProductError(message) {
        title.textContent = message;

        description.textContent =
            "Não foi possível encontrar as informações deste produto.";

        price.textContent = "";
        mainImage.style.display = "none";
        thumbnails.innerHTML = "";

        favoriteButton.hidden = true;
        addToBagButton.hidden = true;

        const section = recommended.closest(".recommended-section");

        if (section) {
            section.hidden = true;
        }
    }

    // ---------- LocalStorage ----------

    function readStorage(key) {
        try {
            const items = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(items) ? items : [];
        } catch {
            return [];
        }
    }

    function saveStorage(key, items) {
        try {
            localStorage.setItem(key, JSON.stringify(items));
            return true;
        } catch (error) {
            console.error(`Erro ao salvar ${key}:`, error);
            showFeedback("Não foi possível salvar sua alteração.");
            return false;
        }
    }

    // ---------- Inicializar produto ----------

    function initializeProduct(products) {
        if (!productId) {
            showProductError("Produto não informado");
            return;
        }

        const product = products.find(
            item => String(item.id) === String(productId)
        );

        if (!product) {
            showProductError("Produto não encontrado");
            return;
        }

        // ---------- Informações ----------

        title.textContent = product.name;

        description.textContent =
            product.description || "Detalhes deste produto em breve.";

        price.textContent = formatPrice(product.price);

        document.title = `${product.name} | Fancy Home`;

        favoriteButton.dataset.productId = product.id;

        // ---------- Galeria ----------

        const productImages = [
            ...new Set(
                [product.image, ...(Array.isArray(product.images)
                    ? product.images
                    : [])]
                    .filter(src => typeof src === "string" && src.trim())
            )
        ];

        thumbnails.innerHTML = "";

        function selectImage(src, button) {
            mainImage.src = imageUrl(src);
            mainImage.alt = product.name;
            mainImage.style.display = "";

            thumbnails.querySelectorAll(".product-thumbnail")
                .forEach(item => {
                    item.classList.remove("active");
                    item.setAttribute("aria-pressed", "false");
                });

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");
        }

        if (productImages.length === 0) {
            mainImage.style.display = "none";
        } else {
            productImages.forEach((src, index) => {
                const button = document.createElement("button");

                button.type = "button";
                button.className = "product-thumbnail";

                button.setAttribute(
                    "aria-label",
                    `Ver imagem ${index + 1}`
                );

                button.setAttribute("aria-pressed", "false");

                const image = document.createElement("img");
                image.src = imageUrl(src);
                image.alt = "";

                button.appendChild(image);

                button.addEventListener("click", () => {
                    selectImage(src, button);
                });

                thumbnails.appendChild(button);

                if (index === 0) {
                    selectImage(src, button);
                }
            });
        }

        // ---------- Favoritos ----------

        function updateFavorite() {
            const wishlist = readStorage("fancyWishlist");

            const isFavorite = wishlist.some(
                id => String(id) === String(product.id)
            );

            favoriteButton.setAttribute(
                "aria-pressed",
                String(isFavorite)
            );

            favoriteButton.setAttribute(
                "aria-label",
                isFavorite
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"
            );
        }

        favoriteButton.addEventListener("click", () => {
            let wishlist = readStorage("fancyWishlist");

            const isFavorite = wishlist.some(
                id => String(id) === String(product.id)
            );

            if (isFavorite) {
                wishlist = wishlist.filter(
                    id => String(id) !== String(product.id)
                );
            } else {
                wishlist.push(product.id);
            }

            if (saveStorage("fancyWishlist", wishlist)) {
                showFeedback(
                    isFavorite
                        ? "Produto removido dos favoritos."
                        : "Produto adicionado aos favoritos."
                );

                updateFavorite();
            }
        });

        updateFavorite();

        // ---------- Sacola ----------

        addToBagButton.addEventListener("click", () => {
            const bag = readStorage("fancyBag");

            const existingProduct = bag.find(
                item => String(item.id) === String(product.id)
            );

            if (existingProduct) {
                existingProduct.quantity =
                    Number(existingProduct.quantity || 0) + 1;
            } else {
                bag.push({
                    id: product.id,
                    quantity: 1
                });
            }

            if (saveStorage("fancyBag", bag)) {
                showFeedback("Produto adicionado à sacola!");
            }
        });

        // ---------- Produtos recomendados ----------

        recommended.innerHTML = "";

        const suggestions = products
            .filter(item => String(item.id) !== String(product.id))
            .slice(0, 6);

        suggestions.forEach(item => {
            const li = document.createElement("li");
            li.className = "recommended-card";

            const link = document.createElement("a");
            link.href = pageUrl(item.id);

            const image = document.createElement("img");
            image.src = imageUrl(item.image);
            image.alt = item.name;
            image.loading = "lazy";

            const name = document.createElement("h3");
            name.textContent = item.name;

            const productPrice = document.createElement("p");
            productPrice.textContent = formatPrice(item.price);

            link.append(image, name, productPrice);
            li.appendChild(link);
            recommended.appendChild(li);
        });

        console.log("Produto demonstrativo carregado:", product);
    }

    // ---------- Carregar catálogo ----------

    if (!window.productsReady) {
        showProductError("Erro ao carregar o catálogo");
        console.error("productsReady não foi encontrado.");
        return;
    }

    window.productsReady
        .then(products => {
            if (!Array.isArray(products)) {
                throw new Error("Lista de produtos inválida.");
            }

            initializeProduct(products);
        })
        .catch(error => {
            console.error("Erro ao carregar produto:", error);
            showProductError("Erro ao carregar produto");
        });

})();
