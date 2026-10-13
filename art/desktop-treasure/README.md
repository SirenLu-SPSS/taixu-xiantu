# 電腦版法寶展示美術

由本機 ComfyUI Qwen Image 2.1 生成。各法寶工作流程含模型、提示詞、seed 與生成參數，同目錄保存。只用於電腦版法寶展示頁，不替換原角色欄位、背包與戰鬥圖片。

42 種法寶：基礎 12 種對應 treasure_0 至 treasure_11，高階 30 種對應 v21_treasure_0 至 v21_treasure_29；舊版鏡、飛劍、鈴、葫蘆沿用對應種類展示圖。遊戲數值與品階皆讀取原存檔，不從示意圖取得。

原始圖片轉為 WebP quality 88；showcase.webp 為通用展示台背景。

高階法寶以 768px、16 steps 生成。所有大圖及桌面縮圖共用 TreasureShowcase.asset 映射；建置與測試檢查全部法寶的對應圖檔，防止高階法寶回退成低解析度小圖。
