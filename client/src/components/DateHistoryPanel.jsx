import { useEffect, useState } from 'react';
import api from '../utils/api';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DateHistoryPanel({ selectedDate, onDateSelect }) {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/history/dates')
      .then(res => setDates(res.data || []))
      .catch(() => setDates([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="history-sidebar">
      <div className="history-sidebar-header">History</div>
      {loading && (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Loading…</span>
        </div>
      )}
      {!loading && dates.length === 0 && (
        <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
          No history yet. Archive today's attendance to start building history.
        </div>
      )}
      {dates.map(d => {
        const dStr = new Date(d).toISOString().split('T')[0];
        return (
          <div
            key={dStr}
            className={`history-date-item ${selectedDate === dStr ? 'active' : ''}`}
            onClick={() => onDateSelect(dStr)}
            id={`history-date-${dStr}`}
          >
            {formatDate(d)}
          </div>
        );
      })}
    </div>
  );
}
