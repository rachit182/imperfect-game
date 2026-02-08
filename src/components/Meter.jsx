export default function Meter({ label, value }) {
  return (
    <div className="meter">
      <span>{label}</span>
      <div className="bar">
        <div className="fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
