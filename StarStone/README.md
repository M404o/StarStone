# StarStone Daily Deck (Static Web App)

毎朝1枚、ランダムにカードを引いて「小さな行動」を決めるミニマルな儀式アプリ。  
**天然石 × 星 × カード** の世界観で、30枚のフルデッキを同梱。

## 使い方
1. このフォルダを任意のホスティング（GitHub Pages / Netlify / Vercel Static / Firebase Hosting 等）に配置
2. `index.html` を開く（ローカルでもOK。Chromeで動作確認）
3. 「カードをめくる」→ 画像保存 or テキストコピーでSNSに共有

## 構成
- `deck.json` : 30枚のカード定義（石・シンボル・行動）
- `app.js` : ランダムドロー、キャンバス描画、保存/コピー
- `style.css` : ミニマルなダークテーマ

## カスタム
- カードを増減する: `deck.json` を編集
- ロゴ/クレジットON/OFF: 画面のトグル or デフォルトはON
- 色味やフォント: `style.css` / `app.js` の描画フォントを調整

---

© StarStone Deck — Make your morning a little cosmic.
