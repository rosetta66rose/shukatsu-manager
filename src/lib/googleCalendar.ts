const CALENDAR_ID = 'primary';
const GCAL_API = 'https://www.googleapis.com/calendar/v3';

export interface GCalEvent {
  summary: string;
  description?: string;
  start: { date: string } | { dateTime: string; timeZone: string };
  end: { date: string } | { dateTime: string; timeZone: string };
}

async function gcalFetch(token: string, path: string, options: RequestInit = {}) {
  return fetch(`${GCAL_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers as object | undefined),
    },
  });
}

/** イベントを作成し、作成されたイベントIDを返す */
export async function createGCalEvent(token: string, event: GCalEvent): Promise<string> {
  const res = await gcalFetch(
    token,
    `/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
    { method: 'POST', body: JSON.stringify(event) },
  );
  if (!res.ok) throw new Error(`GCal create failed: ${res.status}`);
  const data = await res.json() as { id: string };
  return data.id;
}

/** 既存イベントを上書き更新（404/410 は削除済みとみなし無視） */
export async function updateGCalEvent(token: string, eventId: string, event: GCalEvent): Promise<void> {
  const res = await gcalFetch(
    token,
    `/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${encodeURIComponent(eventId)}`,
    { method: 'PUT', body: JSON.stringify(event) },
  );
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`GCal update failed: ${res.status}`);
  }
}

/** イベントを削除（404/410 は削除済みとみなし無視） */
export async function deleteGCalEvent(token: string, eventId: string): Promise<void> {
  const res = await gcalFetch(
    token,
    `/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${encodeURIComponent(eventId)}`,
    { method: 'DELETE' },
  );
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`GCal delete failed: ${res.status}`);
  }
}
