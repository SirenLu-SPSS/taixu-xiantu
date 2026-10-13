# 帳號與五人物雲端存檔

目前：已正式啟用，帳號與人物資料已於 2026-10-13 搬到 Supabase Free。Render 免費靜態網站與 Node API 繼續服務。下方原始部署說明保留為歷史紀錄；目前不依賴 2026-11-12 到期的 Render 試用資料庫，詳見 `supabase-migration.md`。

## 功能

- 首頁帳號綁定／登入；帳號 4–32 位英數字或底線，密碼至少 10 字元。
- 每帳號最多五人物，資料庫列鎖及唯一欄位約束保障上限。
- 續寫前緣列出人物名稱、境界、存檔時間；每個人物獨立存檔。
- 原本機存檔保留；玩家明確確認後才複製到帳號的空位，不覆蓋雲端人物。
- 遊戲先寫本機、再傳雲端。離線留待同步；更新衝突禁止舊版本覆蓋，可匯出本機版本、再選雲端版本。
- 每人物保留最近五次伺服器歷史版本；管理員可從 save_history 檢查與救援。
- 密碼 scrypt、不可逆救援碼雜湊、隨機七天 session；session token 只存在 sessionStorage，資料庫只存 token 雜湊。跨來源 Bearer 認證不依賴第三方 Cookie。
- 註冊顯示一次性救援碼供下載。重設密碼後撤銷所有舊 session 並輪替救援碼。

## 部署狀態與啟用流程

現有 Render 是純靜態服務；新增帳號 Web Service 與持久 Postgres，不能將玩家存檔放在 Web Service 暫存磁碟。

1. 審核 `render-accounts.yaml` 費用後建立 Singapore Postgres 與 Node Web Service。
2. DATABASE_URL 僅設定在服務端，使用內網連線，同區域；公開資料庫 IP 禁止存取。
3. Web Service build: `npm ci --include=dev && npm test`，start: `node server/start.cjs`，health: `/health`。
4. 將實際 HTTPS API URL 設到 `src/account-config.js` 的公開 TAIXU_ACCOUNT_API。該檔不可放密碼或資料庫連線字串。
5. 現有靜態服務 build 改成 `npm ci --include=dev && npm test && npm run build`，安裝新增測試依賴。
6. 先完成新 API 健康檢查、兩帳號隔離與雙登入測試，再推 main 啟用帳號 UI。API URL 仍空白時不應推正式網站。
7. 若回退前端，Postgres 不刪除；舊本機 SAVE key 不變，既有遊客可照常讀取。

正式環境仍由原本的太虛仙途網址進入；API 是獨立網址。自訂遊戲網址時須同步更新 ALLOWED_ORIGINS。

免費 Render Postgres 30 天會到期，不適合玩家永久存檔。預估 Starter Web $7/月 + 256MB Postgres $6/月 + 1GB 儲存 $0.30/月，合計約 US$13.30/月（稅、流量及額外用量依帳單）。建立資源前須取得費用同意。

## 測試

`node --test tests/*.test.cjs`，238 通過。帳號整合測試在 PGlite PostgreSQL 相容引擎執行實際 SQL；正式 Render PostgreSQL 的健康與併發煙霧測試需於資源建立後補驗。

測試涵蓋註冊、登入、密碼雜湊、救援碼輪替、登出撤銷、帳號隔離、CORS、五人物上限、版本衝突、五版歷史、服務重啟持久性及錯誤格式保護。前端另以虛構帳號在兩個獨立登入視窗驗證讀取相同人物，390×844 手機版可正常操作。

## 限制

- 是帳號進度備份，非伺服器權威戰鬥；客戶端仍可修改本機數值。
- 不提供電子郵件驗證，遺失密碼需使用註冊時下載的救援碼。
- 本機暫存仍依瀏覽器保存；尚未同步前清除瀏覽器資料會失去離線進度。設定提供匯出。
- session 關閉分頁後需重新登入，雲端人物不受影響。
- 更新 schema 只採新增資料表與索引，不清空現有玩家記錄。

## 2026-10-13 試用部署

每帳號上限為 5 位人物。使用免費帳號 Web Service 與免費 PostgreSQL，資料庫於 2026-11-12 到期，屆時需遷移或升級才能繼續保存。免費 Web Service 閒置後首次登入可能需要等待喚醒。API: https://taixu-player-accounts-trial.onrender.com。新首頁素材由 ComfyUI Qwen Image 2.1 生成，CSS 景深與光暈動畫遵循減少動態效果設定，進入遊戲後停止。
