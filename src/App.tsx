import { useState } from 'react';
import { LayoutDashboard, Calendar, Bell, LogOut } from 'lucide-react';
import type { Company } from './types';
import { useAuth } from './hooks/useAuth';
import { useCompanies } from './hooks/useCompanies';
import { useReminders } from './hooks/useReminders';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { CompanyModal } from './components/CompanyModal';
import { DetailModal } from './components/DetailModal';
import { LoginPage } from './components/LoginPage';

type View = 'dashboard' | 'calendar';

export default function App() {
  const { user, authLoading, signInWithGoogle, signOutUser } = useAuth();
  const { companies, loading, addCompany, updateCompany, deleteCompany } = useCompanies(user?.uid ?? '');

  const [view, setView] = useState<View>('dashboard');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useReminders(companies);

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <LoginPage onSignIn={signInWithGoogle} />;
  }

  const handleEdit = (company: Company) => {
    setDetailCompany(null);
    setEditingCompany(company);
  };

  const handleSave = (data: Omit<Company, 'id'>) => {
    if (editingCompany) {
      updateCompany(editingCompany.id, data);
    } else {
      addCompany(data);
    }
    setEditingCompany(null);
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('この企業を削除しますか？')) {
      deleteCompany(id);
      setDetailCompany(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-base font-bold text-gray-900">就活管理</h1>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{user.displayName}</p>
        </div>
        <nav className="p-3 flex-1">
          <NavItem
            icon={<LayoutDashboard size={18} />}
            label="ダッシュボード"
            active={view === 'dashboard'}
            onClick={() => setView('dashboard')}
          />
          <NavItem
            icon={<Calendar size={18} />}
            label="カレンダー"
            active={view === 'calendar'}
            onClick={() => setView('calendar')}
          />
        </nav>
        <div className="p-3 border-t border-gray-200 space-y-1">
          <button
            onClick={() => {
              if (Notification.permission !== 'granted') {
                Notification.requestPermission().then(p => {
                  if (p === 'granted') alert('通知を許可しました。締切前にリマインドします。');
                });
              } else {
                alert('通知はすでに許可されています。');
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Bell size={16} />
            通知設定
          </button>
          <button
            onClick={signOutUser}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm gap-2">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            読み込み中...
          </div>
        ) : view === 'dashboard' ? (
          <Dashboard
            companies={companies}
            onEdit={c => setDetailCompany(c)}
            onAdd={() => setShowAddModal(true)}
            onUpdateStatus={(id, status) => updateCompany(id, { status })}
          />
        ) : (
          <CalendarView
            companies={companies}
            onEdit={c => setDetailCompany(c)}
          />
        )}
      </main>

      {/* Modals */}
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
          onUpdateMemo={memo => updateCompany(detailCompany.id, { memo })}
          onUpdateStatus={status => {
            updateCompany(detailCompany.id, { status });
            setDetailCompany(prev => prev ? { ...prev, status } : null);
          }}
        />
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors ${
        active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
