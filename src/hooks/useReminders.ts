import { useEffect } from 'react';
import type { Company } from '../types';

const NOTIFIED_KEY = 'recruit-notified';

function getNotified(): Set<string> {
  const saved = localStorage.getItem(NOTIFIED_KEY);
  return new Set(saved ? JSON.parse(saved) : []);
}

function saveNotified(set: Set<string>) {
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set]));
}

export function useReminders(companies: Company[]) {
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (Notification.permission !== 'granted') return;

    const notified = getNotified();
    const now = new Date();

    companies.forEach(company => {
      if (!company.deadline) return;
      if (company.status === '参加確定' || company.status === '辞退' || company.status === '不合格') return;

      const deadline = new Date(company.deadline);
      const diffMs = deadline.getTime() - now.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      const thresholds = [
        { days: 1, label: '明日', key: `${company.id}-1d` },
        { days: 3, label: '3日後', key: `${company.id}-3d` },
      ];

      thresholds.forEach(({ days, label, key }) => {
        if (diffDays > 0 && diffDays <= days && !notified.has(key)) {
          new Notification(`📋 締切リマインド: ${company.name}`, {
            body: `応募締切が${label}(${deadline.toLocaleDateString('ja-JP')})に迫っています！\n選考: ${company.selectionProcess}`,
            icon: '/favicon.ico',
          });
          notified.add(key);
        }
      });
    });

    saveNotified(notified);
  }, [companies]);
}
