import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime } from '../utils/date';

const date = new Date(2026, 9, 3, 14, 5);
const timestampLike = { toDate: () => date };

describe('formatDate', () => {
  it('formata Date e Timestamp como DD/MM/YYYY', () => {
    expect(formatDate(date)).toBe('03/10/2026');
    expect(formatDate(timestampLike)).toBe('03/10/2026');
  });
});

describe('formatDateTime', () => {
  it('formata como DD/MM/YYYY HH:mm', () => {
    expect(formatDateTime(date)).toBe('03/10/2026 14:05');
    expect(formatDateTime(timestampLike)).toBe('03/10/2026 14:05');
  });
});
