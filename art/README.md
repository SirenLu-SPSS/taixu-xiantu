# 美術素材 · ComfyUI

## 仙寶經濟 V2.0

`economy-assets.csv` 列出 222 個唯一資產（120 裝備、12 法寶、12 靈寵、72 寶石、6 功能 ICON）。十九張 ComfyUI Qwen Image 2.1 圖集分別保存 API 工作流。`generate-economy-art.cjs` 以既有 LAN ComfyUI 生成；`process-economy-art.py` 裁切、去除連通白底及縮圖；`verify-economy-art.py` 核對 444 個 PNG 的 RGBA、透明像素及尺寸。

新資產位於 `src/assets/economy/master`（256px）及 `runtime`（64px），不覆蓋已核准的 WebP。`economy-art-manifest.json` 記錄來源圖集、格位、版本與 SHA-256。寶石功能色保持固定，階級由圖形光效及 1–6 枚金色標記區分；物品品階框由 UI 呈現。

所有插畫以使用者指定的本機 ComfyUI 生成，採青玉、墨綠、古金色調。工作流程與固定 seed 保存於 `art/workflows/`，遊戲使用 `src/assets/art/` 的 WebP 素材。

## 生成設定

- 模型：qwen_image_2.1_int8_convrot.safetensors
- 文字編碼器：qwen3vl_8b_int8_convrot.safetensors
- VAE：qwen_image_2.1_vae_bf16.safetensors
- 節點：TextEncodeQwenImage21 → KSampler → VAEDecode → SaveImage
- 解析度：768 × 768；24 steps；CFG 4；Euler / simple
- 人物全身素材參考原本四款頭像；重跑 cultivators-api.json 前，將 portraits-api.json 產生的圖片上傳為 taixu-portraits-reference.png。參考圖輸入使用 images.image_1。

## 素材與使用範圍

- 四款人物頭像與對應全身角色：劍修、仙姝、道君、仙子。點擊頂部頭像可切換，戰鬥角色同步改變。
- 八個功能導覽圖示：太極、乾坤袋、仙劍、靈火、靈狐、寶珠、山水、丹爐。網頁側欄和手機導覽使用相同素材，底部探索／養成也有圖示。
- 戰鬥場景：水彩地面、竹林、苔石、亭閣、靈草；妖狼、翠林山精、九尾靈狐使用透明素材。
- 地面快取、人物與場景按前後位置排序。竹林遮到主角時降低透明度，避免隱藏人物。
- 程式特效：劍光弧線、火球尾焰與爆散、飛劍軌跡、回春葉光、突破符光、點擊目的地標記。

白底精靈素材裁切後，只去除與外邊緣相連的白色區域並處理邊缘，保留白髮與白袍。全身角色現在使用單張精靈搭配待機呼吸、行走擺動與方向翻轉；尚未加入逐幀骨架或八方向動畫。

青雲山與翠竹幽林優先使用完整角色／妖獸素材。後續三張地圖保留既有妖獸繪製方式，逐步替換專屬素材。

## 相容性

美術不修改战斗數值或角色進度。頭像選擇存於原存檔的 portrait 欄位；舊存檔缺少該欄位時顯示預設劍修。圖片載入期間，人物與妖獸會使用原有繪製方式。

使用者設定減少動態效果時，裝飾性擺動停止。建置會檢查所有必要素材，Render 部署前執行存檔、養成及渲染回歸測試。

## 五種異界 · ComfyUI 圖像素材

五套主題各包含一张 768×768 場景圖與一張 2×2 精靈圖集，使用相同 Qwen Image 2.1 模型與 24-step 流程；固定 prompt 和 seed 位於 `art/workflows/rift-*-api.json`。共產出 25 個遊戲 WebP：5 張地面、5 個普通敵人、5 個精英、5 個 Boss、5 個獨立變身形態。

| 主題 | 場景 | Boss → 變身 |
| --- | --- | --- |
| 赤焰魔境 | 黑曜石、熔岩與古銅祭壇 | 火焰帝君 → 炎龍 |
| 霜月雪域 | 月光冰晶與霜雪石板 | 霜月女王 → 冰翼女王 |
| 幽夢妖林 | 古樹盤根與螢光靈菇 | 萬木妖皇 → 荊棘巨木 |
| 黃沙古國 | 沙丘、殘柱與古國封印 | 古國帝王 → 金沙巨像 |
| 星隕虛空 | 浮空石臺、星紋與紫色裂隙 | 星隕界主 → 晶翼界主 |

原始圖集為白底、左上普通敵人、右上精英、左下 Boss、右下變身。`art/process-rift-art.py` 去除連接外邊緣的白底、處理抗鋸齒邊緣，並清除跨格的小碎片；保留角色白袍、冰晶與主要武器。將下載的原圖命名為 `{theme}-floor.png` / `{theme}-actors.png` 放在來源資料夾，執行 `python art/process-rift-art.py <來源資料夾>` 可重建 WebP（需 Pillow、NumPy、SciPy）。

`src/ui/rift-art.js` 只接管背景、敵人、圖鑑與血條位置；十波數值、技能碰撞、獎勵及存檔仍由原本機緣系統負責。圖片未載入時暫用程序圖形，背景就緒後建立一次快取並釋放替代背景。角色精靈採尺寸包含式縮放，保持比例；Boss 變身時切换独立 rage 素材，保留擴大體型與預警。

## 角色管理頁 ComfyUI 美術

Qwen Image 2.1 經區域網路 ComfyUI 製作 5 組圖集：16 款裝備／消耗品／材料 ICON，8 款靈寵與法寶 ICON，水墨背景，4 款基礎全身立繪及 4 款深青外衣立繪，共 33 個 WebP、約 0.6MB。所有工作流在 `art/workflows/character-*-api.json`，來源及 SHA-256 在 `art/character-art-manifest.json`。

原圖命名 icons.png、companions.png、backdrop.png、bodies.png、outfits.png。`python art/process-character-art.py <來源目錄>` 可重建素材，僅需 Pillow、NumPy。ICON 只去除連接邊緣的深色背景；人物只去除連接邊緣的白底，保留白袍。實際伙伴圖集出現 4×3 排列，擷取第一列靈寵及第三列法寶，避免重複或截斷。人物圖集為 2×2，順序劍修、玉修、仙翁、月仙。

外衣穿戴切換至專用 outfit 全身素材；卸下回到 body 素材。配件圖層獨立存在，精確服裝裁片／骨骼動畫留待後续製作。圖片與數值分開，換圖不改变攻擊、CD、傷害或存檔。
