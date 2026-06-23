const PHOTO_BASE = '/uploads/photos/';

function getPhotoUrl(photoPath) {
  if (!photoPath) return `${PHOTO_BASE}avatar.jpg`;
  const filename = photoPath.split('/').pop();
  return `${PHOTO_BASE}${filename}`;
}

function Badge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {status === 'leave' ? 'On Leave' : status}
    </span>
  );
}



export default function StudentCard({ student, onClick, dimmed, absenteesFilter }) {
  if (!student) {
    return (
      <div className="student-card empty">
        <span style={{ fontSize: '0.7rem', color: '#d1d5db' }}>Empty</span>
      </div>
    );
  }

  const photoUrl = getPhotoUrl(student.photoPath);
  const isDimmed = dimmed && student.status !== 'absent';

  return (
    <div
      className={`student-card ${isDimmed ? 'dimmed' : ''}`}
      onClick={() => onClick && onClick(student)}
      id={`student-card-${student._id}`}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick && onClick(student)}
      aria-label={`${student.name} - ${student.status}`}
    >
      <img
        src={photoUrl}
        alt={student.name}
        className="student-avatar"
        onError={e => { e.target.src = '/uploads/photos/avatar.jpg'; }}
      />
      <span className="student-name">{student.name}</span>
      <Badge status={student.status || 'absent'} />
    </div>
  );
}
