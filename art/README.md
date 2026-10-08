# 美術素材 · ComfyUI

這組素材由使用者指定的本機 ComfyUI 產生，以青玉、墨綠、古金為共同色調。美術只影響呈現，不修改戰鬥數值或原角色進度。

- 模型：qwen_image_2.1_int8_convrot.safetensors
- 文字編碼器：qwen3vl_8b_int8_convrot.safetensors
- VAE：qwen_image_2.1_vae_bf16.safetensors
- 節點：TextEncodeQwenImage21 → KSampler → VAEDecode → SaveImage
- 解析度：768 × 768；24 steps；CFG 4；Euler / simple
- API 工作流程與固定 seed：art/workflows/*.json
- 網頁素材：src/assets/art/*.webp

四款人物頭像可點擊頂部頭像切換，選擇存於原存檔新增的 portrait 欄位。舊存檔沒有該欄位時，預設顯示青雲劍修；切換只改外觀。

山水插畫用於登入、地圖標題與洞府橫幅。技能與部分導覽使用獨立圖示。文字、血條、冷卻與互動控制仍使用 HTML，保持手機可讀性。

目前人物圖片是頭像插畫，戰鬥場景中的角色仍使用原有繪製方式；不把靜態頭像當成完整走路動畫。
