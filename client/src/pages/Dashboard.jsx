import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import FloorTabs from '../components/FloorTabs';
import RoomTile from '../components/RoomTile';
import StudentModal from '../components/StudentModal';
import LeaveModal from '../components/LeaveModal';
import DateHistoryPanel from '../components/DateHistoryPanel';
import { useAttendance } from '../hooks/useAttendance';
import api from '../utils/api';

// ── Skeleton loader ─────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="room-grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="skeleton skeleton-tile" />
      ))}
    </div>
  );
}

// ── Room Grid for a floor ───────────────────────────────────
function FloorRoomGrid({ floorData, onStudentClick, absenteesFilter, searchQuery, readOnly, roomTypeFilter }) {
  if (!floorData) return <div style={{ padding: '2rem', color: 'var(--muted)', textAlign: 'center' }}>No rooms on this floor.</div>;

  const rooms = Object.values(floorData);

  // Filter by search query
  const filtered = searchQuery
    ? rooms.filter(room =>
        room.roomNo.includes(searchQuery) ||
        room.students.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : rooms;

  // Filter by absentees
  const displayed = absenteesFilter
    ? filtered.filter(room => room.students.some(s => !s.status || s.status === 'absent'))
    : filtered;

  if (displayed.length === 0) {
    return (
      <div style={{ padding: '2rem', color: 'var(--muted)', textAlign: 'center', fontSize: '0.9rem' }}>
        {searchQuery ? 'No rooms match your search.' : 'No absentees found on this floor.'}
      </div>
    );
  }

  const typeFiltered = roomTypeFilter === 'all' 
    ? displayed 
    : displayed.filter(r => r.roomType === roomTypeFilter);

  if (typeFiltered.length === 0) {
    return (
      <div style={{ padding: '2rem', color: 'var(--muted)', textAlign: 'center', fontSize: '0.9rem' }}>
        No rooms found for the selected filter.
      </div>
    );
  }

  const sharingRooms = typeFiltered.filter(r => r.roomType === 'sharing');
  const singleRooms  = typeFiltered.filter(r => r.roomType === 'single');

  return (
    <div>
      {sharingRooms.length > 0 && (
        <>
          {singleRooms.length > 0 && (
            <div className="section-label">Sharing Rooms</div>
          )}
          <div className="room-grid">
            {sharingRooms.map(room => (
              <RoomTile
                key={room.roomNo}
                room={room}
                onStudentClick={onStudentClick}
                absenteesFilter={absenteesFilter}
                readOnly={readOnly}
              />
            ))}
          </div>
        </>
      )}
      {singleRooms.length > 0 && (
        <>
          <div className="section-label">Single Rooms</div>
          <div className="room-grid">
            {singleRooms.map(room => (
              <RoomTile
                key={room.roomNo}
                room={room}
                onStudentClick={onStudentClick}
                absenteesFilter={absenteesFilter}
                readOnly={readOnly}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Filter Dropdown ─────────────────────────────────────────
const FilterDropdown = ({ filterMode, setFilterMode, disabled }) => {
  const [open, setOpen] = useState(false);
  const options = [
    { value: 'all', label: 'All Rooms' },
    { value: 'absentees', label: 'Absentees' },
    { value: 'single', label: 'Single Rooms' },
    { value: 'sharing', label: 'Sharing Rooms' }
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button 
        style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--border)', background: 'var(--card-bg)', borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer', color: filterMode !== 'all' ? 'var(--heading)' : 'var(--muted)', opacity: disabled ? 0.6 : 1 }}
        onClick={() => !disabled && setOpen(!open)}
        title="Filter Options"
      >
        {open ? (
          <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        ) : (
          <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        )}
      </button>
      
      {open && <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />}
      
      <div style={{ 
        position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: 'var(--card-bg)', 
        border: '1.5px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
        zIndex: 20, minWidth: '150px', overflow: 'hidden',
        opacity: open ? 1 : 0,
        visibility: open ? 'visible' : 'hidden',
        transform: open ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'all 0.2s ease-in-out'
      }}>
        {options.map((opt, i) => (
          <div 
            key={opt.value}
            style={{ padding: '0.75rem 1rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: filterMode === opt.value ? 600 : 400, color: filterMode === opt.value ? 'var(--heading)' : 'var(--text)', background: filterMode === opt.value ? 'var(--hover-bg)' : 'transparent', borderBottom: i < options.length - 1 ? '1px solid var(--border)' : 'none' }}
            onClick={() => { setFilterMode(opt.value); setOpen(false); }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = filterMode === opt.value ? 'var(--hover-bg)' : 'transparent'}
          >
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Dashboard ──────────────────────────────────────────
export default function Dashboard() {
  const [activeFloor, setActiveFloor] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [historyMode, setHistoryMode] = useState(false);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(null);
  const [historyGrouped, setHistoryGrouped] = useState({});
  const [historyLoading, setHistoryLoading] = useState(false);

  // Student modal (View 4)
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Leave modal (View 5)
  const [leaveStudent, setLeaveStudent] = useState(null);
  const [leaveLoading, setLeaveLoading] = useState(false);

  const { grouped, loading, error, fetchAttendance, markAttendance, optimisticUpdate } = useAttendance();

  // Fetch today's attendance on mount and when floor changes (only once on mount actually)
  useEffect(() => {
    if (!historyMode) {
      const today = new Date().toISOString().split('T')[0];
      fetchAttendance(today);
    }
  }, [historyMode]);

  // Fetch history when a date is selected
  useEffect(() => {
    if (!selectedHistoryDate) return;
    setHistoryLoading(true);
    api.get(`/history?date=${selectedHistoryDate}`)
      .then(res => setHistoryGrouped(res.data.grouped || {}))
      .catch(() => setHistoryGrouped({}))
      .finally(() => setHistoryLoading(false));
  }, [selectedHistoryDate]);

  // ── Handlers ─────────────────────────────────────────────
  const handleStudentClick = useCallback((student) => {
    setSelectedStudent(student);
    setLeaveStudent(null);
  }, []);

  const handleMarkStatus = useCallback(async (studentId, status = 'present') => {
    setModalLoading(true);
    const prev = selectedStudent?.status;
    optimisticUpdate(studentId, status, null, null);
    setSelectedStudent(s => s ? { ...s, status } : s);
    try {
      await markAttendance(studentId, status, null, null);
    } catch {
      // revert
      optimisticUpdate(studentId, prev, null, null);
      setSelectedStudent(s => s ? { ...s, status: prev } : s);
    } finally {
      setModalLoading(false);
      if (status !== 'leave') setSelectedStudent(null);
    }
  }, [selectedStudent, markAttendance, optimisticUpdate]);

  const handleLeaveOpen = useCallback((student) => {
    setLeaveStudent(student);
    setSelectedStudent(null);
  }, []);

  const handleLeaveSubmit = useCallback(async (studentId, leaveStart, leaveEnd) => {
    setLeaveLoading(true);
    const prev = leaveStudent?.status;
    optimisticUpdate(studentId, 'leave', leaveStart, leaveEnd);
    try {
      await markAttendance(studentId, 'leave', leaveStart, leaveEnd);
      setLeaveStudent(null);
    } catch {
      optimisticUpdate(studentId, prev, null, null);
    } finally {
      setLeaveLoading(false);
    }
  }, [leaveStudent, markAttendance, optimisticUpdate]);

  const handleHistoryToggle = useCallback(() => {
    setHistoryMode(h => !h);
    setSearchQuery('');
    setFilterMode('all');
  }, []);

  // ── Current data to display ───────────────────────────────
  const displayGrouped = historyMode ? historyGrouped : grouped;

  const handleSearchChange = useCallback((newQuery) => {
    setSearchQuery(newQuery);
    if (!newQuery) return;
    const query = newQuery.toLowerCase();

    const currentFloorData = displayGrouped[activeFloor];
    if (currentFloorData) {
      const matchOnCurrent = Object.values(currentFloorData).some(room => 
        room.roomNo.toLowerCase().includes(query) ||
        room.students.some(s => s.name.toLowerCase().includes(query))
      );
      if (matchOnCurrent) return;
    }

    for (const [floorStr, floorData] of Object.entries(displayGrouped)) {
      const match = Object.values(floorData).some(room => 
        room.roomNo.toLowerCase().includes(query) ||
        room.students.some(s => s.name.toLowerCase().includes(query))
      );
      if (match) {
        setActiveFloor(Number(floorStr));
        break;
      }
    }
  }, [activeFloor, displayGrouped]);

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        historyMode={historyMode}
        onHistoryToggle={handleHistoryToggle}
      />

      {historyMode ? (
        // ── View 6: History mode ──────────────────────────────
        <div className="history-layout">
          <DateHistoryPanel
            selectedDate={selectedHistoryDate}
            onDateSelect={setSelectedHistoryDate}
          />
          <div className="history-content">
            {!selectedHistoryDate ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', paddingTop: '3rem', fontSize: '0.9rem' }}>
                Select a date from the left panel to view attendance history.
              </div>
            ) : historyLoading ? (
              <SkeletonGrid />
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingRight: '1.25rem' }}>
                  <FloorTabs activeFloor={activeFloor} onFloorChange={setActiveFloor} />
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.4rem' }}>
                    <FilterDropdown filterMode={filterMode} setFilterMode={setFilterMode} />
                  </div>
                </div>
                <div className="room-grid-container">
                  <FloorRoomGrid
                    floorData={displayGrouped[activeFloor]}
                    onStudentClick={null}
                    absenteesFilter={filterMode === 'absentees'}
                    searchQuery={searchQuery}
                    roomTypeFilter={filterMode === 'single' ? 'single' : filterMode === 'sharing' ? 'sharing' : 'all'}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        // ── View 3: Live Dashboard ────────────────────────────
        <div className="dashboard-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: '1.25rem' }}>
            <FloorTabs activeFloor={activeFloor} onFloorChange={setActiveFloor} disabled={loading} />
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.4rem' }}>
              <FilterDropdown filterMode={filterMode} setFilterMode={setFilterMode} disabled={loading} />
            </div>
          </div>

          <div style={{ padding: '0 1.25rem' }}>
            <div className="room-grid-container">
              {error ? (
                <div style={{ padding: '2rem', color: 'var(--red)', textAlign: 'center' }}>
                  {error}
                  <br />
                  <button className="btn btn-ghost" style={{ marginTop: '0.75rem' }} onClick={() => fetchAttendance(new Date().toISOString().split('T')[0])}>
                    Retry
                  </button>
                </div>
              ) : loading ? (
                <SkeletonGrid />
              ) : (
                <FloorRoomGrid
                  floorData={grouped[activeFloor]}
                  onStudentClick={handleStudentClick}
                  absenteesFilter={filterMode === 'absentees'}
                  searchQuery={searchQuery}
                  readOnly={false}
                  roomTypeFilter={filterMode === 'single' ? 'single' : filterMode === 'sharing' ? 'sharing' : 'all'}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* View 4: Student Modal */}
      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onMarkPresent={handleMarkStatus}
          onLeave={handleLeaveOpen}
          loading={modalLoading}
        />
      )}

      {/* View 5: Leave Modal */}
      {leaveStudent && (
        <LeaveModal
          student={leaveStudent}
          onClose={() => setLeaveStudent(null)}
          onSubmit={handleLeaveSubmit}
          loading={leaveLoading}
        />
      )}
    </div>
  );
}
