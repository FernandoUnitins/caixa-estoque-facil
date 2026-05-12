import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function TelaLancamento({ setTelaAtual }) {
  const [tipo, setTipo] = useState('ENTRADA');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');

  async function salvarLancamento(e) {
    e.preventDefault();
    if (!descricao || !valor) return alert('Preencha os campos!');

    const { error } = await supabase.from('lancamentos').insert([
      { tipo, descricao, valor: parseFloat(valor.replace(',', '.')) }
    ]);

    if (error) {
      alert('Erro ao salvar no banco!');
    } else {
      alert('Lançamento salvo com sucesso!');
      setTelaAtual('resumo'); // Volta pra tela inicial para ver o saldo atualizar
    }
  }

  return (
    <main className="tela">
      <h2>NOVO LANÇAMENTO</h2>
      <form onSubmit={salvarLancamento} className="form-padrao">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="input-padrao">
          <option value="ENTRADA">+ Entrada</option>
          <option value="SAIDA">- Saída</option>
        </select>
        <input 
          type="text" 
          placeholder="Descrição (ex: Venda de água)" 
          value={descricao} 
          onChange={(e) => setDescricao(e.target.value)} 
          className="input-padrao"
        />
        <input 
          type="number" 
          step="0.01" 
          placeholder="Valor (R$)" 
          value={valor} 
          onChange={(e) => setValor(e.target.value)} 
          className="input-padrao"
        />
        <button type="submit" className={tipo === 'ENTRADA' ? 'btn-entrada' : 'btn-saida'}>
          SALVAR
        </button>
      </form>
    </main>
  );
}