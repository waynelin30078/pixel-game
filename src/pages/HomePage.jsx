import { useState, useEffect, useRef } from 'react';
import '../styles/global.css';

/**
 * 首頁：輸入玩家 ID 開始遊戲
 */
export default function HomePage({ onStart }) {
  const [playerId, setPlayerId] = useState('');
  const [error, setError] = useState('');
  const [glitching, setGlitching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    // 定期觸發 glitch 動畫
    const id = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 400);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  function handleStart() {
    const trimmed = playerId.trim();
    if (!trimmed) {
      setError('請輸入玩家 ID！');
      inputRef.current?.focus();
      return;
    }
    onStart(trimmed);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleStart();
    setError('');
  }

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
        gap: 32,
      }}
    >
      {/* 大標題 */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'clamp(0.8rem, 3vw, 1.4rem)',
            color: 'var(--color-gold)',
            letterSpacing: '0.15em',
            animation: glitching ? 'glitch 0.4s steps(4)' : 'none',
            textShadow: '0 0 20px rgba(247,201,72,0.6), 4px 4px 0 rgba(0,0,0,0.8)',
            lineHeight: 1.5,
          }}
        >
          ★ QUIZ QUEST ★
        </div>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'clamp(0.35rem, 1.5vw, 0.55rem)',
            color: 'var(--color-cyan)',
            letterSpacing: '0.3em',
            marginTop: 8,
            animation: 'blink 1.5s step-start infinite',
          }}
        >
          INSERT COIN TO PLAY
        </div>
      </div>

      {/* 裝飾：像素角色預覽 */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <img
            key={i}
            src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=boss-stage-${i}&backgroundColor=0a0a1a`}
            alt=""
            width={56}
            height={56}
            style={{
              imageRendering: 'pixelated',
              animation: `float ${2.5 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              filter: 'drop-shadow(0 0 8px rgba(78,205,196,0.5))',
            }}
          />
        ))}
      </div>

      {/* 登入面板 */}
      <div
        className="pixel-box"
        style={{
          padding: '32px 28px',
          width: '100%',
          maxWidth: 440,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          animation: 'slideUp 0.4s steps(8) both',
        }}
      >
        {/* 面板標題 */}
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.55rem',
            color: 'var(--color-gold)',
            textAlign: 'center',
            letterSpacing: '0.2em',
            borderBottom: '2px solid var(--color-border)',
            paddingBottom: 16,
          }}
        >
          PLAYER SELECT
        </div>

        {/* ID 輸入 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label
            htmlFor="player-id"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.45rem',
              color: 'var(--color-gray)',
              letterSpacing: '0.1em',
            }}
          >
            ENTER YOUR ID
          </label>
          <input
            id="player-id"
            ref={inputRef}
            className="pixel-input"
            type="text"
            value={playerId}
            onChange={(e) => { setPlayerId(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="YOUR_NAME_HERE"
            maxLength={20}
            autoComplete="off"
          />
          {error && (
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.4rem',
                color: 'var(--color-red)',
                animation: 'blink 0.5s step-start 3',
              }}
            >
              ▶ {error}
            </span>
          )}
        </div>

        {/* 遊戲說明 */}
        <div
          style={{
            background: 'var(--color-panel2)',
            padding: '12px 14px',
            borderLeft: '3px solid var(--color-cyan)',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.78rem',
            color: 'var(--color-gray)',
            lineHeight: 1.6,
          }}
        >
          <div style={{ color: 'var(--color-cyan)', fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-pixel)', fontSize: '0.4rem' }}>
            HOW TO PLAY
          </div>
          答對 <span style={{ color: 'var(--color-gold)' }}>{import.meta.env.VITE_PASS_THRESHOLD || 7}</span> 題以上即可通關！
          共 <span style={{ color: 'var(--color-gold)' }}>{import.meta.env.VITE_QUESTION_COUNT || 10}</span> 關，每關面對一位 BOSS。
        </div>

        {/* 開始按鈕 */}
        <button
          id="start-game-btn"
          className="btn-pixel btn-gold"
          onClick={handleStart}
          disabled={!playerId.trim()}
          style={{
            width: '100%',
            fontSize: '0.65rem',
            padding: '16px',
            opacity: playerId.trim() ? 1 : 0.5,
            cursor: playerId.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          ▶ START GAME
        </button>
      </div>

      {/* 底部版權 */}
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.35rem',
          color: 'var(--color-gray)',
          letterSpacing: '0.15em',
          textAlign: 'center',
        }}
      >
        © 2025 QUIZ QUEST — ALL RIGHTS RESERVED
      </div>
    </div>
  );
}
