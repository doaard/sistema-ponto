import React, { useState } from 'react';
import Input from '../Input/Input';
import Botao from '../Botao/Botao';
import { IoMdSave } from 'react-icons/io';
import { MdCleaningServices } from 'react-icons/md';
import './FuncionarioCadastro.css';

const padraoCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const padraoPIS = /^\d{3}\.\d{5}\.\d{2}-\d{1}$/;

const FuncionarioCadastro = () => {
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    pis: '',
    matricula: '',
    admissao: '',
    situacao: ''
  });
  const [erros, setErros] = useState({});

  /*-------------------------*/
  /*  handlers utilitários   */
  /*-------------------------*/
  const handleChange = ({ target: { name, value } }) => {
    setForm(prev => ({ ...prev, [name]: value }));
    // Remove o erro do campo quando o usuário começa a digitar
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarCPF = (cpf) => {
    if (!padraoCPF.test(cpf)) return false;
    
    // Validação adicional de CPF
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
    
    // Validação dos dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(10))) return false;
    
    return true;
  };

  const validarPIS = pis => padraoPIS.test(pis);

  const limparCampos = () => {
    setForm({
      nome: '',
      cpf: '',
      pis: '',
      matricula: '',
      admissao: '',
      situacao: ''
    });
    setErros({});
  };

  /*-------------------------*/
  /*  submit                 */
  /*-------------------------*/
  const handleSubmit = (e) => {
    e.preventDefault();
    const novosErros = {};

    // Validações simples
    if (!form.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório.';
    } else if (form.nome.trim().length < 2) {
      novosErros.nome = 'Nome deve ter pelo menos 2 caracteres.';
    }

    if (!form.matricula.trim()) {
      novosErros.matricula = 'Matrícula é obrigatória.';
    } else if (form.matricula.trim().length < 3) {
      novosErros.matricula = 'Matrícula deve ter pelo menos 3 caracteres.';
    }

    if (!form.admissao) {
      novosErros.admissao = 'Data de admissão é obrigatória.';
    } else {
      // Validar se a data não é futura
      const dataAdmissao = new Date(form.admissao);
      const hoje = new Date();
      if (dataAdmissao > hoje) {
        novosErros.admissao = 'Data de admissão não pode ser futura.';
      }
    }

    if (!form.situacao) {
      novosErros.situacao = 'Situação é obrigatória.';
    }

    if (!validarCPF(form.cpf)) {
      novosErros.cpf = 'CPF inválido. Verifique o formato e os dígitos.';
    }

    if (!validarPIS(form.pis)) {
      novosErros.pis = 'PIS inválido. Use o formato XXX.XXXXX.XX-X.';
    }

    // Verificar unicidade no localStorage
    const lista = JSON.parse(localStorage.getItem('funcionarios')) || [];
    const cpfLimpo = form.cpf.replace(/\D/g, '');
    const pisLimpo = form.pis.replace(/\D/g, '');
    const matricula = form.matricula.trim();

    if (lista.some(f => f.cpf === cpfLimpo)) {
      novosErros.cpf = 'CPF já cadastrado.';
    }
    if (lista.some(f => f.pis === pisLimpo)) {
      novosErros.pis = 'PIS já cadastrado.';
    }
    if (lista.some(f => f.matricula === matricula)) {
      novosErros.matricula = 'Matrícula já cadastrada.';
    }

    // Se tiver erro, exibe e retorna
    if (Object.keys(novosErros).length) {
      setErros(novosErros);
      return;
    }

    // Salva no localStorage
    const novoFuncionario = {
      id: Date.now(), // ID único baseado no timestamp
      nome: form.nome.trim(),
      cpf: cpfLimpo,
      pis: pisLimpo,
      matricula: matricula,
      admissao: form.admissao,
      situacao: form.situacao,
      dataCadastro: new Date().toISOString()
    };

    const novaLista = [...lista, novoFuncionario];
    localStorage.setItem('funcionarios', JSON.stringify(novaLista));

    alert('Funcionário cadastrado com sucesso!');
    limparCampos();
  };

  /*-------------------------*/
  /*  render                 */
  /*-------------------------*/
  return (
    <div className="container-form">
      <h2 className="form-title">➕ Cadastro de Funcionário</h2>

      <form onSubmit={handleSubmit} className="form">
        <Input
          label="Nome completo"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          required
          error={erros.nome}
          placeholder="Digite o nome completo"
        />

        <Input
          label="CPF"
          name="cpf"
          value={form.cpf}
          onChange={handleChange}
          mask="999.999.999-99"
          required
          error={erros.cpf}
          placeholder="000.000.000-00"
        />

        <Input
          label="PIS"
          name="pis"
          value={form.pis}
          onChange={handleChange}
          mask="999.99999.99-9"
          required
          error={erros.pis}
          placeholder="000.00000.00-0"
        />

        <Input
          label="Matrícula"
          name="matricula"
          value={form.matricula}
          onChange={handleChange}
          required
          error={erros.matricula}
          placeholder="Digite a matrícula"
        />

        <Input
          label="Data de Admissão"
          name="admissao"
          value={form.admissao}
          onChange={handleChange}
          type="date"
          required
          error={erros.admissao}
        />

        <Input
          label="Situação"
          name="situacao"
          value={form.situacao}
          onChange={handleChange}
          required
          error={erros.situacao}
          type="select"
        />

        {/* Botões de ação */}
        <div className="button-group">
          <Botao
            texto="Salvar"
            icone={<IoMdSave />}
            aoClicar={handleSubmit}
          />
          <Botao
            texto="Limpar"
            icone={<MdCleaningServices />}
            aoClicar={limparCampos}
          />
        </div>
      </form>
    </div>
  );
};

export default FuncionarioCadastro;