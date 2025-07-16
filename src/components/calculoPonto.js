// calculosPonto.js - Utilitário para cálculos de ponto

// Horários padrão da empresa por dia da semana
const HORARIOS_PADRAO = {
  1: [ // Segunda-feira
    { entrada: '08:00', saida: '12:00' },
    { entrada: '13:00', saida: '17:00' }
  ],
  2: [ // Terça-feira
    { entrada: '08:00', saida: '16:00' }
  ],
  3: [ // Quarta-feira
    { entrada: '13:00', saida: '17:00' },
    { entrada: '19:00', saida: '21:00' },
    { entrada: '23:30', saida: '02:00' }
  ],
  4: [], // Quinta-feira - Folga
  5: [], // Sexta-feira - Vazio para exemplo
  6: [], // Sábado - Vazio para exemplo
  0: []  // Domingo - Vazio para exemplo
};

// Tolerância padrão em minutos
const TOLERANCIA_GERAL = 10;
const TOLERANCIA_POR_OCORRENCIA = 5;

// Horário que define adicional noturno (22:00 às 05:00)
const INICIO_NOTURNO = '22:00';
const FIM_NOTURNO = '05:00';

/**
 * Converte string de horário para minutos
 * @param {string} horario - Horário no formato HH:MM
 * @returns {number} - Minutos desde 00:00
 */
const horarioParaMinutos = (horario) => {
  const [horas, minutos] = horario.split(':').map(Number);
  return horas * 60 + minutos;
};

/**
 * Converte minutos para string de horário
 * @param {number} minutos - Minutos desde 00:00
 * @returns {string} - Horário no formato HH:MM
 */
const minutosParaHorario = (minutos) => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Calcula diferença entre dois horários em minutos
 * @param {string} inicio - Horário de início
 * @param {string} fim - Horário de fim
 * @returns {number} - Diferença em minutos
 */
const calcularDiferenca = (inicio, fim) => {
  let minutosInicio = horarioParaMinutos(inicio);
  let minutosFim = horarioParaMinutos(fim);
  
  // Se o horário de fim é menor que o de início, passou da meia-noite
  if (minutosFim < minutosInicio) {
    minutosFim += 24 * 60; // Adiciona 24 horas
  }
  
  return minutosFim - minutosInicio;
};

/**
 * Calcula horas trabalhadas em um período
 * @param {string} entrada - Horário de entrada
 * @param {string} saida - Horário de saída
 * @returns {number} - Minutos trabalhados
 */
const calcularHorasTrabalhadas = (entrada, saida) => {
  if (!entrada || !saida) return 0;
  return calcularDiferenca(entrada, saida);
};

/**
 * Calcula adicional noturno
 * @param {string} entrada - Horário de entrada
 * @param {string} saida - Horário de saída
 * @returns {number} - Minutos de adicional noturno
 */
const calcularAdicionalNoturno = (entrada, saida) => {
  if (!entrada || !saida) return 0;
  
  const inicioNoturno = horarioParaMinutos(INICIO_NOTURNO);
  const fimNoturno = horarioParaMinutos(FIM_NOTURNO) + 24 * 60; // Próximo dia
  
  let minutosEntrada = horarioParaMinutos(entrada);
  let minutosSaida = horarioParaMinutos(saida);
  
  // Se saída é menor que entrada, passou da meia-noite
  if (minutosSaida < minutosEntrada) {
    minutosSaida += 24 * 60;
  }
  
  // Verifica intersecção com período noturno
  const inicioTrabalho = Math.max(minutosEntrada, inicioNoturno);
  const fimTrabalho = Math.min(minutosSaida, fimNoturno);
  
  if (inicioTrabalho < fimTrabalho) {
    return fimTrabalho - inicioTrabalho;
  }
  
  return 0;
};

/**
 * Calcula dados do ponto para um dia específico
 * @param {Object} marcacoes - Marcações do dia { entrada1, saida1, entrada2, saida2, ... }
 * @param {number} diaSemana - Dia da semana (0=domingo, 1=segunda, etc.)
 * @returns {Object} - Dados calculados do ponto
 */
