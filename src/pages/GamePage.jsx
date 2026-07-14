import { useState, useEffect, useCallback } from 'react';
import BossAvatar from '../components/BossAvatar';
import HealthBar from '../components/HealthBar';
import PixelButton from '../components/PixelButton';

const PASS_THRESHOLD = parseInt(import.meta.env.VITE_PASS_THRESHOLD) || 7;
const OPTIONS = ['A', 'B', 'C', 'D'];
const OPTION_COLORS = {
  A: '#e84855',
  B: '#f7c948',
  C: '#3bb273',
  D: '#4ecdc4',
};

/**
 * 遊戲主頁面：一題一題呈現，每題配一個關主
 */
export default function GamePage({ playerId, questions, onFinish }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);       // 目前選擇
  const [confirmed, setConfirmed] = useState(false);     // 是否已確認
  const [answers, setAnswers] = useState([]);            // 記錄所有答案
  const [bossHit, setBossHit] = useState(false);
  const [bossDead, setBossDead] = useState(false);
  const [stageAnim, setStageAnim] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);          // 每題 30 秒
  const [timerActive, setTimerActive] = useState(true);

  const total = questions.length;
  const currentQ = questions[currentIdx];
  const playerHp = PASS_THRESHOLD; // 玩家最多可以錯這麼多
  const wrongCount = answers.filter(a => !a.isCorrect).length;
  const playerHpCurrent = Math.max(0, playerHp - wrongCount);

  // STAGE 進場動畫
  useEffect(() => {
    setStageAnim(true);
    setBossHit(false);
    setBossDead(false);
    setSelected(null);
    setConfirmed(false);
    setTimeLeft(30);
    setTimerActive(true);
    const t = setTimeout(() => setStageAnim(false), 600);
    return () => clearTimeout(t);
  }, [currentIdx]);

  // 計時器
  useEffect(() => {
    if (!timerActive || confirmed) return;
    if (timeLeft <= 0) {
      handleConfirm(true); // 時間到自動提交（未選擇）
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, timerActive, confirmed]);

  const handleConfirm = useCallback((timeout = false) => {
    if (confirmed) return;
    setTimerActive(false);
    setConfirmed(true);

    const answer = timeout ? null : selected;
    // 在這裡我們不知道正確答案（GAS 才知道），先記錄選擇
    // isCorrect 先設 null，送出後由 GAS 回傳
    const newAnswers = [...answers, { questionId: currentQ.id, answer }];
    setAnswers(newAnswers);

    // 動畫效果（假設選了就打 BOSS）
    if (answer) {
      setBossHit(true);
      setTimeout(() => setBossHit(false), 400);
    }

    // 延遲後切下一題
    setTimeout(() => {
      if (currentIdx + 1 >= total) {
        onFinish(newAnswers);
      } else {
        setCurrentIdx(i => i + 1);
      }
    }, 1200);
  }, [confirmed, selected, answers, currentQ, currentIdx, total, onFinish]);

  const timerPct = (timeLeft / 30) * 100;
  const timerColor = timeLeft > 15 ? 'var(--color-green)' : timeLeft > 7 ? 'var(--color-gold)' : 'var(--color-red)';

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        gap: 12,
        maxWidth: 700,
        margin: '0 auto',
      }}
    >
      {/* ── 頂部 HUD ── */}
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* 玩家 HP */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.4rem', color: 'var(--color-cyan)', marginBottom: 4 }}>
            {playerId.toUpperCase()}
          </div>
          <HealthBar current={playerHpCurrent} max={playerHp} color="var(--color-green)" label="LIFE" />
        </div>

        {/* STAGE 顯示 */}
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'clamp(0.45rem, 2vw, 0.65rem)',
            color: 'var(--color-gold)',
            textAlign: 'center',
            textShadow: '0 0 10px rgba(247,201,72,0.5)',
            whiteSpace: 'nowrap',
            animation: stageAnim ? 'stageEnter 0.5s steps(8) both' : 'none',
          }}
        >
          STAGE {currentIdx + 1}
          <div style={{ fontSize: '0.35rem', color: 'var(--color-gray)', marginTop: 2 }}>/ {total}</div>
        </div>

        {/* BOSS HP */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.4rem', color: 'var(--color-red)', marginBottom: 4, textAlign: 'right' }}>
            BOSS HP
          </div>
          <HealthBar
            current={confirmed ? 0 : 100}
            max={100}
            color="var(--color-red)"
            label=""
          />
        </div>
      </div>

      {/* ── 計時器 ── */}
      <div style={{ width: '100%' }}>
        <div className="hp-bar-container" style={{ height: 8 }}>
          <div
            className="hp-bar-fill"
            style={{
              width: `${timerPct}%`,
              background: timerColor,
              transition: 'width 1s linear, background 0.3s',
            }}
          />
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'var(--font-pixel)', fontSize: '0.4rem', color: timerColor, marginTop: 2 }}>
          {timeLeft}s
        </div>
      </div>

      {/* ── 關主區 ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '8px 0',
        }}
      >
        <BossAvatar index={currentIdx} isHit={bossHit} isDead={bossDead} />
      </div>

      {/* ── 題目卡 ── */}
      <div
        className="pixel-box"
        style={{
          width: '100%',
          padding: '20px 18px',
          animation: 'slideUp 0.3s steps(6) both',
        }}
      >
        {/* 題號 */}
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.42rem',
            color: 'var(--color-gray)',
            marginBottom: 12,
            letterSpacing: '0.15em',
          }}
        >
          Q.{currentIdx + 1} ── {currentQ?.id ? `#${currentQ.id}` : ''}
        </div>

        {/* 題目文字 */}
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
            color: 'var(--color-white)',
            lineHeight: 1.7,
            fontWeight: 700,
            marginBottom: 20,
            minHeight: 48,
          }}
        >
          {currentQ?.question}
        </div>

        {/* 選項 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt;
            const color = OPTION_COLORS[opt];
            return (
              <button
                key={opt}
                id={`option-${opt}`}
                onClick={() => !confirmed && setSelected(opt)}
                disabled={confirmed}
                style={{
                  background: isSelected
                    ? `${color}22`
                    : 'var(--color-panel2)',
                  border: `2px solid ${isSelected ? color : 'var(--color-border)'}`,
                  color: isSelected ? color : 'var(--color-white)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: confirmed ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  transition: 'border-color 0.1s, background 0.1s',
                  lineHeight: 1.5,
                  boxShadow: isSelected ? `0 0 12px ${color}44, 4px 4px 0 ${color}33` : '4px 4px 0 var(--color-panel2)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.55rem',
                    color,
                    minWidth: 18,
                    paddingTop: 2,
                  }}
                >
                  {opt}
                </span>
                <span>{currentQ?.[opt]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 確認按鈕 ── */}
      <div style={{ width: '100%', display: 'flex', gap: 10 }}>
        <PixelButton
          onClick={() => handleConfirm(false)}
          disabled={!selected || confirmed}
          style={{ flex: 1, fontSize: '0.6rem', padding: '14px' }}
        >
          ▶ CONFIRM
        </PixelButton>
        <PixelButton
          variant="ghost"
          onClick={() => handleConfirm(true)}
          disabled={confirmed}
          style={{ fontSize: '0.5rem', padding: '14px 18px' }}
        >
          SKIP
        </PixelButton>
      </div>

      {/* ── 答題進度點 ── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {questions.map((_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              background: i < currentIdx
                ? 'var(--color-gold)'
                : i === currentIdx
                ? 'var(--color-cyan)'
                : 'var(--color-border)',
              imageRendering: 'pixelated',
            }}
          />
        ))}
      </div>
    </div>
  );
}
