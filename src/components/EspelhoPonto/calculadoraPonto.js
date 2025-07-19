// CalculadoraPonto.js - Utilitário para cálculos de ponto

// Definição dos horários padrão por dia da semana
const HORARIOS_PADRAO = {
  1: [{ inicio: '08:00', fim: '12:00' }, { inicio: '13:00', fim: '17:00' }], // Segunda
  2: [{ inicio: '08:00', fim: '16:00' }], // Terça
  3: [{ inicio: '13:00', fim: '17:00' }, { inicio: '19:00', fim: '21:00' }, { inicio: '23:30', fim: '02:00' }], // Quarta
  4: [], // Quinta (folga)
  5: [{ inicio: '08:00', fim: '12:00' }, { inicio: '13:00', fim: '17:00' }], // Sexta (assumindo igual segunda)
  6: [], // Sábado
  0: [] // Domingo
};

// Tolerância padrão em minutos
const TOLERANCIA_GERAL = 10;
const TOLERANCIA_POR_OCORRENCIA = 5;

// Converte hora string (HH:MM) para minutos
const horaParaMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

// Converte minutos para hora string (HH:MM)
const minutosParaHora = (minutos) => {
  const h = Math.floor(Math.abs(minutos) / 60);
  const m = Math.abs(minutos) % 60;
  const sinal = minutos < 0 ? '-' : '';
  return `${sinal}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Calcula diferença em minutos entre duas horas
const calcularDiferenca = (horaInicio, horaFim) => {
  let inicioMin = horaParaMinutos(horaInicio);
  let fimMin = horaParaMinutos(horaFim);

  // Se fim é menor que início, assumir que passou da meia-noite
  if (fimMin < inicioMin) {
    fimMin += 24 * 60;
  }

  return fimMin - inicioMin;
};

// Verifica se uma hora está no período noturno (22:00 às 05:00)
const isHorarioNoturno = (hora) => {
  const minutos = horaParaMinutos(hora);
  return minutos >= horaParaMinutos('22:00') || minutos <= horaParaMinutos('05:00');
};

// Calcula adicional noturno para um período
const calcularAdicionalNoturno = (horaInicio, horaFim) => {
  const inicioMin = horaParaMinutos(horaInicio);
  let fimMin = horaParaMinutos(horaFim);

  if (fimMin < inicioMin) {
    fimMin += 24 * 60;
  }

  let adicionalNoturno = 0;

  // Período noturno 1: 22:00 às 24:00
  const noturno1Inicio = horaParaMinutos('22:00');
  const noturno1Fim = 24 * 60;

  if (inicioMin < noturno1Fim && fimMin > noturno1Inicio) {
    const inicio = Math.max(inicioMin, noturno1Inicio);
    const fim = Math.min(fimMin, noturno1Fim);
    adicionalNoturno += fim - inicio;
  }

  // Período noturno 2: 00:00 às 05:00 (próximo dia)
  const noturno2Inicio = 24 * 60;
  const noturno2Fim = 24 * 60 + horaParaMinutos('05:00');

  if (inicioMin < noturno2Fim && fimMin > noturno2Inicio) {
    const inicio = Math.max(inicioMin, noturno2Inicio);
    const fim = Math.min(fimMin, noturno2Fim);
    adicionalNoturno += fim - inicio;
  }

  return adicionalNoturno;
};

// Função principal para calcular espelho de ponto
export const calcularEspelhoPonto = (funcionarios, marcacoes) => {
  const resultado = [];

  funcionarios.forEach(funcionario => {
    // Buscar marcações deste funcionário
    const marcacoesFuncionario = marcacoes.filter(m => m.pis === funcionario.pis);

    // Agrupar marcações por data
    const marcacoesPorData = {};
    marcacoesFuncionario.forEach(marcacao => {
      const data = marcacao.data;
      if (!marcacoesPorData[data]) {
        marcacoesPorData[data] = [];
      }
      marcacoesPorData[data].push(marcacao);
    });

    // Processar cada dia
    Object.keys(marcacoesPorData).forEach(data => {
      const marcacoesData = marcacoesPorData[data].sort((a, b) => a.hora.localeCompare(b.hora));
      const dataObj = new Date(data + 'T00:00:00');
      const diaSemana = dataObj.getDay();

      const calculoDia = calcularDia(funcionario, data, marcacoesData, diaSemana);
      resultado.push(calculoDia);
    });
  });

  return resultado.sort((a, b) => a.data.localeCompare(b.data));
};

// Calcula os dados de um dia específico
const calcularDia = (funcionario, data, marcacoes, diaSemana) => {
  const horariosPadrao = HORARIOS_PADRAO[diaSemana] || [];

  // Se é folga, só verificar se houve marcações (hora extra)
  if (horariosPadrao.length === 0) {
    return calcularDiaFolga(funcionario, data, marcacoes);
  }

  // Calcular para dia normal
  return calcularDiaNormal(funcionario, data, marcacoes, horariosPadrao);
};

// Calcula dia de folga
const calcularDiaFolga = (funcionario, data, marcacoes) => {
  let horasTrabalhadas = 0;
  let adicionalNoturno = 0;

  // Processar marcações em pares (entrada/saída)
  for (let i = 0; i < marcacoes.length; i += 2) {
    if (i + 1 < marcacoes.length) {
      const entrada = marcacoes[i];
      const saida = marcacoes[i + 1];

      const minutosTrabalhados = calcularDiferenca(entrada.hora, saida.hora);
      horasTrabalhadas += minutosTrabalhados;

      adicionalNoturno += calcularAdicionalNoturno(entrada.hora, saida.hora);
    }
  }

  return {
    funcionario: funcionario.nome,
    matricula: funcionario.matricula,
    data,
    diaSemana: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][new Date(data + 'T00:00:00').getDay()],
    horasTrabalhadas: minutosParaHora(horasTrabalhadas),
    horasNormais: '00:00',
    horasExtras: minutosParaHora(horasTrabalhadas), // Toda hora em folga é extra
    faltas: '00:00',
    atrasos: '00:00',
    adicionalNoturno: minutosParaHora(adicionalNoturno),
    observacoes: 'Folga'
  };
};

// Calcula dia normal de trabalho
const calcularDiaNormal = (funcionario, data, marcacoes, horariosPadrao) => {
  let horasTrabalhadas = 0;
  let horasNormais = 0;
  let horasExtras = 0;
  let faltas = 0;
  let atrasos = 0;
  let adicionalNoturno = 0;

  // Calcular carga horária padrão do dia
  const cargaHorariaPadrao = horariosPadrao.reduce((total, periodo) => {
    return total + calcularDiferenca(periodo.inicio, periodo.fim);
  }, 0);

  // Se não há marcações, considerar falta total
  if (marcacoes.length === 0) {
    return {
      funcionario: funcionario.nome,
      matricula: funcionario.matricula,
      data,
      diaSemana: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][new Date(data + 'T00:00:00').getDay()],
      horasTrabalhadas: '00:00',
      horasNormais: '00:00',
      horasExtras: '00:00',
      faltas: minutosParaHora(cargaHorariaPadrao),
      atrasos: '00:00',
      adicionalNoturno: '00:00',
      observacoes: 'Falta total'
    };
  }

  // Processar marcações em pares (entrada/saída)
  for (let i = 0; i < marcacoes.length; i += 2) {
    if (i + 1 < marcacoes.length) {
      const entrada = marcacoes[i];
      const saida = marcacoes[i + 1];

      const minutosTrabalhados = calcularDiferenca(entrada.hora, saida.hora);
      horasTrabalhadas += minutosTrabalhados;

      adicionalNoturno += calcularAdicionalNoturno(entrada.hora, saida.hora);
    }
  }

  // Calcular atrasos (primeira entrada vs horário padrão)
  if (marcacoes.length > 0 && horariosPadrao.length > 0) {
    const primeiraEntrada = marcacoes[0].hora;
    const horarioPadrao = horariosPadrao[0].inicio;

    const atrasoMinutos = horaParaMinutos(primeiraEntrada) - horaParaMinutos(horarioPadrao);
    if (atrasoMinutos > TOLERANCIA_GERAL) {
      atrasos = atrasoMinutos;
    }
  }

  // Calcular horas normais e extras
  if (horasTrabalhadas <= cargaHorariaPadrao) {
    horasNormais = horasTrabalhadas;
    faltas = cargaHorariaPadrao - horasTrabalhadas;
  } else {
    horasNormais = cargaHorariaPadrao;
    horasExtras = horasTrabalhadas - cargaHorariaPadrao;
  }

  return {
    funcionario: funcionario.nome,
    matricula: funcionario.matricula,
    data,
    diaSemana: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][new Date(data + 'T00:00:00').getDay()],
    horasTrabalhadas: minutosParaHora(horasTrabalhadas),
    horasNormais: minutosParaHora(horasNormais),
    horasExtras: minutosParaHora(horasExtras),
    faltas: minutosParaHora(faltas),
    atrasos: minutosParaHora(atrasos),
    adicionalNoturno: minutosParaHora(adicionalNoturno),
    observacoes: ''
  };
};