// utils/calculosPonto.js

/**
 * Converte minutos em formato HH:MM
 * @param {number} minutos - Total de minutos
 * @returns {string} Formato HH:MM
 */
export const formatarMinutos = (minutos) => {
  if (!minutos || minutos === 0) return '00:00';
  
  const horas = Math.floor(Math.abs(minutos) / 60);
  const mins = Math.abs(minutos) % 60;
  const sinal = minutos < 0 ? '-' : '';
  
  return `${sinal}${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Converte formato HH:MM em minutos
 * @param {string} tempo - Formato HH:MM
 * @returns {number} Total de minutos
 */
export const converterParaMinutos = (tempo) => {
  if (!tempo || tempo === '00:00') return 0;
  
  const [horas, minutos] = tempo.split(':').map(Number);
  return (horas * 60) + minutos;
};

/**
 * Calcula diferença entre dois horários
 * @param {string} inicio - Horário de início HH:MM
 * @param {string} fim - Horário de fim HH:MM
 * @returns {number} Diferença em minutos
 */
export const calcularDiferenca = (inicio, fim) => {
  if (!inicio || !fim) return 0;
  
  const minutosInicio = converterParaMinutos(inicio);
  const minutosFim = converterParaMinutos(fim);
  
  return minutosFim - minutosInicio;
};

/**
 * Gera dados de exemplo para o espelho de ponto
 * @returns {Array} Array com dados de exemplo
 */
export const gerarDadosExemplo = () => {
  const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
  
  if (funcionarios.length === 0) {
    return [];
  }
  
  const dados = [];
  const hoje = new Date();
  
  // Gera 30 dias de dados para cada funcionário
  for (let dia = 0; dia < 30; dia++) {
    const dataAtual = new Date(hoje);
    dataAtual.setDate(hoje.getDate() - dia);
    
    const diaSemana = dataAtual.getDay();
    const dataString = dataAtual.toISOString().split('T')[0];
    
    funcionarios.forEach((funcionario, index) => {
      const isWeekend = diaSemana === 0 || diaSemana === 6;
      const isFolga = isWeekend || Math.random() < 0.1; // 10% chance de folga
      
      let registro = {
        id: `${funcionario.id}-${dataString}`,
        funcionarioId: funcionario.id,
        funcionarioNome: funcionario.nome,
        funcionarioMatricula: funcionario.matricula,
        data: dataString,
        diaSemana: diaSemana,
        isfolga: isFolga,
        horasTrabalhadas: 0,
        horasNormais: 0,
        horasExtras: 0,
        faltas: 0,
        atrasos: 0,
        adicionalNoturno: 0
      };
      
      if (!isFolga) {
        // Simula diferentes cenários de trabalho
        const cenario = Math.random();
        
        if (cenario < 0.05) {
          // 5% - Falta
          registro.faltas = 480; // 8 horas
        } else if (cenario < 0.15) {
          // 10% - Atraso
          registro.atrasos = 15 + Math.floor(Math.random() * 45); // 15-60 min
          registro.horasTrabalhadas = 480 - registro.atrasos;
          registro.horasNormais = registro.horasTrabalhadas;
        } else if (cenario < 0.25) {
          // 10% - Hora extra
          registro.horasTrabalhadas = 480 + Math.floor(Math.random() * 120); // até 2h extra
          registro.horasNormais = 480;
          registro.horasExtras = registro.horasTrabalhadas - 480;
        } else {
          // 75% - Dia normal
          registro.horasTrabalhadas = 480; // 8 horas
          registro.horasNormais = 480;
        }
        
        // Adicional noturno (chance de 20%)
        if (Math.random() < 0.2) {
          registro.adicionalNoturno = Math.floor(Math.random() * 120); // até 2h
        }
      }
      
      dados.push(registro);
    });
  }
  
  return dados.sort((a, b) => new Date(b.data) - new Date(a.data));
};

/**
 * Calcula resumo mensal
 * @param {Array} dados - Array com os dados do mês
 * @returns {Object} Objeto com o resumo
 */
export const calcularResumoMensal = (dados) => {
  return dados.reduce((acc, item) => {
    if (!item.isfolga) {
      acc.totalHorasTrabalhadas += item.horasTrabalhadas;
      acc.totalHorasNormais += item.horasNormais;
      acc.totalHorasExtras += item.horasExtras;
      acc.totalFaltas += item.faltas;
      acc.totalAtrasos += item.atrasos;
      acc.totalAdicionalNoturno += item.adicionalNoturno;
    }
    return acc;
  }, {
    totalHorasTrabalhadas: 0,
    totalHorasNormais: 0,
    totalHorasExtras: 0,
    totalFaltas: 0,
    totalAtrasos: 0,
    totalAdicionalNoturno: 0
  });
};