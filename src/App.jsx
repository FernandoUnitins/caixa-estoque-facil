import React, { useState } from 'react';
import './App.css';

function App() {
  // Estado para os valores
  const [entradas, setEntradas] = useState(0.0);
  const [saidas, setSaidas] = useState(0.0);

  // DATA DINÂMICA
  const dataHoje = new Date().toLocaleDateString('pt-BR');

  const saldo = entradas - saidas;

  const handleEntrada = () => {
    const valor = parseFloat(prompt("Digite o valor da nova ENTRADA:"));
    if (!isNaN(valor) && valor > 0) setEntradas(entradas + valor);
  };

  const handleSaida = () => {
    const valor = parseFloat(prompt("Digite o valor da nova SAÍDA:"));
    if (!isNaN(valor) && valor > 0) setSaidas(saidas + valor);
  };

  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="app-container">
      <header>
        <h1>Caixa & Estoque Fácil</h1>
        <h2>RESUMO DO CAIXA</h2>
        <p>{dataHoje}</p> 
      </header>

      <main className="resumo-box">
        <div className="linha-resumo">
          <span>+ ENTRADAS</span>
          <span className="valor-entrada">{formatarMoeda(entradas)}</span>
        </div>
        <div className="linha-resumo">
          <span>- SAÍDAS</span>
          <span className="valor-saida">{formatarMoeda(saidas)}</span>
        </div>
        
        <hr />
        
        <div className="linha-resumo saldo">
          <strong>SALDO DE CAIXA</strong>
          <strong className="valor-saldo">{formatarMoeda(saldo)}</strong>
        </div>

        <button className="btn-secundario" onClick={() => alert("Em desenvolvimento...")}>
          VER LANÇAMENTOS
        </button>

        <div className="acoes-lancamento">
          <p>Realizar Lançamento</p>
          <div className="botoes">
            <button className="btn-entrada" onClick={handleEntrada}>+ ENTRADA</button>
            <button className="btn-saida" onClick={handleSaida}>- SAÍDA</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;