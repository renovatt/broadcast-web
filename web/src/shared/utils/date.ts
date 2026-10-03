import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

/** Qualquer valor com toDate() (ex.: Timestamp do Firestore) ou um Date. */
type DateLike = Date | { toDate: () => Date };

const toDate = (value: DateLike) => (value instanceof Date ? value : value.toDate());

/** 03/10/2026 */
export const formatDate = (value: DateLike) => dayjs(toDate(value)).format('DD/MM/YYYY');

/** 03/10/2026 14:30 */
export const formatDateTime = (value: DateLike) => dayjs(toDate(value)).format('DD/MM/YYYY HH:mm');
