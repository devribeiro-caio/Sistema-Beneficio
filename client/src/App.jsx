import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDownUp, Building2, Check, ChevronDown, CircleDollarSign, ClipboardList, Coffee, Edit3, Filter, LayoutDashboard, Plus, Search, ShieldAlert, Trash2, Users, X } from 'lucide-react';

const API = `${window.benefitsDesktop?.isDesktop ? 'http://127.0.0.1:4317' : ''}/api`;
const currency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const emptyEmployee = { name: '', role: '', company: '', benefits: { va: { value: 0, status: 'Não' }, vr: { value: 0, status: 'Não' }, cesta: 'Não' } };

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  if (!response.ok) { const result = await response.json().catch(() => ({})); throw new Error(result.message || 'Não foi possível concluir a operação.'); }
  return response.status === 204 ? null : response.json();
}

export default function App() {
  const [companies, setCompanies] = useState([]), [employees, setEmployees] = useState([]), [allEmployees, setAllEmployees] = useState([]);
  const [summary, setSummary] = useState({ employees: 0, va: 0, vr: 0, total: 0, withMoney: 0, cesta: 0 });
  const [companyFilter, setCompanyFilter] = useState('all'), [search, setSearch] = useState('');
  const [modal, setModal] = useState(null), [employeeForm, setEmployeeForm] = useState(emptyEmployee);
  const [companyForm, setCompanyForm] = useState({ name: '', shortName: '', color: '#13a9d2' }), [editingCompany, setEditingCompany] = useState(null);
  const [busy, setBusy] = useState(true), [saving, setSaving] = useState(false), [notice, setNotice] = useState(''), [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setBusy(true); setError('');
    try {
      const params = new URLSearchParams({ ...(companyFilter !== 'all' ? { company: companyFilter } : {}), ...(search ? { search } : {}) });
      const [companyRows, employeeRows, totals, allRows] = await Promise.all([
        api('/companies'), api(`/employees?${params}`), api(`/summary${companyFilter !== 'all' ? `?company=${companyFilter}` : ''}`), api('/employees')
      ]);
      setCompanies(companyRows); setEmployees(employeeRows); setSummary(totals); setAllEmployees(allRows);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }, [companyFilter, search]);
  useEffect(() => { const timer = setTimeout(refresh, 180); return () => clearTimeout(timer); }, [refresh]);
  useEffect(() => { if (!notice) return undefined; const timer = setTimeout(() => setNotice(''), 3000); return () => clearTimeout(timer); }, [notice]);

  const companyCounts = useMemo(() => Object.fromEntries(companies.map((company) => [company._id, allEmployees.filter((employee) => employee.company?._id === company._id).length])), [companies, allEmployees]);
  function openNewEmployee() { setEmployeeForm({ ...emptyEmployee, company: companyFilter !== 'all' ? companyFilter : companies[0]?._id || '' }); setModal({ type: 'employee', employee: null }); }
  function openEditEmployee(employee) {
    setEmployeeForm({ name: employee.name, role: employee.role, company: employee.company?._id || '', benefits: { va: { value: employee.benefits?.va?.value || 0, status: employee.benefits?.va?.status || 'Não' }, vr: { value: employee.benefits?.vr?.value || 0, status: employee.benefits?.vr?.status || 'Não' }, cesta: employee.benefits?.cesta || 'Não' } });
    setModal({ type: 'employee', employee });
  }
  async function saveEmployee(event) {
    event.preventDefault(); setSaving(true);
    try { await api(modal.employee ? `/employees/${modal.employee._id}` : '/employees', { method: modal.employee ? 'PUT' : 'POST', body: JSON.stringify(employeeForm) }); setModal(null); setNotice(modal.employee ? 'Cadastro atualizado.' : 'Colaborador cadastrado.'); await refresh(); }
    catch (err) { setError(err.message); } finally { setSaving(false); }
  }
  async function deleteEmployee(employee) {
    if (!window.confirm(`Excluir o cadastro de ${employee.name}?`)) return;
    try { await api(`/employees/${employee._id}`, { method: 'DELETE' }); setNotice('Cadastro removido.'); await refresh(); } catch (err) { setError(err.message); }
  }
  function openCompanyForm(company = null) { setEditingCompany(company); setCompanyForm(company ? { name: company.name, shortName: company.shortName, color: company.color } : { name: '', shortName: '', color: '#13a9d2' }); setModal({ type: 'company' }); }
  async function saveCompany(event) {
    event.preventDefault(); setSaving(true);
    try { await api(editingCompany ? `/companies/${editingCompany._id}` : '/companies', { method: editingCompany ? 'PUT' : 'POST', body: JSON.stringify(companyForm) }); setModal(null); setNotice(editingCompany ? 'Empresa atualizada.' : 'Empresa cadastrada.'); await refresh(); }
    catch (err) { setError(err.message); } finally { setSaving(false); }
  }
  function updateBenefit(key, field, value) { setEmployeeForm((form) => ({ ...form, benefits: { ...form.benefits, [key]: { ...form.benefits[key], [field]: value } } })); }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><i/><i/></div><div><b>benefícios</b><small>FORMIS · GESTÃO INTERNA</small></div></div>
      <div className="nav-caption">MENU PRINCIPAL</div>
      <button className="nav-link active"><LayoutDashboard size={18}/>Visão geral</button>
      <button className="nav-link" onClick={() => document.getElementById('cadastros')?.scrollIntoView({ behavior: 'smooth' })}><Users size={18}/>Colaboradores <span>{summary.employees}</span></button>
      <button className="nav-link" onClick={() => setModal({ type: 'companies' })}><Building2 size={18}/>Empresas</button>
      <div className="sidebar-bottom"><div className="local-note"><ShieldAlert size={16}/><div><b>Ambiente local</b><small>Dados na instância MongoDB configurada.</small></div></div><div className="profile"><div className="profile-icon">BF</div><div><b>Administração</b><small>Sistema interno</small></div><ChevronDown size={15}/></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="crumb">Sistema <span>/</span> <b>Benefícios</b></div><div className="top-meta"><i/>Conexão local <span className="today">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div></header>
      <div className="content">
        <section className="page-title"><div><div className="eyebrow"><Activity size={14}/> PAINEL DE CONTROLE</div><h1>Benefícios da equipe</h1><p>Acompanhe os benefícios e mantenha os cadastros organizados.</p></div><button className="primary" onClick={openNewEmployee}><Plus size={16}/> Novo colaborador</button></section>
        {error && <div className="error-banner"><ShieldAlert size={17}/><span>{error}</span><button onClick={() => setError('')}><X size={16}/></button></div>}
        <section className="company-strip"><div className="strip-label"><Building2 size={15}/> EMPRESAS</div><button className={`company-chip ${companyFilter === 'all' ? 'selected' : ''}`} onClick={() => setCompanyFilter('all')}><i className="all-dot"/>Todas <b>{allEmployees.length}</b></button>{companies.map((company) => <button key={company._id} className={`company-chip ${companyFilter === company._id ? 'selected' : ''}`} onClick={() => setCompanyFilter(company._id)}><i style={{ background: company.color }}/>{company.shortName}<b>{companyCounts[company._id] || 0}</b></button>)}<button className="manage" onClick={() => setModal({ type: 'companies' })}><Edit3 size={14}/> Gerenciar</button></section>
        <section className="stats">
          <article className="stat"><div className="stat-head">Colaboradores cadastrados <span className="icon blue"><Users size={17}/></span></div><strong>{busy ? '—' : summary.employees}</strong><small>{companies.length} empresas cadastradas</small></article>
          <article className="stat"><div className="stat-head">Total de benefícios VA + VR <span className="icon teal"><CircleDollarSign size={17}/></span></div><strong className="money">{busy ? '—' : currency(summary.total)}</strong><small><i className="dot va"/> VA {currency(summary.va)} <i className="dot vr"/> VR {currency(summary.vr)}</small></article>
          <article className="stat"><div className="stat-head">Recebem VA ou VR <span className="icon green"><Check size={17}/></span></div><strong>{busy ? '—' : summary.withMoney}</strong><small>Colaboradores com benefício financeiro</small></article>
          <article className="stat"><div className="stat-head">Cestas concedidas <span className="icon amber"><Coffee size={17}/></span></div><strong>{busy ? '—' : summary.cesta}</strong><small>Inclui modalidade <b>45+45</b></small></article>
        </section>
        <section className="table-card" id="cadastros"><div className="table-head"><div><div className="eyebrow muted"><ClipboardList size={14}/> BASE DE COLABORADORES</div><h2>Cadastros <span>{employees.length}</span></h2></div><button className="outline" onClick={() => setNotice('Exportação Excel não incluída nesta versão inicial.')}><ArrowDownUp size={15}/> Exportar</button></div>
          <div className="toolbar"><label className="search"><Search size={16}/><input aria-label="Buscar por nome ou cargo" placeholder="Buscar por nome ou cargo..." value={search} onChange={(event) => setSearch(event.target.value)}/>{search && <button onClick={() => setSearch('')} aria-label="Limpar busca"><X size={14}/></button>}</label><label className="filter"><Filter size={14}/><select value={companyFilter} onChange={(event) => setCompanyFilter(event.target.value)} aria-label="Filtrar por empresa"><option value="all">Todas as empresas</option>{companies.map((company) => <option key={company._id} value={company._id}>{company.shortName}</option>)}</select></label><small className="updated"><i/>Atualizado agora</small></div>
          <div className="table-wrap"><table><thead><tr><th>COLABORADOR</th><th>EMPRESA</th><th>CARGO</th><th>VA</th><th>VR</th><th>CESTA</th><th/></tr></thead><tbody>
            {busy ? <tr><td colSpan="7" className="empty">Carregando registros…</td></tr> : employees.length === 0 ? <tr><td colSpan="7" className="empty"><span className="empty-icon"><Users size={20}/></span><b>Nenhum colaborador encontrado</b><small>{error ? 'Verifique a conexão MongoDB e tente novamente.' : 'Cadastre alguém ou ajuste os filtros.'}</small>{!error && <button className="text-action" onClick={openNewEmployee}><Plus size={15}/>Adicionar colaborador</button>}</td></tr> : employees.map((employee) => <tr key={employee._id}><td><div className="person"><span className="avatar" style={{ '--avatar': employee.company?.color || '#13a9d2' }}>{employee.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><div><b>{employee.name}</b><small>Colaborador</small></div></div></td><td><span className="company-name"><i style={{ background: employee.company?.color || '#13a9d2' }}/>{employee.company?.shortName || '—'}</span></td><td className="role">{employee.role}</td><td><Benefit benefit={employee.benefits?.va}/></td><td><Benefit benefit={employee.benefits?.vr}/></td><td><span className={`pill ${employee.benefits?.cesta === 'Não' ? 'off' : employee.benefits?.cesta === '45+45' ? 'warm' : 'on'}`}>{employee.benefits?.cesta || 'Não'}</span></td><td><div className="row-actions"><button onClick={() => openEditEmployee(employee)} aria-label={`Editar ${employee.name}`} title="Editar"><Edit3 size={14}/></button><button className="delete" onClick={() => deleteEmployee(employee)} aria-label={`Excluir ${employee.name}`} title="Excluir"><Trash2 size={14}/></button></div></td></tr>)}
          </tbody></table></div><div className="table-foot"><span>Exibindo <b>{employees.length}</b> {employees.length === 1 ? 'registro' : 'registros'}</span><span>Valores conforme cadastro dos benefícios</span></div>
        </section>
        <footer className="footer"><span>BENEFÍCIOS FORMIS · SISTEMA INTERNO</span><span>Aplicação local <i/></span></footer>
      </div>
    </main>

    {modal?.type === 'employee' && <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && setModal(null)}><form className="modal employee-modal" onSubmit={saveEmployee}><div className="modal-top"><div><div className="eyebrow">CADASTRO DE PESSOAS</div><h2>{modal.employee ? 'Editar colaborador' : 'Novo colaborador'}</h2><p>Preencha os dados e benefícios do colaborador.</p></div><button type="button" className="close" onClick={() => setModal(null)}><X size={17}/></button></div><div className="form-grid"><label className="field span-2"><span>Nome completo <i>*</i></span><input autoFocus required value={employeeForm.name} onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })} placeholder="Ex.: Maria da Silva"/></label><label className="field span-2"><span>Cargo <i>*</i></span><input required value={employeeForm.role} onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })} placeholder="Ex.: Assistente administrativo"/></label><label className="field span-2"><span>Empresa <i>*</i></span><select required value={employeeForm.company} onChange={(e) => setEmployeeForm({ ...employeeForm, company: e.target.value })}><option value="">Selecione a empresa</option>{companies.map((company) => <option key={company._id} value={company._id}>{company.name}</option>)}</select></label><div className="form-divider span-2">BENEFÍCIOS</div>{['va', 'vr'].map((key) => <div className="benefit-edit" key={key}><div className="benefit-title"><b>{key.toUpperCase()}</b><small>{key === 'va' ? 'Vale-alimentação' : 'Vale-refeição'}</small></div><label className="field"><span>Valor mensal (R$)</span><input type="number" min="0" step="0.01" value={employeeForm.benefits[key].value} onChange={(e) => updateBenefit(key, 'value', Number(e.target.value))}/></label><label className="field"><span>Concedido</span><select value={employeeForm.benefits[key].status} onChange={(e) => updateBenefit(key, 'status', e.target.value)}><option>Não</option><option>Sim</option></select></label></div>)}<label className="field span-2"><span>Cesta</span><select value={employeeForm.benefits.cesta} onChange={(e) => setEmployeeForm({ ...employeeForm, benefits: { ...employeeForm.benefits, cesta: e.target.value } })}><option>Não</option><option>Sim</option><option>45+45</option></select></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Cancelar</button><button className="primary" disabled={saving}>{saving ? 'Salvando…' : <><Check size={15}/>{modal.employee ? 'Salvar alterações' : 'Cadastrar colaborador'}</>}</button></div></form></div>}
    {modal?.type === 'companies' && <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && setModal(null)}><div className="modal company-modal"><div className="modal-top"><div><div className="eyebrow">ORGANIZAÇÃO</div><h2>Empresas</h2><p>Gerencie as empresas disponíveis nos cadastros.</p></div><button className="close" onClick={() => setModal(null)}><X size={17}/></button></div><div className="company-list">{companies.map((company) => <div className="company-row" key={company._id}><i style={{ background: company.color }}/><div><b>{company.shortName}</b><small>{company.name}</small></div><span>{companyCounts[company._id] || 0} colaboradores</span><button onClick={() => openCompanyForm(company)} title="Editar"><Edit3 size={14}/></button></div>)}</div><div className="modal-actions"><button className="secondary" onClick={() => setModal(null)}>Fechar</button><button className="primary" onClick={() => openCompanyForm()}><Plus size={15}/>Nova empresa</button></div></div></div>}
    {modal?.type === 'company' && <div className="overlay nested" onMouseDown={(event) => event.target === event.currentTarget && setModal({ type: 'companies' })}><form className="modal company-form" onSubmit={saveCompany}><div className="modal-top"><div><div className="eyebrow">CADASTRO</div><h2>{editingCompany ? 'Editar empresa' : 'Nova empresa'}</h2></div><button type="button" className="close" onClick={() => setModal({ type: 'companies' })}><X size={17}/></button></div><label className="field"><span>Razão social <i>*</i></span><input autoFocus required value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}/></label><label className="field"><span>Nome curto <i>*</i></span><input required value={companyForm.shortName} onChange={(e) => setCompanyForm({ ...companyForm, shortName: e.target.value })} placeholder="Ex.: Formis"/></label><label className="field"><span>Cor de identificação</span><div className="color-input"><input type="color" value={companyForm.color} onChange={(e) => setCompanyForm({ ...companyForm, color: e.target.value })}/><small>{companyForm.color.toUpperCase()}</small></div></label><div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal({ type: 'companies' })}>Voltar</button><button className="primary" disabled={saving}>{saving ? 'Salvando…' : <><Check size={15}/>Salvar empresa</>}</button></div></form></div>}
    {notice && <div className="toast"><Check size={15}/>{notice}<button onClick={() => setNotice('')}><X size={14}/></button></div>}
  </div>;
}

function Benefit({ benefit }) {
  const active = benefit?.status === 'Sim';
  return <div className="benefit"><span className={active ? 'yes' : 'no'}><i/>{active ? 'Sim' : 'Não'}</span><small>{active ? currency(benefit.value) : '—'}</small></div>;
}
