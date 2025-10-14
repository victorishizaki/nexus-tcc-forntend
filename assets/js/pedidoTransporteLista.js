
document.addEventListener('DOMContentLoaded', () => {
    const listaContainer = document.getElementById('pedidos-list');

    const pedidos = JSON.parse(localStorage.getItem('pedidosTransporte')) || [];

    if (pedidos.length === 0) {
        listaContainer.innerHTML = '<p style="text-align: center;">Nenhum pedido cadastrado ainda.</p>';
        return;
    }

    pedidos.forEach(pedido => {
        const pedidoElemento = document.createElement('div');
        pedidoElemento.classList.add('pedido-item');

        pedidoElemento.innerHTML = `
            <div class="pedido-content">
                <div class="pedido-icon">📦</div>
                <div class="pedido-details">
                    <p>Origem: <span>${pedido.origem}</span></p>
                    <p>Destino: <span>${pedido.destino}</span></p>
                    <p>Veículo: <span>${pedido.veiculo}</span></p>
                </div>
            </div>
            <hr class="pedido-divider">
        `;

        listaContainer.appendChild(pedidoElemento);
    });
});