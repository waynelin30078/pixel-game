# Quiz Quest — 像素風闖關問答遊戲

一款像素風格的街機式問答遊戲：輸入玩家 ID，逐題挑戰不同的 BOSS，答對指定題數即可通關。題目與計分邏輯由 **Google Sheets + Google Apps Script（GAS）** 提供，前端則以 **React + Vite** 打造。

---

## 目錄

- [技術架構](#技術架構)
- [安裝與啟動](#安裝與啟動)
- [Google Sheets 設定](#google-sheets-設定)
- [Google Apps Script 設定](#google-apps-script-設定)
- [環境變數設定](#環境變數設定)
- [部署到 GitHub Pages](#部署到-github-pages)
- [10 題測試題目（生成式AI基礎知識）](#10-題測試題目生成式ai基礎知識)
- [常見問題排解](#常見問題排解)

---

## 技術架構

```
瀏覽器 (React + Vite)
   │  GET  ?action=getQuestions&count=N
   │  POST { userId, answers }
   ▼
Google Apps Script（doGet / doPost）
   │  讀取 / 寫入
   ▼
Google Sheets（Questions 分頁、Scores 分頁）
```

- 前端完全不知道正確答案，出題與計分都在 GAS 端完成。
- 若 `.env` 未設定 GAS URL，前端會自動改用內建的假資料（mock），方便單純開發 UI 時不必先架後端（見 `src/utils/api.js`）。

---

## 安裝與啟動

需求：Node.js 18+（建議 20+）與 npm。

```bash
# 1. 安裝依賴
npm install

# 2. 複製環境變數範例檔並填入實際值
cp .env.example .env

# 3. 啟動開發伺服器
npm run dev
```

其他指令：

```bash
npm run build    # 打包正式版本至 dist/
npm run preview  # 預覽打包後的成果
npm run lint      # 執行 oxlint 靜態檢查
```

---

## Google Sheets 設定

1. 前往 [Google Sheets](https://sheets.google.com)，建立一個新試算表，命名為例如 `Quiz Quest 題庫`。
2. 在試算表下方建立 **兩個分頁（Sheet）**，分頁名稱必須完全一致（區分大小寫）：

### 分頁一：`Questions`（題庫）

第一列為標題列，從 A1 開始依序輸入：

| A (id) | B (question) | C (A) | D (B) | E (C) | F (D) | G (answer) |
|---|---|---|---|---|---|---|
| id | question | A | B | C | D | answer |

- `id`：題目編號，需唯一（可用 1, 2, 3…）。
- `question`：題目文字。
- `A` / `B` / `C` / `D`：四個選項的文字內容。
- `answer`：正確答案的選項字母（`A`/`B`/`C`/`D`），**此欄絕對不會回傳給前端**，僅供 GAS 內部批改使用。

第二列開始，每一列填入一題。可直接使用下方「[10 題測試題目](#10-題測試題目生成式ai基礎知識)」章節提供的內容貼上。

### 分頁二：`Scores`（成績紀錄）

第一列為標題列：

| A (userId) | B (highScore) | C (cleared) | D (updatedAt) |
|---|---|---|---|
| userId | highScore | cleared | updatedAt |

此分頁由 Apps Script 自動寫入，**不需要手動填資料**，用來記錄每位玩家的歷史最高分與是否曾經通關過（用於判斷「首次通關」）。

> 分頁名稱、欄位順序務必與上方一致，因為 Apps Script 程式碼是依欄位「位置」讀取（第 1 欄、第 2 欄…），而不是依標題文字比對。

---

## Google Apps Script 設定

1. 在剛才建立的試算表中，點選選單 **擴充功能 → Apps Script**（Extensions → Apps Script），會開啟一個新分頁的 Apps Script 編輯器，並自動與此試算表綁定。
2. 刪除編輯器內預設的 `myFunction` 範例程式碼，整份貼上下方完整程式碼，檔名維持 `Code.gs`。

```javascript
// ===== 設定 =====
const SHEET_QUESTIONS = 'Questions';
const SHEET_SCORES = 'Scores';
const PASS_THRESHOLD = 7; // 需與前端 .env 的 VITE_PASS_THRESHOLD 保持一致

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'getQuestions') {
    return jsonResponse(getQuestions(e));
  }
  return jsonResponse({ error: 'Unknown action: ' + action });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    return jsonResponse(submitAnswers(body));
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ── 取得題目（不含正確答案）────────────────────────
function getQuestions(e) {
  const count = parseInt(e.parameter.count, 10) || 10;
  const rows = readSheet(SHEET_QUESTIONS);

  const all = rows.map(r => ({
    id: r[0],
    question: r[1],
    A: r[2],
    B: r[3],
    C: r[4],
    D: r[5],
  }));

  const shuffled = all
    .map(q => ({ q, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(x => x.q);

  return { questions: shuffled.slice(0, count) };
}

// ── 批改答案並更新成績 ────────────────────────
function submitAnswers(body) {
  const { userId, answers } = body;
  if (!userId || !Array.isArray(answers)) {
    return { error: 'Invalid payload' };
  }

  const questionRows = readSheet(SHEET_QUESTIONS);
  const answerKey = {};
  questionRows.forEach(r => { answerKey[r[0]] = r[6]; });

  let score = 0;
  answers.forEach(a => {
    if (a.answer && answerKey[a.questionId] === a.answer) score++;
  });
  const total = answers.length;
  const passed = score >= PASS_THRESHOLD;

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SCORES);
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) { rowIndex = i; break; }
  }

  let highScore = score;
  let isFirstClear = passed;

  if (rowIndex === -1) {
    sheet.appendRow([userId, score, passed, new Date()]);
  } else {
    const prevHighScore = data[rowIndex][1] || 0;
    const prevCleared = !!data[rowIndex][2];
    highScore = Math.max(prevHighScore, score);
    isFirstClear = passed && !prevCleared;
    sheet.getRange(rowIndex + 1, 2, 1, 3).setValues([[highScore, prevCleared || passed, new Date()]]);
  }

  return { score, total, passed, highScore, isFirstClear };
}

// ── 共用工具 ────────────────────────
function readSheet(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  const data = sheet.getDataRange().getValues();
  return data.slice(1); // 去掉標題列
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. 點選右上角 **儲存**（磁片圖示），或按 `Ctrl+S`。
4. 點選右上角藍色按鈕 **部署（Deploy） → 新增部署作業（New deployment）**。
5. 點選齒輪圖示，選擇部署類型為 **網頁應用程式（Web app）**。
6. 設定：
   - **執行身分（Execute as）**：我（your account）
   - **具有存取權的使用者（Who has access）**：任何人（Anyone）
7. 點選 **部署（Deploy）**，第一次會跳出 Google 授權畫面，選擇你的帳號並允許權限（會顯示「未經驗證的應用程式」警告，屬正常現象，點選「進階」→「前往專案（不安全）」繼續即可）。
8. 部署完成後，會顯示一組網址，格式類似：

   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

   複製這組網址，這就是 `VITE_GOOGLE_APP_SCRIPT_URL`。

> **之後修改 `Code.gs` 程式碼時**：光按「儲存」不會更新已部署的網址內容，必須到「部署 → 管理部署作業 → 編輯（鉛筆圖示）→ 版本選擇『新版本』→ 部署」，否則前端會呼叫到舊的程式邏輯。

---

## 環境變數設定

編輯專案根目錄的 `.env`：

```bash
# 貼上上一步取得的 Apps Script 網頁應用程式網址
VITE_GOOGLE_APP_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec

# 通過門檻（至少答對幾題才算通關），須與 Code.gs 中的 PASS_THRESHOLD 一致
VITE_PASS_THRESHOLD=7

# 每次遊戲的題目數量
VITE_QUESTION_COUNT=10
```

修改 `.env` 後需要重新啟動 `npm run dev` 才會生效。

---

## 部署到 GitHub Pages

專案已內建 GitHub Actions Workflow（[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)），每次推送到 `main` 分支時自動觸發 build 並部署。

### 前置步驟

#### 1. 開啟 GitHub Pages

1. 進入 GitHub Repo → **Settings → Pages**
2. **Source** 選擇 **GitHub Actions**
3. 儲存

#### 2. 設定 Repository Secret（敏感資料）

前往 **Settings → Secrets and variables → Actions → Secrets**，新增：

| Secret 名稱 | 說明 |
|---|---|
| `VITE_GOOGLE_APP_SCRIPT_URL` | 你的 Google Apps Script 部署網址 |

#### 3. 設定 Repository Variables（非敏感設定）

前往 **Settings → Secrets and variables → Actions → Variables**，新增：

| Variable 名稱 | 建議值 | 說明 |
|---|---|---|
| `VITE_PASS_THRESHOLD` | `7` | 通過門檻題數 |
| `VITE_QUESTION_COUNT` | `10` | 每局題目數量 |
| `VITE_BASE_URL` | `/pixel-game/` | GitHub Pages 子路徑（替換成你的 Repo 名稱） |

> **⚠️ `VITE_BASE_URL` 必須設定！** GitHub Pages 預設將站台掛在 `https://<username>.github.io/<repo-name>/`，格式為 `/<repo-name>/`（含前後斜線）。若未設定，靜態資源路徑會錯誤導致白頁。

### 觸發部署

```bash
git add .
git commit -m "chore: deploy to GitHub Pages"
git push origin main
```

推送後到 Repo → **Actions** 頁籤可即時查看部署進度，完成後訪問：

```
https://<your-username>.github.io/<repo-name>/
```

### 手動觸發

Workflow 也支援手動執行：到 **Actions → Deploy to GitHub Pages → Run workflow**。

---

## 10 題測試題目（生成式AI基礎知識）

以下題目可直接依欄位貼到 `Questions` 分頁（第 2 列開始）。

| id | question | A | B | C | D | answer |
|----|----------|---|---|---|---|--------|
| 1 | 生成式 AI（Generative AI）主要是利用什麼技術來生成新的內容（文字、圖片等）？ | 規則引擎 | 深度學習生成模型 | 傳統資料庫查詢 | 靜態網頁模板 | B |
| 2 | 大型語言模型（LLM）目前主流採用的神經網路架構為？ | Transformer | CNN（卷積神經網路） | 決策樹 | 支持向量機（SVM） | A |
| 3 | 在使用生成式 AI 時，「Prompt」指的是？ | 模型的訓練資料集 | 使用者輸入給模型的指令或問題 | 模型的輸出結果 | GPU 運算單元 | B |
| 4 | 當生成式 AI 模型產生看似合理但實際錯誤或捏造的內容時，這種現象稱為？ | Overfitting（過擬合） | Hallucination（幻覺） | Tokenization（分詞） | Fine-tuning（微調） | B |
| 5 | RAG（Retrieval-Augmented Generation）技術的主要目的是？ | 加快模型訓練速度 | 結合外部知識檢索以提升生成內容的準確性 | 壓縮模型參數量 | 將文字轉換成圖片 | B |
| 6 | 調整 LLM 輸出的「Temperature」參數主要影響什麼？ | 模型的運算速度 | 生成內容的隨機性與創意程度 | 訓練資料的大小 | 模型的參數數量 | B |
| 7 | 「Token」在語言模型中通常指的是？ | 使用者的身分驗證碼 | 模型的權重數值 | 文字被切分後的最小處理單位 | GPU 的運算核心 | C |
| 8 | Diffusion Model（擴散模型）常被應用於哪一類生成式 AI 任務？ | 圖片生成（如 Stable Diffusion） | 資料庫查詢優化 | 網路安全防禦 | 語音壓縮編碼 | A |
| 9 | 「Fine-tuning（微調）」在生成式 AI 中的意思是？ | 從零開始訓練全新模型 | 在已訓練好的基礎模型上，用特定資料再訓練以符合特定任務需求 | 刪除模型多餘的參數 | 調整使用者介面設計 | B |
| 10 | 「Few-shot learning」是指在提示（Prompt）中提供什麼，以幫助模型更好完成任務？ | 完全不提供任何範例 | 少量範例讓模型參考學習 | 模型的原始碼 | 大量標註資料重新訓練模型 | B |

若貼到 Google Sheets 後欄位沒有自動分開，可改用下方 **Tab 分隔** 版本（選取 `Questions!A2` 儲存格後直接貼上）：

```
1	生成式 AI（Generative AI）主要是利用什麼技術來生成新的內容（文字、圖片等）？	規則引擎	深度學習生成模型	傳統資料庫查詢	靜態網頁模板	B
2	大型語言模型（LLM）目前主流採用的神經網路架構為？	Transformer	CNN（卷積神經網路）	決策樹	支持向量機（SVM）	A
3	在使用生成式 AI 時，「Prompt」指的是？	模型的訓練資料集	使用者輸入給模型的指令或問題	模型的輸出結果	GPU 運算單元	B
4	當生成式 AI 模型產生看似合理但實際錯誤或捏造的內容時，這種現象稱為？	Overfitting（過擬合）	Hallucination（幻覺）	Tokenization（分詞）	Fine-tuning（微調）	B
5	RAG（Retrieval-Augmented Generation）技術的主要目的是？	加快模型訓練速度	結合外部知識檢索以提升生成內容的準確性	壓縮模型參數量	將文字轉換成圖片	B
6	調整 LLM 輸出的「Temperature」參數主要影響什麼？	模型的運算速度	生成內容的隨機性與創意程度	訓練資料的大小	模型的參數數量	B
7	「Token」在語言模型中通常指的是？	使用者的身分驗證碼	模型的權重數值	文字被切分後的最小處理單位	GPU 的運算核心	C
8	Diffusion Model（擴散模型）常被應用於哪一類生成式 AI 任務？	圖片生成（如 Stable Diffusion）	資料庫查詢優化	網路安全防禦	語音壓縮編碼	A
9	「Fine-tuning（微調）」在生成式 AI 中的意思是？	從零開始訓練全新模型	在已訓練好的基礎模型上，用特定資料再訓練以符合特定任務需求	刪除模型多餘的參數	調整使用者介面設計	B
10	「Few-shot learning」是指在提示（Prompt）中提供什麼，以幫助模型更好完成任務？	完全不提供任何範例	少量範例讓模型參考學習	模型的原始碼	大量標註資料重新訓練模型	B
```

---

## 常見問題排解

- **前端一直顯示假資料 / 分數固定是 70%**：代表 `.env` 的 `VITE_GOOGLE_APP_SCRIPT_URL` 未設定或仍是預設的 `YOUR_SCRIPT_ID` 佔位字串，請確認已貼上正確網址並重啟 `npm run dev`。
- **呼叫 API 出現 CORS 錯誤**：確認 Apps Script 部署設定為「執行身分：我」「存取權：任何人」；前端已使用 `Content-Type: text/plain` 避免觸發預檢請求（preflight），不要自行改成 `application/json`。
- **修改 `Code.gs` 後行為沒有變化**：需要建立「新版本」部署（見上方部署章節提醒），單純儲存程式碼不會更新已發布的網址內容。
- **`getQuestions` 回傳空陣列**：檢查 `Questions` 分頁是否有標題列（第 1 列會被跳過），以及欄位順序是否為 `id, question, A, B, C, D, answer`。
- **通關判定與畫面顯示的門檻不一致**：`Code.gs` 內的 `PASS_THRESHOLD` 常數必須與 `.env` 的 `VITE_PASS_THRESHOLD` 手動保持一致，兩者互不影響。
