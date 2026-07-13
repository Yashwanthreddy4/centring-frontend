// ============================================================
// CENTRING TRACKER — Complete Frontend App
// Drop this file as src/App.jsx in your React project
// Requires: api.js, AuthContext.js, LangContext.js (your files)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import api, { socket } from './api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LangProvider, useLang } from './context/LangContext';

// ── Helpers ─────────────────────────────────────────────────
const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const today = () => new Date().toISOString().split('T')[0];
const daysBetween = (a, b) => Math.max(0, Math.ceil((new Date(b) - new Date(a)) / 86400000));

function badge(status) {
  const map = {
    out: 'bg-blue-100 text-blue-700',
    overdue: 'bg-red-100 text-red-700',
    dueSoon: 'bg-amber-100 text-amber-700',
    returned: 'bg-green-100 text-green-700',
    good: 'bg-green-100 text-green-700',
    repair: 'bg-amber-100 text-amber-700',
    damaged: 'bg-red-100 text-red-700',
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-amber-100 text-amber-700',
    pending: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}

// ── Small reusable UI ────────────────────────────────────────
function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>{children}</div>;
}

function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, className = '' }) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-xl transition-all active:scale-95 disabled:opacity-40';
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-5 py-3 text-base' };
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    success: 'bg-green-600 text-white hover:bg-green-700',
    outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>}
      <input
        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
        {...props}
      />
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>}
      <select
        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

function Textarea({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>}
      <textarea
        rows={2}
        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 resize-none"
        {...props}
      />
    </label>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-base">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon, text, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
      <span className="text-5xl opacity-30">{icon}</span>
      <p className="text-gray-500 font-medium">{text}</p>
      {sub && <p className="text-gray-400 text-sm">{sub}</p>}
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );
}

