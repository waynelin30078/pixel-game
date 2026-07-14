/**
 * Google Apps Script API 封裝
 */

const GAS_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;
const QUESTION_COUNT = parseInt(import.meta.env.VITE_QUESTION_COUNT) || 10;

/**
 * 從 Google Sheets 隨機取得題目（不含解答）
 * @returns {Promise<Array>} 題目陣列
 */
export async function fetchQuestions() {
  if (!GAS_URL || GAS_URL.includes('YOUR_SCRIPT_ID')) {
    // 開發用 mock 資料
    return getMockQuestions();
  }

  const url = `${GAS_URL}?action=getQuestions&count=${QUESTION_COUNT}`;
  const res = await fetch(url, { redirect: 'follow' });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  if (data.error) throw new Error(data.error);
  return data.questions;
}

/**
 * 提交答案到 Google Apps Script 計算分數並記錄
 * @param {string} userId - 玩家 ID
 * @param {Array<{questionId: string|number, answer: string}>} answers
 * @returns {Promise<{score: number, total: number, passed: boolean, highScore: number}>}
 */
export async function submitAnswers(userId, answers) {
  if (!GAS_URL || GAS_URL.includes('YOUR_SCRIPT_ID')) {
    // 開發用 mock：假設答對 answers.length 中一半
    const score = Math.floor(answers.length * 0.7);
    return {
      score,
      total: answers.length,
      passed: score >= (parseInt(import.meta.env.VITE_PASS_THRESHOLD) || 7),
      highScore: score,
      isFirstClear: score >= (parseInt(import.meta.env.VITE_PASS_THRESHOLD) || 7),
    };
  }

  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // GAS 需用 text/plain 避免 CORS preflight
    body: JSON.stringify({ userId, answers }),
    redirect: 'follow',
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ─── Mock 資料（開發用）────────────────────────────────────────
function getMockQuestions() {
  const pool = [
    { id: 1, question: 'JavaScript 中，`typeof null` 的回傳值是？', A: 'null', B: 'object', C: 'undefined', D: 'string' },
    { id: 2, question: 'CSS Flexbox 中，`justify-content` 控制哪個軸的對齊？', A: '交叉軸', B: '主軸', C: '兩者皆是', D: '垂直軸' },
    { id: 3, question: 'React Hook `useEffect` 第二個參數是？', A: '回呼函式', B: '依賴陣列', C: '初始值', D: '清理函式' },
    { id: 4, question: 'HTTP 狀態碼 404 代表什麼？', A: '伺服器錯誤', B: '找不到資源', C: '未授權', D: '請求成功' },
    { id: 5, question: '下列哪個不是 JavaScript 的原始型別？', A: 'string', B: 'number', C: 'array', D: 'boolean' },
    { id: 6, question: '`git rebase` 和 `git merge` 的主要差異是？', A: 'rebase 會刪除分支', B: 'rebase 重寫提交歷史', C: 'merge 較快', D: '兩者完全相同' },
    { id: 7, question: 'SQL 中，`GROUP BY` 通常搭配什麼使用？', A: 'WHERE', B: 'ORDER BY', C: '聚合函式', D: 'JOIN' },
    { id: 8, question: 'REST API 中，PUT 和 PATCH 的差異？', A: 'PUT 局部更新，PATCH 完整替換', B: 'PUT 完整替換，PATCH 局部更新', C: '兩者相同', D: 'PUT 刪除資源' },
    { id: 9, question: 'Big O Notation O(log n) 通常對應？', A: '線性搜尋', B: '氣泡排序', C: '二元搜尋', D: '雜湊表查詢' },
    { id: 10, question: 'Docker 中，`EXPOSE` 指令的作用是？', A: '真正開放端口', B: '文件說明用途，不實際開放', C: '建立防火牆規則', D: '映射主機端口' },
    { id: 11, question: 'TypeScript 中 `interface` 和 `type` 的主要差異？', A: '完全相同', B: 'interface 可合併宣告', C: 'type 效能較差', D: 'interface 不支援 union' },
    { id: 12, question: '`Promise.all` 和 `Promise.allSettled` 的差異？', A: '兩者相同', B: 'all 有一個 reject 就失敗，allSettled 全部等完', C: 'allSettled 較慢', D: 'all 不支援陣列' },
  ];

  const count = parseInt(import.meta.env.VITE_QUESTION_COUNT) || 10;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return Promise.resolve(shuffled.slice(0, count));
}
