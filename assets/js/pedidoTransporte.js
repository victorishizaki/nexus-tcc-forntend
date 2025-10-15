document.addEventListener('DOMContentLoaded', () => {
    // --- Configuração da API ---
    const API_BASE_URL = 'http://localhost:8080'; 

    // --- Elementos DOM ---
    const formPedido = document.querySelector('#form-pedido');
    const veiculoIdInput = document.querySelector('#veiculo-id-input');
    const rotaIdInput = document.querySelector('#rota-id-input');
    const statusInput = document.querySelector('#status-input'); 
    
    const dataInicioInput = document.querySelector('#data-inicio');
    const dataFimInput = document.querySelector('#data-fim');

    const rotaOptionsContainer = document.querySelector('#rota-options');
    const veiculoOptionsContainer = document.querySelector('#veiculo-options');
    
    // Armazena dados para uso 
    let rotasDataMap = {}; 
    let veiculosDataMap = {}; 
    
    // --- FUNÇÕES DE MÁSCARA E CONVERSÃO DE DATA ---

    /**
     * Aplica máscara DD/MM/AAAA em um input de texto.
     */
    function applyDateMask(input) {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
            let formattedValue = '';
            
            if (value.length > 0) formattedValue += value.substring(0, 2);
            if (value.length > 2) formattedValue += '/' + value.substring(2, 4);
            if (value.length > 4) formattedValue += '/' + value.substring(4, 8);

            e.target.value = formattedValue;
        });
        // Limita o máximo de caracteres para 10 (DD/MM/AAAA)
        input.setAttribute('maxlength', 10);
    }

    /**
     * Converte DD/MM/AAAA para AAAA-MM-DD (formato API) e valida.
     * @param {string} dateString Data no formato DD/MM/AAAA
     * @returns {string|null} Data no formato AAAA-MM-DD ou null se inválida.
     */
    function convertToApiDate(dateString) {
        const parts = dateString.split('/');
        if (parts.length !== 3 || parts[2].length !== 4) {
            return null; // Formato incorreto
        }
        
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        
        // Validação básica de data (exemplo: meses entre 1 e 12)
        if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
            return null;
        }

        // Retorna no formato YYYY-MM-DD exigido pelo Java LocalDate
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }


    // --- Funções de Dropdown (mantidas) ---

    function renderOptions(optionsData, container, hiddenInput, labelFn, initialText) {
        container.innerHTML = ''; 
        const triggerTextEl = hiddenInput.closest('.custom-select-wrapper').querySelector('.selected-value');
        triggerTextEl.textContent = initialText;

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
            });
        });
    }

    async function fetchVeiculos() {
        try {
            const response = await fetch(`${API_BASE_URL}/veiculos`);
            if (!response.ok) throw new Error('Falha ao carregar veículos (API /veiculos)');
            const veiculos = await response.json();
            
            veiculosDataMap = veiculos.reduce((acc, v) => {
                acc[v.id] = v;
                return acc;
            }, {});

            renderOptions(
                veiculos,
                veiculoOptionsContainer,
                veiculoIdInput,
                (v) => `${v.placa} - ${v.modelo}`, 
                "Selecione o Veículo"
            );
        } catch (error) {
            console.error('Erro ao buscar veículos:', error);
        }
    }

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
                rotaIdInput,
                (r) => `Origem: ${r.origem} / Destino: ${r.destino}`, 
                "Selecione a Rota"
            );
        } catch (error) {
            console.error('Erro ao buscar rotas:', error);
        }
    }
    
    // --- Lógica de Abertura/Fechamento dos Dropdowns (Centralizada) ---
    const allSelects = document.querySelectorAll('.custom-select-wrapper');

    allSelects.forEach(wrapper => {
        const trigger = wrapper.querySelector('.custom-select-trigger');
        const options = wrapper.querySelectorAll('.custom-options li'); 
        const hiddenInput = wrapper.querySelector('input[type="hidden"]');
        const triggerText = wrapper.querySelector('.selected-value');
        
        trigger.addEventListener('click', () => {
            allSelects.forEach(w => {
                if (w !== wrapper) {
                    w.classList.remove('open');
                }
            });
            wrapper.classList.toggle('open');
        });
        
        options.forEach(option => {
            option.addEventListener('click', () => {
                triggerText.innerText = option.innerText;
                hiddenInput.value = option.getAttribute('data-value'); 
                wrapper.classList.remove('open');
            });
        });
        
        if(wrapper.classList.contains('status-select-wrapper')) {
            triggerText.textContent = "Selecione o Status";
        }
    });

    window.addEventListener('click', (e) => {
        allSelects.forEach(wrapper => {
            if (!wrapper.contains(e.target)) {
                wrapper.classList.remove('open');
            }
        });
    });


    // --- Submissão do Formulário (Com Validação e Conversão de Data) ---
    formPedido.addEventListener('submit', async (e) => {
        e.preventDefault();

        const veiculoId = veiculoIdInput.value;
        const rotaId = rotaIdInput.value;
        const status = statusInput.value; 

        // 1. Converter e validar datas
        const apiDataInicio = convertToApiDate(dataInicioInput.value);
        const apiDataFim = convertToApiDate(dataFimInput.value);

        if (!apiDataInicio || !apiDataFim) {
            alert("Por favor, insira as datas nos formatos válidos (DD/MM/AAAA).");
            return;
        }

        if (!veiculoId || !rotaId || !status) {
            alert("Por favor, selecione Rota, Veículo e Status.");
            return;
        }

        const requestBody = {
            veiculoId: parseInt(veiculoId), 
            rotaId: parseInt(rotaId),
            dataInicio: apiDataInicio, // Formato AAAA-MM-DD
            dataFim: apiDataFim       // Formato AAAA-MM-DD
        };
        
        const submitButton = formPedido.querySelector('button[type="submit"]');
        submitButton.textContent = 'CRIANDO...';
        submitButton.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/pedido/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText || 'Falha ao criar pedido.'}`);
            }

            alert("Pedido de Transporte criado com sucesso! Custo calculado pelo servidor.");
            window.location.href = 'pedidoHome.html'; 
            
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            alert(`Falha na criação do pedido: ${error.message}`);
        } finally {
            submitButton.textContent = 'CRIAR';
            submitButton.disabled = false;
        }
    });

    // --- Inicialização ---
    fetchRotas();
    fetchVeiculos();
    
    // Aplica a máscara nos inputs de data
    applyDateMask(dataInicioInput);
    applyDateMask(dataFimInput);
});