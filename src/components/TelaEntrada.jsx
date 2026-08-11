import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ScanBarcode } from 'lucide-react';

// ==========================================
// ÍCONES SVG NATIVOS
// ==========================================
const IconClose = ({ color = "currentColor", size = "18" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconPlus = ({ color = "currentColor", size = "20", strokeWidth = "3" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const IconMinus = ({ color = "currentColor" }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconTrash = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

const IconSettings = ({ color = "currentColor" }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconCart = ({ color = "#9ca3af", size = "24" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);
const IconArrowDownCircle = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="8 12 12 16 16 12"></polyline><line x1="12" y1="8" x2="12" y2="16"></line></svg>;
const IconArrowUpCircle = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>;
const IconReceipt = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2V2l-2 2-2-2-2 2-2-2-2 2-2-2-2 2z"></path><line x1="16" y1="8" x2="8" y2="8"></line><line x1="16" y1="12" x2="8" y2="12"></line><line x1="10" y1="16" x2="8" y2="16"></line></svg>;
const IconPower = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>;
const IconCheckCircle = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconAlertTriangle = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const IconList = ({ color = "currentColor", size = "20" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const IconCalculator = ({ color = "currentColor", size = "20" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="8" y1="6" x2="16" y2="6"></line>
    <line x1="16" y1="14" x2="16" y2="18"></line>
    <line x1="8" y1="10" x2="8.01" y2="10"></line>
    <line x1="12" y1="10" x2="12.01" y2="10"></line>
    <line x1="16" y1="10" x2="16.01" y2="10"></line>
    <line x1="8" y1="14" x2="8.01" y2="14"></line>
    <line x1="12" y1="14" x2="12.01" y2="14"></line>
    <line x1="8" y1="18" x2="8.01" y2="18"></line>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
  </svg>
);
const IconCaixa = () => <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign-circle-icon lucide-dollar-sign-circle"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>;


// ==========================================
// COMPONENTES AUXILIARES
// ==========================================
const LabelCampo = ({ children }) => <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', paddingLeft: '4px' }}>{children}</label>;
const Overlay = ({ children, absolute }) => <div style={{ position: absolute ? 'absolute' : 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: absolute ? '16px' : '0' }}>{children}</div>;

export default function TelaEntrada({ mostrarToast, sessaoCaixa, onCaixaFechado }) {
  const [carrinho, setCarrinho] = useState([]);
  const [produtosTotais, setProdutosTotais] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  
  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);
  
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const tradutorIntervalRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Estados dos Modais
  const [modalRemover, setModalRemover] = useState(null); 
  const [modalEditar, setModalEditar] = useState(null); 
  const [modalGerenciar, setModalGerenciar] = useState(false); 
  const [modalOperacaoFisica, setModalOperacaoFisica] = useState(null); 
  const [modalFechamento, setModalFechamento] = useState(false);
  
  // Estado para Relatório de Lançamentos do Caixa Atual
  const [modalLancamentos, setModalLancamentos] = useState(false);
  const [lancamentosSessao, setLancamentosSessao] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  
  // Detalhes do Lançamento
  const [modalDetalhes, setModalDetalhes] = useState(null);
  const [itensDetalhe, setItensDetalhe] = useState([]);
  const [buscandoItens, setBuscandoItens] = useState(false);

  // Estados do Checkout
  const [modoPagamento, setModoPagamento] = useState(false);
  const [valorRecebido, setValorRecebido] = useState('');
  const [formaSelecionada, setFormaSelecionada] = useState('');
  const [mostrarDescontoGlobal, setMostrarDescontoGlobal] = useState(false);
  const [tipoDescontoGlobal, setTipoDescontoGlobal] = useState('valor'); 
  const [descontoGlobalValorStr, setDescontoGlobalValorStr] = useState('');
  const [descontoGlobalPercStr, setDescontoGlobalPercStr] = useState('');

  // Estados de Operações de Caixa
  const [valorOperacao, setValorOperacao] = useState('');
  const [obsOperacao, setObsOperacao] = useState('');
  const [valorContadoFechamento, setValorContadoFechamento] = useState('');
  
  const [resumoFechamento, setResumoFechamento] = useState(null);
  const valorRecebidoRef = useRef(null);
  const descontoGlobalValorRef = useRef(null);
  const descontoGlobalPercRef = useRef(null);

  // Estados do Teclado Virtual e Tablet Landscape
  const [isTabletLandscape, setIsTabletLandscape] = useState(false);
  const [campoFocado, setCampoFocado] = useState('busca');
  const [tecladoCaps, setTecladoCaps] = useState(true);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [calcExpression, setCalcExpression] = useState('');

  useEffect(() => {
    const checkDevice = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      const isTabletWidth = window.innerWidth >= 768 && window.innerWidth <= 1366;
      const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      setIsTabletLandscape(isLandscape && isTabletWidth && hasTouch);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    if (isTabletLandscape) {
      const timer = setTimeout(() => {
        setCampoFocado('busca');
        const el = document.querySelector('input[placeholder="Nome ou código..."]');
        if (el) el.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isTabletLandscape]);

  const handleTecladoPress = (key) => {
    if (!campoFocado) return;

    const updateMaskedValue = (currentVal, keyStr, setter) => {
      let raw = String(currentVal || '').replace(/\D/g, "");
      if (keyStr === 'Backspace') {
        raw = raw.slice(0, -1);
      } else if (keyStr === 'Clear') {
        raw = '';
      } else if (/^\d$/.test(keyStr)) {
        raw += keyStr;
      }
      setter(mascaraMoeda(raw));
    };

    switch (campoFocado) {
      case 'busca': {
        let novo = termoBusca;
        if (key === 'Backspace') {
          novo = novo.slice(0, -1);
        } else if (key === 'Clear') {
          novo = '';
        } else if (key === 'Space') {
          novo += ' ';
        } else if (key === 'Shift') {
          setTecladoCaps(!tecladoCaps);
          return;
        } else {
          novo += tecladoCaps ? key.toUpperCase() : key.toLowerCase();
        }
        setTermoBusca(novo);
        if (!novo.trim()) {
          setResultadosBusca([]);
        } else {
          const encontrados = produtosTotais.filter(p => 
            (p.codigo_barras === novo) || 
            (p.codigo_interno?.toLowerCase() === novo.toLowerCase()) || 
            p.descricao.toLowerCase().includes(novo.toLowerCase())
          );
          setResultadosBusca(encontrados);
        }
        break;
      }
      case 'recebido': {
        updateMaskedValue(valorRecebido, key, setValorRecebido);
        break;
      }
      case 'descontoGlobalValor': {
        updateMaskedValue(descontoGlobalValorStr, key, setDescontoGlobalValorStr);
        break;
      }
      case 'descontoGlobalPerc': {
        let novo = String(descontoGlobalPercStr || '');
        if (key === 'Backspace') {
          novo = novo.slice(0, -1);
        } else if (key === 'Clear') {
          novo = '';
        } else if (/^\d$/.test(key)) {
          novo += key;
        }
        setDescontoGlobalPercStr(novo);
        break;
      }
      case 'descontoItem': {
        if (!modalEditar) return;
        let raw = String(modalEditar.descontoStr || '').replace(/\D/g, "");
        if (key === 'Backspace') {
          raw = raw.slice(0, -1);
        } else if (key === 'Clear') {
          raw = '';
        } else if (/^\d$/.test(key)) {
          raw += key;
        }
        setModalEditar(prev => ({ ...prev, descontoStr: mascaraMoeda(raw) }));
        break;
      }
      case 'valorOperacao': {
        updateMaskedValue(valorOperacao, key, setValorOperacao);
        break;
      }
      case 'obsOperacao': {
        let novo = obsOperacao;
        if (key === 'Backspace') {
          novo = novo.slice(0, -1);
        } else if (key === 'Clear') {
          novo = '';
        } else if (key === 'Space') {
          novo += ' ';
        } else if (key === 'Shift') {
          setTecladoCaps(!tecladoCaps);
          return;
        } else {
          novo += tecladoCaps ? key.toUpperCase() : key.toLowerCase();
        }
        setObsOperacao(novo);
        break;
      }
      case 'valorContadoFechamento': {
        updateMaskedValue(valorContadoFechamento, key, setValorContadoFechamento);
        break;
      }
      default:
        break;
    }
  };

  const handleQuickCash = (amount) => {
    if (campoFocado !== 'recebido') return;
    const currentVal = parseMoeda(valorRecebido);
    const newVal = currentVal + amount;
    const centsStr = (newVal * 100).toFixed(0);
    setValorRecebido(mascaraMoeda(centsStr));
  };

  const handleExactCash = () => {
    if (campoFocado !== 'recebido') return;
    const centsStr = (totalFinal * 100).toFixed(0);
    setValorRecebido(mascaraMoeda(centsStr));
  };

  const evaluateExpression = (expr) => {
    try {
      const sanitized = expr.replace(/[^\d+\-*/().]/g, '');
      const result = new Function(`return ${sanitized}`)();
      if (result === undefined || isNaN(result) || !isFinite(result)) return 'Erro';
      return String(Number(result.toFixed(4)));
    } catch {
      return 'Erro';
    }
  };

  const handleCalcPress = (val) => {
    if (val === '=') {
      if (!calcExpression) return;
      const res = evaluateExpression(calcExpression);
      setCalcExpression(res);
    } else if (val === 'C') {
      setCalcExpression('');
    } else if (val === 'Backspace') {
      setCalcExpression(prev => prev.slice(0, -1));
    } else {
      setCalcExpression(prev => {
        if (prev.length > 18) return prev;
        return prev + val;
      });
    }
  };

  const renderCalculadora = () => {
    const calcKeys = [
      ['C', '(', ')', '/'],
      ['7', '8', '9', '*'],
      ['4', '5', '6', '-'],
      ['1', '2', '3', '+'],
      ['0', '.', '⌫', '=']
    ];

    const labelFocoMap = {
      'busca': 'Busca de Produtos',
      'recebido': 'Valor Recebido (Dinheiro)',
      'descontoGlobalValor': 'Desconto Global (R$)',
      'descontoGlobalPerc': 'Desconto Global (%)',
      'descontoItem': 'Desconto do Item (R$)',
      'valorOperacao': 'Valor da Operação',
      'obsOperacao': 'Observação da Operação',
      'valorContadoFechamento': 'Dinheiro em Caixa (Contado)'
    };
    const labelFoco = labelFocoMap[campoFocado] || '';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconCalculator color="#4f46e5" size="20" />
            <strong style={{ fontSize: '1rem', color: '#1f2937' }}>Calculadora</strong>
          </div>
          <button 
            type="button"
            onClick={() => setMostrarCalculadora(false)}
            style={{ 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#ef4444', 
              padding: '6px 12px', 
              borderRadius: '8px', 
              fontSize: '0.8rem', 
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <IconClose size="14" color="#ef4444" /> FECHAR
          </button>
        </div>

        {/* Display */}
        <div style={{ 
          backgroundColor: '#1f2937', 
          color: '#10b981', 
          padding: '12px 15px', 
          borderRadius: '12px', 
          textAlign: 'right', 
          fontSize: '1.6rem', 
          fontWeight: 'bold', 
          fontFamily: 'monospace',
          minHeight: '55px',
          wordBreak: 'break-all',
          marginBottom: '12px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}>
          {calcExpression || '0'}
        </div>

        {/* Teclas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {calcKeys.map((row, rIdx) => (
            <div key={rIdx} style={{ display: 'flex', gap: '6px', flex: 1 }}>
              {row.map(k => {
                const isOperator = ['/', '*', '-', '+', '='].includes(k);
                const isClear = k === 'C';
                const isBackspace = k === '⌫';
                
                let bg = '#f3f4f6';
                let fg = '#1f2937';
                let border = '1px solid #e5e7eb';
                
                if (isOperator) {
                  bg = k === '=' ? '#10b981' : '#eef2ff';
                  fg = k === '=' ? 'white' : '#4f46e5';
                  border = k === '=' ? '1px solid #059669' : '1px solid #c7d2fe';
                } else if (isClear) {
                  bg = '#fef2f2';
                  fg = '#ef4444';
                  border = '1px solid #fecaca';
                } else if (isBackspace) {
                  bg = '#f3f4f6';
                  fg = '#4b5563';
                }

                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleCalcPress(k === '⌫' ? 'Backspace' : k)}
                    style={{
                      flex: 1,
                      height: '46px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      backgroundColor: bg,
                      color: fg,
                      border: border,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Aplicar no Caixa */}
        {campoFocado && campoFocado !== 'busca' && calcExpression && calcExpression !== 'Erro' && (
          <button
            type="button"
            onClick={() => {
              const val = calcExpression;
              if (campoFocado === 'recebido') {
                setValorRecebido(mascaraMoeda(Math.round(parseFloat(val) * 100)));
              } else if (campoFocado === 'descontoGlobalValor') {
                setDescontoGlobalValorStr(mascaraMoeda(Math.round(parseFloat(val) * 100)));
              } else if (campoFocado === 'descontoGlobalPerc') {
                setDescontoGlobalPercStr(val);
              } else if (campoFocado === 'descontoItem') {
                setModalEditar(prev => ({ ...prev, descontoStr: mascaraMoeda(Math.round(parseFloat(val) * 100)) }));
              } else if (campoFocado === 'valorOperacao') {
                setValorOperacao(mascaraMoeda(Math.round(parseFloat(val) * 100)));
              } else if (campoFocado === 'valorContadoFechamento') {
                setValorContadoFechamento(mascaraMoeda(Math.round(parseFloat(val) * 100)));
              } else if (campoFocado === 'obsOperacao') {
                setObsOperacao(val);
              }
              mostrarToast('Valor da calculadora aplicado ao campo!', 'sucesso');
            }}
            style={{
              marginTop: '10px',
              height: '44px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.85rem',
              boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)'
            }}
          >
            APLICAR NO CAMPO: {labelFoco} ➔
          </button>
        )}
      </div>
    );
  };

  const renderTecladoVirtual = () => {
    if (mostrarCalculadora) {
      return renderCalculadora();
    }

    const inputsNumericos = ['recebido', 'descontoGlobalValor', 'descontoGlobalPerc', 'descontoItem', 'valorOperacao', 'valorContadoFechamento'];
    const isNumerico = inputsNumericos.includes(campoFocado);

    const labelFocoMap = {
      'busca': 'Busca de Produtos',
      'recebido': 'Valor Recebido (Dinheiro)',
      'descontoGlobalValor': 'Desconto Global (R$)',
      'descontoGlobalPerc': 'Desconto Global (%)',
      'descontoItem': 'Desconto do Item (R$)',
      'valorOperacao': 'Valor da Operação',
      'obsOperacao': 'Observação da Operação',
      'valorContadoFechamento': 'Dinheiro em Caixa (Contado)'
    };

    const labelFoco = labelFocoMap[campoFocado] || 'Nenhum campo selecionado';

    const qwertyRows = [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace']
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
        <div style={{ marginBottom: '15px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Bolinha de status  
          <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: campoFocado ? '#10b981' : '#9ca3af',
              display: 'inline-block',
              animation: campoFocado ? 'pulse 1.5s infinite' : 'none'
            }} />
             <strong style={{ fontSize: '0.95rem', color: campoFocado ? '#4f46e5' : '#6b7280' }}>
              {campoFocado ? `Digite no campo: ${labelFoco}` : 'Selecione um campo'}
            </strong> */}
          </div>
          <button
            type="button"
            onClick={() => setMostrarCalculadora(true)}
            style={{
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: '#4b5563',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}
            title="Abrir Calculadora"
          >
            <IconCalculator size="14" color="#4b5563" /> CALCULADORA
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {isNumerico ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {campoFocado === 'recebido' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '5px' }}>
                  <button type="button" onClick={handleExactCash} style={{ height: '40px', padding: 0, fontSize: '0.75rem', backgroundColor: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    EXATO ({formatarMoeda(totalFinal)})
                  </button>
                  <button type="button" onClick={() => handleQuickCash(5)} style={{ height: '40px', padding: 0, fontSize: '0.75rem', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + R$ 5,00
                  </button>
                  <button type="button" onClick={() => handleQuickCash(10)} style={{ height: '40px', padding: 0, fontSize: '0.75rem', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + R$ 10,00
                  </button>
                  <button type="button" onClick={() => handleQuickCash(20)} style={{ height: '40px', padding: 0, fontSize: '0.75rem', backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + R$ 20,00
                  </button>
                  <button type="button" onClick={() => handleQuickCash(50)} style={{ height: '40px', padding: 0, fontSize: '0.75rem', backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + R$ 50,00
                  </button>
                  <button type="button" onClick={() => handleQuickCash(100)} style={{ height: '40px', padding: 0, fontSize: '0.75rem', backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + R$ 100,00
                  </button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleTecladoPress(num)}
                    style={{
                      height: '52px',
                      fontSize: '1.4rem',
                      fontWeight: 'bold',
                      backgroundColor: '#f3f4f6',
                      color: '#1f2937',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleTecladoPress('Clear')}
                  style={{
                    height: '52px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    backgroundColor: '#fee2e2',
                    color: '#ef4444',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  LIMPAR
                </button>
                <button
                  type="button"
                  onClick={() => handleTecladoPress('0')}
                  style={{
                    height: '52px',
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    backgroundColor: '#f3f4f6',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleTecladoPress('Backspace')}
                  style={{
                    height: '52px',
                    fontSize: '1.3rem',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ⌫
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {qwertyRows.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                  {row.map(keyVal => {
                    const isShift = keyVal === 'Shift';
                    const isBackspace = keyVal === 'Backspace';
                    const displayVal = isShift ? (tecladoCaps ? '⇧' : '⇧') : isBackspace ? '⌫' : (tecladoCaps ? keyVal : keyVal.toLowerCase());
                    
                    let bg = '#f3f4f6';
                    let fg = '#1f2937';
                    let border = '1px solid #e5e7eb';
                    let fontSize = '1rem';

                    if (isShift) {
                      bg = tecladoCaps ? '#eef2ff' : '#f3f4f6';
                      fg = tecladoCaps ? '#4f46e5' : '#4b5563';
                      border = tecladoCaps ? '1px solid #c7d2fe' : '1px solid #e5e7eb';
                    }

                    return (
                      <button
                        key={keyVal}
                        type="button"
                        onClick={() => handleTecladoPress(keyVal)}
                        style={{
                          height: '46px',
                          flex: isShift || isBackspace ? 1.4 : 1,
                          padding: 0,
                          fontSize: fontSize,
                          fontWeight: 'bold',
                          backgroundColor: bg,
                          color: fg,
                          border: border,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                      >
                        {displayVal}
                      </button>
                    );
                  })}
                </div>
              ))}
              
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={() => handleTecladoPress('Clear')}
                  style={{
                    height: '46px',
                    flex: 2,
                    padding: 0,
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    backgroundColor: '#fee2e2',
                    color: '#ef4444',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  LIMPAR
                </button>
                <button
                  type="button"
                  onClick={() => handleTecladoPress('Space')}
                  style={{
                    height: '46px',
                    flex: 6,
                    padding: 0,
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    backgroundColor: '#f3f4f6',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  ESPAÇO
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.activeElement?.blur();
                    setCampoFocado(null);
                  }}
                  style={{
                    height: '46px',
                    flex: 2,
                    padding: 0,
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    border: '1px solid #c7d2fe',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    carregarDadosBase();
    return () => fecharLeitor();
  }, []);

  useEffect(() => {
    if (modoPagamento && formaSelecionada.toUpperCase() === 'DINHEIRO') {
      setTimeout(() => {
        if (valorRecebidoRef.current) {
          valorRecebidoRef.current.focus();
        }
        setCampoFocado('recebido');
      }, 50);
    }
  }, [modoPagamento, formaSelecionada]);

  useEffect(() => {
    if (modoPagamento && mostrarDescontoGlobal) {
      setTimeout(() => {
        if (tipoDescontoGlobal === 'valor' && descontoGlobalValorRef.current) {
          descontoGlobalValorRef.current.focus();
        } else if (tipoDescontoGlobal === 'porcentagem' && descontoGlobalPercRef.current) {
          descontoGlobalPercRef.current.focus();
        }
        setCampoFocado(tipoDescontoGlobal === 'valor' ? 'descontoGlobalValor' : 'descontoGlobalPerc');
      }, 50);
    }
  }, [modoPagamento, mostrarDescontoGlobal, tipoDescontoGlobal]);

  async function carregarDadosBase() {
    const { data: prods } = await supabase.from('produtos').select('*').eq('ativo', true);
    if (prods) setProdutosTotais(prods);

    const { data: formas } = await supabase.from('formas_pagamento').select('nome').eq('ativo', true).order('nome');
    if (formas) setFormasPagamento(formas);
  }

  const mascaraMoeda = (valor) => {
    if (valor === '' || valor === undefined || valor === null) return '';
    let v = String(valor).replace(/\D/g, ""); 
    if (v === '') return '';
    return (Number(v) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const parseMoeda = (valor) => {
    if (!valor) return 0;
    const cleanString = String(valor).replace(/[^\d,]/g, '');
    return parseFloat(cleanString.replace(',', '.')) || 0;
  };

  const formatarMoedaExibicao = (valorNumber) => {
    return Number(valorNumber).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  const formatarHora = (dataString) => {
    return new Date(dataString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const qtdTotalItens = carrinho.reduce((acc, item) => acc + item.quantidadeVenda, 0);
  const totalSub = carrinho.reduce((acc, item) => acc + ((item.preco * item.quantidadeVenda) - item.desconto), 0);

  let descGlobalFormatado = 0;
  if (mostrarDescontoGlobal) {
    if (tipoDescontoGlobal === 'valor') {
      descGlobalFormatado = parseMoeda(descontoGlobalValorStr);
    } else {
      descGlobalFormatado = totalSub * ((Number(descontoGlobalPercStr) || 0) / 100);
    }
  }
  const totalFinal = totalSub - descGlobalFormatado > 0 ? totalSub - descGlobalFormatado : 0;
  const troco = parseMoeda(valorRecebido) - totalFinal;

  const handleBuscaAoVivo = (e) => {
    const valor = e.target.value;
    setTermoBusca(valor);
    if (!valor.trim()) { setResultadosBusca([]); return; }
    const encontrados = produtosTotais.filter(p => 
      (p.codigo_barras === valor) || (p.codigo_interno?.toLowerCase() === valor.toLowerCase()) || p.descricao.toLowerCase().includes(valor.toLowerCase())
    );
    setResultadosBusca(encontrados);
  };

  const adicionarAoCarrinho = (produto) => {
    if (produto.estoque <= 0) return mostrarToast(`Sem estoque: ${produto.descricao}`, 'erro');

    // --- INÍCIO DO INCREMENTO: VALIDAÇÃO DE VALIDADE ---
    if (produto.validade) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas o dia

      // Adiciona T12:00:00 para evitar problemas de fuso horário que adiantam o dia
      const dataValidade = new Date(`${produto.validade}T12:00:00`); 
      dataValidade.setHours(0, 0, 0, 0);

      // Calcula a diferença em dias
      const diffTime = dataValidade - hoje;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return mostrarToast(`ATENÇÃO: Produto VENCIDO! (${produto.descricao})`, 'erro');
      } else if (diffDays <= 7) {
        mostrarToast(`AVISO: ${produto.descricao} vence em ${diffDays} dia(s)!`, 'erro'); // Alerta, mas não bloqueia a venda
      }
    }
    // --- FIM DO INCREMENTO ---
    
    const copia = [...carrinho];
    const index = copia.findIndex(i => i.id === produto.id);
    if (index >= 0) {
      if (copia[index].quantidadeVenda >= produto.estoque) return mostrarToast('Limite de estoque atingido.', 'erro');
      copia[index].quantidadeVenda += 1;
    } else {
      copia.push({ ...produto, quantidadeVenda: 1, desconto: 0 });
    }
    setCarrinho(copia);
    mostrarToast('Adicionado!', 'sucesso');
    setTermoBusca('');
    setResultadosBusca([]);
  };

  const abrirLeitor = () => {
    setIsScanning(true);
    
    setTimeout(() => {
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner("reader-pdv", { fps: 10, qrbox: 250 }, false);
        scannerRef.current.render((texto) => {
          fecharLeitor();
          const prod = produtosTotais.find(p => p.codigo_barras === texto);
          if (prod) adicionarAoCarrinho(prod);
          else mostrarToast('Produto não cadastrado.', 'erro');
        }, () => {});
      }

      tradutorIntervalRef.current = setInterval(() => {
        const elementos = document.querySelectorAll('#reader-pdv span, #reader-pdv button, #reader-pdv a, #reader-pdv div');
        elementos.forEach(el => {
          if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
            const texto = el.innerText.trim();
            if (texto === 'Request Camera Permissions' || texto === 'Request camera permissions') el.innerText = 'Permitir Acesso à Câmera';
            else if (texto === 'Scan an Image File') el.innerText = 'Ler a partir de uma foto';
            else if (texto === 'Scan using camera directly') el.innerText = 'Ler usando a câmera';
            else if (texto === 'Start Scanning') el.innerText = 'Iniciar Leitura';
            else if (texto === 'Stop Scanning') el.innerText = 'Parar Leitura';
            else if (texto === 'Choose Image' || texto === 'Choose Image - No file chosen') el.innerText = 'Escolher Arquivo';
            else if (texto === 'No camera found') el.innerText = 'Nenhuma câmera encontrada';
          }
        });
      }, 300);

    }, 200);
  };

  function fecharLeitor() {
    if (tradutorIntervalRef.current) clearInterval(tradutorIntervalRef.current);
    if (scannerRef.current) { scannerRef.current.clear().catch(()=>{}); scannerRef.current = null; }
    setIsScanning(false);
  }

  const abrirEdicao = (index) => {
    const item = carrinho[index];
    setModalEditar({
      index,
      descricao: item.descricao,
      preco: item.preco,
      estoqueMax: item.estoque,
      quantidadeVenda: item.quantidadeVenda,
      descontoStr: mascaraMoeda(item.desconto ? item.desconto.toFixed(2).replace('.', '') : '')
    });
  };

  const aplicarDescontoRapido = (percentual) => {
    const totalItemAntesDesc = modalEditar.preco * modalEditar.quantidadeVenda;
    const descValor = totalItemAntesDesc * (percentual / 100);
    setModalEditar({ ...modalEditar, descontoStr: mascaraMoeda(descValor.toFixed(2).replace('.', '')) });
  };

  const salvarEdicaoItem = () => {
    const descValor = parseMoeda(modalEditar.descontoStr);
    const totalSemDesc = modalEditar.preco * modalEditar.quantidadeVenda;
    if (descValor >= totalSemDesc) return mostrarToast('Desconto não pode ser maior que o valor!', 'erro');

    const copia = [...carrinho];
    copia[modalEditar.index].quantidadeVenda = modalEditar.quantidadeVenda;
    copia[modalEditar.index].desconto = descValor;
    setCarrinho(copia);
    setModalEditar(null);
  };

  const finalizarVenda = async (e) => {
    e.preventDefault();
    if (!formaSelecionada) return mostrarToast('Selecione uma forma de pagamento.', 'erro');
    setLoading(true);

    const isDinheiro = formaSelecionada.toUpperCase() === 'DINHEIRO';
    const valorRecebidoFinal = isDinheiro ? parseMoeda(valorRecebido) : totalFinal;
    const trocoFinal = (isDinheiro && troco > 0) ? troco : 0;

    const { data: lancData, error: lancError } = await supabase.from('lancamentos').insert([{
      tipo: 'ENTRADA',
      descricao: 'VENDA', 
      valor: totalFinal,
      desconto: descGlobalFormatado,
      valor_recebido: valorRecebidoFinal,
      troco: trocoFinal,
      forma_pagamento: formaSelecionada,
      sessao_id: sessaoCaixa.id
    }]).select();

    if (!lancError) {
      const lancamentoId = lancData[0].id;
      const promessas = carrinho.map(async (item) => {
        await supabase.from('itens_venda').insert([{
          lancamento_id: lancamentoId, produto_id: item.id, quantidade: item.quantidadeVenda,
          preco_unitario: item.preco, desconto: item.desconto, subtotal: (item.preco * item.quantidadeVenda) - item.desconto
        }]);
        await supabase.from('produtos').update({ estoque: item.estoque - item.quantidadeVenda }).eq('id', item.id);
      });
      await Promise.all(promessas);
      mostrarToast('VENDA FINALIZADA!', 'sucesso');
      setCarrinho([]); 
      setModoPagamento(false); 
      setValorRecebido(''); 
      setFormaSelecionada('');
    } else {
      mostrarToast('Erro ao salvar venda.', 'erro');
    }
    setLoading(false);
  };

  const salvarOperacaoCaixa = async (e) => {
    e.preventDefault();
    const valorNum = parseMoeda(valorOperacao);
    if (valorNum <= 0) return mostrarToast('Valor inválido.', 'erro');

    if (modalOperacaoFisica === 'SANGRIA' || modalOperacaoFisica === 'SAIDA') {
      setLoading(true);
      const { data, error } = await supabase.from('lancamentos').select('tipo, valor').eq('sessao_id', sessaoCaixa.id);
      
      let saldoAtual = Number(sessaoCaixa.valor_abertura);
      if (data && !error) {
        data.forEach(l => {
          if (l.tipo === 'ENTRADA' || l.tipo === 'REFORCO') saldoAtual += Number(l.valor);
          if (l.tipo === 'SAIDA' || l.tipo === 'SANGRIA') saldoAtual -= Number(l.valor);
        });
      }

      if (valorNum > saldoAtual) {
        mostrarToast(`Saldo insuficiente na gaveta! Máximo permitido para retirada: R$ ${formatarMoedaExibicao(saldoAtual)}`, 'erro');
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from('lancamentos').insert([{
      tipo: modalOperacaoFisica,
      descricao: `${modalOperacaoFisica}: ${obsOperacao || 'Sem obs.'}`,
      valor: valorNum,
      sessao_id: sessaoCaixa.id
    }]);

    if (!error) {
      mostrarToast('Operação registrada!', 'sucesso');
      setModalOperacaoFisica(null); 
      setValorOperacao(''); 
      setObsOperacao('');
    } else {
      mostrarToast('Erro na operação.', 'erro');
    }
    setLoading(false);
  };

  // ==========================================
  // PREPARAÇÃO INTELIGENTE DO FECHAMENTO DE CAIXA
  // ==========================================
  const prepararFechamento = async () => {
    setLoading(true);
    setValorContadoFechamento('');
    
    const { data, error } = await supabase.from('lancamentos').select('tipo, valor, forma_pagamento').eq('sessao_id', sessaoCaixa.id);
    
    let totalEntradasDinheiro = 0;
    let totalEntradasOutros = 0;
    let totalSaidas = 0;

    if (data && !error) {
      data.forEach(l => {
        if (l.tipo === 'REFORCO') {
            totalEntradasDinheiro += Number(l.valor);
        } else if (l.tipo === 'ENTRADA') {
            // Verifica se a forma de pagamento é DINHEIRO (ignora cartões e PIX para o saldo da gaveta)
            if (l.forma_pagamento && l.forma_pagamento.toUpperCase().includes('DINHEIRO')) {
                totalEntradasDinheiro += Number(l.valor);
            } else {
                totalEntradasOutros += Number(l.valor);
            }
        } else if (l.tipo === 'SAIDA' || l.tipo === 'SANGRIA') {
            totalSaidas += Number(l.valor);
        }
      });
    }

    const valorAbertura = Number(sessaoCaixa.valor_abertura);
    const esperadoGaveta = valorAbertura + totalEntradasDinheiro - totalSaidas;

    setResumoFechamento({
      abertura: valorAbertura,
      entradasDinheiro: totalEntradasDinheiro,
      entradasOutros: totalEntradasOutros,
      saidas: totalSaidas,
      esperado: esperadoGaveta
    });

    setModalGerenciar(false);
    setModalFechamento(true);
    setLoading(false);
  };

  const encerrarTurno = async () => {
    if (valorContadoFechamento.trim() === '') {
      mostrarToast('Por favor, informe o valor contado na gaveta antes de finalizar.', 'erro');
      return;
    }

    setLoading(true);
    const valorFechamentoNum = parseMoeda(valorContadoFechamento);

    const { error } = await supabase.from('caixas_sessoes').update({
      status: 'FECHADO',
      data_fechamento: new Date().toISOString(),
      valor_fechamento: valorFechamentoNum
    }).eq('id', sessaoCaixa.id);

    if (!error) {
      mostrarToast('CAIXA ENCERRADO COM SUCESSO!', 'sucesso');
      onCaixaFechado(); 
    } else {
      mostrarToast('Erro ao fechar caixa.', 'erro');
    }
    setLoading(false);
  };

  const carregarLancamentosSessao = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('lancamentos')
      .select('*, caixas_sessoes(usuarios(nome))')
      .eq('sessao_id', sessaoCaixa.id)
      .order('data_hora', { ascending: false });

    if (!error && data) setLancamentosSessao(data);
    setLoading(false);
  };

  const abrirDetalhes = async (lanc) => {
    setModalDetalhes(lanc);
    setItensDetalhe([]);
    
    if (lanc.tipo === 'ENTRADA') {
      setBuscandoItens(true);
      const { data, error } = await supabase
        .from('itens_venda')
        .select(`
          quantidade, preco_unitario, desconto, subtotal,
          produtos (descricao)
        `)
        .eq('lancamento_id', lanc.id);
        
      if (!error && data) setItensDetalhe(data);
      setBuscandoItens(false);
    }
  };

  const lancamentosFiltrados = lancamentosSessao.filter(l => {
    if (filtroTipo === 'ENTRADA') return l.tipo === 'ENTRADA' || l.tipo === 'REFORCO';
    if (filtroTipo === 'SAIDA') return l.tipo === 'SAIDA' || l.tipo === 'SANGRIA';
    return true; 
  });

  const totalFiltrado = lancamentosFiltrados.reduce((acc, l) => {
    if (filtroTipo === 'TODOS') {
      if (l.tipo === 'ENTRADA' || l.tipo === 'REFORCO') return acc + Number(l.valor);
      if (l.tipo === 'SAIDA' || l.tipo === 'SANGRIA') return acc - Number(l.valor);
    }
    return acc + Number(l.valor);
  }, 0);

  const getEstiloPagamento = (nome, selecionado) => {
    const nomeUpper = nome.toUpperCase();
    let corBase = '#6b7280'; 

    if (nomeUpper.includes('DINHEIRO')) corBase = '#10b981'; 
    else if (nomeUpper.includes('PIX')) corBase = '#0ea5e9'; 
    else if (nomeUpper.includes('CRÉDITO') || nomeUpper.includes('CREDITO')) corBase = '#8b5cf6'; 
    else if (nomeUpper.includes('DÉBITO') || nomeUpper.includes('DEBITO')) corBase = '#3b82f6'; 

    if (selecionado) {
      return { backgroundColor: corBase, color: 'white', border: `2px solid ${corBase}`, boxShadow: `0 4px 10px ${corBase}50`, transform: 'scale(1.02)' };
    } else {
      return { backgroundColor: 'white', color: '#374151', border: `2px solid #e5e7eb`, boxShadow: 'none', transform: 'none' };
    }
  };

  const renderConteudoModoPagamento = () => {
    return (
      <form onSubmit={finalizarVenda} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', height: '100%' }}>
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* TOTAL A RECEBER Box */}
          <div style={{ backgroundColor: '#10b981', color: 'white', padding: '15px 20px', borderRadius: '16px', textAlign: 'center', flexShrink: 0 }}>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0 }}>TOTAL A RECEBER</p>
            {descGlobalFormatado > 0 && <p style={{ textDecoration: 'line-through', opacity: 0.7, fontSize: '0.85rem', margin: '2px 0 0 0' }}>De: R$ {formatarMoedaExibicao(totalSub)}</p>}
            <h1 style={{ fontSize: '2rem', margin: '2px 0 0 0' }}>R$ {formatarMoedaExibicao(totalFinal)}</h1>
          </div>

          {/* DESCONTO NA VENDA Section */}
          {!mostrarDescontoGlobal ? (
            <button 
              type="button" 
              onClick={() => {
                setMostrarDescontoGlobal(true);
                setTipoDescontoGlobal('valor');
                setCampoFocado('descontoGlobalValor');
              }} 
              className="btn-secundario" 
              style={{ color: '#10b981', borderStyle: 'dashed', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexShrink: 0 }}
            >
              <IconPlus color="#10b981" /> DESCONTO NA VENDA
            </button>
          ) : (
            <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <LabelCampo>Desconto</LabelCampo>
                <button 
                  type="button" 
                  onClick={() => { 
                    setMostrarDescontoGlobal(false); 
                    setDescontoGlobalValorStr(''); 
                    setDescontoGlobalPercStr(''); 
                    setCampoFocado(null);
                  }} 
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  REMOVER DESCONTO
                </button>
              </div>
              <div style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setTipoDescontoGlobal('valor');
                    setCampoFocado('descontoGlobalValor');
                  }} 
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', backgroundColor: tipoDescontoGlobal === 'valor' ? '#4f46e5' : '#e5e7eb', color: tipoDescontoGlobal === 'valor' ? 'white' : '#374151', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  R$ (Valor)
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setTipoDescontoGlobal('porcentagem');
                    setCampoFocado('descontoGlobalPerc');
                  }} 
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', backgroundColor: tipoDescontoGlobal === 'porcentagem' ? '#4f46e5' : '#e5e7eb', color: tipoDescontoGlobal === 'porcentagem' ? 'white' : '#374151', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  % (Porcentagem)
                </button>
              </div>
              {tipoDescontoGlobal === 'valor' ? 
                <input
                  type="text"
                  ref={descontoGlobalValorRef}
                  placeholder="0,00"
                  value={descontoGlobalValorStr}
                  onChange={e => setDescontoGlobalValorStr(mascaraMoeda(e.target.value))}
                  className="input-padrao"
                  style={{
                    marginTop: '8px',
                    border: (isTabletLandscape && campoFocado === 'descontoGlobalValor') ? '2px solid #4f46e5' : '1px solid #d1d5db',
                    boxShadow: (isTabletLandscape && campoFocado === 'descontoGlobalValor') ? '0 0 0 3px rgba(79, 70, 229, 0.2)' : 'none',
                    height: '40px',
                    fontSize: '0.9rem'
                  }}
                  inputMode={isTabletLandscape ? "none" : "numeric"}
                  onFocus={() => setCampoFocado('descontoGlobalValor')}
                /> :
                <input
                  type="number"
                  ref={descontoGlobalPercRef}
                  placeholder="%"
                  value={descontoGlobalPercStr}
                  onChange={e => setDescontoGlobalPercStr(e.target.value)}
                  className="input-padrao"
                  style={{
                    marginTop: '8px',
                    border: (isTabletLandscape && campoFocado === 'descontoGlobalPerc') ? '2px solid #4f46e5' : '1px solid #d1d5db',
                    boxShadow: (isTabletLandscape && campoFocado === 'descontoGlobalPerc') ? '0 0 0 3px rgba(79, 70, 229, 0.2)' : 'none',
                    height: '40px',
                    fontSize: '0.9rem'
                  }}
                  inputMode="none"
                  onFocus={(e) => {
                    setCampoFocado('descontoGlobalPerc');
                    if (isTabletLandscape) e.target.blur();
                  }}
                />
              }
            </div>
          )}
          
          {/* FORMA DE PAGAMENTO Section */}
          <div style={{ flexShrink: 0 }}>
            <LabelCampo>Selecione a Forma de Pagamento:</LabelCampo>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px', flexShrink: 0 }}>
            {formasPagamento.map(f => {
              const isSelecionado = formaSelecionada === f.nome;
              const estilo = getEstiloPagamento(f.nome, isSelecionado);

              return (
                <button
                  key={f.nome}
                  type="button"
                  onClick={() => {
                    setFormaSelecionada(f.nome);
                    if (f.nome.toUpperCase() === 'DINHEIRO') {
                      setCampoFocado('recebido');
                    } else {
                      if (campoFocado === 'recebido') {
                        setCampoFocado(null);
                      }
                    }
                  }}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    margin: 0,
                    height: '40px',
                    boxSizing: 'border-box',
                    ...estilo
                  }}
                >
                  {f.nome.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* VALOR RECEBIDO Section (If Dinheiro) */}
          {formaSelecionada.toUpperCase() === 'DINHEIRO' && (
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <LabelCampo>Valor Recebido do Cliente (Em mãos)</LabelCampo>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'white',
                border: (isTabletLandscape && campoFocado === 'recebido') ? '2px solid #4f46e5' : '1px solid #10b981',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: (isTabletLandscape && campoFocado === 'recebido') ? '0 0 0 3px rgba(79, 70, 229, 0.2)' : '0 0 0 2px rgba(16, 185, 129, 0.2)',
                height: '44px'
              }}>
                <span style={{ padding: '0 12px', fontWeight: 'bold', color: (isTabletLandscape && campoFocado === 'recebido') ? '#4f46e5' : '#10b981', fontSize: '0.9rem' }}>R$</span>
                <input
                  type="text"
                  ref={valorRecebidoRef}
                  placeholder="0,00"
                  value={valorRecebido}
                  onChange={e => setValorRecebido(mascaraMoeda(e.target.value))}
                  onFocus={() => setCampoFocado('recebido')}
                  style={{ flex: 1, border: 'none', padding: '10px 10px 10px 0', outline: 'none', fontSize: '1.1rem', fontWeight: 'bold' }}
                  required
                  inputMode={isTabletLandscape ? "none" : "numeric"}
                />
              </div>
              
              <div style={{ backgroundColor: troco > 0 ? '#eef2ff' : '#f9fafb', padding: '10px 12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '40px', boxSizing: 'border-box' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>TROCO A DEVOLVER:</span>
                <strong style={{ fontSize: '1.2rem', color: troco > 0 ? '#4f46e5' : '#9ca3af' }}>R$ {troco > 0 ? formatarMoedaExibicao(troco) : '0,00'}</strong>
              </div>
            </div>
          )}

        </div>

        {/* Voltar e Confirmar Venda Fixed Footer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid #e5e7eb', flexShrink: 0 }}>
          <button type="button" className="btn-secundario" onClick={() => { setModoPagamento(false); setCampoFocado(null); }} style={{ height: '48px', margin: 0, fontSize: '0.9rem' }}>Voltar</button>
          <button type="submit" className="btn-entrada" disabled={loading} style={{ height: '48px', margin: 0, fontSize: '0.9rem' }}>CONFIRMAR VENDA</button>
        </div>
      </form>
    );
  };

  // ==========================================
  // RENDERIZAÇÃO DO MODO CAIXA PRINCIPAL
  // ==========================================
  return (
    <div style={{
      display: 'flex',
      flexDirection: isTabletLandscape ? 'row' : 'column',
      width: '100%',
      height: 'calc(100vh - 100px)',
      backgroundColor: 'transparent',
      overflow: 'hidden',
      boxSizing: 'border-box',
      margin: '0 auto',
      maxWidth: isTabletLandscape ? '100%' : '560px',
      justifyContent: 'center'
    }}>
      <main className="tela" style={{ 
        flex: isTabletLandscape ? '0 0 45%' : 1, 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '15px',
        position: 'relative',
        overflowY: 'hidden',
        height: '100%',
        margin: isTabletLandscape ? 0 : '0 auto',
        boxSizing: 'border-box',
        maxWidth: isTabletLandscape ? 'none' : '560px',
        width: '100%'
      }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexShrink: 0 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: modoPagamento ? '#10b981' : '#4b5563', margin: 0, fontSize: '1.4rem' }}>
          {modoPagamento ? 'FINALIZAR VENDA' : <><IconCaixa /> FRENTE DE CAIXA</>}
        </h2>
        {!modoPagamento && (
          <button onClick={() => setModalGerenciar(true)} disabled={loading} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontWeight: 'bold', fontSize: '0.8rem', height: 'auto' }}>
            <IconSettings /> OPÇÕES DO CAIXA
          </button>
        )}
      </div>

      {/* MODAL DE GESTÃO */}
      {modalGerenciar && (
        <Overlay absolute={isTabletLandscape}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '20px', width: '90%', maxWidth: '350px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Menu do Caixa</h3>
              <button onClick={() => setModalGerenciar(false)} style={{ background: 'none', border: 'none' }}><IconClose color="#9ca3af" /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => { setModalGerenciar(false); setValorOperacao(''); setObsOperacao(''); setModalOperacaoFisica('REFORCO'); }} className="btn-secundario" style={{ margin: 0, justifyContent: 'flex-start', padding: '15px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconArrowDownCircle color="#10b981" /> Reforço (Colocar Troco)
              </button>
              <button onClick={() => { setModalGerenciar(false); setValorOperacao(''); setObsOperacao(''); setModalOperacaoFisica('SANGRIA'); }} className="btn-secundario" style={{ margin: 0, justifyContent: 'flex-start', padding: '15px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconArrowUpCircle color="#ef4444" /> Sangria (Retirar Valor)
              </button>
              <button onClick={() => { setModalGerenciar(false); setValorOperacao(''); setObsOperacao(''); setModalOperacaoFisica('SAIDA'); }} className="btn-secundario" style={{ margin: 0, justifyContent: 'flex-start', padding: '15px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconReceipt color="#4b5563" /> Registrar Despesa
              </button>
              
              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '5px 0' }} />
              
              <button onClick={() => { setModalGerenciar(false); carregarLancamentosSessao(); setModalLancamentos(true); }} className="btn-secundario" style={{ margin: 0, justifyContent: 'flex-start', padding: '15px', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '10px', borderColor: '#c7d2fe', backgroundColor: '#eef2ff' }}>
                <IconList color="#4f46e5" /> Ver Lançamentos
              </button>
              
              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '5px 0' }} />

              <button onClick={prepararFechamento} className="btn-entrada" style={{ margin: 0, backgroundColor: '#374151', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: 'none', boxShadow: 'none', marginTop: '5px' }}>
                <IconPower color="white" /> FECHAR CAIXA (Sair)
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* MODAL OPERACAO FISICA (REFORCO, SANGRIA, SAIDA) */}
      {modalOperacaoFisica && (
        <Overlay absolute={isTabletLandscape}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '20px', width: '90%', maxWidth: '350px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#374151', fontSize: '1.15rem', fontWeight: 'bold' }}>
                {modalOperacaoFisica === 'REFORCO' ? 'REFORÇO DE CAIXA' : modalOperacaoFisica === 'SANGRIA' ? 'SANGRIA DE CAIXA' : 'REGISTRAR DESPESA'}
              </h3>
              <button onClick={() => setModalOperacaoFisica(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><IconClose color="#9ca3af" /></button>
            </div>
            <form onSubmit={salvarOperacaoCaixa} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <LabelCampo>Valor da Operação (R$)</LabelCampo>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'white',
                border: (isTabletLandscape && campoFocado === 'valorOperacao') ? '2px solid #4f46e5' : '1px solid #d1d5db',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: (isTabletLandscape && campoFocado === 'valorOperacao') ? '0 0 0 3px rgba(79, 70, 229, 0.2)' : 'none'
              }}>
                <span style={{ padding: '0 15px', fontWeight: 'bold', color: '#6b7280' }}>R$</span>
                <input
                  type="text"
                  value={valorOperacao}
                  onChange={e => setValorOperacao(mascaraMoeda(e.target.value))}
                  onFocus={() => setCampoFocado('valorOperacao')}
                  style={{ flex: 1, border: 'none', padding: '15px 15px 15px 0', outline: 'none', fontSize: '1.2rem', fontWeight: 'bold' }}
                  required
                  placeholder="0,00"
                  inputMode={isTabletLandscape ? "none" : "numeric"}
                />
              </div>

              <LabelCampo>Descrição / Observação</LabelCampo>
              <input
                type="text"
                value={obsOperacao}
                onChange={e => setObsOperacao(e.target.value)}
                onFocus={() => setCampoFocado('obsOperacao')}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: (isTabletLandscape && campoFocado === 'obsOperacao') ? '2px solid #4f46e5' : '1px solid #d1d5db',
                  fontSize: '16px',
                  outline: 'none',
                  boxShadow: (isTabletLandscape && campoFocado === 'obsOperacao') ? '0 0 0 3px rgba(79, 70, 229, 0.2)' : 'none'
                }}
                placeholder="Ex: Troco inicial, Pagamento fornecedor"
                inputMode={isTabletLandscape ? "none" : undefined}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-secundario" onClick={() => setModalOperacaoFisica(null)} style={{ flex: 1, margin: 0, cursor: 'pointer' }}>CANCELAR</button>
                <button type="submit" className="btn-entrada" style={{ flex: 1, margin: 0, backgroundColor: modalOperacaoFisica === 'REFORCO' ? '#10b981' : '#ef4444', border: 'none', cursor: 'pointer' }} disabled={loading}>
                  {loading ? 'SALVANDO...' : 'CONFIRMAR'}
                </button>
              </div>
            </form>
          </div>
        </Overlay>
      )}

      {/* NOVO MODAL: LISTA DE LANÇAMENTOS DO CAIXA */}
      {modalLancamentos && !modalDetalhes && (
        <Overlay absolute={isTabletLandscape}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', width: '90%', maxWidth: '450px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconList color="#4f46e5" /> Transações do Turno
              </h3>
              <button onClick={() => setModalLancamentos(false)} style={{ background: 'none', border: 'none', padding: 0 }}><IconClose color="#9ca3af" /></button>
            </div>

            <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
              <button onClick={() => setFiltroTipo('TODOS')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: filtroTipo === 'TODOS' ? '#4f46e5' : '#f3f4f6', color: filtroTipo === 'TODOS' ? 'white' : '#4b5563', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>TODOS</button>
              <button onClick={() => setFiltroTipo('ENTRADA')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: filtroTipo === 'ENTRADA' ? '#10b981' : '#f3f4f6', color: filtroTipo === 'ENTRADA' ? 'white' : '#4b5563', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>ENTRADAS</button>
              <button onClick={() => setFiltroTipo('SAIDA')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: filtroTipo === 'SAIDA' ? '#ef4444' : '#f3f4f6', color: filtroTipo === 'SAIDA' ? 'white' : '#4b5563', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>SAÍDAS</button>
            </div>

            {!loading && (
              <div style={{ backgroundColor: filtroTipo === 'ENTRADA' ? '#ecfdf5' : filtroTipo === 'SAIDA' ? '#fef2f2' : '#eef2ff', padding: '12px 15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', border: `1px solid ${filtroTipo === 'ENTRADA' ? '#a7f3d0' : filtroTipo === 'SAIDA' ? '#fecaca' : '#c7d2fe'}` }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: filtroTipo === 'ENTRADA' ? '#047857' : filtroTipo === 'SAIDA' ? '#b91c1c' : '#4338ca' }}>
                     TOTAL {filtroTipo === 'TODOS' ? 'LÍQUIDO' : filtroTipo}:
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', fontWeight: '600' }}>
                    {lancamentosFiltrados.length} {lancamentosFiltrados.length === 1 ? 'registo' : 'registos'} na lista
                  </span>
                </div>
                <strong style={{ fontSize: '1.2rem', color: filtroTipo === 'ENTRADA' ? '#10b981' : filtroTipo === 'SAIDA' ? '#ef4444' : (totalFiltrado >= 0 ? '#4f46e5' : '#ef4444') }}>
                   {formatarMoeda(totalFiltrado)}
                </strong>
              </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
              {loading ? (
                <p style={{ textAlign: 'center', color: '#6b7280', margin: '20px 0' }}>A carregar transações...</p>
              ) : lancamentosFiltrados.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', margin: '20px 0' }}>Nenhum lançamento encontrado neste filtro.</p>
              ) : (
                lancamentosFiltrados.map(lanc => (
                  <div 
                    key={lanc.id} 
                    onClick={() => abrirDetalhes(lanc)}
                    style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', backgroundColor: (lanc.tipo === 'ENTRADA' || lanc.tipo === 'REFORCO') ? '#ecfdf5' : '#fef2f2', color: (lanc.tipo === 'ENTRADA' || lanc.tipo === 'REFORCO') ? '#10b981' : '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {lanc.tipo}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatarHora(lanc.data_hora)}</span>
                      </div>
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lanc.descricao}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>{lanc.forma_pagamento || 'N/A'}</span>
                        <span>•</span>
                        <span style={{ color: '#4f46e5', fontWeight: '600' }}>Op: {lanc.caixas_sessoes?.usuarios?.nome || 'Desconhecido'}</span>
                      </span>
                    </div>
                    <strong style={{ color: (lanc.tipo === 'ENTRADA' || lanc.tipo === 'REFORCO') ? '#10b981' : '#ef4444', fontSize: '1.1rem', flexShrink: 0 }}>
                      {(lanc.tipo === 'ENTRADA' || lanc.tipo === 'REFORCO') ? '+' : '-'}{formatarMoeda(lanc.valor)}
                    </strong>
                  </div>
                ))
              )}
            </div>
            
          </div>
        </Overlay>
      )}

      {/* MODAL: DETALHES DE UM LANÇAMENTO ESPECÍFICO */}
      {modalDetalhes && (
        <Overlay absolute={isTabletLandscape}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', width: '90%', maxWidth: '400px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
              <h3 style={{ color: '#374151', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><IconReceipt color="#4f46e5" /> Detalhes</h3>
              <button onClick={() => setModalDetalhes(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><IconClose color="#9ca3af" /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Data/Hora:</span>
                <strong style={{ color: '#374151', fontSize: '0.85rem' }}>{new Date(modalDetalhes.data_hora).toLocaleString('pt-BR')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Tipo:</span>
                <strong style={{ color: modalDetalhes.tipo === 'ENTRADA' ? '#10b981' : '#ef4444', fontSize: '0.85rem' }}>{modalDetalhes.tipo}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Pagamento:</span>
                <strong style={{ color: '#374151', fontSize: '0.85rem' }}>{modalDetalhes.forma_pagamento || 'Não info.'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Operador:</span>
                <strong style={{ color: '#374151', fontSize: '0.85rem' }}>{modalDetalhes.caixas_sessoes?.usuarios?.nome || 'Desconhecido'}</strong>
              </div>
              {modalDetalhes.descricao && (
                <div style={{ marginBottom: '15px', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Descrição / Origem:</span>
                  <strong style={{ color: '#374151', fontSize: '0.9rem' }}>{modalDetalhes.descricao}</strong>
                </div>
              )}

              {modalDetalhes.tipo === 'ENTRADA' && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#4b5563', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px', marginBottom: '10px' }}>PRODUTOS DA VENDA</h4>
                  {buscandoItens ? (
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' }}>A carregar produtos...</p>
                  ) : itensDetalhe.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}>Venda sem produtos avulsos ou lançamento manual antigo.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {itensDetalhe.map((item, i) => (
                        <div key={i} style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}>
                          <strong style={{ display: 'block', color: '#374151', marginBottom: '4px' }}>{item.produtos?.descricao || 'Produto Removido'}</strong>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6b7280' }}>{item.quantidade}x {formatarMoeda(item.preco_unitario)}</span>
                            <strong style={{ color: '#10b981' }}>{formatarMoeda(item.subtotal)}</strong>
                          </div>
                          {item.desconto > 0 && <span style={{ display: 'block', color: '#ef4444', fontSize: '0.75rem', marginTop: '2px' }}>Desc: -{formatarMoeda(item.desconto)}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', backgroundColor: modalDetalhes.tipo === 'ENTRADA' ? '#ecfdf5' : '#fef2f2', padding: '15px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Valor Bruto:</span>
                <strong style={{ color: '#374151' }}>{formatarMoeda(Number(modalDetalhes.valor) + Number(modalDetalhes.desconto || 0))}</strong>
              </div>
              {modalDetalhes.desconto > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>Desconto Global:</span>
                  <strong style={{ color: '#ef4444' }}>-{formatarMoeda(modalDetalhes.desconto)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '10px' }}>
                <strong style={{ color: '#374151', fontSize: '1rem' }}>TOTAL {modalDetalhes.tipo}:</strong>
                <strong style={{ color: modalDetalhes.tipo === 'ENTRADA' ? '#10b981' : '#ef4444', fontSize: '1.2rem' }}>
                  {formatarMoeda(modalDetalhes.valor)}
                </strong>
              </div>
              {modalDetalhes.troco > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Dinheiro Recebido: {formatarMoeda(modalDetalhes.valor_recebido)}</span>
                  <strong style={{ color: '#4f46e5', fontSize: '0.85rem' }}>Troco: {formatarMoeda(modalDetalhes.troco)}</strong>
                </div>
              )}
            </div>
            
            <button onClick={() => setModalDetalhes(null)} className="btn-secundario" style={{ margin: '15px 0 0 0' }}>VOLTAR PARA LISTA</button>
          </div>
        </Overlay>
      )}

      {/* MODAL PARA FECHAMENTO DE CAIXA */}
      {modalFechamento && resumoFechamento && (
        <Overlay absolute={isTabletLandscape}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '20px', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '15px', color: '#374151' }}>Resumo do Turno</h3>
            
            <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px', textAlign: 'left', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280' }}>Fundo Inicial:</span>
                <strong style={{ color: '#374151' }}>R$ {formatarMoedaExibicao(resumoFechamento.abertura)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#10b981' }}>(+) Entradas em Dinheiro/Reforço:</span>
                <strong style={{ color: '#10b981' }}>R$ {formatarMoedaExibicao(resumoFechamento.entradasDinheiro)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ color: '#ef4444' }}>(-) Saídas/Sangrias:</span>
                <strong style={{ color: '#ef4444' }}>R$ {formatarMoedaExibicao(resumoFechamento.saidas)}</strong>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px dashed #d1d5db' }}>
                <span style={{ fontWeight: 'bold', color: '#4b5563' }}>ESPERADO NA GAVETA (Físico):</span>
                <strong style={{ color: '#4f46e5', fontSize: '1.1rem' }}>R$ {formatarMoedaExibicao(resumoFechamento.esperado)}</strong>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', marginTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Outras Entradas (Cartão/Pix):</span>
                <strong style={{ color: '#6b7280', fontSize: '0.85rem' }}>R$ {formatarMoedaExibicao(resumoFechamento.entradasOutros)}</strong>
              </div>
            </div>

            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '10px' }}>Conte o <strong>dinheiro físico</strong> e informe abaixo:</p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: '12px',
              border: (isTabletLandscape && campoFocado === 'valorContadoFechamento') ? '2px solid #4f46e5' : '1px solid #d1d5db',
              overflow: 'hidden',
              marginBottom: '15px',
              boxShadow: (isTabletLandscape && campoFocado === 'valorContadoFechamento') ? '0 0 0 3px rgba(79, 70, 229, 0.2)' : 'none'
            }}>
               <span style={{ padding: '0 15px', fontWeight: 'bold', color: '#6b7280' }}>R$</span>
               <input
                 type="text"
                 value={valorContadoFechamento}
                 onChange={e => setValorContadoFechamento(mascaraMoeda(e.target.value))}
                 onFocus={() => setCampoFocado('valorContadoFechamento')}
                 style={{ flex: 1, border: 'none', padding: '15px 15px 15px 0', background: 'none', outline: 'none', fontSize: '1.3rem', fontWeight: 'bold' }}
                 placeholder="0,00"
                 inputMode={isTabletLandscape ? "none" : "numeric"}
               />
            </div>

            {valorContadoFechamento.trim() !== '' && (
              (() => {
                const contadoCents = Math.round(parseMoeda(valorContadoFechamento) * 100);
                const esperadoCents = Math.round(resumoFechamento.esperado * 100);
                const diffCents = contadoCents - esperadoCents;
                
                if (diffCents === 0) return <p style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><IconCheckCircle color="#10b981" /> Caixa bateu perfeitamente!</p>;
                
                if (diffCents > 0) return <p style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><IconPlus color="#10b981" /> Sobra de R$ {formatarMoedaExibicao(diffCents / 100)}</p>;
                
                return <p style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><IconAlertTriangle color="#ef4444" /> Quebra (Falta) de R$ {formatarMoedaExibicao(Math.abs(diffCents) / 100)}</p>;
              })()
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <button 
                  onClick={encerrarTurno} 
                  className="btn-entrada" 
                  style={{ 
                    margin: 0, 
                    backgroundColor: (loading || valorContadoFechamento.trim() === '') ? '#d1d5db' : '#ef4444', 
                    color: (loading || valorContadoFechamento.trim() === '') ? '#9ca3af' : 'white',
                    height: '55px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    cursor: (loading || valorContadoFechamento.trim() === '') ? 'not-allowed' : 'pointer'
                  }} 
                  disabled={loading || valorContadoFechamento.trim() === ''}
                >
                 <IconPower color={(loading || valorContadoFechamento.trim() === '') ? '#9ca3af' : 'white'} /> FINALIZAR E SAIR
               </button>
               <button onClick={() => { setModalFechamento(false); setValorContadoFechamento(''); }} className="btn-secundario" style={{ margin: 0 }} disabled={loading}>CANCELAR</button>
            </div>
          </div>
        </Overlay>
      )}

      {/* MODAL EDITAR ITEM */}
      {modalEditar !== null && (
        <Overlay absolute={isTabletLandscape}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', width: '90%', maxWidth: '350px' }}>
            <h3 style={{ color: '#374151', marginBottom: '15px', textAlign: 'center' }}>Ajustar Item</h3>
            <div style={{ backgroundColor: '#eef2ff', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
              <strong style={{ color: '#4f46e5', fontSize: '1.2rem', display: 'block', marginBottom: '10px', lineHeight: '1.2' }}>{modalEditar.descricao}</strong>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <span style={{ textDecoration: parseMoeda(modalEditar.descontoStr) > 0 ? 'line-through' : 'none', color: '#6b7280', fontSize: '0.9rem' }}>
                  R$ {formatarMoedaExibicao(modalEditar.preco * modalEditar.quantidadeVenda)}
                </span>
                {parseMoeda(modalEditar.descontoStr) > 0 && (
                  <>
                    <span style={{ color: '#9ca3af' }}>➔</span>
                    <strong style={{ color: '#10b981', fontSize: '1.2rem' }}>
                      R$ {formatarMoedaExibicao((modalEditar.preco * modalEditar.quantidadeVenda) - parseMoeda(modalEditar.descontoStr))}
                    </strong>
                  </>
                )}
              </div>
            </div>
            <LabelCampo>Quantidade</LabelCampo>
            <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: '20px', justifyContent: 'center' }}>
              <button onClick={() => setModalEditar({...modalEditar, quantidadeVenda: Math.max(1, modalEditar.quantidadeVenda - 1)})} style={{ width: '60px', height: '50px', borderRadius: '12px 0 0 12px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRight: 'none', color: '#374151', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><IconMinus color="#374151" /></button>
              <input type="number" readOnly value={modalEditar.quantidadeVenda} style={{ width: '80px', height: '50px', border: '1px solid #d1d5db', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', outline: 'none' }} inputMode="numeric" />
              <button onClick={() => setModalEditar({...modalEditar, quantidadeVenda: Math.min(modalEditar.estoqueMax, modalEditar.quantidadeVenda + 1)})} style={{ width: '60px', height: '50px', borderRadius: '0 12px 12px 0', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderLeft: 'none', color: '#374151', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><IconPlus color="#374151" /></button>
            </div>
            <LabelCampo>Desconto (R$)</LabelCampo>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              border: (isTabletLandscape && campoFocado === 'descontoItem') ? '2px solid #4f46e5' : '1px solid #d1d5db',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '10px',
              boxShadow: (isTabletLandscape && campoFocado === 'descontoItem') ? '0 0 0 3px rgba(79, 70, 229, 0.2)' : 'none'
            }}>
              <span style={{ paddingLeft: '15px', paddingRight: '10px', color: '#6b7280', fontWeight: 'bold' }}>R$</span>
              <input
                type="text"
                value={modalEditar.descontoStr}
                onChange={e => setModalEditar({...modalEditar, descontoStr: mascaraMoeda(e.target.value)})}
                onFocus={(e) => {
                  setCampoFocado('descontoItem');
                  if (isTabletLandscape) e.target.blur();
                }}
                placeholder="0,00"
                style={{ flex: 1, border: 'none', padding: '15px 15px 15px 0', outline: 'none', fontSize: '1.1rem', textAlign: 'center' }}
                inputMode="none"
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '5px', textAlign: 'center' }}>Aplicar desconto rápido (%)</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '20px' }}>
              {[5, 10, 15, 20, 25, 30, 40, 50].map(pct => (
                <button key={pct} onClick={() => aplicarDescontoRapido(pct)} style={{ flex: '1 0 20%', padding: '8px', backgroundColor: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem' }}>{pct}%</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setModalEditar(null)} className="btn-secundario" style={{ flex: 1, margin: 0 }}>CANCELAR</button>
              <button onClick={salvarEdicaoItem} className="btn-entrada" style={{ flex: 1, margin: 0, border: 'none' }}>SALVAR</button>
            </div>
          </div>
        </Overlay>
      )}

      {modoPagamento ? renderConteudoModoPagamento() : (
        <>
          {/* ÁREA DE BUSCA DE PRODUTOS */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Nome ou código..."
                value={termoBusca}
                onChange={handleBuscaAoVivo}
                onFocus={() => setCampoFocado('busca')}
                className="input-padrao"
                style={{
                  width: '100%',
                  margin: 0,
                  paddingRight: '40px',
                  height: '50px',
                  border: (isTabletLandscape && campoFocado === 'busca') ? '2px solid #4f46e5' : '1px solid #d1d5db',
                  boxShadow: (isTabletLandscape && campoFocado === 'busca') ? '0 0 0 3px rgba(79, 70, 229, 0.2)' : 'none'
                }}
                inputMode={isTabletLandscape ? "none" : undefined}
              />
              {termoBusca && <button onClick={() => {setTermoBusca(''); setResultadosBusca([]);}} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none' }}><IconClose color="#9ca3af" /></button>}
            </div>
            <button onClick={abrirLeitor} style={{ width: '100px', height: '100px', backgroundColor: '#374151', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none' }}><ScanBarcode size={22} color="white" /></button>
          </div>

          {resultadosBusca.length > 0 && (
            <div style={{ backgroundColor: 'white', border: '1px solid #4f46e5', borderRadius: '12px', padding: '10px', marginBottom: '15px', maxHeight: '180px', overflowY: 'auto', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              {resultadosBusca.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: '0.85rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.descricao}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>R$ {formatarMoedaExibicao(p.preco)} | Estq: {p.estoque}</span>
                  </div>
                  <button 
                    onClick={() => adicionarAoCarrinho(p)} 
                    style={{ backgroundColor: '#10b981', border: 'none', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}
                  >
                    <span style={{ color: 'white', fontSize: '26px', fontWeight: 'bold', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-2px' }}>+</span>
                  </button>            
                </div>
              ))}
            </div>
          )}

          {/* CARRINHO DE COMPRAS */}
          <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '10px' }}>
            {carrinho.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.3 }}><IconCart size="48" /><p>Carrinho vazio</p></div>
            ) : (
              carrinho.map((item, index) => (
                <div key={index} style={{ 
                  backgroundColor: 'white', 
                  padding: '6px 10px', 
                  borderRadius: '10px', 
                  marginBottom: '6px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => abrirEdicao(index)}>
                    <strong style={{ display: 'block', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#374151' }}>{item.descricao}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.quantidadeVenda}x R$ {formatarMoedaExibicao(item.preco)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#10b981', fontSize: '0.85rem' }}>R$ {formatarMoedaExibicao((item.preco * item.quantidadeVenda) - item.desconto)}</strong>
                    <button onClick={() => setModalRemover(index)} style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '5px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconTrash color="#ef4444" size="14" /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button onClick={() => setModoPagamento(true)} disabled={carrinho.length === 0} style={{ width: '100%', backgroundColor: carrinho.length === 0 ? '#d1d5db' : '#10b981', color: 'white', padding: '20px', borderRadius: '16px', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', border: 'none', marginTop: '15px' }}>
            <span>FINALIZAR ({qtdTotalItens})</span>
            <span>R$ {formatarMoedaExibicao(totalSub)}</span>
          </button>
        </>
      )}

      {isScanning && (
        <Overlay absolute={isTabletLandscape}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90%' }}>
            <h3 style={{ color: 'white', marginBottom: '15px' }}>Aponte a Câmera</h3>
            <div id="reader-pdv" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', padding: '10px', borderRadius: '12px' }}></div>
            <button onClick={fecharLeitor} style={{ backgroundColor: '#ef4444', color: 'white', padding: '15px 30px', borderRadius: '12px', marginTop: '20px', border: 'none', fontWeight: 'bold' }}>FECHAR CÂMERA</button>
          </div>
        </Overlay>
      )}

      {modalRemover !== null && (
        <Overlay absolute={isTabletLandscape}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '20px', width: '90%', maxWidth: '350px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><IconTrash color="#ef4444" size="40" /></div>
            <h3>Deseja realmente remover este item?</h3>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setModalRemover(null)} className="btn-secundario" style={{ flex: 1, margin: 0 }}>NÃO</button>
              <button onClick={() => { const c = [...carrinho]; c.splice(modalRemover, 1); setCarrinho(c); setModalRemover(null); }} className="btn-entrada" style={{ flex: 1, margin: 0, backgroundColor: '#ef4444' }}>SIM</button>
            </div>
          </div>
        </Overlay>
      )}
      </main>

      {isTabletLandscape && (
        <div style={{
          width: '55%',
          flex: '0 0 55%',
          minWidth: 0,
          minHeight: 0,
          borderLeft: '1px solid #e5e7eb',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto',
          boxSizing: 'border-box',
          padding: '15px'
        }}>
          {renderTecladoVirtual()}
        </div>
      )}
    </div>
  );
}