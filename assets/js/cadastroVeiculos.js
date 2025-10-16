document.addEventListener('DOMContentLoaded', () => {
    // Mapeamento dos elementos do formulário
    const form = document.getElementById('veiculo-form');
    const formTitle = document.querySelector('.header h1');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const inputs = {
        placa: document.getElementById('placa'),
        modelo: document.getElementById('modelo'),
        tipo: document.getElementById('tipo'),
        status: document.getElementById('status'),
        capacidade: document.getElementById('capacidade')
    };

    // --- LÓGICA DE EDIÇÃO ---
    const urlParams = new URLSearchParams(window.location.search);
    const editIndex = urlParams.get('edit');
    let veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];

    // Se a URL contiver o parâmetro 'edit', preenche o formulário
    if (editIndex !== null && veiculos[editIndex]) {
        const veiculoParaEditar = veiculos[editIndex];

        formTitle.textContent = "Editar Veículo";
        submitBtn.textContent = "SALVAR ALTERAÇÕES";

        inputs.placa.value = veiculoParaEditar.placa;
        inputs.modelo.value = veiculoParaEditar.modelo;
        inputs.tipo.value = veiculoParaEditar.tipo;
        inputs.status.value = veiculoParaEditar.status;
        inputs.capacidade.value = veiculoParaEditar.capacidade;
    }

    // --- MÁSCARAS E VALIDAÇÕES ---

    // Limita a placa a 7 caracteres e converte para maiúsculas
    inputs.placa.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase().slice(0, 7);
    });

    // Remove " KG" para edição e adiciona ao sair do campo
    inputs.capacidade.addEventListener('focus', (e) => {
        e.target.value = e.target.value.replace(' KG', '');
    });

    inputs.capacidade.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, ''); // Permite apenas números
    });

    inputs.capacidade.addEventListener('blur', (e) => { // Ao sair do campo
        let value = e.target.value;
        if (value && !value.endsWith(' KG')) {
            e.target.value = value + ' KG';
        }
    });


    // --- LÓGICA DE SUBMISSÃO (CRIAR OU EDITAR) ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const veiculoData = {
            placa: inputs.placa.value,
            modelo: inputs.modelo.value,
            tipo: inputs.tipo.value,
            status: inputs.status.value,
            capacidade: inputs.capacidade.value
        };

        if (editIndex !== null) {
            // Modo Edição: atualiza o veículo existente
            veiculos[editIndex] = veiculoData;
        } else {
            // Modo Criação: adiciona um novo veículo
            veiculos.push(veiculoData);
        }

        localStorage.setItem('veiculos', JSON.stringify(veiculos));
        // Redireciona para a tela de lista de veículos
        window.location.href = 'cadastroVeiculosLista.html';
    });
});