import { createGCalEvent, updateGCalEvent, deleteGCalEvent } from '../lib/googleCalendar';
import type { GCalEvent } from '../lib/googleCalendar';
import { parseEventDates } from '../utils/date';
import type { Company } from '../types';

function buildDeadlineEvent(company: Company): GCalEvent {
  const isHonsen = company.type === '本選考';
  const dateStr = company.deadline!.slice(0, 10);
  return {
    summary: `${isHonsen ? '📝' : '📋'} ${company.name} 締切`,
    description: [
      `種別: ${company.type}`,
      `ステータス: ${company.status}`,
      company.selectionProcess ? `選考: ${company.selectionProcess}` : '',
      company.location ? `場所: ${company.location}` : '',
      company.notes ? `備考: ${company.notes}` : '',
    ].filter(Boolean).join('\n'),
    start: { date: dateStr },
    end: { date: dateStr },
  };
}

function buildEventDateEvent(company: Company, start: string, end?: string): GCalEvent {
  const isHonsen = company.type === '本選考';
  const confirmed = isHonsen
    ? company.status === '内定'
    : company.status === '参加確定';
  return {
    summary: `${confirmed ? (isHonsen ? '🎉' : '✅') : (isHonsen ? '🤝' : '🏢')} ${company.name}${isHonsen ? ' 面接' : ' 参加'}`,
    description: [
      `種別: ${company.type}`,
      `ステータス: ${company.status}`,
      company.location ? `場所: ${company.location}` : '',
    ].filter(Boolean).join('\n'),
    start: { date: start },
    end:   { date: end ?? start },
  };
}

export function useCalendarSync() {
  /**
   * 企業情報を Google Calendar に同期する。
   * 返り値は Firestore に保存すべき gcal ID の更新差分。
   */
  const syncCompany = async (
    company: Company,
    token: string,
  ): Promise<{ gcalDeadlineId?: string; gcalEventIds?: string[] }> => {
    const updates: { gcalDeadlineId?: string; gcalEventIds?: string[] } = {};

    // ── 締切イベント ──────────────────────────────
    if (company.deadline) {
      const event = buildDeadlineEvent(company);
      if (company.gcalDeadlineId) {
        await updateGCalEvent(token, company.gcalDeadlineId, event);
        updates.gcalDeadlineId = company.gcalDeadlineId;
      } else {
        updates.gcalDeadlineId = await createGCalEvent(token, event);
      }
    }

    // ── 参加日 / 面接日イベント ────────────────────
    if (company.eventDates) {
      const dates = parseEventDates(company.eventDates);
      const newIds: string[] = [];

      for (let i = 0; i < dates.length; i++) {
        const d = dates[i];
        const event = buildEventDateEvent(company, d.start, d.end);
        const existingId = company.gcalEventIds?.[i];
        if (existingId) {
          await updateGCalEvent(token, existingId, event);
          newIds.push(existingId);
        } else {
          newIds.push(await createGCalEvent(token, event));
        }
      }

      // 日程が減った場合、余分な旧イベントを削除
      const oldIds = company.gcalEventIds ?? [];
      for (let i = dates.length; i < oldIds.length; i++) {
        await deleteGCalEvent(token, oldIds[i]);
      }
      updates.gcalEventIds = newIds;
    }

    return updates;
  };

  /** 企業削除時に Google Calendar 側のイベントをまとめて消す */
  const removeCompany = async (company: Company, token: string): Promise<void> => {
    const tasks: Promise<void>[] = [];
    if (company.gcalDeadlineId) {
      tasks.push(deleteGCalEvent(token, company.gcalDeadlineId));
    }
    for (const id of company.gcalEventIds ?? []) {
      tasks.push(deleteGCalEvent(token, id));
    }
    await Promise.all(tasks);
  };

  return { syncCompany, removeCompany };
}
