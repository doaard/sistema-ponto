import React, { useState } from 'react';
import Input from '../Input/Input';
import Botao from '../Botao/Botao';
import { IoMdCloudUpload } from 'react-icons/io';
import { MdCleaningServices } from 'react-icons/md';
import { FaFileImport } from 'react-icons/fa';
import './ImportarAFD.css';

const ImportarAFD = () => {
  const [arquivo, setArquivo] = useState(null);
  const [dados, setDados] = useState([]);
  const [processando, setProcessando] = useState(false);
  const [erros, setErros] = useState({});
  const [sucesso, setSucesso] = useState('');

  /*-------------------------*/
  /*  handlers utilitários   */
  /*-------------------------*/
  const handleArquivoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Verifica se é um arquivo válido (exemplo: .txt, .afd)
      const tiposPermitidos = ['text/plain', 'application/octet-stream'];
      if (!tiposPermitidos.includes(file.type) && !file.name.endsWith('.afd')) {
        setErros({ arquivo: 'Tipo de arquivo não suportado. Use arquivos .txt ou .afd' });
        return;
      }

      setArquivo(file);
      setErros({});
      setSucesso('');
    }
  };

  const processarArquivoAFD = async (conteudo) => {
    // Simula processamento de arquivo AFD
    // Aqui você implementaria a lógica específica para seu formato AFD
    const linhas = conteudo.split('\n');
    const registros = [];

    linhas.forEach((linha, index) => {
      linha = linha.trim();
      if (linha) {
        // Exemplo de processamento - adapte conforme seu formato AFD
        const dados = linha.split('\t'); // ou outro separador
        if (dados.length >= 3) {
          registros.push({
            id: index + 1,
            codigo: dados[0] || '',
            nome: dados[1] || '',
            departamento: dados[2] || '',
            // Adicione mais campos conforme necessário
          });
        }
      }
    });

    return registros;
  };

  const importarArquivo = async () => {
    if (!arquivo) {
      setErros({ arquivo: 'Selecione um arquivo para importar' });
      return;
    }

    setProcessando(true);
    setErros({});
    setSucesso('');

    try {
      const conteudo = await arquivo.text();
      const registrosProcessados = await processarArquivoAFD(conteudo);

      if (registrosProcessados.length === 0) {
        setErros({ processamento: 'Nenhum registro válido encontrado no arquivo' });
        return;
      }

      setDados(registrosProcessados);
      setSucesso(`${registrosProcessados.length} registros importados com sucesso!`);

      // Salvar no localStorage (opcional)
      const dadosExistentes = JSON.parse(localStorage.getItem('dadosAFD')) || [];
      const novosDados = [...dadosExistentes, ...registrosProcessados];
      localStorage.setItem('dadosAFD', JSON.stringify(novosDados));

    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setErros({ processamento: 'Erro ao processar arquivo. Verifique o formato.' });
    } finally {
      setProcessando(false);
    }
  };

  const limparDados = () => {
    setArquivo(null);
    setDados([]);
    setErros({});
    setSucesso('');
    // Limpar o input de arquivo
    const inputFile = document.getElementById('arquivo-input');
    if (inputFile) {
      inputFile.value = '';
    }
  };

  /*-------------------------*/
  /*  render                 */
  /*-------------------------*/
  return (
    <div className="container-form">
      <h2 className="form-title">📁 Importar Arquivo AFD</h2>

      <div className="form">
        {/* Seleção de arquivo */}
        <div className="file-input-container">
          <Input
            label="Selecionar arquivo AFD"
            name="arquivo"
            type="file"
            accept=".afd,.txt"
            onChange={handleArquivoChange}
            error={erros.arquivo}
            id="arquivo-input"
          />

          {arquivo && (
            <div className="file-info">
              <p>📄 Arquivo selecionado: {arquivo.name}</p>
              <p>📏 Tamanho: {(arquivo.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>

        {/* Área de status */}
        {erros.processamento && (
          <div className="error-message">
            ❌ {erros.processamento}
          </div>
        )}

        {sucesso && (
          <div className="success-message">
            ✅ {sucesso}
          </div>
        )}

        {/* Botões de ação */}
        <div className="button-group">
          <Botao
            texto={processando ? "Processando..." : "Importar"}
            icone={<FaFileImport />}
            aoClicar={importarArquivo}
            disabled={processando}
          />
          <Botao
            texto="Limpar"
            icone={<MdCleaningServices />}
            aoClicar={limparDados}
            disabled={processando}
          />
        </div>

        {/* Visualização dos dados importados */}
        {dados.length > 0 && (
          <div className="dados-importados">
            <h3>📊 Dados Importados ({dados.length} registros)</h3>
            <div className="tabela-container">
              <table className="tabela-dados">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Departamento</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.slice(0, 10).map((registro) => (
                    <tr key={registro.id}>
                      <td>{registro.id}</td>
                      <td>{registro.codigo}</td>
                      <td>{registro.nome}</td>
                      <td>{registro.departamento}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dados.length > 10 && (
                <p className="mais-registros">
                  ... e mais {dados.length - 10} registros
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportarAFD;