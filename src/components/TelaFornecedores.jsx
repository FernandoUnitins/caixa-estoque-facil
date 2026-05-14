import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// ==========================================
// ÍCONES SVG
// ==========================================
const IconTruck = ({ color = "currentColor", size = "24" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

const IconUserTie = ({ color = "currentColor", size = "18" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export default function TelaFornecedores({ mostrarToast }) {
  const [fornecedores, setFornecedores] = useState([]);
  const [telaAtual, setTelaAtual] = useState('lista'); // 'lista' ou 'form'
  const [loading, setLoading] = useState(false);

  // Estados para as APIs do IBGE
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);

  const estadoInicial = {
    id: null, nome: '', cnpj_cpf: '', cep: '', endereco: '', complemento: '', numero: '', 
    bairro: '', cidade: '', uf: '', telefone: '', email: '', vendedor: '', 
    telefone_vendedor: '', observacao: '', ativo: true
  };
  const [form, setForm] = useState(estadoInicial);

  useEffect(() => {
    if (telaAtual === 'lista') carregarFornecedores();
    
    // Busca os estados do IBGE (API Gratuita)
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json())
      .then(data => setEstados(data))
      .catch(() => console.log("Erro ao carregar estados"));
  }, [telaAtual]);

  useEffect(() => {
    if (form.uf) {
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${form.uf}/municipios?orderBy=nome`)
        .then(res => res.json())
        .then(data => setCidades(data))
        .catch(() => console.log("Erro ao carregar cidades"));
    } else {
      setCidades([]);
    }
  }, [form.uf]);

  const carregarFornecedores = async () => {
    const { data, error } = await supabase.from('fornecedores').select('*').order('nome');
    if (data) setFornecedores(data);
    if (error) mostrarToast('Erro ao buscar fornecedores.', 'erro');
  };

  const abrirFormulario = (forn = null) => {
    if (forn) {
      setForm({ ...forn }); 
    } else {
      setForm(estadoInicial); 
    }
    setTelaAtual('form');
  };

  // ==========================================
  // MÁSCARAS DE FORMATAÇÃO
  // ==========================================
  const mascaraTelefone = (valor) => {
    if (!valor) return "";
    let v = valor.replace(/\D/g, ""); 
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2"); 
    v = v.replace(/(\d)(\d{4})$/, "$1-$2"); 
    return v;
  };

  const mascaraCep = (valor) => {
    if (!valor) return "";
    let v = valor.replace(/\D/g, ""); 
    if (v.length > 5) {
      v = v.replace(/^(\d{5})(\d)/, "$1-$2"); 
    }
    return v;
  };

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
      return;
    }

    if (name === 'cep') value = mascaraCep(value.substring(0, 9)); 
    if (name === 'telefone') value = mascaraTelefone(value.substring(0, 15));
    if (name === 'telefone_vendedor') value = mascaraTelefone(value.substring(0, 15));

    setForm({ ...form, [name]: value });
  };

  // ==========================================
  // INTEGRAÇÃO COM APIs (CNPJ e CEP)
  // ==========================================
  const buscarCNPJ = async () => {
    const cleanCnpj = form.cnpj_cpf.replace(/[^a-zA-Z0-9]/g, '');
    if (cleanCnpj.length !== 14) return;

    mostrarToast('Buscando dados do CNPJ...', 'sucesso');
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      const data = await res.json();
      
      if (data.cnpj) {
        setForm(prev => ({
          ...prev,
          nome: data.razao_social || data.nome_fantasia || prev.nome,
          cep: data.cep ? mascaraCep(data.cep.toString()) : prev.cep, 
          endereco: data.logradouro || prev.endereco,
          complemento: data.complemento || prev.complemento,
          numero: data.numero || prev.numero,
          bairro: data.bairro || prev.bairro,
          uf: data.uf || prev.uf,
          // Converte sempre para MAIÚSCULO para não dar erro na lista do IBGE
          cidade: data.municipio ? data.municipio.toUpperCase() : prev.cidade,
          telefone: data.ddd_telefone_1 ? mascaraTelefone(data.ddd_telefone_1) : prev.telefone, 
          // Limpa e formata o e-mail que vem da API
          email: data.email ? data.email.toString().toLowerCase().trim() : prev.email,
        }));
        mostrarToast('Dados preenchidos automaticamente!', 'sucesso');
      } else {
        mostrarToast('CNPJ não encontrado na Receita.', 'erro');
      }
    } catch (e) {
      mostrarToast('Erro ao buscar o CNPJ.', 'erro');
    }
  };

  const buscarCEP = async () => {
    const cleanCep = form.cep.replace(/\D/g, ''); 
    if (cleanCep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          complemento: data.complemento || prev.complemento,
          bairro: data.bairro || prev.bairro,
          uf: data.uf || prev.uf,
          // Converte para MAIÚSCULO para não dar conflito com o IBGE
          cidade: data.localidade ? data.localidade.toUpperCase() : prev.cidade
        }));
      }
    } catch (e) {
      console.log('Erro ao buscar CEP');
    }
  };

  const abrirWhatsApp = (numero) => {
    if (!numero) return mostrarToast('Informe o número primeiro.', 'erro');
    const numLimpo = numero.replace(/\D/g, '');
    if (numLimpo.length >= 10) {
      window.open(`https://wa.me/55${numLimpo}`, '_blank');
    } else {
      mostrarToast('Número do WhatsApp inválido.', 'erro');
    }
  };

  // ==========================================
  // SALVAR NO BANCO E VALIDAÇÕES
  // ==========================================
  const salvarFornecedor = async (e) => {
    e.preventDefault();
    
    if (form.email && !form.email.includes('@')) {
      mostrarToast('O e-mail informado não é válido.', 'erro');
      return;
    }

    setLoading(true);

    const dadosSalvar = {
      nome: form.nome.trim().toUpperCase(), // Força maiúsculo antes de ir para o banco
      cnpj_cpf: form.cnpj_cpf, 
      cep: form.cep, 
      endereco: form.endereco, 
      complemento: form.complemento, 
      numero: form.numero, 
      bairro: form.bairro, 
      cidade: form.cidade, 
      uf: form.uf, 
      telefone: form.telefone, 
      email: form.email, 
      vendedor: form.vendedor, 
      telefone_vendedor: form.telefone_vendedor, 
      observacao: form.observacao, 
      ativo: form.ativo
    };

    if (form.id) {
      const { error } = await supabase.from('fornecedores').update(dadosSalvar).eq('id', form.id);
      if (error) mostrarToast('Erro ao atualizar fornecedor.', 'erro');
      else { mostrarToast('Fornecedor atualizado com sucesso!', 'sucesso'); setTelaAtual('lista'); }
    } else {
      const { error } = await supabase.from('fornecedores').insert([dadosSalvar]);
      if (error) mostrarToast('Erro ao cadastrar fornecedor.', 'erro');
      else { mostrarToast('Fornecedor cadastrado com sucesso!', 'sucesso'); setTelaAtual('lista'); }
    }
    setLoading(false);
  };

  // ==========================================
  // COMPONENTE AUXILIAR (LABEL DO CAMPO)
  // ==========================================
  const LabelCampo = ({ children, obrigatorio }) => (
    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4b5563', paddingLeft: '4px' }}>
      {children} 
      {obrigatorio && <span style={{ color: '#ef4444', fontSize: '0.7rem', marginLeft: '5px', fontWeight: 'bold' }}>(obrigatório)</span>}
    </label>
  );

  // ==========================================
  // RENDERIZAÇÃO DO MODO: FORMULÁRIO
  // ==========================================
  if (telaAtual === 'form') {
    return (
      <main className="tela" style={{ paddingBottom: '30px', width: '100%', overflowX: 'hidden' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4b5563' }}>
  <IconTruck size="24" /> {form.id ? 'EDITAR FORNECEDOR' : 'NOVO FORNECEDOR'}
</h2>
        
        <form onSubmit={salvarFornecedor} className="form-padrao" style={{ width: '100%', marginTop: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LabelCampo obrigatorio>CNPJ/CPF (Alfa-Numérico)</LabelCampo>
            <input type="text" name="cnpj_cpf" value={form.cnpj_cpf} onChange={handleChange} onBlur={buscarCNPJ} className="input-padrao" required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LabelCampo obrigatorio>Nome / Razão Social</LabelCampo>
            {/* O onChange transforma a letra em maiúscula instantaneamente durante a digitação */}
            <textarea 
              name="nome" 
              value={form.nome} 
              onChange={(e) => setForm({ ...form, nome: e.target.value.toUpperCase() })} 
              className="input-padrao" 
              rows="2" 
              style={{ resize: 'vertical' }} 
              required 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LabelCampo>CEP</LabelCampo>
            <input type="text" name="cep" value={form.cep} onChange={handleChange} onBlur={buscarCEP} className="input-padrao" />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LabelCampo>Endereço (Rua, Avenida...)</LabelCampo>
            <textarea name="endereco" value={form.endereco} onChange={handleChange} className="input-padrao" rows="2" style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LabelCampo>Complemento</LabelCampo>
            <textarea name="complemento" value={form.complemento} onChange={handleChange} className="input-padrao" rows="2" style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
              <LabelCampo>Nº</LabelCampo>
              <input type="text" name="numero" value={form.numero} onChange={handleChange} className="input-padrao" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
              <LabelCampo>Bairro</LabelCampo>
              <input type="text" name="bairro" value={form.bairro} onChange={handleChange} className="input-padrao" style={{ textOverflow: 'ellipsis' }} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
              <LabelCampo>UF</LabelCampo>
              <select name="uf" value={form.uf} onChange={handleChange} className="input-padrao" style={{ padding: '14px 5px' }}>
                <option value="">UF</option>
                {estados.map(est => (
                  <option key={est.id} value={est.sigla}>{est.sigla}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
              <LabelCampo>Cidade</LabelCampo>
              <select name="cidade" value={form.cidade ? form.cidade.toUpperCase() : ""} onChange={handleChange} className="input-padrao" style={{ textOverflow: 'ellipsis' }}>
                <option value="">Selecione</option>
                {form.cidade && cidades.length === 0 && <option value={form.cidade.toUpperCase()}>{form.cidade}</option>}
                {cidades.map(cid => (
                  <option key={cid.id} value={cid.nome.toUpperCase()}>{cid.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LabelCampo>Telefone Empresa</LabelCampo>
            <input type="text" name="telefone" value={form.telefone} onChange={handleChange} className="input-padrao" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LabelCampo>E-mail</LabelCampo>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="input-padrao" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', marginTop: '10px' }}>
<label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '6px' }}>
  <IconUserTie size="18" /> DADOS DO VENDEDOR
</label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <LabelCampo>Nome do Vendedor</LabelCampo>
              <input type="text" name="vendedor" value={form.vendedor} onChange={handleChange} className="input-padrao" style={{ backgroundColor: 'white' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <LabelCampo>WhatsApp</LabelCampo>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                <div style={{ minWidth: 0 }}>
                  <input type="text" name="telefone_vendedor" value={form.telefone_vendedor} onChange={handleChange} className="input-padrao" style={{ backgroundColor: 'white', width: '100%' }} />
                </div>
                <button type="button" onClick={() => abrirWhatsApp(form.telefone_vendedor)} style={{ width: '50px', minWidth: '50px', height: '50px', padding: '0', backgroundColor: '#25D366', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '12px', border: 'none' }} title="Chamar no WhatsApp">
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="white" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
            <LabelCampo>Observações Gerais</LabelCampo>
            <textarea name="observacao" value={form.observacao} onChange={handleChange} className="input-padrao" rows="2" />
          </div>
          
          {form.id && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange} id="chkAtivoFornecedor" style={{ transform: 'scale(1.5)' }} />
              <label htmlFor="chkAtivoFornecedor" style={{ fontWeight: '600', color: form.ativo ? '#10b981' : '#ef4444', cursor: 'pointer' }}>
                {form.ativo ? 'FORNECEDOR ATIVO' : 'FORNECEDOR INATIVO'}
              </label>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn-secundario" onClick={() => setTelaAtual('lista')} style={{ margin: 0 }}>CANCELAR</button>
            <button type="submit" className="btn-entrada" disabled={loading} style={{ margin: 0 }}>{loading ? 'SALVANDO...' : 'SALVAR'}</button>
          </div>
        </form>
      </main>
    );
  }

  // ==========================================
  // RENDERIZAÇÃO DO MODO: LISTAGEM
  // ==========================================
  return (
    <main className="tela" style={{ paddingBottom: '30px' }}>
<h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4b5563' }}>
  <IconTruck size="24" /> FORNECEDORES
</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        
        {fornecedores.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', margin: '20px 0' }}>
            Nenhum fornecedor cadastrado.
          </p>
        )}

        {fornecedores.map(forn => (
          <div 
            key={forn.id} 
            onClick={() => abrirFormulario(forn)}
            style={{ 
              backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', 
              cursor: 'pointer', opacity: forn.ativo ? 1 : 0.6, transition: 'background-color 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#374151' }}>{forn.nome}</strong>
              <span style={{ fontSize: '0.7rem', backgroundColor: forn.ativo ? '#ecfdf5' : '#fef2f2', color: forn.ativo ? '#10b981' : '#ef4444', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                {forn.ativo ? 'ATIVO' : 'INATIVO'}
              </span>
            </div>
            {(forn.telefone || forn.email) && (
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '5px' }}>
                {forn.telefone} {forn.telefone && forn.email ? ' | ' : ''} {forn.email}
              </p>
            )}
            {forn.vendedor && (
              <p style={{ fontSize: '0.75rem', color: '#4f46e5', marginTop: '5px', fontWeight: '600' }}>
                Vendedor: {forn.vendedor} {forn.telefone_vendedor ? `(${forn.telefone_vendedor})` : ''}
              </p>
            )}
          </div>
        ))}

        <button className="btn-entrada" onClick={() => abrirFormulario()} style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          NOVO FORNECEDOR
        </button>
      </div>
    </main>
  );
}