document.addEventListener('DOMContentLoaded', () => {
    const listaContainer = document.getElementById('veiculos-list');
    let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];

    function renderizarVeiculos() {
        listaContainer.innerHTML = '';

        if (veiculos.length === 0) {
            listaContainer.innerHTML = '<p style="text-align: center; color: #999;">Nenhum veículo cadastrado ainda.</p>';
            return;
        }

        veiculos.forEach((veiculo, index) => {
            const veiculoElemento = document.createElement('div');
            veiculoElemento.classList.add('veiculo-item');
            veiculoElemento.dataset.index = index;

            veiculoElemento.innerHTML = `
                <div class="veiculo-icon">
                    <span>🚚</span>
                </div>
                <div class="veiculo-details">
                    <p class="placa">${veiculo.placa}</p>
                    <p>Modelo: ${veiculo.modelo}</p>
                </div>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" title="Editar">✏️</button>
                    <button class="action-btn delete-btn" title="Excluir">🗑️</button>
                </div>
            `;
            listaContainer.appendChild(veiculoElemento);
        });
    }

    listaContainer.addEventListener('click', (event) => {
        const target = event.target;
        const veiculoItem = target.closest('.veiculo-item');
        
        if (!veiculoItem) return;

        const index = parseInt(veiculoItem.dataset.index, 10);

        if (target.classList.contains('delete-btn')) {
            const confirmacao = confirm(`Tem certeza que deseja excluir o veículo de placa ${veiculos[index].placa}?`);
            if (confirmacao) {
                veiculos.splice(index, 1);
                localStorage.setItem('veiculos', JSON.stringify(veiculos));
                renderizarVeiculos();
            }
        }

        if (target.classList.contains('edit-btn')) {
            window.location.href = `cadastroVeiculos.html?edit=${index}`;
        }
    });

    renderizarVeiculos();
});

