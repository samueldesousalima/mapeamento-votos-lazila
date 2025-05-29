const form = document.getElementById('formCadastro');
const tabela = document.getElementById('tabelaVotos');

let votos = JSON.parse(localStorage.getItem('votos')) || [];

function salvarVotos() {
  localStorage.setItem('votos', JSON.stringify(votos));
}

function atualizarTabela() {
  tabela.innerHTML = '';

  votos.forEach((voto, index) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${voto.nomeEleitor}</td>
      <td>${voto.localVotacao}</td>
      <td>${voto.puxador}</td>
      <td>
        <button class="btn-editar" data-index="${index}">Editar</button>
        <button class="btn-apagar" data-index="${index}">Apagar</button>
      </td>
    `;

    tabela.appendChild(tr);
  });

  // Adiciona eventos aos botões editar e apagar
  document.querySelectorAll('.btn-apagar').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = e.target.getAttribute('data-index');
      votos.splice(idx, 1);
      salvarVotos();
      atualizarTabela();
      atualizarGraficos();
    });
  });

  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = e.target.getAttribute('data-index');
      const voto = votos[idx];

      // Preenche o formulário com os dados para edição
      document.getElementById('nomeEleitor').value = voto.nomeEleitor;
      document.getElementById('localVotacao').value = voto.localVotacao;
      document.getElementById('puxador').value = voto.puxador;

      // Remove o voto antigo para substituir depois
      votos.splice(idx, 1);
      salvarVotos();
      atualizarTabela();
      atualizarGraficos();
    });
  });
}

function contarPorCampo(campo) {
  return votos.reduce((acc, voto) => {
    acc[voto[campo]] = (acc[voto[campo]] || 0) + 1;
    return acc;
  }, {});
}

let graficoPuxadores = null;
let graficoLocais = null;

function atualizarGraficos() {
  const dadosPuxador = contarPorCampo('puxador');
  const dadosLocal = contarPorCampo('localVotacao');

  const ctxPuxador = document.getElementById('graficoPuxadores').getContext('2d');
  const ctxLocal = document.getElementById('graficoLocais').getContext('2d');

  const criarGrafico = (ctx, dados, titulo, cor) => {
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(dados),
        datasets: [{
          label: titulo,
          data: Object.values(dados),
          backgroundColor: cor,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: titulo }
        },
        scales: {
          y: { beginAtZero: true, precision: 0 }
        }
      }
    });
  };

  if (graficoPuxadores) graficoPuxadores.destroy();
  if (graficoLocais) graficoLocais.destroy();

  graficoPuxadores = criarGrafico(ctxPuxador, dadosPuxador, 'Distribuição por Puxador', '#003c7d');
  graficoLocais = criarGrafico(ctxLocal, dadosLocal, 'Distribuição por Local de Votação', '#0050a5');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nomeEleitor = document.getElementById('nomeEleitor').value.trim();
  const localVotacao = document.getElementById('localVotacao').value.trim();
  const puxador = document.getElementById('puxador').value.trim();

  if (!nomeEleitor || !localVotacao || !puxador) return;

  votos.push({ nomeEleitor, localVotacao, puxador });
  salvarVotos();

  form.reset();
  atualizarTabela();
  atualizarGraficos();
});

// Inicializa a tabela e gráficos com dados salvos ao carregar a página
window.addEventListener('load', () => {
  atualizarTabela();
  atualizarGraficos();
});
