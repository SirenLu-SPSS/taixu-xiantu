# Supabase Free 資料庫搬移

專案 `vkfgxjqtdpswswgqycps`，組織「太虛仙途」，Singapore，Free。
現有免費 Render 靜態網站及帳號 Node 服務繼續承接遊戲網頁與 API；Supabase 承接持久 PostgreSQL。這不是把 HTML 遊戲網站單獨託管於 Supabase。

## 執行步驟

1. 保持 Supabase Data API 關閉，取得 Connect → Session pooler 連線字串（含資料庫密碼）。密碼只放帳號服務的秘密環境變數，不放前端、Git 或日誌。
2. 原 Render 帳號服務的 `DATABASE_URL` 維持原來源；新增 `ACCOUNT_DATABASE_MIGRATION_TARGET`，值為 Supabase Session pooler URL。也可把原始密碼獨立放在 `ACCOUNT_DATABASE_MIGRATION_PASSWORD`，程式會自動做 URL 編碼，使用者不用手動編碼特殊符號。
3. 新服務啟動時建立來源寫入保護，等待舊交易結束後凍結來源寫入，逐批複製 accounts、sessions、characters、save_history 到空白目標。
4. 比較每表的記錄數與完整記錄 SHA-256，包含密碼雜湊、救援雜湊、session、人物與歷史 JSON。全部一致才提交目標並讓新 API 使用目標資料庫。
5. 複製失敗則回滾目標並解除來源凍結；既有資料絕不以 ON CONFLICT 覆蓋。非空目標直接拒絕複製。
6. 確認健康檢查、既有帳號讀取、人物版本保護及新人物操作後，將 Render `DATABASE_URL` 改為 Supabase URL，再將 `ACCOUNT_DATABASE_MIGRATION_TARGET` 與 `ACCOUNT_DATABASE_MIGRATION_PASSWORD` 清空。避免日後啟動仍依賴 30 天會到期的 Render 原資料庫。
7. 原資料庫保持唯讀備份，不刪除。切換後不得直接解除來源凍結並回退，否則會漏掉 Supabase 新進度；回退前須先逆向同步。

## 資料與安全

- 每帳號仍為五人物，原人物 UUID、欄位、版本與救援碼繼續有效。
- 搬移期間雲端寫入會暫時失敗，原有前端保留本機進度並稍後重試。
- 目標資料表啟用 RLS，撤回 PUBLIC、anon、authenticated 的資料表權限；僅帳號服務透過資料庫憑證存取。
- TLS 使用 verify-full，不能以停用憑證驗證繞過錯誤。
- 免費方案有配額，低活動約一週可能暫停，需要在 Dashboard 恢復；不是永久不中斷服務承諾。

## 驗證

`node --test tests/account-migration.test.cjs` 驗證完整複製、來源凍結、重啟冪等、失敗回滾與非空目標保護。正式切換另需 Supabase 與 Render 上線檢查。

## 2026-10-13 完成紀錄

正式搬移驗證通過：3 帳號、6 人物、4 sessions、1 歷史存檔。四表逐筆 SHA-256 一致，Supabase 表啟用 RLS，Data API 保持關閉。正式 API 已測試註冊、兩個工作階段讀取、五人物上限、帳號隔離、版本衝突及密碼救援，測試建立的假帳號已清理。完整本機測試 319 項通過。

使用 Supabase 官方 prod-ca-2021.crt，verify-full 驗證 CA 與主機名稱。DATABASE_URL 已改用 Supabase Session pooler，搬移目標與獨立密碼環境變數已清空；舊 Render 資料庫保持凍結備份。遊戲及 API 網址維持原網址，兩者仍在免費 Render 服務上。
