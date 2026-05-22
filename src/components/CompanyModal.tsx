import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Company, Status } from '../types';

const STATUSES: Status[] = ['未応募', '応募済み', '選考中', '参加確定', '辞退', '不合格'];

interface Props {
  company: Partial<Company> | null;
  onSave: (data: Omit<Company, 'id'>) => void;
  onClose: () => void;
}

const emptyForm = (): Omit<Company, 'id'> => ({
  name: '',
  deadline: null,
  selectionProcess: '',
  internDates: '',
  location: '',
  notes: '',
  status: '未応募',
  memo: '',
});

export function CompanyModal({ company, onSave, onClose }: Props) {
  const [form, setForm] = useState<Omit<Company, 'id'>>(emptyForm());

  useEffect(() => {
    if (company) {
      const { id: _id, ...rest } = company as Company;
      setForm({ ...emptyForm(), ...rest });
    } else {
      setForm(emptyForm());
    }
  }, [company]);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [key]: e.target.value || (key === 'deadline' ? null : e.target.value) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {(company as Company)?.id ? '企業情報を編集' : '企業を追加'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">企業名 *</label>
            <input
              required
              value={form.name}
              onChange={set('name')}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 株式会社○○"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
            <select
              value={form.status}
              onChange={set('status')}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">応募締切</label>
            <input
              type="datetime-local"
              value={form.deadline ? form.deadline.slice(0, 16) : ''}
              onChange={e => setForm(prev => ({ ...prev, deadline: e.target.value ? e.target.value : null }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">選考内容</label>
            <input
              value={form.selectionProcess}
              onChange={set('selectionProcess')}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 適性検査(SPI)・ES"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">インターン開催日</label>
            <input
              value={form.internDates}
              onChange={set('internDates')}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 8/24-9/4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">場所</label>
            <input
              value={form.location}
              onChange={set('location')}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 東京・大阪"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <input
              value={form.notes}
              onChange={set('notes')}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea
              value={form.memo}
              onChange={set('memo')}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="自由メモ..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
