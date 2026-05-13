import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function TelaPerfil({ perfil, mostrarToast }) {
  const [novoUsername, setNovoUsername] = useState(perfil?.username || '');
  const [novoEmail, setNovoEmail] = useState(perfil?.email || '');
  const [novaSenha, setNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const salvarPerfil = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Atualizar dados no Supabase Auth (Email e/ou Senha)
      const updates = {};
      
      // Verifica se o e-mail foi alterado
      if (novoEmail.toLowerCase().trim() !== perfil.email.toLowerCase().trim()) {
        updates.email = novoEmail.toLowerCase().trim();
      }

      // Verifica se uma nova senha foi digitada
      if (novaSenha) {
        if (novaSenha.length < 6) {
          mostrarToast('A senha deve ter no mínimo 6 caracteres.', 'erro');
          setLoading(false);
          return;
        }
        updates.password = novaSenha;
      }

      // Se houver mudanças de acesso, envia para o Auth
      if (Object.keys(updates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(updates);
        if (authError) {
          mostrarToast('Erro ao atualizar dados de acesso: ' + authError.message, 'erro');
          setLoading(false);
          return;
        }
        
        // Nota: O Supabase costuma enviar um link de confirmação para o novo e-mail
        if (updates.email) {
          mostrarToast('Confirme a alteração no seu novo e-mail.', 'sucesso');
        }
      }

      // 2. Atualizar a tabela 'usuarios' (mantém o username e o email sincronizados)
      const { error: dbError } = await supabase.from('usuarios')
        .update({ 
          username: novoUsername.toLowerCase().trim(),
          email: novoEmail.toLowerCase().trim() 
        })
        .eq('id', perfil.id);

      if (dbError) {
        mostrarToast('Erro ao atualizar perfil no banco de dados.', 'erro');
      } else {
        mostrarToast('Perfil atualizado com sucesso!', 'sucesso');
        setNovaSenha('');
      }

    } catch (err) {
      mostrarToast('Erro de conexão.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  // Componente de Label para padronização visual
  const Label = ({ children }) => (
    <label 
      style={{ 
        fontSize: '0.85rem', 
        fontWeight: '700', 
        color: '#4b5563', 
        marginBottom: '5px', 
        display: 'block',
        textAlign: 'left'
      }}
    >
      {children}
    </label>
  );

  return (
    <main className="tela" style={{ paddingBottom: '30px' }}>
      <h2>👤 MEU PERFIL</h2>
      <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', marginBottom: '20px' }}>
        Atualize seus dados de acesso e contato
      </p>

      <form onSubmit={salvarPerfil} className="form-padrao">
        <div style={{ width: '100%' }}>
          <Label>Nome de Usuário (Login)</Label>
          <input 
            type="text" 
            value={novoUsername} 
            onChange={(e) => setNovoUsername(e.target.value)} 
            className="input-padrao" 
            required 
          />
        </div>

        <div style={{ width: '100%' }}>
          <Label>E-mail de Contato</Label>
          <input 
            type="email" 
            value={novoEmail} 
            onChange={(e) => setNovoEmail(e.target.value)} 
            className="input-padrao" 
            required 
          />
        </div>

        <div style={{ width: '100%' }}>
          <Label>Nova Senha</Label>
          <input 
            type="password" 
            placeholder="Deixe em branco para manter a atual" 
            value={novaSenha} 
            onChange={(e) => setNovaSenha(e.target.value)} 
            className="input-padrao" 
          />
        </div>

        <button type="submit" className="btn-entrada" disabled={loading} style={{ marginTop: '10px' }}>
          {loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
        </button>
      </form>
    </main>
  );
}