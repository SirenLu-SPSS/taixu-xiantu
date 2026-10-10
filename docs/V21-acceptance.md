# 太虛仙途 V2.1 驗收紀錄

## 完成範圍
- 化神、煉虛、合體、大乘、渡劫與飛昇後六個主題，共 30 個探索分區（各含主域、東西境、秘境、首領祭壇）。六套地面圖搭配分區路徑及物件配置；不是 30 張獨立地面插畫。
- 48 個敵人定義、18 個可互動 NPC、16 類敵人能力、首領三階段與虛空／落雷危險區。秘境出現精英與魔修，祭壇一次生成一名首領。
- 30 種法寶、30 種靈寵、30 本技能書、9 種新素材；沿用天鑄玄晶與十二類六階寶石。
- 首領保底紫品以上裝備或法寶，另抽金品／傳說。普通機緣 4%／5%／6% 及既有異界掉落表保留。
- 八格技能 2×4 配置、交換、移除、保存及自動施放優先／血量／真元／目標數條件。原技能仍可升級和配置。
- 新技能包含多目標、持續傷害、位移、護盾、解控、回復、增幅與短暫作戰分身。沿用單一遊戲循環與既有戰鬥引擎。
- 高階靈寵培養／進化消耗專屬材料；高階法寶與靈寵由掉落取得，不進一般商店。
- 舊存檔欄位與未知資料保留，新增 highRealms 區塊；獎勵收據與 NPC 傳承防重複領取，滿包進未領取匣。

## ComfyUI 圖資
189 個資產：法寶 30、靈寵 30、技能 30、材料 9、地面 6、敵人 48、NPC 18、場景物件 18。
每個資產都有 Master 與 Runtime PNG RGBA。ICON 為 256→64；敵人／NPC／物件為 256→128；地面 1024。183 組去背資產均檢查含透明像素；地面保留完整背景。
CSV：art/v21/assets.csv；清單：art/v21/assets.json；原始圖／工作流：art/v21/sources、art/v21/workflows。
產製使用既有遠端 ComfyUI、Qwen Image 2.1 工作流。妖獸圖集經目視驗收調整裁切對應，首領使用另存的 ComfyUI 原始圖集。未覆蓋既有核准素材。

## 測試
- node --test tests/*.test.cjs：143 通過、0 失敗。
- node scripts/build.cjs：成功；git diff --check：通過。
- 固定種子 5,000 次首領抽樣：金品 915（18.3%）；傳說法寶 110（2.2%）。設定分別 18%／2%。另有每次保底及重載防重領測試。
- 30 種神通逐一執行實際施放介面；範圍傷害、位移、分身射擊、護盾吸收、回復上限、境界限制與首領階段測試通過。
- 舊角色、技能、裝備、自動戰鬥／打坐與未知存檔資料保留測試通過。
- 瀏覽器逐一切換六境界、技能書學習與配置保存正常，未出現 JavaScript 錯誤。
- 390×844 手機尺寸驗收：八格按鈕 44×46，未被底部導覽遮住。

## 修改檔案
新增 src/data/high-realms.js、src/systems/high-realms.js、src/ui/high-realms.js、src/data/v21-assets.js、tests/high-realms.test.cjs、art/generate-v21.cjs、art/process-v21.py、art/v21 清單／來源／工作流及 src/assets/v21 圖資。
整合 index.html、src/game.js、src/styles/v3.css、src/systems/character.js、src/systems/economy.js、src/ui/economy.js、src/ui/battle-art.js、scripts/build.cjs、.gitignore。

## 驗收限制與後續
- 沒有待產製的本次靜態圖資。NPC、敵人仍為靜態戰鬥素材；走路、攻擊、施法、受傷的逐格動畫尚未製作。
- Master 與 Runtime 分目錄管理；大型獨立角色立繪可在後續擴充。
- 手機尺寸已驗收，尚未在實體 iPhone Safari 執行。
- 高境界長期成長速度及技能平衡仍需玩家實戰回饋；機率與素材數量集中在資料表可調整。
