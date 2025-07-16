import React from 'react';
import FuncionarioCadastro from './components/FuncionarioCadastro/FuncionarioCadastro';
import ImportarAFD from './components/ImportarAFD/ImportarAFD';
import EspelhoPonto from './components/EspelhoPonto/EspelhoPonto';
import Botao from './components/Botao/Botao';
import { IoMdSave, IoMdCloudUpload } from "react-icons/io";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        {/* Header com navegação */}
        <header className="app-header">
          <div className="container">
            <h1 className="app-title">⏰ Sistema de Ponto</h1>
            <nav className="app-nav">
              <Link to="/" className="nav-link">
                🏠 Início
              </Link>
              <Link to="/funcionarioCadastro" className="nav-link">
                👤 Cadastro de Funcionário
              </Link>
              <Link to="/importarAFD" className="nav-link">
                📁 Importar AFD
              </Link>
            </nav>
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="app-main">
          <Routes>
            {/* Página inicial */}
            <Route 
              path="/" 
              element={
                <div className="home-container">
                  <div className="welcome-section">
                    <h2>🎯 Bem-vindo ao Sistema de Ponto</h2>
                    <p>Gerencie funcionários e importe marcações de ponto de forma simples e eficiente.</p>
                  </div>
                  
                  <div className="quick-actions">
                    <h3>🚀 Ações Rápidas</h3>
                    <div className="action-cards">
                      <div className="action-card">
                        <h4>👤 Cadastrar Funcionário</h4>
                        <p>Adicione novos funcionários ao sistema com informações completas.</p>
                        <Link to="/funcionarioCadastro">
                          <Botao
                            texto="Cadastrar Funcionário"
                            icone={<IoMdSave />}
                            aoClicar={() => {}}
                          />
                        </Link>
                      </div>
                      
                      <div className="action-card">
                        <h4>📁 Importar AFD</h4>
                        <p>Importe arquivos AFD e processe marcações de ponto automaticamente.</p>
                        <Link to="/importarAFD">
                          <Botao
                            texto="Importar AFD"
                            icone={<IoMdCloudUpload />}
                            aoClicar={() => {}}
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              } 
            />

            {/* Página de cadastro de funcionário */}
            <Route 
              path="/funcionarioCadastro" 
              element={<FuncionarioCadastro />} 
            />

            {/* Página de importar AFD */}
            <Route 
              path="/importarAFD" 
              element={<ImportarAFD />} 
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="container">
            <p>&copy; 2024 Sistema de Ponto - Desenvolvido com ❤️</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;