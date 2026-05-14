import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { PackageSearch } from 'lucide-react';


// ==========================================
// ÍCONES SVG COM CORES FORÇADAS E CUSTOMIZÁVEIS
// ==========================================
const IconBox = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const IconCamera = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const IconSearch = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconClock = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconCheck = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconClose = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconPlus = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconMinus = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

export default function TelaProdutos({ mostrarToast, perfil }) { // <-- Perfil recebido

  const [produtos, setProdutos] = useState([]);
  const [telaAtual, setTelaAtual] = useState('lista'); // 'lista' ou 'form'
  const [loading, setLoading] = useState(false);

  // Estados de Busca
  const [termoBusca, setTermoBusca] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  // Listas de Relacionamento
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  // Estados Especiais da Interface
  const [addCategoriaModo, setAddCategoriaModo] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
  
  const [addFornecedorModo, setAddFornecedorModo] = useState(false);
  const [novoFornecedorNome, setNovoFornecedorNome] = useState('');

  const [imagemPreview, setImagemPreview] = useState(null);
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const gerarCodigoInterno = () => 'PRD-' + Math.floor(1000 + Math.random() * 9000);

  const estadoInicial = {
    id: null, codigo_interno: gerarCodigoInterno(), codigo_barras: '', descricao: '', 
    preco: '', preco_custo: '', estoque: 0, validade: '', categoria_id: '', 
    fornecedor_id: '', observacao: '', imagem_url: '', ativo: true
  };
  const [form, setForm] = useState(estadoInicial);

  useEffect(() => {
    carregarListasAuxiliares();
  }, []);

  const carregarListasAuxiliares = async () => {
    const { data: cats } = await supabase.from('categorias').select('*').eq('ativo', true).order('nome');
    if (cats) setCategorias(cats);

    const { data: forns } = await supabase.from('fornecedores').select('*').eq('ativo', true).order('nome');
    if (forns) setFornecedores(forns);
  };

  // ==========================================
  // SISTEMA DE BUSCA INTELIGENTE
  // ==========================================
  const realizarBusca = async (e = null) => {
    if (e) e.preventDefault();
    setBuscando(true);
    setBuscaRealizada(true);

    let query = supabase.from('produtos').select('*').order('descricao');

    if (termoBusca.trim() !== '') {
      const termo = `%${termoBusca.trim()}%`;
      query = query.or(`descricao.ilike.${termo},codigo_interno.ilike.${termo},codigo_barras.ilike.${termo}`);
    }

    const { data, error } = await query;
    if (error) {
      mostrarToast('Erro ao buscar produtos.', 'erro');
    } else {
      setProdutos(data || []);
    }
    setBuscando(false);
  };

  // ==========================================
  // MÁSCARAS DE MOEDA
  // ==========================================
  const mascaraMoeda = (valor) => {
    if (valor === '' || valor === undefined || valor === null) return '';
    let v = String(valor).replace(/\D/g, ""); 
    if (v === '') return '';
    v = (Number(v) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return v;
  };

  const parseMoeda = (valor) => {
    if (!valor) return 0;
    return parseFloat(String(valor).replace(/\./g, '').replace(',', '.'));
  };

  const formatarMoedaExibicao = (valorNumber) => {
    return Number(valorNumber || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const abrirFormulario = (prod = null) => {
    if (prod) {
      setForm({ 
        ...prod,
        preco: mascaraMoeda(prod.preco ? prod.preco.toFixed(2).replace('.', '') : ''),
        preco_custo: mascaraMoeda(prod.preco_custo ? prod.preco_custo.toFixed(2).replace('.', '') : '')
      });
      setImagemPreview(prod.imagem_url);
    } else {
      setForm(estadoInicial);
      setForm(prev => ({ ...prev, codigo_interno: gerarCodigoInterno() }));
      setImagemPreview(null);
    }
    setImagemArquivo(null);
    setTelaAtual('form');
  };

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
      return;
    }
    if (name === 'preco' || name === 'preco_custo') {
      value = mascaraMoeda(value);
    }
    setForm({ ...form, [name]: value });
  };

  // ==========================================
  // COMPACTAÇÃO DE IMAGEM
  // ==========================================
  const handleImagem = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagemPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          setImagemArquivo(blob);
        }, 'image/jpeg', 0.7);
      };
    };
  };

  // ==========================================
  // LEITOR DE CÓDIGO DE BARRAS INTELIGENTE
  // ==========================================
  const iniciarLeitor = () => {
    setIsScanning(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render(async (texto) => {
        scanner.clear();
        setIsScanning(false);

        if (telaAtual === 'lista') {
          mostrarToast('Buscando código lido...', 'sucesso');
          setBuscando(true);
          setTermoBusca(texto);
          
          const { data } = await supabase.from('produtos').select('*').eq('codigo_barras', texto);
          if (data && data.length > 0) {
            setProdutos(data);
            setBuscaRealizada(true);
            abrirFormulario(data[0]);
            mostrarToast('Produto encontrado!', 'sucesso');
          } else {
            setProdutos([]);
            setBuscaRealizada(true);
            mostrarToast('Nenhum produto cadastrado com este código.', 'erro');
          }
          setBuscando(false);
          
        } else {
          setForm(prev => ({ ...prev, codigo_barras: texto }));
          mostrarToast('Código lido com sucesso!', 'sucesso');
        }
      }, (erro) => { /* ignora erros de foco */ });
    }, 100);
  };

  const fecharLeitor = () => {
    setIsScanning(false);
    const el = document.getElementById("reader");
    if(el) el.innerHTML = "";
  };

  // ==========================================
  // CADASTROS RÁPIDOS E SALVAMENTO
  // ==========================================
  const salvarNovaCategoriaRapida = async () => {
    if (!novaCategoriaNome) return;
    setLoading(true);
    const { data, error } = await supabase.from('categorias').insert([{ nome: novaCategoriaNome.toUpperCase().trim() }]).select();
    if (error) mostrarToast('Erro ao criar categoria.', 'erro');
    else {
      setCategorias([...categorias, data[0]]);
      setForm({ ...form, categoria_id: data[0].id });
      setAddCategoriaModo(false);
      setNovaCategoriaNome('');
      mostrarToast('Categoria selecionada!', 'sucesso');
    }
    setLoading(false);
  };

  const salvarNovoFornecedorRapido = async () => {
    if (!novoFornecedorNome) return;
    setLoading(true);
    const { data, error } = await supabase.from('fornecedores').insert([{ nome: novoFornecedorNome.toUpperCase().trim() }]).select();
    if (error) mostrarToast('Erro ao criar fornecedor.', 'erro');
    else {
      setFornecedores([...fornecedores, data[0]]);
      setForm({ ...form, fornecedor_id: data[0].id });
      setAddFornecedorModo(false);
      setNovoFornecedorNome('');
      mostrarToast('Fornecedor selecionado!', 'sucesso');
    }
    setLoading(false);
  };

  const salvarProduto = async (e) => {
    e.preventDefault();
    setLoading(true);

    let urlFinal = form.imagem_url;

    if (imagemArquivo) {
      const fileName = `${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('produtos')
        .upload(fileName, imagemArquivo, { contentType: 'image/jpeg' });

      if (uploadError) mostrarToast('Erro ao salvar a imagem.', 'erro');
      else {
        const { data: urlData } = supabase.storage.from('produtos').getPublicUrl(fileName);
        urlFinal = urlData.publicUrl;
      }
    }

    const dadosSalvar = {
      codigo_interno: form.codigo_interno,
      codigo_barras: form.codigo_barras,
      descricao: form.descricao.trim().toUpperCase(), // Transforma em maiúsculo ao salvar
      preco: parseMoeda(form.preco),
      preco_custo: parseMoeda(form.preco_custo),
      estoque: parseInt(form.estoque) || 0,
      validade: form.validade || null,
      categoria_id: form.categoria_id || null,
      fornecedor_id: form.fornecedor_id || null,
      observacao: form.observacao,
      imagem_url: urlFinal,
      ativo: form.ativo
    };

    if (form.id) {
      const { error } = await supabase.from('produtos').update(dadosSalvar).eq('id', form.id);
      if (error) mostrarToast('Erro ao atualizar produto.', 'erro');
      else { 
        mostrarToast('Produto atualizado!', 'sucesso'); 
        setTelaAtual('lista');
        realizarBusca(); 
      }
    } else {
      const { error } = await supabase.from('produtos').insert([dadosSalvar]);
      if (error) mostrarToast('Erro ao cadastrar produto.', 'erro');
      else { 
        mostrarToast('Produto cadastrado!', 'sucesso'); 
        setTelaAtual('lista');
        realizarBusca(); 
      }
    }
    setLoading(false);
  };

  const LabelCampo = ({ children, obrigatorio }) => (
    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4b5563', paddingLeft: '4px' }}>
      {children} 
      {obrigatorio && <span style={{ color: '#ef4444', fontSize: '0.7rem', marginLeft: '5px', fontWeight: 'bold' }}>(obrigatório)</span>}
    </label>
  );

  const ScannerOverlay = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '50px' }}>
      <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <IconCamera color="white" size="24" /> Aponte a Câmera
      </h3>
      <div id="reader" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '12px', padding: '10px' }}></div>
      <button type="button" onClick={fecharLeitor} style={{ backgroundColor: '#ef4444', color: 'white', padding: '15px 30px', borderRadius: '12px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', fontWeight: 'bold' }}>
        <IconClose color="white" size="20" /> CANCELAR LEITURA
      </button>
    </div>
  );

  // ==========================================
  // RENDERIZAÇÃO DO MODO: FORMULÁRIO
  // ==========================================
  if (telaAtual === 'form') {
    return (
      <main className="tela" style={{ paddingBottom: '30px', width: '100%', overflowX: 'hidden' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4b5563' }}>
          <IconBox size="24" /> {form.id ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}
        </h2>

        {isScanning && <ScannerOverlay />}

        <form onSubmit={salvarProduto} className="form-padrao" style={{ width: '100%', marginTop: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '16px', backgroundColor: '#e5e7eb', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px dashed #d1d5db', position: 'relative' }}>
              {imagemPreview ? (
                <img src={imagemPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <IconCamera color="#9ca3af" size="40" />
              )}
              <input type="file" accept="image/*" capture="environment" onChange={handleImagem} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '5px' }}>Toque para tirar foto</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LabelCampo>ID do Produto</LabelCampo>
            <input type="text" value={form.codigo_interno} disabled className="input-padrao" style={{ backgroundColor: '#eef2ff', color: '#4f46e5', fontWeight: 'bold' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LabelCampo>Código de Barras</LabelCampo>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input type="text" name="codigo_barras" value={form.codigo_barras} onChange={handleChange} className="input-padrao" style={{ flex: 1, minWidth: 0 }} />
              <button type="button" onClick={iniciarLeitor} style={{ width: '50px', padding: '0', backgroundColor: '#374151', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }} title="Ler Código">
                <IconCamera color="white" size="20" />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LabelCampo obrigatorio>Descrição do Produto</LabelCampo>
            <textarea 
              name="descricao" 
              value={form.descricao} 
              onChange={(e) => setForm({ ...form, descricao: e.target.value.toUpperCase() })} 
              className="input-padrao" 
              rows="2" 
              style={{ resize: 'vertical' }} 
              required 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LabelCampo obrigatorio>Preço Venda (R$)</LabelCampo>
            <input type="text" name="preco" value={form.preco} onChange={handleChange} className="input-padrao" placeholder="0,00" required />
          </div>

          {/* TRAVA DE SEGURANÇA PROFUNDA: Só mostra o Preço de Custo se for ADM */}
          {perfil?.tipo === 'adm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <LabelCampo>Preço Custo (R$)</LabelCampo>
              <input type="text" name="preco_custo" value={form.preco_custo} onChange={handleChange} className="input-padrao" placeholder="0,00" />
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LabelCampo obrigatorio>Estoque</LabelCampo>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <button type="button" onClick={() => setForm({...form, estoque: Math.max(0, Number(form.estoque || 0) - 1)})} style={{ width: '50px', borderRadius: '12px 0 0 12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRight: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <IconMinus size="20" />
              </button>
              <input type="number" name="estoque" value={form.estoque} onChange={handleChange} className="input-padrao" style={{ borderRadius: '0', textAlign: 'center', flex: 1, zIndex: 1 }} required />
              <button type="button" onClick={() => setForm({...form, estoque: Number(form.estoque || 0) + 1})} style={{ width: '50px', borderRadius: '0 12px 12px 0', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderLeft: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <IconPlus size="20" />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LabelCampo>Validade</LabelCampo>
            <input type="date" name="validade" value={form.validade} onChange={handleChange} className="input-padrao" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LabelCampo>Categoria</LabelCampo>
            {addCategoriaModo ? (
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="text" placeholder="Nova categoria..." value={novaCategoriaNome} onChange={e => setNovaCategoriaNome(e.target.value.toUpperCase())} className="input-padrao" style={{ flex: 1, minWidth: 0 }} />
                <button type="button" onClick={salvarNovaCategoriaRapida} style={{ width: '48px', backgroundColor: '#10b981', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }}>
                  <IconCheck color="white" size="20" />
                </button>
                <button type="button" onClick={() => setAddCategoriaModo(false)} style={{ width: '48px', backgroundColor: '#ef4444', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }}>
                  <IconClose color="white" size="20" />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '5px' }}>
                <select name="categoria_id" value={form.categoria_id} onChange={handleChange} className="input-padrao" style={{ flex: 1, minWidth: 0, textOverflow: 'ellipsis' }}>
                  <option value="">Selecione...</option>
                  {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                </select>
                {/* TRAVA DE SEGURANÇA: Só mostra botão Nova Categoria se tiver permissão */}
                {(perfil?.tipo === 'adm' || perfil?.perm_categorias) && (
                  <button type="button" onClick={() => setAddCategoriaModo(true)} style={{ width: '48px', backgroundColor: '#4f46e5', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }} title="Nova Categoria">
                    <IconPlus color="white" size="20" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LabelCampo>Fornecedor (Opcional)</LabelCampo>
            {addFornecedorModo ? (
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="text" placeholder="Novo fornecedor..." value={novoFornecedorNome} onChange={e => setNovoFornecedorNome(e.target.value.toUpperCase())} className="input-padrao" style={{ flex: 1, minWidth: 0 }} />
                <button type="button" onClick={salvarNovoFornecedorRapido} style={{ width: '48px', backgroundColor: '#10b981', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }}>
                  <IconCheck color="white" size="20" />
                </button>
                <button type="button" onClick={() => setAddFornecedorModo(false)} style={{ width: '48px', backgroundColor: '#ef4444', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }}>
                  <IconClose color="white" size="20" />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '5px' }}>
                <select name="fornecedor_id" value={form.fornecedor_id} onChange={handleChange} className="input-padrao" style={{ flex: 1, minWidth: 0, textOverflow: 'ellipsis' }}>
                  <option value="">Selecione o Fornecedor...</option>
                  {fornecedores.map(forn => <option key={forn.id} value={forn.id}>{forn.nome}</option>)}
                </select>
                {/* TRAVA DE SEGURANÇA: Só mostra botão Novo Fornecedor se tiver permissão */}
                {(perfil?.tipo === 'adm' || perfil?.perm_fornecedores) && (
                  <button type="button" onClick={() => setAddFornecedorModo(true)} style={{ width: '48px', backgroundColor: '#4f46e5', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }} title="Novo Fornecedor">
                    <IconPlus color="white" size="20" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
            <LabelCampo>Observações Gerais</LabelCampo>
            <textarea name="observacao" value={form.observacao} onChange={handleChange} className="input-padrao" rows="2" />
          </div>
          
          {form.id && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '10px', backgroundColor: form.ativo ? '#ecfdf5' : '#fef2f2', borderRadius: '12px', border: `1px solid ${form.ativo ? '#10b981' : '#ef4444'}` }}>
              <input type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange} id="chkAtivoProd" style={{ transform: 'scale(1.5)', marginLeft: '10px' }} />
              <label htmlFor="chkAtivoProd" style={{ fontWeight: '700', color: form.ativo ? '#10b981' : '#ef4444', cursor: 'pointer' }}>
                {form.ativo ? 'PRODUTO ESTÁ ATIVO NA LOJA' : 'PRODUTO INATIVO (Oculto)'}
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
        <PackageSearch size="48" strokeWidth="0.75px" /> PRODUTOS
      </h2>

      {/* ÁREA DE BUSCA */}
      <form onSubmit={realizarBusca} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Buscar por nome, código ou ID..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="input-padrao"
            style={{ flex: 1, backgroundColor: 'white' }}
          />
        </div>
        
        <button type="submit" className="btn-secundario" disabled={buscando} style={{ margin: 0, backgroundColor: buscando ? '#d1d5db' : 'transparent', color: buscando ? '#6b7280' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {buscando ? (
            <><IconClock size="18" /> BUSCANDO...</>
          ) : (
            <><IconSearch size="18" /> BUSCAR PRODUTOS</>
          )}
        </button>
      </form>

      {/* INFORMAÇÃO DA BUSCA */}
      {buscaRealizada && !buscando && (
        <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold', marginTop: '15px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <IconCheck size="14" /> {produtos.length} produto(s) encontrado(s).
        </p>
      )}

      {/* ANIMAÇÃO DE LOADING SIMPLES */}
      {buscando && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '30px' }}>
          <svg style={{ animation: 'spin 1s linear infinite' }} width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 2V6C12 6.55228 12.4477 7 13 7H17C17.5523 7 18 6.55228 18 6V2C18 1.44772 17.5523 1 17 1H13C12.4477 1 12 1.44772 12 2Z" fill="#4f46e5"/>
             <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
             <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </svg>
          <p style={{ marginTop: '10px', color: '#6b7280', fontSize: '0.9rem' }}>Carregando dados...</p>
        </div>
      )}

      {/* MENSAGEM INICIAL SE AINDA NÃO BUSCOU */}
      {!buscaRealizada && !buscando && (
        <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', backgroundColor: '#eef2ff', borderRadius: '12px' }}>
          <p style={{ color: '#4f46e5', fontSize: '0.95rem', fontWeight: '600' }}>Faça uma busca para visualizar o estoque!</p>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '5px' }}>Deixe o campo vazio e clique em "Buscar" para listar todos os produtos.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
        {!buscando && produtos.map(prod => (
          <div 
            key={prod.id} 
            onClick={() => abrirFormulario(prod)}
            style={{ 
              backgroundColor: '#ffffff', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', 
              cursor: 'pointer', opacity: prod.ativo ? 1 : 0.6, display: 'flex', gap: '15px', alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '8px', backgroundColor: '#f3f4f6', overflow: 'hidden', flexShrink: 0, border: '1px solid #d1d5db', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {prod.imagem_url ? <img src={prod.imagem_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <IconBox size="24" color="#9ca3af" />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <strong style={{ color: '#374151', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.descricao}</strong>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>ID: {prod.codigo_interno} {prod.codigo_barras ? `| Cód: ${prod.codigo_barras}` : ''}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold' }}>
                  R$ {formatarMoedaExibicao(prod.preco)}
                </span>
                <span style={{ fontSize: '0.75rem', backgroundColor: prod.estoque > 5 ? '#eef2ff' : '#fef2f2', color: prod.estoque > 5 ? '#4f46e5' : '#ef4444', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                  ESTOQUE: {prod.estoque}
                </span>
              </div>
            </div>
          </div>
        ))}

        <button className="btn-entrada" onClick={() => abrirFormulario()} style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <IconPlus size="20" /> CADASTRAR NOVO PRODUTO
        </button>
      </div>
    </main>
  );
}










// import React, { useState, useEffect } from 'react';
// import { supabase } from '../supabaseClient';
// import { Html5QrcodeScanner } from 'html5-qrcode';

// // ==========================================
// // ÍCONES SVG COM CORES FORÇADAS E CUSTOMIZÁVEIS
// // ==========================================
// const IconBox = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
// const IconCamera = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
// const IconSearch = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
// const IconClock = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
// const IconCheck = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
// const IconClose = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
// const IconPlus = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
// const IconMinus = ({ color = "currentColor", size = "24" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

// export default function TelaProdutos({ mostrarToast, perfil }) { // <-- Adicione o perfil aqui  

//   const [produtos, setProdutos] = useState([]);
//   const [telaAtual, setTelaAtual] = useState('lista'); // 'lista' ou 'form'
//   const [loading, setLoading] = useState(false);

//   // Estados de Busca
//   const [termoBusca, setTermoBusca] = useState('');
//   const [buscando, setBuscando] = useState(false);
//   const [buscaRealizada, setBuscaRealizada] = useState(false);

//   // Listas de Relacionamento
//   const [categorias, setCategorias] = useState([]);
//   const [fornecedores, setFornecedores] = useState([]);

//   // Estados Especiais da Interface
//   const [addCategoriaModo, setAddCategoriaModo] = useState(false);
//   const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
  
//   const [addFornecedorModo, setAddFornecedorModo] = useState(false);
//   const [novoFornecedorNome, setNovoFornecedorNome] = useState('');

//   const [imagemPreview, setImagemPreview] = useState(null);
//   const [imagemArquivo, setImagemArquivo] = useState(null);
//   const [isScanning, setIsScanning] = useState(false);

//   const gerarCodigoInterno = () => 'PRD-' + Math.floor(1000 + Math.random() * 9000);

//   const estadoInicial = {
//     id: null, codigo_interno: gerarCodigoInterno(), codigo_barras: '', descricao: '', 
//     preco: '', preco_custo: '', estoque: 0, validade: '', categoria_id: '', 
//     fornecedor_id: '', observacao: '', imagem_url: '', ativo: true
//   };
//   const [form, setForm] = useState(estadoInicial);

//   useEffect(() => {
//     carregarListasAuxiliares();
//   }, []);

//   const carregarListasAuxiliares = async () => {
//     const { data: cats } = await supabase.from('categorias').select('*').eq('ativo', true).order('nome');
//     if (cats) setCategorias(cats);

//     const { data: forns } = await supabase.from('fornecedores').select('*').eq('ativo', true).order('nome');
//     if (forns) setFornecedores(forns);
//   };

//   // ==========================================
//   // SISTEMA DE BUSCA INTELIGENTE
//   // ==========================================
//   const realizarBusca = async (e = null) => {
//     if (e) e.preventDefault();
//     setBuscando(true);
//     setBuscaRealizada(true);

//     let query = supabase.from('produtos').select('*').order('descricao');

//     if (termoBusca.trim() !== '') {
//       const termo = `%${termoBusca.trim()}%`;
//       query = query.or(`descricao.ilike.${termo},codigo_interno.ilike.${termo},codigo_barras.ilike.${termo}`);
//     }

//     const { data, error } = await query;
//     if (error) {
//       mostrarToast('Erro ao buscar produtos.', 'erro');
//     } else {
//       setProdutos(data || []);
//     }
//     setBuscando(false);
//   };

//   // ==========================================
//   // MÁSCARAS DE MOEDA
//   // ==========================================
//   const mascaraMoeda = (valor) => {
//     if (valor === '' || valor === undefined || valor === null) return '';
//     let v = String(valor).replace(/\D/g, ""); 
//     if (v === '') return '';
//     v = (Number(v) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//     return v;
//   };

//   const parseMoeda = (valor) => {
//     if (!valor) return 0;
//     return parseFloat(String(valor).replace(/\./g, '').replace(',', '.'));
//   };

//   const formatarMoedaExibicao = (valorNumber) => {
//     return Number(valorNumber || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//   };

//   const abrirFormulario = (prod = null) => {
//     if (prod) {
//       setForm({ 
//         ...prod,
//         preco: mascaraMoeda(prod.preco ? prod.preco.toFixed(2).replace('.', '') : ''),
//         preco_custo: mascaraMoeda(prod.preco_custo ? prod.preco_custo.toFixed(2).replace('.', '') : '')
//       });
//       setImagemPreview(prod.imagem_url);
//     } else {
//       setForm(estadoInicial);
//       setForm(prev => ({ ...prev, codigo_interno: gerarCodigoInterno() }));
//       setImagemPreview(null);
//     }
//     setImagemArquivo(null);
//     setTelaAtual('form');
//   };

//   const handleChange = (e) => {
//     let { name, value, type, checked } = e.target;
//     if (type === 'checkbox') {
//       setForm({ ...form, [name]: checked });
//       return;
//     }
//     if (name === 'preco' || name === 'preco_custo') {
//       value = mascaraMoeda(value);
//     }
//     setForm({ ...form, [name]: value });
//   };

//   // ==========================================
//   // COMPACTAÇÃO DE IMAGEM
//   // ==========================================
//   const handleImagem = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setImagemPreview(URL.createObjectURL(file));

//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = (event) => {
//       const img = new Image();
//       img.src = event.target.result;
//       img.onload = () => {
//         const canvas = document.createElement('canvas');
//         const MAX_WIDTH = 600;
//         const scaleSize = MAX_WIDTH / img.width;
//         canvas.width = MAX_WIDTH;
//         canvas.height = img.height * scaleSize;
        
//         const ctx = canvas.getContext('2d');
//         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
//         canvas.toBlob((blob) => {
//           setImagemArquivo(blob);
//         }, 'image/jpeg', 0.7);
//       };
//     };
//   };

//   // ==========================================
//   // LEITOR DE CÓDIGO DE BARRAS INTELIGENTE
//   // ==========================================
//   const iniciarLeitor = () => {
//     setIsScanning(true);
//     setTimeout(() => {
//       const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
//       scanner.render(async (texto) => {
//         scanner.clear();
//         setIsScanning(false);

//         if (telaAtual === 'lista') {
//           mostrarToast('Buscando código lido...', 'sucesso');
//           setBuscando(true);
//           setTermoBusca(texto);
          
//           const { data } = await supabase.from('produtos').select('*').eq('codigo_barras', texto);
//           if (data && data.length > 0) {
//             setProdutos(data);
//             setBuscaRealizada(true);
//             abrirFormulario(data[0]);
//             mostrarToast('Produto encontrado!', 'sucesso');
//           } else {
//             setProdutos([]);
//             setBuscaRealizada(true);
//             mostrarToast('Nenhum produto cadastrado com este código.', 'erro');
//           }
//           setBuscando(false);
          
//         } else {
//           setForm(prev => ({ ...prev, codigo_barras: texto }));
//           mostrarToast('Código lido com sucesso!', 'sucesso');
//         }
//       }, (erro) => { /* ignora erros de foco */ });
//     }, 100);
//   };

//   const fecharLeitor = () => {
//     setIsScanning(false);
//     const el = document.getElementById("reader");
//     if(el) el.innerHTML = "";
//   };

//   // ==========================================
//   // CADASTROS RÁPIDOS E SALVAMENTO
//   // ==========================================
//   const salvarNovaCategoriaRapida = async () => {
//     if (!novaCategoriaNome) return;
//     setLoading(true);
//     const { data, error } = await supabase.from('categorias').insert([{ nome: novaCategoriaNome.toUpperCase().trim() }]).select();
//     if (error) mostrarToast('Erro ao criar categoria.', 'erro');
//     else {
//       setCategorias([...categorias, data[0]]);
//       setForm({ ...form, categoria_id: data[0].id });
//       setAddCategoriaModo(false);
//       setNovaCategoriaNome('');
//       mostrarToast('Categoria selecionada!', 'sucesso');
//     }
//     setLoading(false);
//   };

//   const salvarNovoFornecedorRapido = async () => {
//     if (!novoFornecedorNome) return;
//     setLoading(true);
//     const { data, error } = await supabase.from('fornecedores').insert([{ nome: novoFornecedorNome.toUpperCase().trim() }]).select();
//     if (error) mostrarToast('Erro ao criar fornecedor.', 'erro');
//     else {
//       setFornecedores([...fornecedores, data[0]]);
//       setForm({ ...form, fornecedor_id: data[0].id });
//       setAddFornecedorModo(false);
//       setNovoFornecedorNome('');
//       mostrarToast('Fornecedor selecionado!', 'sucesso');
//     }
//     setLoading(false);
//   };

//   const salvarProduto = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     let urlFinal = form.imagem_url;

//     if (imagemArquivo) {
//       const fileName = `${Date.now()}.jpg`;
//       const { data: uploadData, error: uploadError } = await supabase.storage
//         .from('produtos')
//         .upload(fileName, imagemArquivo, { contentType: 'image/jpeg' });

//       if (uploadError) mostrarToast('Erro ao salvar a imagem.', 'erro');
//       else {
//         const { data: urlData } = supabase.storage.from('produtos').getPublicUrl(fileName);
//         urlFinal = urlData.publicUrl;
//       }
//     }

//     const dadosSalvar = {
//       codigo_interno: form.codigo_interno,
//       codigo_barras: form.codigo_barras,
//       descricao: form.descricao.trim().toUpperCase(), // Transforma em maiúsculo ao salvar
//       preco: parseMoeda(form.preco),
//       preco_custo: parseMoeda(form.preco_custo),
//       estoque: parseInt(form.estoque) || 0,
//       validade: form.validade || null,
//       categoria_id: form.categoria_id || null,
//       fornecedor_id: form.fornecedor_id || null,
//       observacao: form.observacao,
//       imagem_url: urlFinal,
//       ativo: form.ativo
//     };

//     if (form.id) {
//       const { error } = await supabase.from('produtos').update(dadosSalvar).eq('id', form.id);
//       if (error) mostrarToast('Erro ao atualizar produto.', 'erro');
//       else { 
//         mostrarToast('Produto atualizado!', 'sucesso'); 
//         setTelaAtual('lista');
//         realizarBusca(); 
//       }
//     } else {
//       const { error } = await supabase.from('produtos').insert([dadosSalvar]);
//       if (error) mostrarToast('Erro ao cadastrar produto.', 'erro');
//       else { 
//         mostrarToast('Produto cadastrado!', 'sucesso'); 
//         setTelaAtual('lista');
//         realizarBusca(); 
//       }
//     }
//     setLoading(false);
//   };

//   const LabelCampo = ({ children, obrigatorio }) => (
//     <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4b5563', paddingLeft: '4px' }}>
//       {children} 
//       {obrigatorio && <span style={{ color: '#ef4444', fontSize: '0.7rem', marginLeft: '5px', fontWeight: 'bold' }}>(obrigatório)</span>}
//     </label>
//   );

//   const ScannerOverlay = () => (
//     <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '50px' }}>
//       <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//         <IconCamera color="white" size="24" /> Aponte a Câmera
//       </h3>
//       <div id="reader" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '12px', padding: '10px' }}></div>
//       <button type="button" onClick={fecharLeitor} style={{ backgroundColor: '#ef4444', color: 'white', padding: '15px 30px', borderRadius: '12px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', fontWeight: 'bold' }}>
//         <IconClose color="white" size="20" /> CANCELAR LEITURA
//       </button>
//     </div>
//   );

//   // ==========================================
//   // RENDERIZAÇÃO DO MODO: FORMULÁRIO
//   // ==========================================
//   if (telaAtual === 'form') {
//     return (
//       <main className="tela" style={{ paddingBottom: '30px', width: '100%', overflowX: 'hidden' }}>
//         <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4b5563' }}>
//           <IconBox size="24" /> {form.id ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}
//         </h2>

//         {isScanning && <ScannerOverlay />}

//         <form onSubmit={salvarProduto} className="form-padrao" style={{ width: '100%', marginTop: '20px' }}>
//           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
//             <div style={{ width: '120px', height: '120px', borderRadius: '16px', backgroundColor: '#e5e7eb', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px dashed #d1d5db', position: 'relative' }}>
//               {imagemPreview ? (
//                 <img src={imagemPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//               ) : (
//                 <IconCamera color="#9ca3af" size="40" />
//               )}
//               <input type="file" accept="image/*" capture="environment" onChange={handleImagem} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
//             </div>
//             <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '5px' }}>Toque para tirar foto</p>
//           </div>

//           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//             <LabelCampo>ID do Produto</LabelCampo>
//             <input type="text" value={form.codigo_interno} disabled className="input-padrao" style={{ backgroundColor: '#eef2ff', color: '#4f46e5', fontWeight: 'bold' }} />
//           </div>
          
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//             <LabelCampo>Código de Barras</LabelCampo>
//             <div style={{ display: 'flex', gap: '5px' }}>
//               <input type="text" name="codigo_barras" value={form.codigo_barras} onChange={handleChange} className="input-padrao" style={{ flex: 1, minWidth: 0 }} />
//               <button type="button" onClick={iniciarLeitor} style={{ width: '50px', padding: '0', backgroundColor: '#374151', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }} title="Ler Código">
//                 <IconCamera color="white" size="20" />
//               </button>
//             </div>
//           </div>

//           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//             <LabelCampo obrigatorio>Descrição do Produto</LabelCampo>
//             {/* O onChange transforma a letra em maiúscula no exato momento da digitação */}
//             <textarea 
//               name="descricao" 
//               value={form.descricao} 
//               onChange={(e) => setForm({ ...form, descricao: e.target.value.toUpperCase() })} 
//               className="input-padrao" 
//               rows="2" 
//               style={{ resize: 'vertical' }} 
//               required 
//             />
//           </div>

//           {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//             <LabelCampo obrigatorio>Preço Venda (R$)</LabelCampo>
//             <input type="text" name="preco" value={form.preco} onChange={handleChange} className="input-padrao" placeholder="0,00" required />
//           </div> */}

//           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//             <LabelCampo obrigatorio>Preço Venda (R$)</LabelCampo>
//             <input type="text" name="preco" value={form.preco} onChange={handleChange} className="input-padrao" placeholder="0,00" required />
//           </div>

//           {/* TRAVA DE SEGURANÇA PROFUNDA: Só mostra o Preço de Custo se for ADM */}
//           {perfil?.tipo === 'adm' && (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//               <LabelCampo>Preço Custo (R$)</LabelCampo>
//               <input type="text" name="preco_custo" value={form.preco_custo} onChange={handleChange} className="input-padrao" placeholder="0,00" />
//             </div>
//           )}
          
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//             <LabelCampo obrigatorio>Estoque</LabelCampo>
//             <div style={{ display: 'flex', alignItems: 'stretch' }}>
//               <button type="button" onClick={() => setForm({...form, estoque: Math.max(0, Number(form.estoque || 0) - 1)})} style={{ width: '50px', borderRadius: '12px 0 0 12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRight: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//                 <IconMinus size="20" />
//               </button>
//               <input type="number" name="estoque" value={form.estoque} onChange={handleChange} className="input-padrao" style={{ borderRadius: '0', textAlign: 'center', flex: 1, zIndex: 1 }} required />
//               <button type="button" onClick={() => setForm({...form, estoque: Number(form.estoque || 0) + 1})} style={{ width: '50px', borderRadius: '0 12px 12px 0', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderLeft: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//                 <IconPlus size="20" />
//               </button>
//             </div>
//           </div>

//           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//             <LabelCampo>Validade</LabelCampo>
//             <input type="date" name="validade" value={form.validade} onChange={handleChange} className="input-padrao" />
//           </div>

//           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//             <LabelCampo>Categoria</LabelCampo>
//             {addCategoriaModo ? (
//               <div style={{ display: 'flex', gap: '5px' }}>
//                 <input type="text" placeholder="Nova categoria..." value={novaCategoriaNome} onChange={e => setNovaCategoriaNome(e.target.value.toUpperCase())} className="input-padrao" style={{ flex: 1, minWidth: 0 }} />
//                 <button type="button" onClick={salvarNovaCategoriaRapida} style={{ width: '48px', backgroundColor: '#10b981', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }}>
//                   <IconCheck color="white" size="20" />
//                 </button>
//                 <button type="button" onClick={() => setAddCategoriaModo(false)} style={{ width: '48px', backgroundColor: '#ef4444', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }}>
//                   <IconClose color="white" size="20" />
//                 </button>
//               </div>
//             ) : (
//               <div style={{ display: 'flex', gap: '5px' }}>
//                 <select name="categoria_id" value={form.categoria_id} onChange={handleChange} className="input-padrao" style={{ flex: 1, minWidth: 0, textOverflow: 'ellipsis' }}>
//                   <option value="">Selecione...</option>
//                   {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
//                 </select>
//                 <button type="button" onClick={() => setAddCategoriaModo(true)} style={{ width: '48px', backgroundColor: '#4f46e5', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }} title="Nova Categoria">
//                   <IconPlus color="white" size="20" />
//                 </button>
//               </div>
//             )}
//           </div>

//           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//             <LabelCampo>Fornecedor (Opcional)</LabelCampo>
//             {addFornecedorModo ? (
//               <div style={{ display: 'flex', gap: '5px' }}>
//                 <input type="text" placeholder="Novo fornecedor..." value={novoFornecedorNome} onChange={e => setNovoFornecedorNome(e.target.value.toUpperCase())} className="input-padrao" style={{ flex: 1, minWidth: 0 }} />
//                 <button type="button" onClick={salvarNovoFornecedorRapido} style={{ width: '48px', backgroundColor: '#10b981', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }}>
//                   <IconCheck color="white" size="20" />
//                 </button>
//                 <button type="button" onClick={() => setAddFornecedorModo(false)} style={{ width: '48px', backgroundColor: '#ef4444', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }}>
//                   <IconClose color="white" size="20" />
//                 </button>
//               </div>
//             ) : (
//               <div style={{ display: 'flex', gap: '5px' }}>
//                 <select name="fornecedor_id" value={form.fornecedor_id} onChange={handleChange} className="input-padrao" style={{ flex: 1, minWidth: 0, textOverflow: 'ellipsis' }}>
//                   <option value="">Selecione o Fornecedor...</option>
//                   {fornecedores.map(forn => <option key={forn.id} value={forn.id}>{forn.nome}</option>)}
//                 </select>
//                 <button type="button" onClick={() => setAddFornecedorModo(true)} style={{ width: '48px', backgroundColor: '#4f46e5', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }} title="Novo Fornecedor">
//                   <IconPlus color="white" size="20" />
//                 </button>
//               </div>
//             )}
//           </div>

//           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
//             <LabelCampo>Observações Gerais</LabelCampo>
//             <textarea name="observacao" value={form.observacao} onChange={handleChange} className="input-padrao" rows="2" />
//           </div>
          
//           {form.id && (
//             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '10px', backgroundColor: form.ativo ? '#ecfdf5' : '#fef2f2', borderRadius: '12px', border: `1px solid ${form.ativo ? '#10b981' : '#ef4444'}` }}>
//               <input type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange} id="chkAtivoProd" style={{ transform: 'scale(1.5)', marginLeft: '10px' }} />
//               <label htmlFor="chkAtivoProd" style={{ fontWeight: '700', color: form.ativo ? '#10b981' : '#ef4444', cursor: 'pointer' }}>
//                 {form.ativo ? 'PRODUTO ESTÁ ATIVO NA LOJA' : 'PRODUTO INATIVO (Oculto)'}
//               </label>
//             </div>
//           )}

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
//             <button type="button" className="btn-secundario" onClick={() => setTelaAtual('lista')} style={{ margin: 0 }}>CANCELAR</button>
//             <button type="submit" className="btn-entrada" disabled={loading} style={{ margin: 0 }}>{loading ? 'SALVANDO...' : 'SALVAR'}</button>
//           </div>
//         </form>
//       </main>
//     );
//   }

//   // ==========================================
//   // RENDERIZAÇÃO DO MODO: LISTAGEM
//   // ==========================================
//   return (
//     <main className="tela" style={{ paddingBottom: '30px' }}>
//       <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4b5563' }}>
//         <IconBox size="24" /> PRODUTOS
//       </h2>

//       {/* ÁREA DE BUSCA */}
//       <form onSubmit={realizarBusca} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
//         <div style={{ display: 'flex', gap: '10px' }}>
//           <input
//             type="text"
//             placeholder="Buscar por nome, código ou ID..."
//             value={termoBusca}
//             onChange={(e) => setTermoBusca(e.target.value)}
//             className="input-padrao"
//             style={{ flex: 1, backgroundColor: 'white' }}
//           />
//         </div>
        
//         <button type="submit" className="btn-secundario" disabled={buscando} style={{ margin: 0, backgroundColor: buscando ? '#d1d5db' : 'transparent', color: buscando ? '#6b7280' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
//           {buscando ? (
//             <><IconClock size="18" /> BUSCANDO...</>
//           ) : (
//             <><IconSearch size="18" /> BUSCAR PRODUTOS</>
//           )}
//         </button>
//       </form>

//       {/* INFORMAÇÃO DA BUSCA */}
//       {buscaRealizada && !buscando && (
//         <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold', marginTop: '15px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
//           <IconCheck size="14" /> {produtos.length} produto(s) encontrado(s).
//         </p>
//       )}

//       {/* ANIMAÇÃO DE LOADING SIMPLES */}
//       {buscando && (
//         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '30px' }}>
//           <svg style={{ animation: 'spin 1s linear infinite' }} width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//              <path d="M12 2V6C12 6.55228 12.4477 7 13 7H17C17.5523 7 18 6.55228 18 6V2C18 1.44772 17.5523 1 17 1H13C12.4477 1 12 1.44772 12 2Z" fill="#4f46e5"/>
//              <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
//              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
//           </svg>
//           <p style={{ marginTop: '10px', color: '#6b7280', fontSize: '0.9rem' }}>Carregando dados...</p>
//         </div>
//       )}

//       {/* MENSAGEM INICIAL SE AINDA NÃO BUSCOU */}
//       {!buscaRealizada && !buscando && (
//         <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', backgroundColor: '#eef2ff', borderRadius: '12px' }}>
//           <p style={{ color: '#4f46e5', fontSize: '0.95rem', fontWeight: '600' }}>Faça uma busca para visualizar o estoque!</p>
//           <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '5px' }}>Deixe o campo vazio e clique em "Buscar" para listar todos os produtos.</p>
//         </div>
//       )}

//       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
//         {!buscando && produtos.map(prod => (
//           <div 
//             key={prod.id} 
//             onClick={() => abrirFormulario(prod)}
//             style={{ 
//               backgroundColor: '#ffffff', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', 
//               cursor: 'pointer', opacity: prod.ativo ? 1 : 0.6, display: 'flex', gap: '15px', alignItems: 'center',
//               boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
//             }}
//           >
//             <div style={{ width: '50px', height: '50px', borderRadius: '8px', backgroundColor: '#f3f4f6', overflow: 'hidden', flexShrink: 0, border: '1px solid #d1d5db', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//               {prod.imagem_url ? <img src={prod.imagem_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <IconBox size="24" color="#9ca3af" />}
//             </div>

//             <div style={{ flex: 1, minWidth: 0 }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//                 <strong style={{ color: '#374151', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.descricao}</strong>
//               </div>
//               <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>ID: {prod.codigo_interno} {prod.codigo_barras ? `| Cód: ${prod.codigo_barras}` : ''}</p>
              
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
//                 <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold' }}>
//                   R$ {formatarMoedaExibicao(prod.preco)}
//                 </span>
//                 <span style={{ fontSize: '0.75rem', backgroundColor: prod.estoque > 5 ? '#eef2ff' : '#fef2f2', color: prod.estoque > 5 ? '#4f46e5' : '#ef4444', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
//                   ESTOQUE: {prod.estoque}
//                 </span>
//               </div>
//             </div>
//           </div>
//         ))}

//         <button className="btn-entrada" onClick={() => abrirFormulario()} style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
//           <IconPlus size="20" /> CADASTRAR NOVO PRODUTO
//         </button>
//       </div>
//     </main>
//   );
// }