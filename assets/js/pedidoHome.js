document.addEventListener('DOMContentLoaded', () => {
    const listaContainer = document.getElementById('pedidos-list-container');
    // ATENÇÃO: Verifique se o endereço e a porta estão corretos para sua API
    const API_BASE_URL = 'http://localhost:8080'; 

    const backButton = document.getElementById('backBtn');
        backButton.addEventListener('click', () => {
            window.location.href = '/index.html';
        });

    // Função para buscar dados da API
    async function fetchPedidos() {
        // Limpa a lista e mostra o indicador de carregamento
        listaContainer.innerHTML = '<p style="text-align: center; color: #2EC4B6;">Carregando pedidos...</p>';
        
        try {
            const response = await fetch(`${API_BASE_URL}/pedido`);
            
            // Verifica se a resposta HTTP é 200-299
            if (!response.ok) {
                // Tenta ler a mensagem de erro do corpo da resposta, se possível
                let errorBody = await response.text();
                throw new Error(`Falha na requisição (Status: ${response.status}). Detalhes: ${errorBody.substring(0, 100)}...`);
            }
            
            const pedidos = await response.json();
            renderPedidos(pedidos);
        } catch (error) {
            console.error('Falha crítica ao buscar pedidos:', error);
            // Exibe mensagem de erro na tela
            listaContainer.innerHTML = `<p style="text-align: center; color: #e74c3c;">Erro ao carregar pedidos: Verifique se a API está rodando em ${API_BASE_URL}/pedido.</p>
                                        <p style="text-align: center; color: #e74c3c; font-size: 12px;">Detalhe: ${error.message}</p>`;
        }
    }

    // Função para renderizar a lista
    function renderPedidos(pedidos) {
        listaContainer.innerHTML = '';

        if (!pedidos || pedidos.length === 0) {
            listaContainer.innerHTML = '<p style="text-align: center;">Nenhum pedido cadastrado ainda.</p>';
            return;
        }

        pedidos.forEach(pedido => {
            const pedidoElemento = document.createElement('div');
            pedidoElemento.classList.add('pedido-item');
            pedidoElemento.dataset.id = pedido.id;

            // Formatação de data de AAAA-MM-DD para DD/MM/AAAA
            const formatarData = (dataStr) => {
                if (!dataStr) return 'N/A';
                // Lida com o formato [yyyy, mm, dd] que o Java LocalDate pode enviar
                if (Array.isArray(dataStr)) {
                    return `${String(dataStr[2]).padStart(2, '0')}/${String(dataStr[1]).padStart(2, '0')}/${dataStr[0]}`;
                }
                // Lida com o formato string yyyy-mm-dd
                const [y, m, d] = dataStr.split('-');
                return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
            };
            
            // Define a classe do status
            const statusClass = (pedido.status || 'planejada').toLowerCase().replace(/ /g, '-');
            
            // Verifica se as propriedades de relacionamento existem antes de acessar
            const rota = pedido.rota || { origem: 'N/A', destino: 'N/A', distancia: 0 };
            const veiculo = pedido.veiculo || { placa: 'N/A', modelo: 'N/A' };


            pedidoElemento.innerHTML = `
                <div class="pedido-content">
                    <div class="pedido-icon status-${statusClass}" title="Status: ${pedido.status}">
                        ${pedido.status === 'EM ROTA' ? '🚚' : (pedido.status === 'CONCLUIDA' ? '✅' : '📦')}
                    </div>
                    <div class="pedido-details">
                        <p>ID: <span>#${pedido.id}</span></p>
                        <p>Rota: <span>${rota.origem} → ${rota.destino}</span></p>
                        <p>Veículo: <span>${veiculo.placa}</span></p>
                    </div>
                    <button class="expand-btn" data-id="${pedido.id}">
                        <span class="arrow">▼</span>
                    </button>
                </div>
                
                <!-- Conteúdo Expansível (Dropdown) -->
                <div class="pedido-expanded-content" id="expanded-${pedido.id}">
                    <hr class="expanded-divider">
                    <p>Status: <span class="status-badge status-${statusClass}">${pedido.status}</span></p>
                    <p>Modelo: <span>${veiculo.modelo}</span></p>
                    <p>Distância: <span>${rota.distancia.toLocaleString('pt-BR')} km</span></p>
                    <p>Custo Total: <span>${pedido.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>
                    <p>Início: <span>${formatarData(pedido.dataInicio)}</span></p>
                    <p>Fim: <span>${formatarData(pedido.dataFim)}</span></p>
                    
                    <div class="action-buttons">
                        <button class="edit-btn" data-id="${pedido.id}">✏️ Editar</button>
                        <button class="delete-btn" data-id="${pedido.id}">🗑️ Deletar</button>
                    </div>
                </div>
                <hr class="pedido-divider">
            `;

            listaContainer.appendChild(pedidoElemento);
        });
        
        // Adiciona listeners aos botões após renderizar
        addEventListeners();
    }

    // Função para adicionar listeners aos botões
    function addEventListeners() {
        listaContainer.querySelectorAll('.expand-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const expandedContent = document.getElementById(`expanded-${id}`);
                expandedContent.classList.toggle('visible');
                e.currentTarget.classList.toggle('open');
            });
        });

        listaContainer.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                // Substituído alert() por console.log para seguir as diretrizes
                if (confirm(`Tem certeza que deseja deletar o Pedido #${id}?`)) { 
                    deletePedido(id);
                }
            });
        });

        listaContainer.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                console.log(`Funcionalidade de Edição para Pedido #${id} (redirecionar para página de edição).`);
                // Implementar redirecionamento para pedidoTransporte.html?id=...
            });
        });
    }

    // Função para deletar pedido na API
    async function deletePedido(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/pedido/${id}`, {
                method: 'DELETE',
            });
            
            if (response.status === 204) { 
                alert(`Pedido #${id} deletado com sucesso!`);
                fetchPedidos(); // Recarrega a lista
            } else {
                throw new Error(`Falha na deleção: Status ${response.status}`);
            }
        } catch (error) {
            console.error('Erro ao deletar pedido:', error);
            alert(`Erro ao deletar pedido: ${error.message}`);
        }
    }

    // Inicia o carregamento dos pedidos
    fetchPedidos();
});