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
const FilterDropdown = ({ absenteesFilter, setAbsenteesFilter, roomTypeFilter, setRoomTypeFilter, disabled }) => {
  const [open, setOpen] = useState(false);
  const hasActiveFilter = absenteesFilter || roomTypeFilter !== 'all';

  const handleClear = (e) => {
    e.stopPropagation();
    setAbsenteesFilter(false);
    setRoomTypeFilter('all');
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        style={{
          width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid', borderColor: hasActiveFilter ? 'var(--heading)' : 'var(--border)',
          background: hasActiveFilter ? 'var(--navy)' : 'var(--card-bg)',
          borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer',
          color: hasActiveFilter ? '#fff' : 'var(--muted)',
          opacity: disabled ? 0.6 : 1, transition: 'all 0.18s'
        }}
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
        position: 'absolute', top: 'calc(100% + 6px)', right: 0,
        background: 'var(--card-bg)', border: '1.5px solid var(--border)',
        borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        zIndex: 20, width: '300px', overflow: 'hidden',
        opacity: open ? 1 : 0,
        visibility: open ? 'visible' : 'hidden',
        transform: open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        transformOrigin: 'top right'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem 0.5rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Filters</span>
          {hasActiveFilter && (
            <button
              onClick={handleClear}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: 'var(--red)', padding: '0.1rem 0.4rem', borderRadius: '4px', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--red-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              Clear all
            </button>
          )}
        </div>

        {/* Two-column body */}
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', borderTop: '1px solid var(--border)' }}>

          {/* Left column — category labels */}
          <div style={{ borderRight: '1px solid var(--border)', background: 'var(--gray-bg)' }}>
            <div style={{
              padding: '1rem 1rem',
              fontSize: '0.8rem', fontWeight: 600, color: absenteesFilter ? 'var(--heading)' : 'var(--muted)',
              borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', minHeight: '56px'
            }}>Availability</div>
            <div style={{
              padding: '1rem 1rem',
              fontSize: '0.8rem', fontWeight: 600, color: roomTypeFilter !== 'all' ? 'var(--heading)' : 'var(--muted)',
              display: 'flex', alignItems: 'center', minHeight: '100px'
            }}>Room Type</div>
          </div>

          {/* Right column — controls */}
          <div>
            {/* Availability — checkbox */}
            <div style={{ padding: '0 1rem', borderBottom: '1px solid var(--border)', minHeight: '56px', display: 'flex', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text)', fontWeight: absenteesFilter ? 600 : 400 }}>
                Absentees
                <div
                  onClick={() => setAbsenteesFilter(v => !v)}
                  style={{
                    width: '18px', height: '18px', borderRadius: '5px', border: '2px solid',
                    borderColor: absenteesFilter ? 'var(--heading)' : 'var(--border)',
                    background: absenteesFilter ? 'var(--heading)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0
                  }}
                >
                  {absenteesFilter && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <polyline points="2,6 5,9 10,3" stroke="var(--card-bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </label>
            </div>

            {/* Room type — radio buttons */}
            <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem', minHeight: '100px' }}>
              {[{ value: 'sharing', label: 'Sharing room' }, { value: 'single', label: 'Single room' }].map(opt => (
                <label
                  key={opt.value}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text)', fontWeight: roomTypeFilter === opt.value ? 600 : 400 }}
                  onClick={() => setRoomTypeFilter(v => v === opt.value ? 'all' : opt.value)}
                >
                  {opt.label}
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', border: '2px solid',
                    borderColor: roomTypeFilter === opt.value ? 'var(--heading)' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.15s'
                  }}>
                    {roomTypeFilter === opt.value && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--heading)' }} />
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ──────────────────────────────────────────
export default function Dashboard() {
  const [activeFloor, setActiveFloor] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [absenteesFilter, setAbsenteesFilter] = useState(false);
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');
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
    setAbsenteesFilter(false);
    setRoomTypeFilter('all');
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
                    <FilterDropdown absenteesFilter={absenteesFilter} setAbsenteesFilter={setAbsenteesFilter} roomTypeFilter={roomTypeFilter} setRoomTypeFilter={setRoomTypeFilter} />
                  </div>
                </div>
                <div className="room-grid-container">
                  <FloorRoomGrid
                    floorData={displayGrouped[activeFloor]}
                    onStudentClick={null}
                    absenteesFilter={absenteesFilter}
                    searchQuery={searchQuery}
                    roomTypeFilter={roomTypeFilter}
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
              <FilterDropdown absenteesFilter={absenteesFilter} setAbsenteesFilter={setAbsenteesFilter} roomTypeFilter={roomTypeFilter} setRoomTypeFilter={setRoomTypeFilter} disabled={loading} />
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
                  absenteesFilter={absenteesFilter}
                  searchQuery={searchQuery}
                  readOnly={false}
                  roomTypeFilter={roomTypeFilter}
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
