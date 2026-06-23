import { useState, useCallback } from 'react';
import api from '../utils/api';

export function useAttendance() {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttendance = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = date || new Date().toISOString().split('T')[0];
      const res = await api.get(`/attendance?date=${dateStr}`);
      setGrouped(res.data.grouped || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAttendance = useCallback(async (studentId, status, leaveStart, leaveEnd) => {
    const res = await api.patch(`/attendance/${studentId}`, { status, leaveStart, leaveEnd });
    return res.data;
  }, []);

  // Optimistically update a student's status in local grouped state
  const optimisticUpdate = useCallback((studentId, status, leaveStart, leaveEnd) => {
    setGrouped(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      for (const floor of Object.values(next)) {
        for (const room of Object.values(floor)) {
          const student = room.students.find(s => s._id === studentId);
          if (student) {
            student.status = status;
            student.leaveStart = leaveStart || null;
            student.leaveEnd = leaveEnd || null;
          }
        }
      }
      return next;
    });
  }, []);

  return { grouped, loading, error, fetchAttendance, markAttendance, optimisticUpdate };
}
