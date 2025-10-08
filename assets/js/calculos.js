document.addEventListener('DOMContentLoaded', () => {
    const robotText = document.querySelector('.sidebar-text');
    const rotaInput = document.querySelector('input[name="rota_selecionada"]');
    const veiculoInput = document.querySelector('input[name="veiculo_selecionado"]');
    
    // Elementos para o cálculo e exibição do resultado
    const formCalculo = document.querySelector('#formCalculo');
    const custoTotalEl = document.querySelector('.total-value');
    const formulaDetailsEl = document.querySelector('.formula-details');

    // Simulação dos dados que viriam das planilhas
    const rotasData = {
        'sp-ba': { distancia: 2027.5 },
        'sp-mg': { distancia: 586.2 }
    };

    const veiculosData = {
        'abc-1234': { custoKm: 1.95 },
        'def-5678': { custoKm: 1.60 }
    };
    
    // Função para atualizar o texto do robô conforme o preenchimento
    function checkFieldsAndChangeText() {
        if (rotaInput.value && veiculoInput.value) {
            robotText.textContent = 'ROTA E VEÍCULO PREENCHIDOS. AGORA BASTA CLICAR EM CALCULAR!';
        } else if (rotaInput.value) {
            robotText.textContent = 'ROTA SELECIONADA, AGORA ESCOLHA O VEÍCULO!';
        } else if (veiculoInput.value) {
            robotText.textContent = 'VEÍCULO SELECIONADO, AGORA ESCOLHA A ROTA!';
        }
    }

    const allSelects = document.querySelectorAll('.custom-select-wrapper');

    allSelects.forEach(wrapper => {
        const trigger = wrapper.querySelector('.custom-select-trigger');
        const options = wrapper.querySelectorAll('.custom-options li');
        const hiddenInput = wrapper.querySelector('input[type="hidden"]');
        const triggerText = trigger.querySelector('.selected-value');

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
                checkFieldsAndChangeText();
            });
        });
    });

    window.addEventListener('click', (e) => {
        allSelects.forEach(wrapper => {
            if (!wrapper.contains(e.target)) {
                wrapper.classList.remove('open');
            }
        });
    });

    formCalculo.addEventListener('submit', (e) => {
        e.preventDefault();

        const rotaId = rotaInput.value;
        const veiculoId = veiculoInput.value;

        if (rotaId && veiculoId) {
            const distancia = rotasData[rotaId].distancia;
            const custoKm = veiculosData[veiculoId].custoKm;
            const custoTotal = distancia * custoKm;

            const formattedCost = custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            custoTotalEl.textContent = formattedCost;
            formulaDetailsEl.textContent = `${distancia.toLocaleString('pt-BR')} km × R$ ${custoKm.toFixed(2).replace('.', ',')} p/km`;

            robotText.textContent = 'PARA CALCULAR O CUSTO DA VIAGEM, BASTA MULTIPLICAR OS DADOS ROTA PELOS DADOS VEÍCULO ✅';
        } else {
            custoTotalEl.textContent = '';
            formulaDetailsEl.textContent = '';
            robotText.textContent = 'POR FAVOR, SELECIONE UMA ROTA E UM VEÍCULO PARA CALCULAR.';
        }
    });
});