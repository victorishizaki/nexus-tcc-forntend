// /assets/js/pedidoTransporte.js (CORRIGIDO)

document.getElementById('form-pedido').addEventListener('submit', function(event) {
    event.preventDefault();

    const veiculo = document.getElementById('veiculo').value;
    const rota = document.getElementById('rota').value;
    
    let origem = "Não especificado";
    let destino = "Não especificado";
    if (rota.includes('-')) {
        const partes = rota.split('-').map(p => p.trim());
        origem = partes[0];
        destino = partes[1];
    } else {
        origem = rota; 
    }

    const novoPedido = {
        veiculo: veiculo,
        origem: origem,
        destino: destino,
        dataInicio: document.getElementById('data-inicio').value,
        dataFim: document.getElementById('data-fim').value,
        status: document.getElementById('status').value
    };

    let pedidos = JSON.parse(localStorage.getItem('pedidosTransporte')) || [];

    pedidos.push(novoPedido);

    localStorage.setItem('pedidosTransporte', JSON.stringify(pedidos));

    window.location.href = 'pedidoTransporteLista.html'; 
});