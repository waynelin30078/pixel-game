import { useState, useEffect } from 'react';
import Starfield from './components/Starfield';
import Scanlines from './components/Scanlines';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import { fetchQuestions, submitAnswers } from './utils/api';
import { preloadAllBosses } from './utils/dicebear';
import './styles/global.css';

// 遊戲狀態機
const PHASE = {
  HOME: 'HOME',
  LOADING: 'LOADING',
  GAME: 'GAME',
  SUBMITTING: 'SUBMITTING',
  RESULT: 'RESULT',
};

export default function App() {
  const [phase, setPhase] = useState(PHASE.HOME);
  const [playerId, setPlayerId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // 預載所有 boss 圖片
  useEffect(() => {
    preloadAllBosses();
  }, []);

  async function handleStart(id) {
    setPlayerId(id);
    setPhase(PHASE.LOADING);
    setError('');
    try {
      const qs = await fetchQuestions();
      setQuestions(qs);
      setPhase(PHASE.GAME);
    } catch (err) {
      setError(`無法載入題目：${err.message}`);
      setPhase(PHASE.HOME);
    }
  }

  async function handleFinish(answers) {
    setPhase(PHASE.SUBMITTING);
    try {
      const res = await submitAnswers(playerId, answers);
      setResult(res);
      setPhase(PHASE.RESULT);
    } catch (err) {
      setError(`提交失敗：${err.message}`);
      // 仍顯示結果（可能是連線問題）
      setResult({ score: 0, total: answers.length, passed: false, highScore: 0 });
      setPhase(PHASE.RESULT);
    }
  }

  function handleRestart() {
    handleStart(playerId);
  }

  function handleHome() {
    setPhase(PHASE.HOME);
    setQuestions([]);
    setResult(null);
    setError('');
  }

  return (
    <>
      <Starfield />
      <Scanlines />

      {/* 主內容 */}
      {phase === PHASE.HOME && (
        <HomePage onStart={handleStart} />
      )}

      {phase === PHASE.LOADING && (
        <LoadingScreen message="LOADING QUESTIONS..." />
      )}

      {phase === PHASE.GAME && (
        <GamePage
          playerId={playerId}
          questions={questions}
          onFinish={handleFinish}
        />
      )}

      {phase === PHASE.SUBMITTING && (
        <LoadingScreen message="CALCULATING SCORE..." />
      )}

      {phase === PHASE.RESULT && (
        <ResultPage
          playerId={playerId}
          result={result}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {/* 錯誤提示 */}
      {error && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-red)',
            color: '#fff',
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.45rem',
            padding: '10px 16px',
            zIndex: 9998,
            letterSpacing: '0.1em',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
          }}
        >
          ⚠ {error}
        </div>
      )}
    </>
  );
}

function LoadingScreen({ message }) {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setDots(d => (d + 1) % 4), 300);
    return () => clearInterval(id);
  }, []);

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
        gap: 24,
      }}
    >
      {/* 像素載入動畫 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 16px)', gap: 6 }}>
        {Array.from({ length: 16 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 16,
              height: 16,
              background: 'var(--color-gold)',
              animation: `blink 0.8s step-start ${(i * 0.05).toFixed(2)}s infinite`,
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.6rem',
          color: 'var(--color-gold)',
          letterSpacing: '0.15em',
        }}
      >
        {message}{'.' .repeat(dots)}
      </div>
    </div>
  );
}
