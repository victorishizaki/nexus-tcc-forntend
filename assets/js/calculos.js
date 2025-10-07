document.addEventListener('DOMContentLoaded', () => {
    const robotText = document.querySelector('.sidebar-text');
    const rotaInput = document.querySelector('input[name="rota_selecionada"]');
    const veiculoInput = document.querySelector('input[name="veiculo_selecionado"]');
    const formSection = document.querySelector('.form-section');

    
    function checkFieldsAndChangeText() {
        // Verifica se os dois os inputs estão preenchidos
        if (rotaInput.value && veiculoInput.value) {
            robotText.textContent = 'CAMPO ROTA E CAMPO VEÍCULO PREENCHIDO. AGORA SÓ CALCULAR!';
        }
    }

    const allSelects = document.querySelectorAll('.custom-select-wrapper');

    allSelects.forEach(wrapper => {
        const trigger = wrapper.querySelector('.custom-select-trigger');
        const options = wrapper.querySelectorAll('.custom-options li');
        const hiddenInput = wrapper.querySelector('input[type="hidden"]');
        const triggerText = trigger.querySelector('span');

        trigger.addEventListener('click', () => {
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

    formSection.addEventListener('click', () => {
        robotText.textContent = 'ROTA SELECIONADA, ESCOLHA O VEÍCULO!';
    }, { once: true });


});