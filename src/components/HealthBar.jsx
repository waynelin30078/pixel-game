/**
 * 像素風 HP 血條
 * @param {number} current - 目前 HP
 * @param {number} max - 最大 HP
 * @param {string} color - 填滿顏色（CSS 變數或 hex）
 * @param {string} label - 標籤文字
 */
export default function HealthBar({ current, max, color = 'var(--color-red)', label = 'HP' }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));

  // 血量低時變色
  const barColor = pct > 50 ? color : pct > 25 ? 'var(--color-gold)' : 'var(--color-red)';

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.45rem',
          color: 'var(--color-gray)',
          marginBottom: 4,
          letterSpacing: '0.05em',
        }}
      >
        <span>{label}</span>
        <span style={{ color: barColor }}>
          {current}/{max}
        </span>
      </div>
      <div className="hp-bar-container">
        <div
          className="hp-bar-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${barColor}, color-mix(in srgb, ${barColor} 70%, white))`,
          }}
        />
        {/* 像素格線裝飾 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 7px, rgba(0,0,0,0.2) 7px, rgba(0,0,0,0.2) 8px)',
          }}
        />
      </div>
    </div>
  );
}
