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
const NAV = [
  { key: 'dashboard', icon: '📊' },
  { key: 'equipment', icon: '🔧' },
  { key: 'customers', icon: '👥' },
  { key: 'rentals', icon: '📦' },
  { key: 'payments', icon: '💰' },
  { key: 'maintenance', icon: '🛠️' },
  { key: 'reports', icon: '📈' },
  { key: 'users', icon: '👤' },
];

function BottomNav({ active, onSelect, isOwner }) {
  const { t } = useLang();
  const visible = NAV.filter(n => (n.key !== 'reports' && n.key !== 'users') || isOwner);
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-40 shadow-lg">
      {visible.slice(0, 5).map(n => (
        <button key={n.key} onClick={() => onSelect(n.key)}
          className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${active === n.key ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <span className="text-xl">{n.icon}</span>
          <span className="text-[10px] font-medium leading-tight">{t(n.key)}</span>
        </button>
      ))}
      {isOwner && (
        <button onClick={() => onSelect(active === 'reports' ? 'more' : 'reports')}
          className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${['reports', 'users'].includes(active) ? 'text-indigo-600' : 'text-gray-400'}`}>
          <span className="text-xl">⋯</span>
          <span className="text-[10px] font-medium">More</span>
        </button>
      )}
    </nav>
  );
}

function SideDrawer({ active, onSelect, onClose, isOwner }) {
  const { t, lang, toggle } = useLang();
  const { logout, user } = useAuth();
  const tabs = NAV.filter(n => (n.key !== 'reports' && n.key !== 'users') || isOwner);
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="w-64 bg-white h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="bg-indigo-600 px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🏗️</div>
            <div>
              <p className="text-white font-bold text-sm">{t('appName')}</p>
              <p className="text-indigo-200 text-xs">{user?.username} · {user?.role}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-3">
          {tabs.map(n => (
            <button key={n.key} onClick={() => { onSelect(n.key); onClose(); }}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${active === n.key ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span className="text-lg">{n.icon}</span>{t(n.key)}
            </button>
          ))}
        </div>
        <div className="border-t border-gray-100 p-4 flex flex-col gap-2">
          <button onClick={toggle} className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 py-1">
            🌐 {lang === 'en' ? 'తెలుగు' : 'English'}
          </button>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 py-1">
            🚪 {t('logout')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────
function Dashboard() {
  const { t } = useLang();
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

  const tiles = stats ? [
    { label: t('totalEquip'), val: stats.totalEquip, icon: '🔧', color: 'bg-blue-50 text-blue-600' },
    { label: t('activeRentals'), val: stats.activeRentals, icon: '📦', color: 'bg-indigo-50 text-indigo-600' },
    { label: t('thisMonth'), val: fmt(stats.thisMonthIncome), icon: '💵', color: 'bg-green-50 text-green-600' },
    { label: t('pendingDues'), val: fmt(stats.pendingDues), icon: '⏳', color: 'bg-red-50 text-red-600' },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {tiles.map(tile => (
          <Card key={tile.label} className="p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-2 ${tile.color}`}>{tile.icon}</div>
            <p className="text-xs text-gray-500 font-medium">{tile.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{tile.val ?? '—'}</p>
          </Card>
        ))}
      </div>

      {stats && (
        <Card className="p-4">
          <p className="text-xs text-gray-500 uppercase font-medium mb-3">{t('overdueRentals')}</p>
          {stats.overdueCount > 0
            ? <p className="text-red-600 font-bold text-2xl">{stats.overdueCount} rentals overdue</p>
            : <p className="text-green-600 font-medium">✓ No overdue rentals</p>}
        </Card>
      )}

      <Card>
        <div className="px-4 pt-4 pb-2 border-b border-gray-50">
          <p className="text-xs text-gray-500 uppercase font-medium">Recent Rentals</p>
        </div>
        {recent.length === 0
          ? <EmptyState icon="📦" text={t('noData')} sub={t('tapAdd')} />
          : recent.map(r => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{r.customer_name}</p>
                <p className="text-xs text-gray-500">{r.equipment_name} · {r.site}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-lg ${badge(r.status)}`}>{t(r.status)}</span>
            </div>
          ))}
      </Card>
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
          <Input label={t('qty')} type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} min={1} />
          <Input label={t('costPerUnit')} type="number" value={form.cost_per_unit} onChange={e => setForm(f => ({ ...f, cost_per_unit: e.target.value }))} />
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
    customer_id: '', equipment_id: '', site: '',
    date_out: today(), return_date: '', daily_rate: '', deposit: '', notes: ''
  });

  const load = useCallback(async () => {
    try {
      const [r, c, e] = await Promise.all([api.get('/rentals'), api.get('/customers'), api.get('/equipment')]);
      setItems(r.data); setCustomers(c.data); setEquipment(e.data);
    } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { socket.on('refresh', load); return () => socket.off('refresh', load); }, [load]);

  const openAdd = () => {
    setForm({ customer_id: '', equipment_id: '', site: '', date_out: today(), return_date: '', daily_rate: '', deposit: '', notes: '' });
    setModal('add');
  };

  const save = async () => {
    try {
      if (modal === 'add') await api.post('/rentals', form);
      else await api.put(`/rentals/${modal.id}`, form);
      setModal(null); load();
    } catch {}
  };

  const markReturned = async (id, actualReturn) => {
    try { await api.patch(`/rentals/${id}/return`, { actual_return: actualReturn }); setRetModal(null); load(); } catch {}
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
        <Btn onClick={openAdd}>+ Add</Btn>
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
        : filtered.map(r => (
          <Card key={r.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-900">{r.customer_name}</p>
                <p className="text-xs text-gray-500">{r.equipment_name} · {r.site}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-lg ${badge(r.status)}`}>{t(r.status)}</span>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>📅 Out: {r.date_out}</span>
              <span>🔙 Due: {r.return_date}</span>
            </div>
            {r.daily_rate && <p className="text-xs text-indigo-600 font-medium mt-1">{fmt(r.daily_rate)}/day</p>}
            <div className="flex gap-1 mt-3 flex-wrap">
              {r.status !== 'returned' && (
                <Btn size="sm" variant="success" onClick={() => setRetModal(r)}>✓ {t('markReturned')}</Btn>
              )}
              <Btn size="sm" variant="outline" onClick={() => { setForm({ ...r }); setModal(r); }}>✏️</Btn>
              {isOwner && <Btn size="sm" variant="danger" onClick={() => del(r.id)}>🗑️</Btn>}
            </div>
          </Card>
        ))}

      {modal && (
        <Modal title={modal === 'add' ? t('newRental') : t('edit')} onClose={() => setModal(null)}>
          <Select label={t('customer')} value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}>
            <option value="">Select customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label={t('equipRented')} value={form.equipment_id} onChange={e => setForm(f => ({ ...f, equipment_id: e.target.value }))}>
            <option value="">Select equipment</option>
            {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </Select>
          <Input label={t('site')} value={form.site} onChange={e => setForm(f => ({ ...f, site: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <Input label={t('dateOut')} type="date" value={form.date_out} onChange={e => setForm(f => ({ ...f, date_out: e.target.value }))} />
            <Input label={t('returnDate')} type="date" value={form.return_date} onChange={e => setForm(f => ({ ...f, return_date: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label={t('dailyRate')} type="number" value={form.daily_rate} onChange={e => setForm(f => ({ ...f, daily_rate: e.target.value }))} />
            <Input label={t('deposit')} type="number" value={form.deposit} onChange={e => setForm(f => ({ ...f, deposit: e.target.value }))} />
          </div>
          <Textarea label={t('notes')} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="flex gap-2 pt-1">
            <Btn onClick={save} className="flex-1">{t('save')}</Btn>
            <Btn variant="outline" onClick={() => setModal(null)} className="flex-1">{t('cancel')}</Btn>
          </div>
        </Modal>
      )}

      {retModal && <ReturnModal rental={retModal} onClose={() => setRetModal(null)} onSave={markReturned} t={t} />}
    </div>
  );
}

function ReturnModal({ rental, onClose, onSave, t }) {
  const [date, setDate] = useState(today());
  const days = daysBetween(rental.date_out, date);
  const bill = days * Number(rental.daily_rate || 0);
  return (
    <Modal title={t('markReturned')} onClose={onClose}>
      <p className="text-sm text-gray-600">Customer: <strong>{rental.customer_name}</strong></p>
      <p className="text-sm text-gray-600">Equipment: <strong>{rental.equipment_name}</strong></p>
      <Input label={t('actualReturn')} type="date" value={date} onChange={e => setDate(e.target.value)} />
      <div className="bg-indigo-50 rounded-xl p-3 text-sm">
        <div className="flex justify-between"><span className="text-gray-600">Days out:</span><span className="font-medium">{days}</span></div>
        <div className="flex justify-between mt-1"><span className="text-gray-600">{t('totalBill')}:</span><span className="font-bold text-indigo-700">{fmt(bill)}</span></div>
      </div>
      <div className="flex gap-2">
        <Btn onClick={() => onSave(rental.id, date)} variant="success" className="flex-1">✓ Confirm Return</Btn>
        <Btn variant="outline" onClick={onClose} className="flex-1">{t('cancel')}</Btn>
      </div>
    </Modal>
  );
}

// ── Payments ─────────────────────────────────────────────────
function Payments() {
  const { t } = useLang();
  const { isOwner } = useAuth();
  const [items, setItems] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ rental_id: '', total_bill: '', amt_paid: '', pay_date: today(), notes: '' });

  const load = useCallback(async () => {
    try {
      const [p, r] = await Promise.all([api.get('/payments'), api.get('/rentals')]);
      setItems(p.data); setRentals(r.data);
    } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { socket.on('refresh', load); return () => socket.off('refresh', load); }, [load]);

  const openAdd = () => { setForm({ rental_id: '', total_bill: '', amt_paid: '', pay_date: today(), notes: '' }); setModal('add'); };

  const save = async () => {
    try {
      await api.post('/payments', form);
      setModal(null); load();
    } catch {}
  };

  const payStatus = p => {
    const bal = p.total_bill - p.amt_paid;
    if (bal <= 0) return 'paid';
    if (p.amt_paid > 0) return 'partial';
    return 'pending';
  };

  const filtered = items.filter(i =>
    (i.customer_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder={t('searchPlaceholder')} /></div>
        <Btn onClick={openAdd}>+ Add</Btn>
      </div>
      {filtered.length === 0
        ? <EmptyState icon="💰" text={t('noData')} sub={t('tapAdd')} />
        : filtered.map(p => {
          const status = payStatus(p);
          const bal = p.total_bill - p.amt_paid;
          return (
            <Card key={p.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{p.customer_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.pay_date}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${badge(status)}`}>{t(status)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="bg-gray-50 rounded-xl p-2">
                  <p className="text-xs text-gray-500">Bill</p>
                  <p className="font-bold text-sm">{fmt(p.total_bill)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-2">
                  <p className="text-xs text-gray-500">Paid</p>
                  <p className="font-bold text-sm text-green-700">{fmt(p.amt_paid)}</p>
                </div>
                <div className={`rounded-xl p-2 ${bal > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <p className="text-xs text-gray-500">Balance</p>
                  <p className={`font-bold text-sm ${bal > 0 ? 'text-red-600' : 'text-gray-400'}`}>{fmt(bal)}</p>
                </div>
              </div>
              {p.notes && <p className="text-xs text-gray-400 mt-2 italic">{p.notes}</p>}
            </Card>
          );
        })}

      {modal && (
        <Modal title={t('recPayment')} onClose={() => setModal(null)}>
          <Select label="Rental" value={form.rental_id} onChange={e => setForm(f => ({ ...f, rental_id: e.target.value }))}>
            <option value="">Select rental</option>
            {rentals.map(r => <option key={r.id} value={r.id}>{r.customer_name} — {r.equipment_name} ({r.site})</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Input label={t('totalBill')} type="number" value={form.total_bill} onChange={e => setForm(f => ({ ...f, total_bill: e.target.value }))} />
            <Input label={t('amtPaid')} type="number" value={form.amt_paid} onChange={e => setForm(f => ({ ...f, amt_paid: e.target.value }))} />
          </div>
          <Input label={t('payDate')} type="date" value={form.pay_date} onChange={e => setForm(f => ({ ...f, pay_date: e.target.value }))} />
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
            <Input label={t('repairCost')} type="number" value={form.repair_cost} onChange={e => setForm(f => ({ ...f, repair_cost: e.target.value }))} />
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

  const pages = { dashboard: Dashboard, equipment: Equipment, customers: Customers, rentals: Rentals, payments: Payments, maintenance: Maintenance, reports: Reports, users: Users };
  const Page = pages[tab] || Dashboard;
  const icons = { dashboard: '📊', equipment: '🔧', customers: '👥', rentals: '📦', payments: '💰', maintenance: '🛠️', reports: '📈', users: '👤' };

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
        <Page />
      </main>

      {/* Bottom nav */}
      <BottomNav active={tab} onSelect={setTab} isOwner={isOwner} />
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