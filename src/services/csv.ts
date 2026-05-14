import type { Package, PackageInput } from '@/types/package';

function formatCSVDate(ts?: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

export function exportToCSV(packages: Package[]): string {
  const BOM = '\uFEFF';
  const header = '快递单号,快递公司,备注,状态,录入时间,签收时间';

  const rows = packages.map((p) => {
    const status = p.status === 'pending' ? '待收件' : '已收到';
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    return [
      escape(p.trackingNumber),
      escape(p.company),
      escape(p.remark),
      status,
      formatCSVDate(p.createdAt),
      formatCSVDate(p.receivedAt),
    ].join(',');
  });

  return BOM + header + '\n' + rows.join('\n');
}

export function downloadCSV(packages: Package[]): void {
  const csv = exportToCSV(packages);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `快递记录_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCSV(text: string): PackageInput[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].replace(/^\uFEFF/, '').split(',').map((h) => h.trim());
  const numberIdx = header.findIndex((h) => h === '快递单号' || h === 'trackingNumber');
  const companyIdx = header.findIndex((h) => h === '快递公司' || h === 'company');
  const remarkIdx = header.findIndex((h) => h === '备注' || h === 'remark');

  if (numberIdx === -1) return [];

  const records: PackageInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const num = cols[numberIdx]?.trim();
    if (!num) continue;

    records.push({
      trackingNumber: num,
      company: cols[companyIdx]?.trim() || '',
      remark: cols[remarkIdx]?.trim() || '',
    });
  }

  return records;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (inQuotes) {
      if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

export async function readCSVFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
}
