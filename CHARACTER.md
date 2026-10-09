# 角色管理介面

開發分支 `feature/character-management`，備份分支 `backup/character-baseline-13242f6`，基線提交 `13242f69ea2cf7e587af8554d054a8c1b3e731fe`。

## 入口與場景

點擊人物頭像或主選單「角色」開啟全螢幕角色頁。手機養成主選單維持原本「洞天養成」入口。返回保留原來的探索／養成頁、地圖、位置、目的地、自動戰鬥與自動打坐設定。角色頁沿用彈窗的場景暫停方式，沒有改動傷害、修煉、突破或攻擊冷卻計算；出戰 CD 時間戳繼續採原有規則。開啟時清除暫時按鍵，不更動角色位置。

## 存檔

繼續使用 `TAIXU_ASCEND_V2_SAVE`、角色 `version:2`。首次進入新版先保留原始存檔於 `TAIXU_ASCEND_V2_SAVE_PRE_CHARACTER`，不清空 storage，不覆寫既有備份。正常保存仍用原 `save()`。`CharacterSystem.normalize` 與 `Progression.normalize` 補欄位；原裝備、背包項目、未知欄位、角色與伙伴進度保留。讀取時超出容量的舊項目也不裁切。

裝備鍵：

| 鍵 | 名稱 | 遷移 |
| --- | --- | --- |
| head | 頭冠 | 原頭冠 |
| earrings | 耳環 | 新增，預設 null |
| inner | 內衣 | 新增，預設 null |
| weapon | 武器 | 原佩劍 |
| legs | 護腿 | 新增，預設 null |
| necklace | 項鍊 | 新增，預設 null |
| bracelet | 手環 | 新增，預設 null |
| robe | 外衣 | 原法袍，保留相同鍵與物品 |
| ring | 戒指 | 原玉戒 |
| boots | 鞋靴 | 原道靴 |

另有同槽可替換法器 `jadeSword`（碧霄仙劍）及 `starRobe`（星紋法衣，需築基），提供不同品質與屬性。新增物品 `earrings`、`inner`、`legs`、`necklace`、`bracelet` 的属性、品質、售價與境界需求集中於 `ITEMS`。透過角色頁「尋寶閣」用兩倍售價購買。裝備穿戴移動一件物品到槽位，替換返回一件舊裝備；卸下只返回一件。滿包、未持有或境界不足時原子失敗，不丟棄或複製物品。所有槽位沿用原 `stats()` 加總，因此加成即時生效。

背包新增容量設定，沒有建立第二份物品資料：

```json
{"bag":{"version":1,"capacities":{"equipment":100,"treasures":100,"pets":100,"consumables":100,"materials":100}}}
```

- 裝備、丹藥、材料：仍來自 `inventory:[{id,count}]`；同 ID 的增加沿用 `Progression.addItem` 堆疊，採集、煉丹、出售使用同一份資料。
- 法寶：來自 `ownedTreasures`，一種已擁有法寶佔一格。
- 靈寵：來自正等級的 `levelPet`，一種已擁有靈寵佔一格。
- 一般裝備穿戴後不佔背包格，法寶／靈寵持有格不因出戰或主選而消失。
- 每類至少 100 格，保留既有更大容量。未知物品保留於材料類，詳細資訊標示尚未辨識，不提供會損失資料的操作。
- 視圖每頁 20 格、100 格共 5 頁，手機每列 5 格、桌面每列 10 格；支持分類、品質／類型／名稱排序及內部捲動。

## 伙伴同步

沒有複製戰鬥編隊。主選仍使用 `activePet` / `activeTreasure`，出戰仍使用 `companions.deployed`，攻擊順序及 CD 分別使用 `order` / `cooldowns`。角色頁可出戰／休息、切換／卸下主選、取得伙伴、升級靈寵及開啟原攻擊順序面板。休息只撤回主動出戰；主選被動加成與出戰分開，與原遊戲一致。靈寵升級仍採等級 ×70 靈石、上限 20；法寶仍維持基礎 Lv.1，本次沒有新增法寶升級數值。

## 美術與擴充

ComfyUI Qwen Image 2.1 工作流及 SHA-256 清單保存於 `art/`。角色頁使用四款全身立繪、換衣立繪、水墨背景及裝備／伙伴 ICON。細部換装不是骨骼動畫：当前是服装预设與配件预览；個別裝備完整裁片、動態擺動和精確手持位置仍需獨立製作。外衣穿戴切換專用完整 outfit 立繪，不疊加服裝 ICON 遮擋手腳。立繪已包含的頭冠、靴子與劍修手持劍不重複疊圖。`characterAppearance` 與 `characterBody` 為外觀擴充層，保持外觀和數值分離。

強化、精煉、套裝及新外觀可從 `ITEMS` 元資料及 `CharacterSystem` 擴充，不在現有 `inventory` 之外重建所有權。法寶、靈寵品質是 catalog 的 `rarity`，不額外改動原戰鬥平衡。Safari `viewport-fit=cover` 與 safe-area padding 延用；角色頁、背包及資訊面板可捲動，返回列保持置頂。

## 驗證

`node --test tests/*.test.cjs`、`node scripts/build.cjs`。涵蓋遷移、十槽穿戴／卸下、原子失敗、五類容量、舊超額物品、伙伴資源與 CD、真實戰力，以及原戰鬥、突破、採集、出售、機緣和異界十波回歸。瀏覽器 QA 僅用 localhost 測試角色；不修改線上玩家存檔。手機 375×812、390×844，平板 768×1024，桌面 1280×900；不宣稱已在實體 iPhone Safari 測試。
