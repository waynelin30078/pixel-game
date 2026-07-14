import { useEffect, useState } from 'react';
import PixelButton from '../components/PixelButton';

const PASS_THRESHOLD = parseInt(import.meta.env.VITE_PASS_THRESHOLD) || 7;

/**
 * 結果頁：顯示分數、通關狀態、歷史最高分
 */
export default function ResultPage({ playerId, result, onRestart, onHome }) {
  const [showDetails, setShowDetails] = useState(false);
  const [countedScore, setCountedScore] = useState(0);

  const { score, total, passed, highScore, isFirstClear } = result || {};

  // 分數滾動動畫
  useEffect(() => {
    if (!score) return;
    let cur = 0;
    const step = Math.ceil(score / 20);
    const id = setInterval(() => {
      cur = Math.min(cur + step, score);
      setCountedScore(cur);
      if (cur >= score) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, [score]);

  useEffect(() => {
    const t = setTimeout(() => setShowDetails(true), 800);
    return () => clearTimeout(t);
  }, []);

  const starCount = score >= total ? 3 : score >= PASS_THRESHOLD ? 2 : score >= Math.floor(PASS_THRESHOLD / 2) ? 1 : 0;

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        gap: 24,
      }}
    >
      {/* 結果標語 */}
      <div style={{ textAlign: 'center' }}>
        {passed ? (
          <>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 'clamp(1rem, 4vw, 1.8rem)',
                color: 'var(--color-gold)',
                textShadow: '0 0 30px rgba(247,201,72,0.8), 4px 4px 0 rgba(0,0,0,0.8)',
                animation: 'pixelPop 0.5s steps(4) both',
                letterSpacing: '0.1em',
              }}
            >
              STAGE CLEAR!
            </div>
            {isFirstClear && (
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.5rem',
                  color: 'var(--color-cyan)',
                  marginTop: 8,
                  animation: 'blink 1s step-start infinite',
                  letterSpacing: '0.2em',
                }}
              >
                ★ FIRST CLEAR BONUS ★
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(0.8rem, 3vw, 1.4rem)',
              color: 'var(--color-red)',
              textShadow: '0 0 20px rgba(232,72,85,0.6), 4px 4px 0 rgba(0,0,0,0.8)',
              animation: 'shake 0.5s steps(4) both',
              letterSpacing: '0.1em',
            }}
          >
            GAME OVER
          </div>
        )}
      </div>

      {/* 星星評分 */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              fontSize: 40,
              opacity: i < starCount ? 1 : 0.2,
              animation: i < starCount ? `pixelPop 0.4s steps(4) ${i * 0.15}s both` : 'none',
              filter: i < starCount ? 'drop-shadow(0 0 8px rgba(247,201,72,0.8))' : 'none',
            }}
          >
            ★
          </div>
        ))}
      </div>

      {/* 分數面板 */}
      <div
        className="pixel-box"
        style={{
          padding: '28px 32px',
          width: '100%',
          maxWidth: 440,
          animation: 'slideUp 0.4s steps(8) 0.3s both',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* 玩家 ID */}
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.5rem',
            color: 'var(--color-cyan)',
            textAlign: 'center',
            letterSpacing: '0.2em',
            borderBottom: '2px solid var(--color-border)',
            paddingBottom: 16,
          }}
        >
          {playerId.toUpperCase()}
        </div>

        {/* 主分數 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color: 'var(--color-gray)', marginBottom: 8 }}>
            SCORE
          </div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
              color: passed ? 'var(--color-gold)' : 'var(--color-red)',
              textShadow: passed
                ? '0 0 20px rgba(247,201,72,0.5)'
                : '0 0 20px rgba(232,72,85,0.5)',
            }}
          >
            {countedScore}
            <span style={{ fontSize: '40%', color: 'var(--color-gray)' }}>/{total}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--color-gray)', marginTop: 4 }}>
            通過門檻：{PASS_THRESHOLD} 題
          </div>
        </div>

        {/* 詳細統計 */}
        {showDetails && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              animation: 'slideUp 0.3s steps(6) both',
            }}
          >
            <StatBox label="CORRECT" value={score} color="var(--color-green)" />
            <StatBox label="WRONG" value={total - score} color="var(--color-red)" />
            <StatBox label="HIGH SCORE" value={highScore ?? score} color="var(--color-gold)" />
            <StatBox
              label="RESULT"
              value={passed ? 'PASS' : 'FAIL'}
              color={passed ? 'var(--color-green)' : 'var(--color-red)'}
            />
          </div>
        )}

        {/* 通過訊息 */}
        <div
          style={{
            background: passed ? 'rgba(59,178,115,0.1)' : 'rgba(232,72,85,0.1)',
            border: `2px solid ${passed ? 'var(--color-green)' : 'var(--color-red)'}`,
            padding: '10px 14px',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.82rem',
            color: passed ? 'var(--color-green)' : 'var(--color-red)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          {passed
            ? isFirstClear
              ? '🎉 恭喜初次通關！成績已記錄！'
              : '✅ 通關成功！繼續挑戰更高分！'
            : `❌ 再多練習！差 ${PASS_THRESHOLD - score} 題就通關了！`}
        </div>
      </div>

      {/* 按鈕區 */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <PixelButton onClick={onRestart} style={{ fontSize: '0.6rem', padding: '14px 24px' }}>
          ↩ RETRY
        </PixelButton>
        <PixelButton variant="ghost" onClick={onHome} style={{ fontSize: '0.6rem', padding: '14px 24px' }}>
          ⌂ HOME
        </PixelButton>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div
      style={{
        background: 'var(--color-panel2)',
        border: '2px solid var(--color-border)',
        padding: '12px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.38rem', color: 'var(--color-gray)', marginBottom: 6, letterSpacing: '0.1em' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.9rem', color }}>
        {value}
      </div>
    </div>
  );
}