export const calcularPontoDia = (marcacoes, diaSemana) => {
  const horariosEsperados = HORARIOS_PADRAO[diaSemana] || [];
  
  // Se é folga, retorna zerado
  if (horariosEsperados.length === 0) {
    return {
      horasTrabalhadas: 0,
      horasNormais: 0,
      horasExtras: 0,
      faltas: 0,
      atrasos: 0,
      adicionalNoturno: 0,
      isfolga: true
    };
  }
  
  // Calcula horas trabalhadas total
  let totalTrabalhado = 0;
  let totalNoturno = 0;
  let totalAtrasos = 0;
  
  // Processa cada período trabalhado
  const periodos = [];
  for (let i = 1; i <= 4; i++) {
    const entrada = marcacoes[`entrada${i}`];
    const saida = marcacoes[`saida${i}`];
    
    if (entrada && saida) {
      const horasTrabalhadas = calcularHorasTrabalhadas(entrada, saida);
      const adicionalNoturno = calcularAdicionalNoturno(entrada, saida);
      
      periodos.push({ entrada, saida, horasTrabalhadas, adicionalNoturno });
      totalTrabalhado += horasTrabalhadas;
      totalNoturno += adicionalNoturno;
    }
  }
  
  // Calcula horas normais esperadas
  let horasNormaisEsperadas = 0;
  horariosEsperados.forEach(periodo => {
    horasNormaisEsperadas += calcularHorasTrabalhadas(periodo.entrada, periodo.saida);
  });
  
  // Calcula atrasos comparando com horários esperados
  periodos.forEach((periodo, index) => {
    if (horariosEsperados[index]) {
      const entradaEsperada = horarioParaMinutos(horariosEsperados[index].entrada);
      const entradaReal = horarioParaMinutos(periodo.entrada);
      
      if (entradaReal > entradaEsperada) {
        const atraso = entradaReal - entradaEsperada;
        if (atraso > TOLERANCIA_POR_OCORRENCIA) {
          totalAtrasos += atraso;
        }
      }
    }
  });
  
  // Calcula horas extras e faltas
  const horasNormais = Math.min(totalTrabalhado, horasNormaisEsperadas);
  const horasExtras = Math.max(0, totalTrabalhado - horasNormaisEsperadas);
  const faltas = Math.max(0, horasNormaisEsperadas - totalTrabalhado);
  
  return {
    horasTrabalhadas: totalTrabalhado,
    horasNormais,
    horasExtras,
    faltas,
    atrasos: totalAtrasos,
    adicionalNoturno: totalNoturno,
    isfolga: false
  };
};

/**
 * Formata minutos para exibição (HH:MM)
 * @param {number} minutos - Minutos a serem formatados
 * @returns {string} - Horário formatado
 */
export const formatarMinutos = (minutos) => {
  if (minutos === 0) return '00:00';
  
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Gera dados de exemplo para teste
 * @returns {Array} - Array com dados de exemplo
 */
export const gerarDadosExemplo = () => {
  const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
  
  if (funcionarios.length === 0) {
    return [];
  }
  
  const dados = [];
  const hoje = new Date();
  
  // Gera dados para os últimos 30 dias
  for (let i = 0; i < 30; i++) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - i);
    
    funcionarios.forEach(funcionario => {
      const diaSemana = data.getDay();
      
      // Simula marcações de ponto
      const marcacoes = gerarMarcacoesExemplo(diaSemana);
      const calculosPonto = calcularPontoDia(marcacoes, diaSemana);
      
      dados.push({
        id: `${funcionario.id}-${data.toISOString().split('T')[0]}`,
        funcionarioId: funcionario.id,
        funcionarioNome: funcionario.nome,
        funcionarioMatricula: funcionario.matricula,
        data: data.toISOString().split('T')[0],
        diaSemana,
        marcacoes,
        ...calculosPonto
      });
    });
  }
  
  return dados.reverse(); // Ordem cronológica
};

/**
 * Gera marcações de exemplo para um dia da semana
 * @param {number} diaSemana - Dia da semana
 * @returns {Object} - Marcações simuladas
 */
const gerarMarcacoesExemplo = (diaSemana) => {
  const horariosEsperados = HORARIOS_PADRAO[diaSemana] || [];
  const marcacoes = {};
  
  horariosEsperados.forEach((periodo, index) => {
    // Simula pequenos atrasos/adiantamentos aleatórios
    const variacao = Math.floor(Math.random() * 20) - 10; // -10 a +10 minutos
    const variacaoSaida = Math.floor(Math.random() * 20) - 10;
    
    const entradaMinutos = horarioParaMinutos(periodo.entrada) + variacao;
    const saidaMinutos = horarioParaMinutos(periodo.saida) + variacaoSaida;
    
    marcacoes[`entrada${index + 1}`] = minutosParaHorario(Math.max(0, entradaMinutos));
    marcacoes[`saida${index + 1}`] = minutosParaHorario(Math.max(0, saidaMinutos));
  });
  
  return marcacoes;
};