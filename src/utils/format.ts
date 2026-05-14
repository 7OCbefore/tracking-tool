export function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${day} ${h}:${min}`;
}

const COMPANY_MAP: Record<string, string> = {
  SF: '顺丰',
  ZTO: '中通',
  YTO: '圆通',
  STO: '申通',
  YD: '韵达',
  JD: '京东',
  EMS: 'EMS',
  HTKY: '百世',
  DB: '德邦',
};

export function normalizeCompany(input: string): string {
  const upper = input.toUpperCase().trim();
  return COMPANY_MAP[upper] ?? input.trim();
}
