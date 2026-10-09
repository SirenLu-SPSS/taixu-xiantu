# 太虛仙途 v3.0・山海行旅

純 HTML / CSS / JavaScript 修仙遊戲。Node.js 22 以上只用於檢查與打包，沒有套件依賴。

## 角色管理更新

點擊人物頭像，或在主選單選擇「角色」，開啟獨立角色管理頁。整合十個裝備欄、法寶、靈寵與五類各 100 格的背包；物品使用、出售、裝備替換、出戰及伙伴升級直接共用遊戲資料。

介面採 ComfyUI 水墨背景、全身角色與換衣立繪，以及裝備／伙伴 ICON。手機直式提供可捲動背包和置頂返回列。角色頁暫停場景活動，返回沿用原位置與自動化設定。

保留 v2 存檔及未知欄位，首次載入另存角色遷移前備份。資料模型、相容性和外觀擴充限制詳見 [CHARACTER.md](./CHARACTER.md)。原有傷害、修煉、突破和冷卻計算維持既有規則。

## 開發

- src/styles/game.css：UI 與手機排版。
- src/data/catalog.js：地圖、境界、技能、靈寵、裝備資料。
- src/game.js：角色狀態、存檔、戰鬥與畫面循環。
- node --test tests/*.test.cjs：存檔相容性與結構檢查。
- node scripts/build.cjs：生成 dist/，Render 發布此目錄。

目前保留經典 script 的載入順序，避免拆模組時改變遊戲狀態。後續每次只抽出一個系統並驗證舊存檔。

## 自動部署

既有 Render 服務必須透過已連接的 GitHub 帳號綁定本倉庫 main 分支，Auto-Deploy 設為 On Commit，Build Command 設為 node --test tests/*.test.cjs && node scripts/build.cjs，Publish Directory 設為 dist。單純使用 Public Git Repository URL 不支援自動部署。render.yaml 提供可重建設定；單獨提交它不會更改既有非 Blueprint 服務。

## 存檔保護

保留版本 2 與 localStorage 鍵 TAIXU_ASCEND_V2_SAVE。存檔在使用者的瀏覽器，不在 GitHub 或 Render；同一網址、同一瀏覽器更新可繼續使用。改網址、換瀏覽器或清除網站資料前，請在設定匯出 JSON，於新網址匯入。不要把角色存檔提交到公開倉庫。

## 開發順序

1. 手機 UI 與操作回饋。
2. 地圖解鎖與探索內容。
3. 境界突破機率與平衡。
4. 技能冷卻、升級與戰鬥。
5. 靈寵養成、裝備與掉落。

每一步先測舊角色讀取及匯出／匯入，再發布；保留未知存檔欄位，新增欄位需有預設值。跨版本改存檔必須另設 migration 與備份。雲端同步尚未建立。
