/* =========================================
   FANCY HOME — PRODUTOS DEMO
   Catálogo estático para Vercel
========================================= */

window.PRODUCTS = [];

window.productsReady = fetch('./api/products.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(products => {
        if (!Array.isArray(products)) {
            throw new Error('Catálogo inválido.');
        }

        window.PRODUCTS.splice(0, window.PRODUCTS.length, ...products);

        document.dispatchEvent(new CustomEvent('products:loaded', {
            detail: window.PRODUCTS
        }));

        return window.PRODUCTS;
    })
    .catch(error => {
        console.error('Erro ao carregar produtos:', error);

        document.dispatchEvent(new CustomEvent('products:error', {
            detail: error
        }));

        return [];
    });