// ── Login Page ───────────────────────────────────────────────
function LoginPage() {
  const { login } = useAuth();
  const { t } = useLang();
  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr('');
    setLoading(true);
    try {
      await login(form.username, form.password);
    } catch {
      setErr('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🏗️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('appName')}</h1>
          <p className="text-gray-500 text-sm mt-1">Centring Business Tracker</p>
        </div>
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <Input label={t('username')} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} autoComplete="username" />
            <Input label={t('password')} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} autoComplete="current-password"
              onKeyDown={e => e.key === 'Enter' && submit()} />
            {err && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{err}</p>}
            <Btn onClick={submit} disabled={loading} size="lg" className="w-full mt-1">
              {loading ? '...' : t('login')}
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Nav ──────────────────────────────────────────────────────

// ── Nav config ───────────────────────────────────────────────
// Bottom nav shows daily-use tabs only
// Equipment + Reports + Users go to side drawer (owner only)
const BOTTOM_NAV = [
  { key: 'dashboard', icon: '📊', label: 'home' },
  { key: 'customers', icon: '👥', label: 'customers' },
  { key: 'rentals', icon: '📦', label: 'rentals' },
  { key: 'sales', icon: '🛒', label: 'sales' },
  { key: 'payments', icon: '💰', label: 'payments' },
];

const ALL_NAV = [
  { key: 'dashboard', icon: '📊', label: 'dashboard' },
  { key: 'customers', icon: '👥', label: 'customers' },
  { key: 'rentals', icon: '📦', label: 'rentals' },
  { key: 'sales', icon: '🛒', label: 'sales' },
  { key: 'payments', icon: '💰', label: 'payments' },
  { key: 'maintenance', icon: '🛠️', label: 'maintenance' },
  { key: 'equipment', icon: '🔧', label: 'equipment' },
  { key: 'reports', icon: '📈', label: 'reports', ownerOnly: true },
  { key: 'users', icon: '👤', label: 'users', ownerOnly: true },
];

function BottomNav({ active, onSelect, onDrawer }) {
  const { t } = useLang();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-40 shadow-lg">
      {BOTTOM_NAV.map(n => (
        <button key={n.key} onClick={() => onSelect(n.key)}
          className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors
            ${active === n.key ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <span className={`text-xl transition-transform ${active === n.key ? 'scale-110' : ''}`}>{n.icon}</span>
          <span className="text-[10px] font-medium leading-tight">{t(n.label)}</span>
          {active === n.key && <span className="w-1 h-1 bg-indigo-600 rounded-full" />}
        </button>
      ))}
      <button onClick={onDrawer}
        className="flex-1 flex flex-col items-center py-2 gap-0.5 text-gray-400 hover:text-gray-600">
        <span className="text-xl">☰</span>
        <span className="text-[10px] font-medium">{t('more')}</span>
      </button>
    </nav>
  );
}

function SideDrawer({ active, onSelect, onClose, isOwner }) {
  const { t, lang, toggle } = useLang();
  const { logout, user } = useAuth();
  const tabs = ALL_NAV.filter(n => !n.ownerOnly || isOwner);
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="w-72 bg-white h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 px-5 py-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🏗️</div>
            <div>
              <p className="text-white font-bold">{t('appName')}</p>
              <p className="text-indigo-200 text-xs mt-0.5">{user?.username} · {t(user?.role)}</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* Daily use group */}
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-5 py-2">{t('dailyUse')}</p>
          {tabs.filter(n => ['dashboard','customers','rentals','sales','payments'].includes(n.key)).map(n => (
            <button key={n.key} onClick={() => { onSelect(n.key); onClose(); }}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors rounded-xl mx-1
                ${active === n.key ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span className="text-lg w-7 text-center">{n.icon}</span>
              <span>{t(n.label)}</span>
              {active === n.key && <span className="ml-auto w-2 h-2 bg-indigo-600 rounded-full" />}
            </button>
          ))}

          {/* Setup & Admin group */}
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-5 py-2 mt-2">{t('setupAdmin')}</p>
          {tabs.filter(n => ['maintenance','equipment','reports','users'].includes(n.key)).map(n => (
            <button key={n.key} onClick={() => { onSelect(n.key); onClose(); }}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors rounded-xl mx-1
                ${active === n.key ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span className="text-lg w-7 text-center">{n.icon}</span>
              <span>{t(n.label)}</span>
              {n.ownerOnly && <span className="ml-auto text-[9px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">{t('owner')}</span>}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 space-y-1">
          <button onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-xl">
            <span>🌐</span>
            <span>{lang === 'en' ? t('switchToTelugu') : t('switchToEnglish')}</span>
          </button>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl">
            <span>🚪</span>
            <span>{t('logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────
function Dashboard({ onNavigate }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  const load = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([api.get('/dashboard/stats'), api.get('/rentals?limit=5')]);
      setStats(s.data);
      setRecent(r.data.slice(0, 5));
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { socket.on('refresh', load); return () => socket.off('refresh', load); }, [load]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('goodMorning');
    if (h < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-4 text-white">
        <p className="text-indigo-200 text-sm">{greeting()},</p>
        <p className="font-bold text-xl capitalize">{user?.username} 👋</p>
        <p className="text-indigo-200 text-xs mt-1">{t('appName')}</p>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">{t('quickActions')}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t('newRental'), icon: '📦', color: 'bg-blue-50 border-blue-100', text: 'text-blue-700', tab: 'rentals' },
            { label: t('addCust'), icon: '👥', color: 'bg-green-50 border-green-100', text: 'text-green-700', tab: 'customers' },
            { label: t('newSale'), icon: '🛒', color: 'bg-amber-50 border-amber-100', text: 'text-amber-700', tab: 'sales' },
            { label: t('logRepair'), icon: '🛠️', color: 'bg-red-50 border-red-100', text: 'text-red-700', tab: 'maintenance' },
          ].map(a => (
            <button key={a.label} onClick={() => onNavigate(a.tab)}
              className={`${a.color} border rounded-2xl p-4 text-left active:scale-95 transition-all`}>
              <span className="text-2xl">{a.icon}</span>
              <p className={`text-sm font-semibold mt-2 ${a.text}`}>{a.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">{t('overview')}</p>
        <div className="grid grid-cols-2 gap-3">
          {stats ? [
            { label: t('activeRentals'), val: stats.activeRentals, icon: '📦', color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: t('thisMonth'), val: fmt(stats.thisMonthIncome), icon: '💵', color: 'text-green-600', bg: 'bg-green-50' },
            { label: t('pendingDues'), val: fmt(stats.pendingDues), icon: '⏳', color: 'text-red-600', bg: 'bg-red-50' },
            { label: t('overdueRentals'), val: stats.overdueCount, icon: '⚠️', color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(tile => (
            <Card key={tile.label} className="p-4">
              <div className={`w-8 h-8 ${tile.bg} rounded-xl flex items-center justify-center text-base mb-2`}>{tile.icon}</div>
              <p className="text-xs text-gray-400 font-medium">{tile.label}</p>
              <p className={`text-lg font-bold mt-0.5 ${tile.color}`}>{tile.val ?? '—'}</p>
            </Card>
          )) : [1,2,3,4].map(i => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="w-8 h-8 bg-gray-100 rounded-xl mb-2" />
              <div className="h-2 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-5 bg-gray-100 rounded w-1/2" />
            </Card>
          ))}
        </div>
      </div>

      {/* Overdue alert */}
      {stats?.overdueCount > 0 && (
        <button onClick={() => onNavigate('rentals')}
          className="w-full bg-red-50 border border-red-100 rounded-2xl p-4 text-left active:scale-95 transition-all">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-bold text-red-700">{stats.overdueCount} {t('overdueAlert')}</p>
              <p className="text-xs text-red-500">{t('tapToCollect')}</p>
            </div>
            <span className="ml-auto text-red-400">→</span>
          </div>
        </button>
      )}

      {/* Recent rentals */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">{t('recentRentals')}</p>
          <button onClick={() => onNavigate('rentals')} className="text-xs text-indigo-600 font-medium">{t('viewAll')} →</button>
        </div>
        <Card>
          {recent.length === 0
            ? <EmptyState icon="📦" text={t('noData')} sub={t('tapAdd')} />
            : recent.map(r => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-sm">📦</div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.customer_name}</p>
                    <p className="text-xs text-gray-400">{r.site}</p>
                  </div>

                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${badge(r.status)}`}>{t(r.status)}</span>
              </div>
            ))}
        </Card>
      </div>
    </div>
  );
}

// ── Equipment ────────────────────────────────────────────────
function Equipment() {
  const { t } = useLang();
  const { isOwner } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | item
  const [form, setForm] = useState({ name: '', qty: 1, cost_per_unit: '', condition: 'good', location: '' });

  const load = useCallback(async () => {
    try { const r = await api.get('/equipment'); setItems(r.data); } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { socket.on('refresh', load); return () => socket.off('refresh', load); }, [load]);

  const openAdd = () => { setForm({ name: '', qty: 1, cost_per_unit: '', condition: 'good', location: '' }); setModal('add'); };
  const openEdit = item => { setForm({ name: item.name, qty: item.qty, cost_per_unit: item.cost_per_unit, condition: item.condition, location: item.location }); setModal(item); };

  const save = async () => {
    try {
      if (modal === 'add') await api.post('/equipment', form);
      else await api.put(`/equipment/${modal.id}`, form);
      setModal(null); load();
    } catch {}
  };

  const del = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try { await api.delete(`/equipment/${id}`); load(); } catch {}
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || (i.location || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder={t('searchPlaceholder')} /></div>
        <Btn onClick={openAdd} size="md">+ {t('addEquip').split(' ')[0]}</Btn>
      </div>

      {filtered.length === 0
        ? <EmptyState icon="🔧" text={t('noData')} sub={t('tapAdd')} />
        : filtered.map(item => (
          <Card key={item.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${badge(item.condition)}`}>{t(item.condition)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {item.qty} {t('units')} · {fmt(item.cost_per_unit)}/{t('units')}
                  {item.location ? ` · 📍 ${item.location}` : ''}
                </p>
              </div>
              <div className="flex gap-1 ml-2">
                <Btn size="sm" variant="outline" onClick={() => openEdit(item)}>✏️</Btn>
                {isOwner && <Btn size="sm" variant="danger" onClick={() => del(item.id)}>🗑️</Btn>}
              </div>
            </div>
          </Card>
        ))}

      {modal && (
        <Modal title={modal === 'add' ? t('addEquip') : t('edit')} onClose={() => setModal(null)}>
          <Input label={t('machineName')} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Miller, Driller" />
          <Input label={t('qty')} type="number" min={0} value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} min={1} />
          <Input label={t('costPerUnit')} type="number" min={0} value={form.cost_per_unit} onChange={e => setForm(f => ({ ...f, cost_per_unit: e.target.value }))} />
          <Select label={t('condition')} value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
            <option value="good">{t('good')}</option>
            <option value="repair">{t('repair')}</option>
            <option value="damaged">{t('damaged')}</option>
          </Select>
          <Input label={t('location')} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Current site / yard" />
          <div className="flex gap-2 pt-1">
            <Btn onClick={save} className="flex-1">{t('save')}</Btn>
            <Btn variant="outline" onClick={() => setModal(null)} className="flex-1">{t('cancel')}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}


// ── Searchable Customer Picker ───────────────────────────────
function CustomerPicker({ customers, value, onChange }) {
  const { t } = useLang();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = React.useRef(null);

  const selected = customers.find(c => String(c.id) === String(value));

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.village || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome for voice search'); return; }
    const rec = new SR();
    rec.lang = 'te-IN';
    rec.interimResults = false;
    recRef.current = rec;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = e => setSearch(e.results[0][0].transcript);
    rec.start();
    setOpen(true);
  };

  const stopVoice = () => { recRef.current?.stop(); setListening(false); };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('customer')}</span>

      {/* Search box with mic */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            value={open ? search : (selected ? `${selected.name} — ${selected.village || ''}` : '')}
            onChange={e => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={t('searchCustomer')}
            className={`w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-gray-50 transition-all
              ${listening ? 'border-red-400 ring-2 ring-red-200 bg-red-50' : 'border-gray-200 focus:ring-indigo-400'}`}
          />
        </div>
        <button
          type="button"
          onClick={() => listening ? stopVoice() : startVoice()}
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all
            ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100'}`}>
          {listening ? '⏹' : '🎤'}
        </button>
      </div>

      {/* Dropdown results */}
      {open && (
        <div className="border border-gray-200 rounded-xl bg-white shadow-lg max-h-48 overflow-y-auto z-10">
          {filtered.length === 0
            ? <p className="text-sm text-gray-400 text-center py-4">{t('noCustomerFound')}</p>
            : filtered.map(c => (
              <button key={c.id} type="button"
                onClick={() => { onChange(c.id); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50 border-b border-gray-50 last:border-0 transition-colors
                  ${String(c.id) === String(value) ? 'bg-indigo-50' : ''}`}>
                <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center text-sm font-bold text-indigo-600">
                  {c.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.village}{c.phone ? ` · ${c.phone}` : ''}</p>
                </div>
                {String(c.id) === String(value) && <span className="ml-auto text-indigo-600">✓</span>}
              </button>
            ))}
        </div>
      )}

      {listening && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-ping" />
          {t('speakTelugu')}
        </p>
      )}
    </div>
  );
}

// ── Voice Input Hook (Telugu) ────────────────────────────────
function useVoiceInput(onResult) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const recRef = React.useRef(null);

  const start = (field) => {
    if (!supported) { alert('Voice typing is not supported in this browser. Please use Chrome.'); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'te-IN';          // Telugu
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recRef.current = rec;

    rec.onstart = () => setListening(field);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onResult(field, text);
    };
    rec.start();
  };

  const stop = () => { recRef.current?.stop(); setListening(false); };

  return { listening, start, stop, supported };
}

// ── Voice Input Field ────────────────────────────────────────
function VoiceInput({ label, value, onChange, fieldKey, listening, onStartVoice, onStopVoice, ...props }) {
  const isActive = listening === fieldKey;
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>}
      <div className="flex gap-2 items-center">
        <input
          value={value}
          onChange={onChange}
          className={`flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-gray-50 transition-all
            ${isActive ? 'border-red-400 ring-2 ring-red-200 bg-red-50' : 'border-gray-200 focus:ring-indigo-400'}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => isActive ? onStopVoice() : onStartVoice(fieldKey)}
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all
            ${isActive
              ? 'bg-red-500 text-white animate-pulse shadow-lg'
              : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100'}`}
          title={isActive ? 'Stop listening' : 'Speak in Telugu'}
        >
          {isActive ? '⏹' : '🎤'}
        </button>
      </div>
      {isActive && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-ping" />
          తెలుగులో మాట్లాడండి... (Speaking in Telugu...)
        </p>
      )}
    </label>
  );
}

// ── Customers ────────────────────────────────────────────────
function Customers() {
  const { t } = useLang();
  const { isOwner } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', village: '' });

  const { listening, start, stop } = useVoiceInput((field, text) => {
    setForm(f => ({ ...f, [field]: f[field] ? f[field] + ' ' + text : text }));
  });

  const load = useCallback(async () => {
    try { const r = await api.get('/customers'); setItems(r.data); } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { socket.on('refresh', load); return () => socket.off('refresh', load); }, [load]);

  const openAdd = () => { setForm({ name: '', phone: '', village: '' }); setModal('add'); };
  const openEdit = item => { setForm({ name: item.name, phone: item.phone, village: item.village }); setModal(item); };

  const save = async () => {
    try {
      if (modal === 'add') await api.post('/customers', form);
      else await api.put(`/customers/${modal.id}`, form);
      setModal(null); load();
    } catch {}
  };

  const del = async id => {
    if (!window.confirm(t('confirmDelete'))) return;
    try { await api.delete(`/customers/${id}`); load(); } catch {}
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.phone.includes(search) ||
    (i.village || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder={t('searchPlaceholder')} /></div>
        <Btn onClick={openAdd}>+ Add</Btn>
      </div>
      {filtered.length === 0
        ? <EmptyState icon="👥" text={t('noData')} sub={t('tapAdd')} />
        : filtered.map(c => (
          <Card key={c.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">📞 {c.phone}{c.village ? ` · 📍 ${c.village}` : ''}</p>
              </div>
              <div className="flex gap-1">
                <Btn size="sm" variant="outline" onClick={() => openEdit(c)}>✏️</Btn>
                {isOwner && <Btn size="sm" variant="danger" onClick={() => del(c.id)}>🗑️</Btn>}
              </div>
            </div>
          </Card>
        ))}

      {modal && (
        <Modal title={modal === 'add' ? t('addCust') : t('edit')} onClose={() => { stop(); setModal(null); }}>

          {/* Name — voice enabled */}
          <VoiceInput
            label={t('name')}
            fieldKey="name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="పేరు చెప్పండి లేదా టైప్ చేయండి"
            listening={listening}
            onStartVoice={start}
            onStopVoice={stop}
          />

          {/* Phone — keyboard only (numbers don't need voice) */}
          <Input
            label={t('phone')}
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="Phone number"
          />

          {/* Village — voice enabled */}
          <VoiceInput
            label={t('village')}
            fieldKey="village"
            value={form.village}
            onChange={e => setForm(f => ({ ...f, village: e.target.value }))}
            placeholder="గ్రామం చెప్పండి లేదా టైప్ చేయండి"
            listening={listening}
            onStartVoice={start}
            onStopVoice={stop}
          />

          <div className="bg-indigo-50 rounded-xl px-3 py-2 text-xs text-indigo-600 flex items-center gap-2">
            🎤 <span>🎤 నొక్కి తెలుగులో మాట్లాడండి — అది వ్రాసుకుంటుంది</span>
          </div>

          <div className="flex gap-2 pt-1">
            <Btn onClick={save} className="flex-1">{t('save')}</Btn>
            <Btn variant="outline" onClick={() => { stop(); setModal(null); }} className="flex-1">{t('cancel')}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}



// ── Rentals ──────────────────────────────────────────────────
// equipLines = [{ equipment_id, qty, daily_rate }]
const emptyLine = () => ({ equipment_id: '', qty: 1, daily_rate: '' });

function Rentals() {
  const { t } = useLang();
  const { isOwner } = useAuth();
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [retModal, setRetModal] = useState(null);
  const [form, setForm] = useState({
    customer_id: '', site: '',
    date_out: today(), return_date: '', advance: '', notes: '',
    equipLines: [emptyLine()]
  });

  const load = useCallback(async () => {
    try {
      const [r, c, e] = await Promise.all([
        api.get('/rentals'), api.get('/customers'), api.get('/equipment')
      ]);
      setItems(r.data); setCustomers(c.data); setEquipment(e.data);
    } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { socket.on('refresh', load); return () => socket.off('refresh', load); }, [load]);

  // Compute total daily rate from all equipment lines
  const totalDailyRate = (lines) =>
    lines.reduce((sum, l) => sum + (Number(l.qty || 1) * Number(l.daily_rate || 0)), 0);

  const openAdd = () => {
    setForm({ customer_id: '', site: '', date_out: today(), return_date: '', advance: '', notes: '', equipLines: [emptyLine()] });
    setModal('add');
  };

  const openEdit = (r) => {
    // Parse stored equipment_lines JSON or fall back to single equipment
    let equipLines;
    try {
      equipLines = r.equipment_lines ? JSON.parse(r.equipment_lines) : [{ equipment_id: r.equipment_id, qty: 1, daily_rate: r.daily_rate }];
    } catch { equipLines = [emptyLine()]; }
    setForm({ customer_id: r.customer_id, site: r.site, date_out: r.date_out, return_date: r.return_date, advance: r.deposit, notes: r.notes || '', equipLines });
    setModal(r);
  };

  const save = async () => {
    try {
      const lines = form.equipLines.filter(l => l.equipment_id);
      const payload = {
        customer_id: form.customer_id,
        equipment_id: lines[0]?.equipment_id || '',   // keep for DB compatibility
        site: form.site,
        date_out: form.date_out,
        return_date: form.return_date,
        daily_rate: totalDailyRate(lines),             // total per day
        deposit: form.advance || 0,
        notes: form.notes,
        equipment_lines: JSON.stringify(lines),        // full detail stored as JSON
      };
      if (modal === 'add') await api.post('/rentals', payload);
      else await api.put(`/rentals/${modal.id}`, payload);
      setModal(null); load();
    } catch {}
  };

  const markReturnedAndPay = async (rental, returnData) => {
    try {
      await api.patch(`/rentals/${rental.id}/return`, { actual_return: returnData.actual_return });
      await api.post('/payments', {
        rental_id: rental.id,
        total_bill: returnData.total_bill,
        amt_paid: returnData.amt_paid,
        pay_date: returnData.actual_return,
        notes: returnData.notes,
      });
      setRetModal(null); load();
    } catch {}
  };

  const del = async id => {
    if (!window.confirm(t('confirmDelete'))) return;
    try { await api.delete(`/rentals/${id}`); load(); } catch {}
  };

  const computeStatus = r => {
    if (r.actual_return) return 'returned';
    const now = new Date(); const ret = new Date(r.return_date);
    if (now > ret) return 'overdue';
    if ((ret - now) / 86400000 <= 3) return 'dueSoon';
    return 'out';
  };

  // Format date from ISO to DD-MM-YYYY
  const fmtDate = d => {
    if (!d) return '—';
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,'0')}-${String(dt.getMonth()+1).padStart(2,'0')}-${dt.getFullYear()}`;
  };

  let filtered = items.map(r => ({ ...r, status: computeStatus(r) }));
  if (filter !== 'all') filtered = filtered.filter(r => r.status === filter);
  if (search) filtered = filtered.filter(r =>
    (r.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.equipment_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.site || '').toLowerCase().includes(search.toLowerCase())
  );

  const tabs = ['all', 'out', 'overdue', 'dueSoon', 'returned'];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder={t('searchPlaceholder')} /></div>
        <Btn onClick={openAdd}>+ New</Btn>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${filter === tab ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {tab === 'all' ? 'All' : t(tab)}
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <EmptyState icon="📦" text={t('noData')} sub={t('tapAdd')} />
        : filtered.map(r => {
          const advance = Number(r.deposit || 0);
          const days = r.actual_return
            ? daysBetween(r.date_out?.split('T')[0], r.actual_return?.split('T')[0])
            : daysBetween(r.date_out?.split('T')[0], today());
          const totalRate = Number(r.daily_rate || 0);
          const estimatedBill = days * totalRate;
          const balance = estimatedBill - advance;

          // Parse equipment lines if available
          let equipLines = [];
          try { equipLines = r.equipment_lines ? JSON.parse(r.equipment_lines) : []; } catch {}
          const hasMultiple = equipLines.length > 1;

          return (
            <Card key={r.id} className="p-4">
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{r.customer_name}</p>
                  <p className="text-xs text-gray-500">📍 {r.site}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${badge(r.status)}`}>{t(r.status)}</span>
              </div>

              {/* Equipment list */}
              {hasMultiple ? (
                <div className="bg-gray-50 rounded-xl p-2 mb-2 space-y-1">
                  {equipLines.map((l, i) => {
                    const eq = equipment.find(e => String(e.id) === String(l.equipment_id));
                    const lineRate = Number(l.qty || 1) * Number(l.daily_rate || 0);
                    return (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-gray-600">🔧 {eq?.name || 'Equipment'} × {l.qty}</span>
                        <span className="text-indigo-600 font-medium">{fmt(l.daily_rate)}/unit → {fmt(lineRate)}/day</span>
                      </div>
                    );
                  })}
                  <div className="border-t border-gray-200 pt-1 flex justify-between text-xs font-bold">
                    <span className="text-gray-700">Total per day</span>
                    <span className="text-indigo-700">{fmt(totalRate)}/day</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mb-2">🔧 {r.equipment_name} · {fmt(totalRate)}/day</p>
              )}

              {/* Dates - clean format */}
              <div className="flex gap-3 text-xs text-gray-500 mb-2">
                <span>📅 Out: {fmtDate(r.date_out)}</span>
                <span>🔙 Due: {fmtDate(r.return_date)}</span>
                <span className="text-gray-400">{days} days so far</span>
              </div>

              {/* Bill summary */}
              {totalRate > 0 && (
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-[10px] text-gray-400">Est. Bill</p>
                    <p className="font-bold text-xs">{fmt(estimatedBill)}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2">
                    <p className="text-[10px] text-gray-400">Advance</p>
                    <p className="font-bold text-xs text-green-700">{fmt(advance)}</p>
                  </div>
                  <div className={`rounded-xl p-2 ${balance > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <p className="text-[10px] text-gray-400">Balance</p>
                    <p className={`font-bold text-xs ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {fmt(Math.max(0, balance))}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-1 flex-wrap">
                {r.status !== 'returned' && (
                  <Btn size="sm" variant="success" onClick={() => setRetModal(r)}>✓ Return & Settle</Btn>
                )}
                <Btn size="sm" variant="outline" onClick={() => openEdit(r)}>✏️ Edit</Btn>
                {isOwner && <Btn size="sm" variant="danger" onClick={() => del(r.id)}>🗑️</Btn>}
              </div>
            </Card>
          );
        })}

      {/* New / Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? t('newRental') : 'Edit Rental'} onClose={() => setModal(null)}>
          <CustomerPicker customers={customers} value={form.customer_id} onChange={id => setForm(f => ({ ...f, customer_id: id }))} />

          <Input label={t('siteLocation')} value={form.site} onChange={e => setForm(f => ({ ...f, site: e.target.value }))} placeholder="e.g. Anantapur bypass road" />

          <div className="grid grid-cols-2 gap-2">
            <Input label={t('dateSentOut')} type="date" value={form.date_out} onChange={e => setForm(f => ({ ...f, date_out: e.target.value }))} />
            <Input label={t('expectedReturn')} type="date" value={form.return_date} onChange={e => setForm(f => ({ ...f, return_date: e.target.value }))} />
          </div>

          {/* Equipment lines */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Equipment & Rates</p>
            <div className="space-y-2">
              {form.equipLines.map((line, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Equipment {i + 1}</span>
                    {form.equipLines.length > 1 && (
                      <button onClick={() => setForm(f => ({ ...f, equipLines: f.equipLines.filter((_, idx) => idx !== i) }))}
                        className="text-red-400 text-xs hover:text-red-600">✕ Remove</button>
                    )}
                  </div>
                  <Select value={line.equipment_id}
                    onChange={e => setForm(f => ({ ...f, equipLines: f.equipLines.map((l, idx) => idx === i ? { ...l, equipment_id: e.target.value } : l) }))}>
                    <option value="">Select equipment</option>
                    {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Qty" type="number" min={1} value={line.qty}
                      onChange={e => setForm(f => ({ ...f, equipLines: f.equipLines.map((l, idx) => idx === i ? { ...l, qty: e.target.value } : l) }))} />
                    <Input label="Rate/unit/day (₹)" type="number" min={0} value={line.daily_rate}
                      onChange={e => setForm(f => ({ ...f, equipLines: f.equipLines.map((l, idx) => idx === i ? { ...l, daily_rate: e.target.value } : l) }))} />
                  </div>
                  {line.qty > 0 && line.daily_rate > 0 && (
                    <p className="text-xs text-indigo-600 font-medium">
                      → {line.qty} × {fmt(line.daily_rate)} = {fmt(Number(line.qty) * Number(line.daily_rate))}/day
                    </p>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setForm(f => ({ ...f, equipLines: [...f.equipLines, emptyLine()] }))}
              className="mt-2 text-xs text-indigo-600 font-medium hover:text-indigo-800">
              + Add another equipment
            </button>
          </div>

          {/* Total daily rate preview */}
          {totalDailyRate(form.equipLines) > 0 && (
            <div className="bg-indigo-50 rounded-xl px-3 py-2 text-sm font-bold text-indigo-700 flex justify-between">
              <span>Total per day</span>
              <span>{fmt(totalDailyRate(form.equipLines))}/day</span>
            </div>
          )}

          <Input label={t('advancePaid')} type="number" min={0} value={form.advance} onChange={e => setForm(f => ({ ...f, advance: e.target.value }))} placeholder="0" />
          <Textarea label="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />

          <div className="flex gap-2 pt-1">
            <Btn onClick={save} className="flex-1">{t('save')}</Btn>
            <Btn variant="outline" onClick={() => setModal(null)} className="flex-1">{t('cancel')}</Btn>
          </div>
        </Modal>
      )}

      {retModal && (
        <ReturnSettleModal rental={retModal} onClose={() => setRetModal(null)} onSave={markReturnedAndPay} t={t} />
      )}
    </div>
  );
}


// ── Return & Settle Modal ─────────────────────────────────────
function ReturnSettleModal({ rental, onClose, onSave, t }) {
  const advance = Number(rental.deposit || 0);
  const [date, setDate] = useState(today());
  const [extraPaid, setExtraPaid] = useState('');
  const [notes, setNotes] = useState('');

  const days = daysBetween(rental.date_out, date);
  const totalBill = days * Number(rental.daily_rate || 0);
  const remaining = Math.max(0, totalBill - advance);
  const totalPaid = advance + Number(extraPaid || 0);
  const balance = totalBill - totalPaid;

  return (
    <Modal title={`✓ ${t('returnSettle')}`} onClose={onClose}>
      <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">{t('customer')}</span>
          <span className="font-semibold">{rental.customer_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{t('equipment')}</span>
          <span className="font-medium">{rental.equipment_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{t('site')}</span>
          <span className="font-medium">{rental.site}</span>
        </div>
      </div>

      <Input label={t('actualReturn')} type="date" value={date} onChange={e => setDate(e.target.value)} />

      <div className="bg-indigo-50 rounded-xl p-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">{t('daysOut')}</span>
          <span className="font-bold">{days} {t('units')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t('rate')}</span>
          <span className="font-medium">{fmt(rental.daily_rate)}{t('perDay')}</span>
        </div>
        <div className="border-t border-indigo-100 pt-2 flex justify-between">
          <span className="text-gray-700 font-medium">{t('totalBill')}</span>
          <span className="font-bold text-indigo-700 text-base">{fmt(totalBill)}</span>
        </div>
        <div className="flex justify-between text-green-700">
          <span>{t('advancePaid')}</span>
          <span className="font-bold">− {fmt(advance)}</span>
        </div>
        <div className="border-t border-indigo-100 pt-2 flex justify-between">
          <span className="text-gray-700 font-medium">{t('remaining')}</span>
          <span className={`font-bold text-base ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>{fmt(remaining)}</span>
        </div>
      </div>

      <Input
        label={t('amountCollected')}
        type="number" min={0}
        value={extraPaid}
        onChange={e => setExtraPaid(e.target.value)}
        placeholder={`${t('remaining')}: ${fmt(remaining)}`}
      />

      {extraPaid !== '' && (
        <div className={`rounded-xl px-3 py-2 text-sm font-medium flex justify-between
          ${balance <= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <span>{balance <= 0 ? `✅ ${t('fullySettled')}` : `⚠️ ${t('stillPendingShort')}`}</span>
          <span>{balance <= 0 ? t('clear') + '!' : fmt(balance) + ' ' + t('pending')}</span>
        </div>
      )}

      <Textarea label={t('notes')} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. paid by cash" />

      <div className="flex gap-2 pt-1">
        <Btn onClick={() => onSave(rental, { actual_return: date, total_bill: totalBill, amt_paid: totalPaid, notes })} variant="success" className="flex-1">✓ {t('confirmSave')}</Btn>
        <Btn variant="outline" onClick={onClose} className="flex-1">{t('cancel')}</Btn>
      </div>
    </Modal>
  );
}

// ── Payments (history only) ───────────────────────────────────
function Payments() {
  const { t } = useLang();
  const { isOwner } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try { const r = await api.get('/payments'); setItems(r.data); } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { socket.on('refresh', load); return () => socket.off('refresh', load); }, [load]);

  const del = async id => {
    if (!window.confirm(t('confirmDelete'))) return;
    try { await api.delete(`/payments/${id}`); load(); } catch {}
  };

  const payStatus = p => {
    const bal = Number(p.total_bill) - Number(p.amt_paid);
    if (bal <= 0) return 'paid';
    if (p.amt_paid > 0) return 'partial';
    return 'pending';
  };

  const filtered = items.filter(i =>
    (i.customer_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = filtered.reduce((s, p) => s + Number(p.amt_paid || 0), 0);
  const totalPending = filtered.reduce((s, p) => s + Math.max(0, Number(p.total_bill || 0) - Number(p.amt_paid || 0)), 0);

  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} placeholder={t('searchPlaceholder')} />

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-center">
          <p className="text-xs text-gray-500">Total Collected</p>
          <p className="font-bold text-green-600 text-lg">{fmt(totalCollected)}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-gray-500">Still Pending</p>
          <p className="font-bold text-red-500 text-lg">{fmt(totalPending)}</p>
        </Card>
      </div>

      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide px-1">{t('paymentHistory')}</p>

      {filtered.length === 0
        ? <EmptyState icon="💰" text="No payments yet" sub="Payments appear here after marking rentals as returned" />
        : filtered.map(p => {
          const status = payStatus(p);
          const bal = Number(p.total_bill) - Number(p.amt_paid);
          return (
            <Card key={p.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{p.customer_name}</p>
                  <p className="text-xs text-gray-500">{p.pay_date}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${badge(status)}`}>{t(status)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-xl p-2">
                  <p className="text-[10px] text-gray-400">Total Bill</p>
                  <p className="font-bold text-xs">{fmt(p.total_bill)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-2">
                  <p className="text-[10px] text-gray-400">Collected</p>
                  <p className="font-bold text-xs text-green-700">{fmt(p.amt_paid)}</p>
                </div>
                <div className={`rounded-xl p-2 ${bal > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <p className="text-[10px] text-gray-400">Balance</p>
                  <p className={`font-bold text-xs ${bal > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {bal > 0 ? fmt(bal) : '✓ Clear'}
                  </p>
                </div>
              </div>
              {p.notes && <p className="text-xs text-gray-400 mt-2 italic">📝 {p.notes}</p>}
              {isOwner && <div className="mt-2"><Btn size="sm" variant="danger" onClick={() => del(p.id)}>🗑️</Btn></div>}
            </Card>
          );
        })}
    </div>
  );
}


// ── Sales ─────────────────────────────────────────────────────
function Sales() {
  const { t } = useLang();
  const { isOwner } = useAuth();
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    customer_id: '', item_name: '', qty: '', rate_per_unit: '',
    amt_paid: '', sale_date: today(), notes: ''
  });

  const load = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([api.get('/sales'), api.get('/customers')]);
      setItems(s.data); setCustomers(c.data);
    } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { socket.on('refresh', load); return () => socket.off('refresh', load); }, [load]);

  const openAdd = () => {
    setForm({ customer_id: '', item_name: '', qty: '', rate_per_unit: '', amt_paid: '', sale_date: today(), notes: '' });
    setModal('add');
  };

  const openEdit = s => {
    setForm({ customer_id: s.customer_id, item_name: s.item_name, qty: s.qty, rate_per_unit: s.rate_per_unit, amt_paid: s.amt_paid, sale_date: s.sale_date, notes: s.notes || '' });
    setModal(s);
  };

  const save = async () => {
    try {
      const total = Number(form.qty || 0) * Number(form.rate_per_unit || 0);
      const payload = { ...form, total_amount: total };
      if (modal === 'add') await api.post('/sales', payload);
      else await api.put(`/sales/${modal.id}`, payload);
      setModal(null); load();
    } catch {}
  };

  const del = async id => {
    if (!window.confirm(t('confirmDelete'))) return;
    try { await api.delete(`/sales/${id}`); load(); } catch {}
  };

  const payStatus = s => {
    const bal = Number(s.total_amount) - Number(s.amt_paid);
    if (bal <= 0) return 'paid';
    if (s.amt_paid > 0) return 'partial';
    return 'pending';
  };

  let filtered = items;
  if (filter !== 'all') filtered = filtered.filter(s => payStatus(s) === filter);
  if (search) filtered = filtered.filter(s =>
    (s.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.item_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalSales = filtered.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
  const totalCollected = filtered.reduce((sum, s) => sum + Number(s.amt_paid || 0), 0);
  const totalPending = totalSales - totalCollected;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder={t('searchPlaceholder')} /></div>
        <Btn onClick={openAdd}>+ {t('sales')}</Btn>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['all', 'paid', 'partial', 'pending'].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${filter === tab ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {tab === 'all' ? 'All' : t(tab)}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <p className="text-[10px] text-gray-400">{t('totalSales')}</p>
          <p className="font-bold text-gray-800 text-sm">{fmt(totalSales)}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-[10px] text-gray-400">{t('collected')}</p>
          <p className="font-bold text-green-600 text-sm">{fmt(totalCollected)}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-[10px] text-gray-400">{t('stillPending')}</p>
          <p className="font-bold text-red-500 text-sm">{fmt(totalPending)}</p>
        </Card>
      </div>

      {filtered.length === 0
        ? <EmptyState icon="🛒" text={t('noSales')} sub={t('tapAddSale')} />
        : filtered.map(s => {
          const status = payStatus(s);
          const bal = Number(s.total_amount) - Number(s.amt_paid);
          return (
            <Card key={s.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{s.customer_name}</p>
                  <p className="text-xs text-gray-500">📅 {s.sale_date}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${badge(status)}`}>{t(status)}</span>
              </div>

              {/* Item details */}
              <div className="bg-gray-50 rounded-xl p-2 mb-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">🧱 {s.item_name}</span>
                  <span className="text-gray-600">{s.qty} {t('units')} × {fmt(s.rate_per_unit)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold mt-1">
                  <span className="text-gray-700">{t('totalAmount')}</span>
                  <span className="text-indigo-700">{fmt(s.total_amount)}</span>
                </div>
              </div>

              {/* Payment summary */}
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-gray-50 rounded-xl p-2">
                  <p className="text-[10px] text-gray-400">{t('totalBill')}</p>
                  <p className="font-bold text-xs">{fmt(s.total_amount)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-2">
                  <p className="text-[10px] text-gray-400">{t('paid')}</p>
                  <p className="font-bold text-xs text-green-700">{fmt(s.amt_paid)}</p>
                </div>
                <div className={`rounded-xl p-2 ${bal > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <p className="text-[10px] text-gray-400">{t('balance')}</p>
                  <p className={`font-bold text-xs ${bal > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {bal > 0 ? fmt(bal) : `✓ ${t('clear')}`}
                  </p>
                </div>
              </div>

              {s.notes && <p className="text-xs text-gray-400 mb-2 italic">📝 {s.notes}</p>}

              <div className="flex gap-1 flex-wrap">
                <Btn size="sm" variant="outline" onClick={() => openEdit(s)}>✏️ {t('edit')}</Btn>
                {isOwner && <Btn size="sm" variant="danger" onClick={() => del(s.id)}>🗑️</Btn>}
              </div>
            </Card>
          );
        })}

      {/* Add / Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? `🛒 ${t('newSale')}` : `${t('edit')} ${t('sales')}`} onClose={() => setModal(null)}>
          <CustomerPicker customers={customers} value={form.customer_id} onChange={id => setForm(f => ({ ...f, customer_id: id }))} />

          <Input label={t('itemName')} value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} placeholder="e.g. Bricks, Sand, Cement" />

          <div className="grid grid-cols-2 gap-2">
            <Input label={t('qty')} type="number" min={0} value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} placeholder="e.g. 500" />
            <Input label={t('ratePerUnit')} type="number" min={0} value={form.rate_per_unit} onChange={e => setForm(f => ({ ...f, rate_per_unit: e.target.value }))} placeholder="e.g. 8" />
          </div>

          {/* Auto calculated total */}
          {form.qty > 0 && form.rate_per_unit > 0 && (
            <div className="bg-indigo-50 rounded-xl px-3 py-2 text-sm font-bold text-indigo-700 flex justify-between">
              <span>{t('totalAmount')}</span>
              <span>{fmt(Number(form.qty) * Number(form.rate_per_unit))}</span>
            </div>
          )}

          <Input label={t('amtPaid')} type="number" min={0} value={form.amt_paid} onChange={e => setForm(f => ({ ...f, amt_paid: e.target.value }))} placeholder="0" />

          {/* Balance preview */}
          {form.qty > 0 && form.rate_per_unit > 0 && form.amt_paid !== '' && (
            <div className={`rounded-xl px-3 py-2 text-sm font-medium flex justify-between
              ${(Number(form.qty) * Number(form.rate_per_unit)) - Number(form.amt_paid) <= 0
                ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <span>{t('balance')}</span>
              <span>{fmt(Math.max(0, (Number(form.qty) * Number(form.rate_per_unit)) - Number(form.amt_paid)))}</span>
            </div>
          )}

          <Input label={t('saleDate')} type="date" value={form.sale_date} onChange={e => setForm(f => ({ ...f, sale_date: e.target.value }))} />
          <Textarea label="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. delivered to site" />

          <div className="flex gap-2 pt-1">
            <Btn onClick={save} className="flex-1">{t('save')}</Btn>
            <Btn variant="outline" onClick={() => setModal(null)} className="flex-1">{t('cancel')}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Maintenance ──────────────────────────────────────────────
function Maintenance() {
  const { t } = useLang();
  const { isOwner } = useAuth();
  const [items, setItems] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ equipment_id: '', repair_desc: '', repair_cost: '', repair_date: today(), next_service: '', notes: '' });

  const load = useCallback(async () => {
    try {
      const [m, e] = await Promise.all([api.get('/maintenance'), api.get('/equipment')]);
      setItems(m.data); setEquipment(e.data);
    } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { socket.on('refresh', load); return () => socket.off('refresh', load); }, [load]);

  const save = async () => {
    try { await api.post('/maintenance', form); setModal(null); load(); } catch {}
  };
  const del = async id => {
    if (!window.confirm(t('confirmDelete'))) return;
    try { await api.delete(`/maintenance/${id}`); load(); } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Btn onClick={() => { setForm({ equipment_id: '', repair_desc: '', repair_cost: '', repair_date: today(), next_service: '', notes: '' }); setModal(true); }}>
          + {t('logRepair')}
        </Btn>
      </div>
      {items.length === 0
        ? <EmptyState icon="🛠️" text={t('noData')} sub={t('tapAdd')} />
        : items.map(m => (
          <Card key={m.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{m.equipment_name}</p>
                <p className="text-sm text-gray-600 mt-0.5">{m.repair_desc}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                  <span>📅 {m.repair_date}</span>
                  {m.repair_cost > 0 && <span>💰 {fmt(m.repair_cost)}</span>}
                  {m.next_service && <span>🔔 Next: {m.next_service}</span>}
                </div>
              </div>
              {isOwner && <Btn size="sm" variant="danger" onClick={() => del(m.id)}>🗑️</Btn>}
            </div>
          </Card>
        ))}

      {modal && (
        <Modal title={t('logRepair')} onClose={() => setModal(null)}>
          <Select label={t('machineName')} value={form.equipment_id} onChange={e => setForm(f => ({ ...f, equipment_id: e.target.value }))}>
            <option value="">Select equipment</option>
            {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </Select>
          <Textarea label={t('repairDesc')} value={form.repair_desc} onChange={e => setForm(f => ({ ...f, repair_desc: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <Input label={t('repairCost')} type="number" min={0} value={form.repair_cost} onChange={e => setForm(f => ({ ...f, repair_cost: e.target.value }))} />
            <Input label="Repair date" type="date" value={form.repair_date} onChange={e => setForm(f => ({ ...f, repair_date: e.target.value }))} />
          </div>
          <Input label={t('nextService')} type="date" value={form.next_service} onChange={e => setForm(f => ({ ...f, next_service: e.target.value }))} />
          <Textarea label={t('notes')} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="flex gap-2 pt-1">
            <Btn onClick={save} className="flex-1">{t('save')}</Btn>
            <Btn variant="outline" onClick={() => setModal(null)} className="flex-1">{t('cancel')}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Reports (Owner only) ─────────────────────────────────────
function Reports() {
  const { t } = useLang();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/reports/summary').then(r => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-xs text-gray-500 uppercase font-medium mb-3">Financial Summary</p>
        <div className="space-y-2">
          {[
            { label: t('totalCollected'), val: fmt(data.totalCollected), color: 'text-green-600' },
            { label: t('pendingDues'), val: fmt(data.pendingDues), color: 'text-red-600' },
            { label: t('repairCosts'), val: fmt(data.repairCosts), color: 'text-amber-600' },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600">{row.label}</span>
              <span className={`font-bold ${row.color}`}>{row.val}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-xs text-gray-500 uppercase font-medium mb-3">{t('monthlyIncome')}</p>
        {(data.monthly || []).map(m => (
          <div key={m.month} className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">{m.month}</span>
              <span className="font-medium">{fmt(m.income)}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(100, (m.income / (data.maxMonthly || 1)) * 100)}%` }} />
            </div>
          </div>
        ))}
      </Card>

      <Card className="p-4">
        <p className="text-xs text-gray-500 uppercase font-medium mb-3">Top Equipment by Revenue</p>
        {(data.topEquipment || []).map((e, i) => (
          <div key={e.name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <span className="text-lg font-bold text-gray-300">#{i + 1}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{e.name}</p>
              <p className="text-xs text-gray-500">{e.rentals} rentals</p>
            </div>
            <p className="font-bold text-indigo-600">{fmt(e.revenue)}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── Users (Owner only) ───────────────────────────────────────
function Users() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'member' });

  const load = useCallback(async () => {
    try { const r = await api.get('/users'); setItems(r.data); } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    try { await api.post('/users', form); setModal(false); setForm({ username: '', password: '', role: 'member' }); load(); } catch {}
  };

  const del = async id => {
    if (!window.confirm(t('confirmDelete'))) return;
    try { await api.delete(`/users/${id}`); load(); } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Btn onClick={() => setModal(true)}>+ {t('addUser')}</Btn>
      </div>
      {items.map(u => (
        <Card key={u.id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900">{u.username}</p>
              <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${u.role === 'owner' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{t(u.role)}</span>
            </div>
            {u.role !== 'owner' && <Btn size="sm" variant="danger" onClick={() => del(u.id)}>🗑️</Btn>}
          </div>
        </Card>
      ))}
      {modal && (
        <Modal title={t('addUser')} onClose={() => setModal(false)}>
          <Input label={t('username')} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          <Input label={t('newPwd')} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          <Select label={t('role')} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="member">{t('member')}</option>
            <option value="owner">{t('owner')}</option>
          </Select>
          <div className="flex gap-2 pt-1">
            <Btn onClick={save} className="flex-1">{t('save')}</Btn>
            <Btn variant="outline" onClick={() => setModal(false)} className="flex-1">{t('cancel')}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Main App Shell ───────────────────────────────────────────
function AppShell() {
  const { user, loading } = useAuth();
  const { t, lang, toggle } = useLang();
  const [tab, setTab] = useState('dashboard');
  const [drawer, setDrawer] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const isOwner = user?.role === 'owner';

  useEffect(() => {
    socket.on('online_count', setOnlineCount);
    return () => socket.off('online_count', setOnlineCount);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <LoginPage />;

  const pages = { dashboard: Dashboard, equipment: Equipment, customers: Customers, rentals: Rentals, payments: Payments, sales: Sales, maintenance: Maintenance, reports: Reports, users: Users };
  const Page = pages[tab] || Dashboard;
  const icons = { dashboard: '📊', equipment: '🔧', customers: '👥', rentals: '📦', payments: '💰', sales: '🛒', maintenance: '🛠️', reports: '📈', users: '👤' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => setDrawer(true)} className="text-gray-500 text-xl w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg">☰</button>
          <span className="text-lg">{icons[tab]}</span>
          <h1 className="font-bold text-gray-900 text-base flex-1">{t(tab)}</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1" />
              {onlineCount} {t('onlineUsers')}
            </span>
            <button onClick={toggle} className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-1 rounded-lg">
              {lang === 'en' ? 'తె' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer */}
      {drawer && <SideDrawer active={tab} onSelect={setTab} onClose={() => setDrawer(false)} isOwner={isOwner} />}

      {/* Page content */}
      <main className="pt-16 pb-24 px-4 max-w-2xl mx-auto">
        {tab === 'dashboard' ? <Dashboard onNavigate={setTab} /> : <Page />}
      </main>

      {/* Bottom nav */}
      <BottomNav active={tab} onSelect={setTab} onDrawer={() => setDrawer(true)} />
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────
export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </LangProvider>
  );
}