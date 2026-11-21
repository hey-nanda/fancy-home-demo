
/* =========================================
   FANCY HOME — PAINÉIS DA CONTA
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const conta = document.getElementById("conta");
    const voltar = document.getElementById("conta-voltar");

    if (!conta || !voltar) return;

    const botoes = conta.querySelectorAll("[data-painel]");
    const paineis = conta.querySelectorAll(".painel-conta");

    const atalhos = conta.querySelector(".atalhos");
    const novidades = document.querySelector(".novidades");
    const boasVindas = document.querySelector(".boas-vindas");

    let ultimoBotao = null;

    // Fecha todos os painéis e retorna ao perfil
    function fechar() {

        paineis.forEach(painel => {
            painel.hidden = true;
        });

        botoes.forEach(botao => {
            botao.setAttribute("aria-expanded", "false");
        });

        atalhos.hidden = false;
        novidades.hidden = false;
        boasVindas.hidden = false;

        conta.classList.remove("aberto", "conta--historico");

        voltar.hidden = true;

        if (ultimoBotao) {
            ultimoBotao.focus();
            ultimoBotao = null;
        }
    }

    // Abre o painel selecionado
    function abrir(nome, botao) {

        const painel = document.getElementById("painel-" + nome);

        if (!painel || !botao) return;

        // Fecha os painéis anteriores
        paineis.forEach(item => {
            item.hidden = true;
        });

        botoes.forEach(item => {
            item.setAttribute("aria-expanded", "false");
        });

        ultimoBotao = botao;

        // Exibe o painel selecionado
        painel.hidden = false;

        botao.setAttribute("aria-expanded", "true");

        // Esconde o conteúdo inicial
        atalhos.hidden = true;
        novidades.hidden = true;
        boasVindas.hidden = true;

        // Atualiza o layout
        conta.classList.add("aberto");

        conta.classList.toggle(
            "conta--historico",
            nome === "historico"
        );

        voltar.hidden = false;

        // Acessibilidade
        const titulo = painel.querySelector("h2");

        if (titulo) {
            titulo.focus();
        }
    }

    // Eventos dos atalhos
    botoes.forEach(botao => {

        botao.addEventListener("click", () => {

            const nome = botao.dataset.painel;

            const painel = document.getElementById("painel-" + nome);

            if (painel && !painel.hidden) {
                fechar();
            } else {
                abrir(nome, botao);
            }

        });

    });

    // Botão voltar
    voltar.addEventListener("click", fechar);

    // Fechar com ESC
    document.addEventListener("keydown", evento => {

        if (evento.key === "Escape") {

            const algumAberto = [...paineis].some(
                painel => !painel.hidden
            );

            if (algumAberto) fechar();

        }

    });

});



/* =========================================
   POP-UP DE MENSAGENS
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const popup = document.getElementById("popup-mensagem");

    if (!popup) return;

    const fechar = document.getElementById("popup-fechar");
    const confirmar = document.getElementById("popup-confirmar");
    const fundo = popup.querySelector(".popup-mensagem__fundo");

    function fecharPopup() {
        popup.remove();
    }

    fechar.addEventListener("click", fecharPopup);
    confirmar.addEventListener("click", fecharPopup);
    fundo.addEventListener("click", fecharPopup);

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && document.body.contains(popup)) {
            fecharPopup();
        }
    });

    confirmar.focus();

});
