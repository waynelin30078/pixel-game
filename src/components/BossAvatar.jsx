import { useState, useEffect, useRef } from 'react';
import { getBossUrl } from '../utils/dicebear';

/**
 * 關主頭像
 * @param {number} index - 題目 index
 * @param {boolean} isHit - 被擊中動畫
 * @param {boolean} isDead - 死亡動畫
 */
export default function BossAvatar({ index = 0, isHit = false, isDead = false }) {
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef(null);

  const url = getBossUrl(index);

  useEffect(() => {
    setImgError(false);
  }, [index]);

  const getAnimation = () => {
    if (isDead) return 'pixelPop 0.4s steps(4) forwards, float 2s ease-in-out 0.4s infinite';
    if (isHit) return 'hitFlash 0.2s steps(2) 3, shake 0.3s steps(4)';
    return 'float 3s ease-in-out infinite';
  };

  return (
    <div
      style={{
        width: 140,
        height: 140,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* 底座光圈 */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 80,
          height: 12,
          background: 'radial-gradient(ellipse, rgba(247,201,72,0.25) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      {imgError ? (
        // Fallback：純 CSS 像素人
        <div style={{ fontSize: 80, lineHeight: 1, animation: getAnimation() }}>👾</div>
      ) : (
        <img
          ref={imgRef}
          src={url}
          alt={`Boss ${index}`}
          width={120}
          height={120}
          onError={() => setImgError(true)}
          style={{
            imageRendering: 'pixelated',
            animation: getAnimation(),
            filter: isDead
              ? 'drop-shadow(0 0 12px var(--color-gold)) brightness(1.5)'
              : 'drop-shadow(0 0 6px rgba(78,205,196,0.5))',
          }}
        />
      )}

      {/* BOSS 標籤 */}
      <div
        style={{
          position: 'absolute',
          top: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-red)',
          color: '#fff',
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.4rem',
          padding: '2px 6px',
          whiteSpace: 'nowrap',
          letterSpacing: '0.1em',
        }}
      >
        BOSS
      </div>
    </div>
  );
}
