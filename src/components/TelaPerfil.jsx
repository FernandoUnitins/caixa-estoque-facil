import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function TelaPerfil({ perfil, mostrarToast }) {
  const [novoUsername, setNovoUsername] = useState(perfil?.username || '');
  const [novaSenha, setNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const salvarPerfil = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Atualiza o Username na tabela pública
    const { error: dbError } = await supabase.from('usuarios')
      .update({ username: novoUsername.toLowerCase() })
      .eq('id', perfil.id);

    if (dbError) mostrarToast('Erro ao atualizar nome de usuário.', 'erro');

    // 2. Atualiza a senha no Supabase Auth (apenas se ele digitou algo)
    if (novaSenha) {
      if (novaSenha.length < 6) {
        mostrarToast('A senha deve ter no mínimo 6 caracteres.', 'erro');
        setLoading(false);
        return;
      }
      const { error: authError } = await supabase.auth.updateUser({ password: novaSenha });
      if (authError) mostrarToast('Erro ao atualizar senha.', 'erro');
      else setNovaSenha('');
    }

    if (!dbError) mostrarToast('Perfil atualizado com sucesso!', 'sucesso');
    setLoading(false);
  };

  return (
    <main className="tela" style={{ paddingBottom: '30px' }}>
      <h2>👤 MEU PERFIL</h2>
      <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', marginBottom: '20px' }}>
        Atualize seus dados de acesso
      </p>

      <form onSubmit={salvarPerfil} className="form-padrao">
        <label style={{ fontSize: '0.85rem', color: '#374151', fontWeight: '600' }}>Nome de Usuário (Login)</label>
        <input 
          type="text" 
          value={novoUsername} 
          onChange={(e) => setNovoUsername(e.target.value)} 
          className="input-padrao" 
          required 
        />

        <label style={{ fontSize: '0.85rem', color: '#374151', fontWeight: '600' }}>Nova Senha</label>
        <input 
          type="password" 
          placeholder="Deixe em branco para manter a atual" 
          value={novaSenha} 
          onChange={(e) => setNovaSenha(e.target.value)} 
          className="input-padrao" 
        />

        <button type="submit" className="btn-entrada" disabled={loading}>
          {loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
        </button>
      </form>
    </main>
  );
}   