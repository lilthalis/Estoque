// Array para armazenar os veículos
let stock = [
  { brand: 'Toyota', model: 'Corolla', year: 2021, color: 'Prata', price: 95000, status: 'Disponível' },
  { brand: 'Honda', model: 'Civic', year: 2020, color: 'Preto', price: 88000, status: 'Vendido' },
  { brand: 'Volkswagen', model: 'Nivus', year: 2022, color: 'Branco', price: 105000, status: 'Disponível' }
];

// Elementos do DOM
const carForm = document.getElementById('carForm');
const carTableBody = document.getElementById('carTableBody');
const totalVehiclesEl = document.getElementById('totalVehicles');
const totalValueEl = document.getElementById('totalValue');
const reportDateEl = document.getElementById('reportDate');
const btnExportPdf = document.getElementById('btnExportPdf');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  updateReportDate();
  renderTable();
});

// Atualiza a data do relatório
function updateReportDate() {
  const now = new Date();
  reportDateEl.textContent = `Gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`;
}

// Renderiza a tabela e atualiza os totais
function renderTable() {
  carTableBody.innerHTML = '';
  let totalValue = 0;

  stock.forEach((car, index) => {
    totalValue += car.price;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${car.brand}</strong> ${car.model}</td>
      <td>${car.year}</td>
      <td>${car.color}</td>
      <td><span class="badge badge-${car.status.toLowerCase()}">${car.status}</span></td>
      <td>R$ ${car.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      <td class="no-pdf">
        <button class="btn-delete" onclick="deleteCar(${index})">Excluir</button>
      </td>
    `;
    carTableBody.appendChild(row);
  });

  // Atualiza resumos
  totalVehiclesEl.textContent = stock.length;
  totalValueEl.textContent = `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

// Evento de envio do formulário
carForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newCar = {
    brand: document.getElementById('brand').value,
    model: document.getElementById('model').value,
    year: parseInt(document.getElementById('year').value),
    color: document.getElementById('color').value,
    price: parseFloat(document.getElementById('price').value),
    status: document.getElementById('status').value
  };

  stock.push(newCar);
  renderTable();
  carForm.reset();
});

// Remover veículo
function deleteCar(index) {
  stock.splice(index, 1);
  renderTable();
}

// Exportar para PDF
btnExportPdf.addEventListener('click', () => {
  updateReportDate();

  // Esconde os botões de ação na hora de gerar o PDF
  const noPdfElements = document.querySelectorAll('.no-pdf');
  noPdfElements.forEach(el => el.style.display = 'none');

  const element = document.getElementById('reportArea');
  
  const options = {
    margin:       10,
    filename:     `relatorio_estoque_${new Date().toISOString().slice(0,10)}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Gera o PDF
  html2pdf().set(options).from(element).save().then(() => {
    // Reexibe os elementos após salvar
    noPdfElements.forEach(el => el.style.display = '');
  });
});