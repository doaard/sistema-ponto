import React, { useState, useEffect, useMemo } from 'react';
import { calcularEspelhoPonto } from './calculadoraPonto';
import './EspelhoPonto.css';

const EspelhoPonto = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [marcacoes, setMarcacoes] = useState([]);
  const [dadosEspelho, setDadosEspelho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [filtroFuncionario, setFiltroFuncionario] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAno, setFiltroAno] = useState('');

  // Carregar dados do localStorage
  useEffect(() => {
    try {
      setLoading(true);
      
      // Carregar funcionários
      const funcionariosData = JSON.parse(localStorage.getItem('funcionarios')) || [];
      setFuncionarios(funcionariosData);
      
      // Carregar marcações AFD
      const marcacoesData = JSON.parse(localStorage.getItem('marcacoes_afd')) || [];
      setMarcacoes(marcacoesData);
      
      // Se há dados, calcular espelho
      if (funcionariosData.length > 0 && marcacoesData.length > 0) {
        const espelhoCalculado = calcularEspelhoPonto(funcionariosData, marcacoesData);
        setDadosEspelho(espelhoCalculado);
      }
      
      setError('');
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Verifique se há funcionários cadastrados e marcações importadas.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Dados filtrados
  const dadosFiltrados = useMemo(() => {
    return dadosEspelho.filter(item => {
      const matchFuncionario = !filtroFuncionario || item.matricula === filtroFuncionario;
      
      const dataItem = new Date(item.data + 'T00:00:00');
      const matchMes = !filtroMes || (dataItem.getMonth() + 1) === parseInt(filtroMes);
      const matchAno = !filtroAno || dataItem.getFullYear() === parseInt(filtroAno);
      
      return matchFuncionario && matchMes && matchAno;
    });
  }, [dadosEspelho, filtroFuncionario, filtroMes, filtroAno]);

  // Calcular resumo
  const resumo = useMemo(() => {
    if (dadosFiltrados.length === 0) {
      return {
        totalDias: 0,
        totalHoras: '00:00',
        totalExtras: '00:00',
        totalFaltas: '00:00'
      };
    }

    const somarHoras = (horas) => {
      return horas.reduce((total, hora) => {
        const [h, m] = hora.split(':').map(Number);
        return total + h * 60 + m;
      }, 0);
    };

    const minutosParaHora = (minutos) => {
      const h = Math.floor(minutos / 60);
      const m = minutos % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const totalHorasMin = somarHoras(dadosFiltrados.map(d => d.horasTrabalhadas));
    const totalExtrasMin = somarHoras(dadosFiltrados.map(d => d.horasExtras));
    const totalFaltasMin = somarHoras(dadosFiltrados.map(d => d.faltas));

    return {
      totalDias: dadosFiltrados.length,
      totalHoras: minutosParaHora(totalHorasMin),
      totalExtras: minutosParaHora(totalExtrasMin),
      totalFaltas: minutosParaHora(totalFaltasMin)
    };
  }, [dadosFiltrados]);

  // Obter anos e meses únicos dos dados
  const anosDisponiveis = useMemo(() => {
    const anos = [...new Set(dadosEspelho.map(item => new Date(item.data + 'T00:00:00').getFullYear()))];
    return anos.sort((a, b) => b - a);
  }, [dadosEspelho]);

  const mesesDisponiveis = useMemo(() => {
    const meses = [...new Set(dadosEspelho.map(item => new Date(item.data + 'T00:00:00').getMonth() + 1))];
    return meses.sort((a, b) => a - b);
  }, [dadosEspelho]);

  if (loading) {
    return (
      <div className="espelho-container">
        <div className="loading">
          <div>⏳ Carregando dados...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="espelho-container">
        <div className="error">
          <strong>Erro:</strong> {error}
        </div>
        <div className="sem-dados">
          <div className="sem-dados-icon">📊</div>
          <p>Para usar o Espelho de Ponto, você precisa:</p>
          <ul>
            <li>Cadastrar funcionários</li>
            <li>Importar marcações AFD</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="espelho-container">
      {/* Header com filtros */}
      <div className="espelho-header">
        <h2 className="espelho-title">📊 Espelho de Ponto</h2>
        
        <div className="filtros-container">
          <div className="filtro-grupo">
            <label className="filtro-label">Funcionário:</label>
            <select
              className="filtro-select"
              value={filtroFuncionario}
              onChange={(e) => setFiltroFuncionario(e.target.value)}
            >
              <option value="">Todos</option>
              {funcionarios.map(func => (
                <option key={func.matricula} value={func.matricula}>
                  {func.nome} ({func.matricula})
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label className="filtro-label">Mês:</label>
            <select
              className="filtro-select"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
            >
              <option value="">Todos</option>
              {mesesDisponiveis.map(mes => (
                <option key={mes} value={mes}>
                  {new Date(2024, mes - 1).toLocaleString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label className="filtro-label">Ano:</label>
            <select
              className="filtro-select"
              value={filtroAno}
              onChange={(e) => setFiltroAno(e.target.value)}
            >
              <option value="">Todos</option>
              {anosDisponiveis.map(ano => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="resumo-container">
        <div className="resumo-card">
          <div className="resumo-titulo">Total de Dias</div>
          <div className="resumo-valor">{resumo.totalDias}</div>
        </div>
        <div className="resumo-card">
          <div className="resumo-titulo">Total de Horas</div>
          <div className="resumo-valor">{resumo.totalHoras}</div>
        </div>
        <div className="resumo-card">
          <div className="resumo-titulo">Horas Extras</div>
          <div className="resumo-valor">{resumo.totalExtras}</div>
        </div>
        <div className="resumo-card">
          <div className="resumo-titulo">Faltas</div>
          <div className="resumo-valor">{resumo.totalFaltas}</div>
        </div>
      </div>

      {/* Tabela */}
      {dadosFiltrados.length === 0 ? (
        <div className="sem-dados">
          <div className="sem-dados-icon">📅</div>
          <p>Nenhum dado encontrado para os filtros selecionados.</p>
        </div>
      ) : (
        <div className="tabela-container">
          <table className="espelho-table">
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Matrícula</th>
                <th>Data</th>
                <th>Dia</th>
                <th>Horas Trabalhadas</th>
                <th>Horas Normais</th>
                <th>Horas Extras</th>
                <th>Faltas</th>
                <th>Atrasos</th>
                <th>Adicional Noturno</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              {dadosFiltrados.map((item, index) => (
                <tr key={index}>
                  <td className="funcionario-nome">{item.funcionario}</td>
                  <td>{item.matricula}</td>
                  <td className="data-cell">
                    {new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="dia-semana">{item.diaSemana}</td>
                  <td>{item.horasTrabalhadas}</td>
                  <td className="horas-normais">{item.horasNormais}</td>
                  <td className="horas-extras">{item.horasExtras}</td>
                  <td className="faltas">{item.faltas}</td>
                  <td className="atrasos">{item.atrasos}</td>
                  <td className="adicional-noturno">{item.adicionalNoturno}</td>
                  <td className="observacoes">{item.observacoes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EspelhoPonto;