/* =========================================
   FANCY HOME — HOME DEMO
   Produtos em destaque do catálogo JSON
========================================= */

(() => {
    const productGrid = document.querySelector('#homeProductGrid');
    if (!productGrid) return;

    const featuredIds = [1, 2, 3, 4, 5, 6];

    function showMessage(message) {
        productGrid.replaceChildren();
        const item = document.createElement('li');
        item.textContent = message;
        productGrid.appendChild(item);
    }

    function renderProducts(products) {
        const featuredProducts = featuredIds
            .map(id => products.find(product => Number(product.id) === id))
            .filter(Boolean);

        if (featuredProducts.length === 0) {
            showMessage('Nenhum produto em destaque disponível no momento.');
            return;
        }

        productGrid.replaceChildren();

        featuredProducts.forEach(product => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = `./product-details.html?id=${encodeURIComponent(product.id)}`;

            const image = document.createElement('img');
            image.src = product.image;
            image.alt = product.name;
            image.loading = 'lazy';

            const name = document.createElement('h2');
            name.textContent = product.name;

            const price = document.createElement('p');
            price.textContent = Number(product.price).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            link.append(image, name, price);
            item.appendChild(link);
            productGrid.appendChild(item);
        });
    }

    if (!window.productsReady) {
        showMessage('Não foi possível carregar os produtos.');
        return;
    }

    window.productsReady
        .then(products => {
            if (!Array.isArray(products) || products.length === 0) {
                showMessage('Não foi possível carregar os produtos.');
                return;
            }
            renderProducts(products);
            console.log('Home carregada com o catálogo demonstrativo!');
        })
        .catch(error => {
            console.error('Erro ao carregar produtos na Home:', error);
            showMessage('Ocorreu um erro ao carregar os produtos.');
        });
})();
