// Carrega os dados salvos no navegador ou inicia com dados de exemplo
let tickets = JSON.parse(localStorage.getItem('ti_tickets')) || [
  { id: 101, requester: 'Ana Souza', department: 'RH', category: 'Hardware', priority: 'Alta', description: 'Notebook não liga', status: 'Aberto' },
  { id: 102, requester: 'Carlos Lima', department: 'Vendas', category: 'Acessos', priority: 'Média', description: 'Reset de senha de e-mail', status: 'Concluído' },
  { id: 103, requester: 'Mariana Luz', department: 'Financeiro', category: 'Software', priority: 'Crítica', description: 'Erro ao emitir Nota Fiscal', status: 'Aberto' }
];

let categoryChartInstance = null;
let statusChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  updateDate();
  renderAll();
});

function updateDate() {
  const now = new Date();
  document.getElementById('reportDate').textContent = `Gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`;
}

function saveData() {
  localStorage.setItem('ti_tickets', JSON.stringify(tickets));
}

function renderAll() {
  renderTable();
  renderCharts();
  saveData();
}

function renderTable() {
  const tbody = document.getElementById('ticketTableBody');
  tbody.innerHTML = '';

  let openCount = 0;
  let closedCount = 0;

  tickets.forEach((ticket, index) => {
    if (ticket.status === 'Aberto') openCount++;
    else closedCount++;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${ticket.id}</td>
      <td><strong>${ticket.requester}</strong><br><small>${ticket.department}</small></td>
      <td>${ticket.category}</td>
      <td><span class="badge priority-${ticket.priority}">${ticket.priority}</span></td>
      <td>${ticket.description}</td>
      <td><span class="badge status-${ticket.status}">${ticket.status}</span></td>
      <td class="no-pdf">
        <button class="btn-status" onclick="toggleStatus(${index})">
          ${ticket.status === 'Aberto' ? 'Concluir' : 'Reabrir'}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('totalTickets').textContent = tickets.length;
  document.getElementById('openTickets').textContent = openCount;
  document.getElementById('closedTickets').textContent = closedCount;
}

// Alterna o status entre 'Aberto' e 'Concluído'
function toggleStatus(index) {
  tickets[index].status = tickets[index].status === 'Aberto' ? 'Concluído' : 'Aberto';
  renderAll();
}

// Formulário de Cadastro
document.getElementById('ticketForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const newTicket = {
    id: Math.floor(100 + Math.random() * 900),
    requester: document.getElementById('requester').value,
    department: document.getElementById('department').value,
    category: document.getElementById('category').value,
    priority: document.getElementById('priority').value,
    description: document.getElementById('description').value,
    status: 'Aberto'
  };

  tickets.push(newTicket);
  renderAll();
  e.target.reset();
});

// Renderização dos Gráficos com Chart.js
function renderCharts() {
  const categories = ['Hardware', 'Software', 'Redes', 'Acessos'];
  const categoryCounts = categories.map(cat => tickets.filter(t => t.category === cat).length);

  const openCount = tickets.filter(t => t.status === 'Aberto').length;
  const closedCount = tickets.filter(t => t.status === 'Concluído').length;

  // Gráfico de Categorias
  if (categoryChartInstance) categoryChartInstance.destroy();
  const ctxCat = document.getElementById('categoryChart').getContext('2d');
  categoryChartInstance = new Chart(ctxCat, {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [{ label: 'Qtd Chamados', data: categoryCounts, backgroundColor: '#0284c7' }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  // Gráfico de Status
  if (statusChartInstance) statusChartInstance.destroy();
  const ctxStatus = document.getElementById('statusChart').getContext('2d');
  statusChartInstance = new Chart(ctxStatus, {
    type: 'doughnut',
    data: {
      labels: ['Aberto', 'Concluído'],
      datasets: [{ data: [openCount, closedCount], backgroundColor: ['#f97316', '#16a34a'] }]
    },
    options: { responsive: true }
  });
}

// Exportação para PDF
document.getElementById('btnExportPdf').addEventListener('click', () => {
  updateDate();
  const noPdfElements = document.querySelectorAll('.no-pdf');
  noPdfElements.forEach(el => el.style.display = 'none');

  const element = document.getElementById('reportArea');
  const options = {
    margin: 8,
    filename: `relatorio_ti_${new Date().toISOString().slice(0,10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(options).from(element).save().then(() => {
    noPdfElements.forEach(el => el.style.display = '');
  });
});