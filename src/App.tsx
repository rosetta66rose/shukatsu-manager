import { useState, useCallback } from 'react';
import { LayoutDashboard, Calendar, Bell, LogOut, CalendarCheck, CalendarX } from 'lucide-react';
import type { Company, Status } from './types';
import { useAuth, getGcalToken } from './hooks/useAuth';
import { useCompanies } from './hooks/useCompanies';
import { useReminders } from './hooks/useReminders';
import { useCalendarSync } from './hooks/useCalendarSync';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { CompanyModal } from './components/CompanyModal';
import { DetailModal } from './components/DetailModal';
import { LoginPage } from './components/LoginPage';
import { BottomNav } from './components/BottomNav';

type View = 'dashboard' | 'calendar';

const notificationSupported = typeof Notification !== 'undefined';

function handleNotification() {
  if (!notificationSupported) { alert('この端末は通知に対応していません。'); return; }
  if (Notification.permission !== 'granted') {
    Notification.requestPermission().then(p => {
      if (p === 'granted') alert('通知を許可しました。締切前にリマインドします。');
    });
  } else {
    alert('通知はすでに許可されています。');
  }
}

export default function App() {
  const { user, authLoading, error, signInWithGoogle, signOutUser, reconnectGcal } = useAuth();
  const { companies, loading, addCompany, updateCompany, deleteCompany } = useCompanies(user?.uid ?? '');
  const { syncCompany, removeCompany } = useCalendarSync();

  const [view, setView] = useState<View>('dashboard');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [gcalConnected, setGcalConnected] = useState(() => !!getGcalToken());
  const [gcalSyncing, setGcalSyncing] = useState(false);

  useReminders(companies);

  // ── Google Calendar ヘルパー ───────────────────────────────────
  const tryGcalSync = useCallback(async (company: Company) => {
    const token = getGcalToken();
    if (!token) return;
    try {
      setGcalSyncing(true);
      const gcalUpdates = await syncCompany(company, token);
      if (Object.keys(gcalUpdates).length > 0) {
        await updateCompany(company.id, gcalUpdates);
      }
    } catch (e) {
      console.error('Google Calendar sync failed:', e);
    } finally {
      setGcalSyncing(false);
    }
  }, [syncCompany, updateCompany]);

  const handleReconnectGcal = async () => {
    const ok = await reconnectGcal();
    setGcalConnected(ok);
    if (!ok) alert('Google カレンダーの再接続に失敗しました。');
  };

  // ── 認証ローディング ──────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onSignIn={signInWithGoogle} error={error} />;
  }

  // ── 操作ハンドラ ──────────────────────────────────────────────
  const handleEdit = (company: Company) => {
    setDetailCompany(null);
    setEditingCompany(company);
  };

  const handleSave = async (data: Omit<Company, 'id'>) => {
    if (editingCompany) {
      await updateCompany(editingCompany.id, data);
      await tryGcalSync({ ...editingCompany, ...data });
    } else {
      const id = await addCompany(data);
      await tryGcalSync({ ...data, id } as Company);
    }
    setEditingCompany(null);
    setShowAddModal(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('この企業を削除しますか？')) {
      const company = companies.find(c => c.id === id);
      const token = getGcalToken();
      if (company && token) {
        try { await removeCompany(company, token); } catch (e) { console.error(e); }
      }
      deleteCompany(id);
      setDetailCompany(null);
    }
  };

  const handleUpdateStatus = async (id: string, status: Status) => {
    await updateCompany(id, { status });
    const company = companies.find(c => c.id === id);
    if (company) await tryGcalSync({ ...company, status });
    // DetailModal の表示も更新
    setDetailCompany(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* PC: サイドバー */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-base font-bold text-gray-900">就活管理</h1>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{user.displayName}</p>
        </div>
        <nav className="p-3 flex-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="ダッシュボード" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem icon={<Calendar size={18} />} label="カレンダー" active={view === 'calendar'} onClick={() => setView('calendar')} />
        </nav>
        <div className="p-3 border-t border-gray-200 space-y-1">
          {/* Google Calendar 連携ステータス */}
          {gcalConnected ? (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-green-700 bg-green-50 rounded-lg">
              <CalendarCheck size={14} />
              <span className="flex-1 font-medium">Googleカレンダー連携中</span>
              {gcalSyncing && <span className="w-3 h-3 border border-green-500 border-t-transparent rounded-full animate-spin" />}
            </div>
          ) : (
            <button
              onClick={handleReconnectGcal}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors font-medium"
            >
              <CalendarX size={14} />Googleカレンダー連携
            </button>
          )}
          <button onClick={handleNotification} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <Bell size={16} />通知設定
          </button>
          <button onClick={signOutUser} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={16} />ログアウト
          </button>
        </div>
      </aside>

      {/* コンテンツ */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm gap-2 pt-20">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            読み込み中...
          </div>
        ) : view === 'dashboard' ? (
          <Dashboard
            companies={companies}
            onEdit={c => setDetailCompany(c)}
            onAdd={() => setShowAddModal(true)}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <CalendarView companies={companies} onEdit={c => setDetailCompany(c)} />
        )}
      </main>

      {/* スマホ: ボトムナビ */}
      <BottomNav
        view={view}
        onChangeView={setView}
        onNotification={handleNotification}
        onSignOut={signOutUser}
        gcalConnected={gcalConnected}
        gcalSyncing={gcalSyncing}
        onReconnectGcal={handleReconnectGcal}
      />

      {/* モーダル */}
      {(editingCompany || showAddModal) && (
        <CompanyModal
          company={editingCompany}
          onSave={handleSave}
          onClose={() => { setEditingCompany(null); setShowAddModal(false); }}
        />
      )}
      {detailCompany && !editingCompany && (
        <DetailModal
          company={detailCompany}
          onClose={() => setDetailCompany(null)}
          onEdit={() => handleEdit(detailCompany)}
          onDelete={() => handleDelete(detailCompany.id)}
          onUpdateMemo={async memo => {
            await updateCompany(detailCompany.id, { memo });
            setDetailCompany(prev => prev ? { ...prev, memo } : null);
          }}
          onUpdateStatus={status => handleUpdateStatus(detailCompany.id, status)}
        />
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors ${
        active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {icon}{label}
    </button>
  );
}
