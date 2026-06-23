import StudentCard from './StudentCard';

const BEDS = ['A', 'B', 'C', 'D'];

export default function RoomTile({ room, onStudentClick, absenteesFilter, readOnly }) {
  const { roomNo, students = [] } = room;

  const hasAbsent = students.some(s => !s.status || s.status === 'absent');
  const allPresent = students.length > 0 && students.every(s => s.status === 'present' || s.status === 'leave');

  // Show 4 bed slots for all room types to maintain consistent structure
  const maxBeds = 4;
  const bedSlots = Array.from({ length: maxBeds }, (_, i) => {
    const bed = BEDS[i];
    return students.find(s => s.bed === bed) || null;
  });

  // If there are students with beds that don't match A-D order, append them
  const filledSlots = bedSlots.map((slot, i) => slot || students[i] || null);

  let tileClass = 'room-tile';
  if (hasAbsent) tileClass += ' has-absent';
  else if (allPresent) tileClass += ' all-present';

  return (
    <div className={tileClass} id={`room-tile-${roomNo}`}>
      <div className="room-tile-header">Room {roomNo}</div>
      <div className="room-students">
        {filledSlots.map((student, i) => (
          <StudentCard
            key={student ? student._id : `empty-${roomNo}-${i}`}
            student={student}
            onClick={readOnly ? null : onStudentClick}
            absenteesFilter={absenteesFilter}
            dimmed={absenteesFilter && student && student.status !== 'absent'}
          />
        ))}
      </div>
    </div>
  );
}
