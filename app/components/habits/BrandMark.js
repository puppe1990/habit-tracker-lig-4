export default function BrandMark({ size = 48, className = "" }) {
  return (
    <div
      className={`brand-mark ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="disc disc-missed" />
      <span className="disc disc-done" />
      <span className="well-void" />
      <span className="disc disc-done" />
    </div>
  );
}
