export default function FloorTabs({ activeFloor, onFloorChange, disabled }) {
  const floors = [1, 2, 3, 4];
  return (
    <div className="floor-tabs">
      {floors.map(f => (
        <button
          key={f}
          id={`floor-tab-${f}`}
          className={`floor-tab ${activeFloor === f ? 'active' : ''}`}
          onClick={() => !disabled && onFloorChange(f)}
          disabled={disabled}
        >
          Floor {f}
        </button>
      ))}
    </div>
  );
}
