document.addEventListener('DOMContentLoaded', () => {
    const listaContainer = document.getElementById('motoristas-list');
    let motoristas = JSON.parse(localStorage.getItem('motoristas')) || [];

    function renderizarMotoristas() {
        listaContainer.innerHTML = ''; // Limpa a lista antes de renderizar

        if (motoristas.length === 0) {
            listaContainer.innerHTML = '<p style="text-align: center; color: #999;">Nenhum motorista cadastrado ainda.</p>';
            return;
        }

        motoristas.forEach((motorista, index) => {
            const motoristaElemento = document.createElement('div');
            motoristaElemento.classList.add('motorista-item');
            motoristaElemento.dataset.index = index; // Armazena o índice do motorista no elemento

            motoristaElemento.innerHTML = `
                <div class="motorista-icon">
                    <span>&#x1F464;</span> <!-- Ícone de pessoa -->
                </div>
                <div class="motorista-details">
                    <p class="nome">${motorista.nome}</p>
                    <p>CNH: ${motorista.cnh}</p>
                </div>
                <!-- NOVO: Botões de Ação -->
                <div class="action-buttons">
                    <button class="action-btn edit-btn" title="Editar">✏️</button>
                    <button class="action-btn delete-btn" title="Excluir">🗑️</button>
                </div>
            `;
            listaContainer.appendChild(motoristaElemento);
        });
    }

    // Gerencia os cliques nos botões de editar e excluir
    listaContainer.addEventListener('click', (event) => {
        const target = event.target;
        const motoristaItem = target.closest('.motorista-item');
        
        if (!motoristaItem) return;

        const index = parseInt(motoristaItem.dataset.index, 10);

        // Ação de Excluir
        if (target.classList.contains('delete-btn')) {
            const confirmacao = confirm(`Tem certeza que deseja excluir ${motoristas[index].nome}?`);
            if (confirmacao) {
                motoristas.splice(index, 1); // Remove o motorista da lista
                localStorage.setItem('motoristas', JSON.stringify(motoristas)); // Atualiza o armazenamento
                renderizarMotoristas(); // Atualiza a tela
            }
        }

        // Ação de Editar
        if (target.classList.contains('edit-btn')) {
            // Redireciona para a página de cadastro passando o índice do motorista
            window.location.href = `pedidoMotorista.html?edit=${index}`;
        }
    });

    // Renderiza a lista inicial ao carregar a página
    renderizarMotoristas();
});
