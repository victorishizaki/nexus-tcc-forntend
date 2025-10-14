document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos DOM ---
    const robotText = document.querySelector('.sidebar-text');
    const rotaInput = document.querySelector('input[name="rota_selecionada"]');
    const veiculoInput = document.querySelector('input[name="veiculo_selecionado"]');
    const formCalculo = document.querySelector('#formCalculo');
    const custoTotalEl = document.querySelector('.total-value');
    const formulaDetailsEl = document.querySelector('.formula-details');
    
    // Contêineres de opções atualizados
    const rotaOptionsContainer = document.querySelector('#rota-options');
    const veiculoOptionsContainer = document.querySelector('#veiculo-options');

    // --- Configuração da API ---
    const API_BASE_URL = 'http://localhost:8080'; 

    // --- Armazenamento de Dados da API ---
    let rotasDataMap = {}; 
    let veiculosDataMap = {}; 

    // --- Funções de Ajuda ---

    /**
     * Atualiza o texto do robô baseado no preenchimento dos campos.
     */
    function checkFieldsAndChangeText() {
        if (rotaInput.value && veiculoInput.value) {
            robotText.textContent = 'ROTA E VEÍCULO PREENCHIDOS. AGORA BASTA CLICAR EM CALCULAR!';
        } else if (rotaInput.value) {
            robotText.textContent = 'ROTA SELECIONADA, AGORA ESCOLHA O VEÍCULO!';
        } else if (veiculoInput.value) {
            robotText.textContent = 'VEÍCULO SELECIONADO, AGORA ESCOLHA A ROTA!';
        }
    }

    /**
     * Renderiza as opções nos dropdowns a partir dos dados da API.
     */
    function renderOptions(optionsData, container, hiddenInput, labelFn) {
        container.innerHTML = ''; 

        optionsData.forEach(item => {
            const li = document.createElement('li');
            li.setAttribute('data-value', item.id); 
            li.textContent = labelFn(item);
            container.appendChild(li);

            li.addEventListener('click', () => {
                const wrapper = li.closest('.custom-select-wrapper');
                const triggerText = wrapper.querySelector('.selected-value');

                triggerText.innerText = li.innerText;
                hiddenInput.value = li.getAttribute('data-value'); 
                wrapper.classList.remove('open');
                checkFieldsAndChangeText();
            });
        });
    }

    // --- Funções de Interação com a API ---

    /**
     * Busca os veículos na API e popula o dropdown.
     */
    async function fetchVeiculos() {
        try {
            const response = await fetch(`${API_BASE_URL}/veiculos`);
            if (!response.ok) throw new Error('Falha ao carregar veículos (API /veiculo)');
            const veiculos = await response.json();
            
            veiculosDataMap = veiculos.reduce((acc, v) => {
                acc[v.id] = v;
                return acc;
            }, {});

            renderOptions(
                veiculos,
                veiculoOptionsContainer,
                veiculoInput,
                (v) => `${v.placa} - ${v.modelo}` 
            );
        } catch (error) {
            console.error('Erro ao buscar veículos:', error);
            robotText.textContent = 'ERRO: Falha ao carregar veículos. Verifique o console.';
        }
    }

    /**
     * Busca as rotas na API e popula o dropdown.
     */
    async function fetchRotas() {
        try {
            const response = await fetch(`${API_BASE_URL}/rotas`); 
            if (!response.ok) throw new Error('Falha ao carregar rotas (API /rotas)');
            const rotas = await response.json();
            
            rotasDataMap = rotas.reduce((acc, r) => {
                acc[r.id] = r;
                return acc;
            }, {});

            renderOptions(
                rotas,
                rotaOptionsContainer,
                rotaInput,
                (r) => `Origem: ${r.origem} / Destino: ${r.destino}`
            );
        } catch (error) {
            console.error('Erro ao buscar rotas:', error);
            robotText.textContent = 'ERRO: Falha ao carregar rotas. Verifique o console.';
        }
    }

    /**
     * Envia os IDs para o Spring Boot calcular o custo total e retornar o resultado.
     */
    async function calculateCost(rotaId, veiculoId) {
        const hoje = new Date().toISOString().split('T')[0];

        const requestBody = {
            veiculoId: parseInt(veiculoId), 
            rotaId: parseInt(rotaId),
            dataInicio: hoje,
            dataFim: hoje 
        };

        const response = await fetch(`${API_BASE_URL}/pedido/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${errorText || 'Falha ao calcular na API.'}`);
        }

        const novoPedido = await response.json(); 
        
        return novoPedido.custoTotal; 
    }

    // --- Inicialização ---

    fetchRotas();
    fetchVeiculos();
    
    // --- Lógica de Abertura/Fechamento dos Dropdowns ---
    const allSelects = document.querySelectorAll('.custom-select-wrapper');

    allSelects.forEach(wrapper => {
        const trigger = wrapper.querySelector('.custom-select-trigger');
        
        trigger.addEventListener('click', () => {
            allSelects.forEach(w => {
                if (w !== wrapper) {
                    w.classList.remove('open');
                }
            });
            wrapper.classList.toggle('open');
        });
    });

    window.addEventListener('click', (e) => {
        allSelects.forEach(wrapper => {
            if (!wrapper.contains(e.target)) {
                wrapper.classList.remove('open');
            }
        });
    });

    // --- Submissão do Formulário de Cálculo ---
    formCalculo.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rotaId = rotaInput.value;
        const veiculoId = veiculoInput.value;

        if (rotaId && veiculoId) {
            custoTotalEl.textContent = 'Calculando...';
            formulaDetailsEl.textContent = '';
            robotText.textContent = 'AGUARDE, ESTAMOS CALCULANDO SEU PEDIDO... ⚙️';

            try {
                const custoTotal = await calculateCost(rotaId, veiculoId);
                
                const formattedCost = custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                custoTotalEl.textContent = formattedCost;

                const rota = rotasDataMap[rotaId];
                const veiculo = veiculosDataMap[veiculoId];
                
                const distanciaFormatada = rota.distancia.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
                const custoKmFormatado = veiculo.custoPorKm.toFixed(2).replace('.', ',');
                
                formulaDetailsEl.textContent = `${distanciaFormatada} km × R$ ${custoKmFormatado} p/km`;

                robotText.textContent = 'CUSTO DA VIAGEM CALCULADO E PEDIDO CRIADO COM SUCESSO! ✅';
                
            } catch (error) {
                console.error(error);
                custoTotalEl.textContent = 'ERRO';
                formulaDetailsEl.textContent = 'Falha ao calcular o custo.';
                robotText.textContent = `ERRO NA CONEXÃO OU CÁLCULO: ${error.message}`;
            }

        } else {
            custoTotalEl.textContent = '';
            formulaDetailsEl.textContent = '';
            robotText.textContent = 'POR FAVOR, SELECIONE UMA ROTA E UM VEÍCULO PARA CALCULAR.';
        }
    });
});