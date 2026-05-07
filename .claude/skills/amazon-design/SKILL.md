---
name: amazon-design
description: Create Amazon-style e-commerce UI components and pages that faithfully replicate Amazon.co.jp / Amazon.com's visual language. Use this skill whenever the user asks to build an e-commerce interface, product listing page, product detail page, shopping cart, order form, review section, or any UI that should "look like Amazon." Also trigger for requests like "Amazonっぽいデザイン", "ECサイトのUI", "商品カード", "カートボタン", "レビュー表示", "Amazonスタイル", or any combination of shopping/retail UI needs. When in doubt, use this skill — it provides the exact color tokens, component patterns, and layout conventions that make interfaces immediately recognizable as Amazon-style.
---

This skill guides the creation of production-grade, Amazon-style e-commerce UIs that faithfully reproduce Amazon's visual language, layout conventions, and interactive patterns.

## Amazon Design System

### Color Palette (CSS variables — always define these at :root)

```css
:root {
  /* Core brand */
  --amz-orange:        #FF9900;
  --amz-orange-hover:  #FA8900;
  --amz-orange-light:  #FFF3CD;

  /* Header & nav */
  --amz-navy:          #131921;
  --amz-header:        #232F3E;
  --amz-header-hover:  #37475A;
  --amz-header-light:  #485769;

  /* Backgrounds */
  --amz-bg:            #EAEDED;
  --amz-bg-card:       #FFFFFF;
  --amz-bg-sidebar:    #F3F3F3;

  /* Text */
  --amz-text:          #0F1111;
  --amz-text-secondary:#565959;
  --amz-link:          #007185;
  --amz-link-hover:    #C7511F;

  /* Accents */
  --amz-price:         #B12704;
  --amz-prime-blue:    #00A8E1;
  --amz-green:         #007600;
  --amz-star:          #FF9900;
  --amz-red:           #CC0000;
  --amz-border:        #D5D9D9;
  --amz-border-light:  #E7E7E7;
}
```

### Typography

- Primary font: `"Amazon Ember", Arial, sans-serif` (fallback to `Arial` which is close enough)
- Font sizes: 12px (badge/meta), 13px (body small), 14px (body), 16px (h3), 18px (h2), 21px (price large), 28px (hero title)
- Font weight: 400 (body), 700 (price, bold labels)

---

## Core Components

### 1. Top Navigation Bar

```html
<!-- Header top bar -->
<header style="background:var(--amz-navy); color:white; font-family:Arial,sans-serif;">
  <!-- Row 1: Logo + Search + Account + Cart -->
  <div style="display:flex; align-items:center; padding:8px 16px; gap:8px;">
    <!-- Logo -->
    <div style="border:1px solid transparent; padding:4px 8px; border-radius:2px; cursor:pointer; white-space:nowrap;">
      <span style="font-size:20px; font-weight:700; letter-spacing:-1px;">amazon</span>
      <span style="font-size:10px; color:var(--amz-orange); display:block; text-align:right; margin-top:-4px;">.co.jp</span>
    </div>
    <!-- Search bar -->
    <div style="flex:1; display:flex; max-width:800px;">
      <select style="background:#F3F3F3; border:none; padding:0 8px; font-size:12px; border-radius:4px 0 0 4px; cursor:pointer; height:38px;">
        <option>すべて</option>
      </select>
      <input type="text" placeholder="Amazon.co.jpを検索"
        style="flex:1; border:none; padding:0 12px; font-size:14px; height:38px; outline:none;"/>
      <button style="background:var(--amz-orange); border:none; padding:0 14px; border-radius:0 4px 4px 0; cursor:pointer; height:38px;">
        <span style="font-size:18px;">🔍</span>
      </button>
    </div>
    <!-- Account & Cart -->
    <div style="display:flex; gap:16px; align-items:center; white-space:nowrap; font-size:13px;">
      <div style="cursor:pointer; padding:4px;">
        <div style="font-size:11px; color:#ccc;">こんにちは、サインインしてください</div>
        <div style="font-weight:700;">アカウント&リスト ▾</div>
      </div>
      <div style="cursor:pointer; padding:4px;">
        <div style="font-size:11px; color:#ccc;">返品と</div>
        <div style="font-weight:700;">注文</div>
      </div>
      <div style="cursor:pointer; display:flex; align-items:flex-end; gap:4px; padding:4px;">
        <span style="font-size:28px; position:relative;">
          🛒
          <span style="position:absolute; top:-4px; right:-4px; background:var(--amz-orange); color:var(--amz-navy); font-size:11px; font-weight:700; border-radius:50%; padding:1px 5px;">3</span>
        </span>
        <span style="font-weight:700; align-self:center;">カート</span>
      </div>
    </div>
  </div>
  <!-- Row 2: Category nav -->
  <div style="background:var(--amz-header); padding:4px 16px; display:flex; gap:4px; font-size:13px;">
    <span style="padding:6px 10px; cursor:pointer; border:1px solid transparent; border-radius:2px; white-space:nowrap;"
      onmouseover="this.style.border='1px solid white'" onmouseout="this.style.border='1px solid transparent'">
      ☰ すべて
    </span>
    <!-- Repeat for each category -->
    <span style="padding:6px 10px; cursor:pointer; border:1px solid transparent; border-radius:2px; white-space:nowrap;"
      onmouseover="this.style.border='1px solid white'" onmouseout="this.style.border='1px solid transparent'">
      本・コミック
    </span>
  </div>
</header>
```

### 2. Product Card (Grid / Search results)

```html
<div style="
  background: var(--amz-bg-card);
  border: 1px solid var(--amz-border-light);
  border-radius: 4px;
  padding: 16px;
  width: 220px;
  font-family: Arial, sans-serif;
  cursor: pointer;
  transition: box-shadow .15s;
"
onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,.2)'"
onmouseout="this.style.boxShadow='none'">
  <!-- Product image -->
  <div style="text-align:center; margin-bottom:8px; height:160px; display:flex; align-items:center; justify-content:center;">
    <img src="..." alt="商品名" style="max-height:160px; max-width:100%; object-fit:contain;"/>
  </div>
  <!-- Title -->
  <div style="font-size:14px; color:var(--amz-link); margin-bottom:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
    商品タイトルが入ります（最大2行で省略）
  </div>
  <!-- Star rating -->
  <div style="display:flex; align-items:center; gap:4px; margin-bottom:4px;">
    <span style="color:var(--amz-star); font-size:13px;">★★★★☆</span>
    <span style="color:var(--amz-link); font-size:12px;">4.2</span>
    <span style="color:var(--amz-text-secondary); font-size:12px;">(1,234)</span>
  </div>
  <!-- Price -->
  <div style="margin-bottom:4px;">
    <span style="font-size:13px; color:var(--amz-text);">￥</span>
    <span style="font-size:21px; font-weight:700; color:var(--amz-price);">2,980</span>
  </div>
  <!-- Prime badge -->
  <div style="color:var(--amz-prime-blue); font-size:12px; font-weight:700; margin-bottom:8px;">
    ✓ Prime 対応
  </div>
  <!-- Add to cart -->
  <button style="
    width:100%; padding:8px;
    background:var(--amz-orange); border:1px solid #C59000;
    border-radius:20px; font-size:13px; cursor:pointer;
    font-family:Arial,sans-serif;
  "
  onmouseover="this.style.background='var(--amz-orange-hover)'"
  onmouseout="this.style.background='var(--amz-orange)'">
    カートに追加
  </button>
</div>
```

### 3. Product Detail Page Layout

Key zones (top-to-bottom, left-to-right):
- **Left column** (~40%): Image gallery with thumbnails
- **Center column** (~35%): Title, rating, price, variant selectors, bullet features
- **Right column** (~25%): Buy box (price, delivery, cart/buy buttons, sold-by)

```html
<!-- Buy Box (right panel) -->
<div style="
  border:1px solid var(--amz-border);
  border-radius:8px; padding:16px;
  font-family:Arial,sans-serif;
  width:240px;
">
  <!-- Price -->
  <div style="margin-bottom:8px;">
    <span style="font-size:13px;">￥</span>
    <span style="font-size:28px; font-weight:700; color:var(--amz-price);">3,280</span>
  </div>
  <!-- Prime delivery -->
  <div style="font-size:13px; color:var(--amz-text); margin-bottom:4px;">
    <span style="color:var(--amz-prime-blue); font-weight:700;">Prime</span> 対応 — <b>明日</b>お届け
  </div>
  <!-- In stock -->
  <div style="color:var(--amz-green); font-size:14px; font-weight:700; margin-bottom:12px;">在庫あり</div>
  <!-- Buttons -->
  <button style="
    width:100%; padding:10px;
    background:var(--amz-orange); border:1px solid #C59000;
    border-radius:20px; font-size:14px; cursor:pointer;
    margin-bottom:8px; font-family:Arial,sans-serif;
  ">カートに追加</button>
  <button style="
    width:100%; padding:10px;
    background:#FFD814; border:1px solid #C7A600;
    border-radius:20px; font-size:14px; cursor:pointer;
    font-family:Arial,sans-serif;
  ">今すぐ購入</button>
  <!-- Seller info -->
  <div style="font-size:12px; color:var(--amz-text-secondary); margin-top:12px;">
    販売: <span style="color:var(--amz-link);">Amazon.co.jp</span>
  </div>
</div>
```

### 4. Star Rating Display

```html
<!-- Rating summary header -->
<div style="font-family:Arial,sans-serif; margin-bottom:16px;">
  <h2 style="font-size:18px; font-weight:700; margin:0 0 8px;">カスタマーレビュー</h2>
  <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
    <span style="font-size:32px; font-weight:700;">4.3</span>
    <div>
      <div style="color:var(--amz-star); font-size:20px;">★★★★☆</div>
      <div style="font-size:13px; color:var(--amz-text-secondary);">5つ星のうち4.3 · 1,234個の評価</div>
    </div>
  </div>
  <!-- Rating bars -->
  <!-- Repeat for 5〜1 star -->
  <div style="display:flex; align-items:center; gap:8px; font-size:13px; margin-bottom:4px;">
    <span style="color:var(--amz-link); white-space:nowrap;">5つ星</span>
    <div style="flex:1; height:14px; background:var(--amz-border-light); border-radius:2px; overflow:hidden;">
      <div style="width:68%; height:100%; background:var(--amz-orange);"></div>
    </div>
    <span style="color:var(--amz-link); white-space:nowrap;">68%</span>
  </div>
</div>

<!-- Individual review card -->
<div style="border-bottom:1px solid var(--amz-border-light); padding:16px 0; font-family:Arial,sans-serif;">
  <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
    <span style="width:32px; height:32px; border-radius:50%; background:var(--amz-bg-sidebar); display:flex; align-items:center; justify-content:center; font-size:16px;">👤</span>
    <span style="font-size:13px; font-weight:700; color:var(--amz-link);">ユーザー名</span>
  </div>
  <div style="color:var(--amz-star); font-size:14px; margin-bottom:2px;">★★★★★</div>
  <div style="font-size:14px; font-weight:700; margin-bottom:4px;">レビュータイトル</div>
  <div style="font-size:12px; color:var(--amz-text-secondary); margin-bottom:8px;">2024年1月15日に日本でレビュー済み</div>
  <div style="font-size:14px; line-height:1.6; color:var(--amz-text);">レビュー本文がここに入ります。</div>
  <div style="font-size:12px; color:var(--amz-text-secondary); margin-top:8px;">
    このレビューは役に立ちましたか？
    <button style="margin-left:8px; padding:2px 10px; border:1px solid var(--amz-border); border-radius:3px; background:white; cursor:pointer; font-size:12px;">はい</button>
    <button style="margin-left:4px; padding:2px 10px; border:1px solid var(--amz-border); border-radius:3px; background:white; cursor:pointer; font-size:12px;">いいえ</button>
  </div>
</div>
```

### 5. Breadcrumb Navigation

```html
<nav style="font-size:13px; font-family:Arial,sans-serif; padding:8px 0; color:var(--amz-text-secondary);">
  <a href="#" style="color:var(--amz-link);">本</a>
  <span style="margin:0 4px;">›</span>
  <a href="#" style="color:var(--amz-link);">コンピュータ・テクノロジー</a>
  <span style="margin:0 4px;">›</span>
  <span style="color:var(--amz-text);">プログラミング</span>
</nav>
```

---

## Layout Patterns

### Product Grid (Search/Category page)

Use CSS Grid: `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))` on a `background:var(--amz-bg)` page.

### Page-level wrapper

```html
<div style="background:var(--amz-bg); min-height:100vh; font-family:Arial,sans-serif; color:var(--amz-text);">
  <!-- header -->
  <main style="max-width:1500px; margin:0 auto; padding:16px;">
    <!-- content -->
  </main>
</div>
```

---

## UI Rules

1. **Buttons**: Always use `border-radius:20px` for primary CTA (orange / yellow). Secondary actions use `border-radius:3px`.
2. **Links**: `color:var(--amz-link)` (`#007185`) by default; turn `var(--amz-link-hover)` (`#C7511F`) on hover.
3. **Prices**: Integer yen (`￥` prefix) with large font for the number. Use `var(--amz-price)` (`#B12704`).
4. **Shadows**: Cards get `box-shadow` only on hover, not by default (Amazon uses borders, not shadows, for resting state).
5. **Prime badge**: Always `var(--amz-prime-blue)` (`#00A8E1`) with bold weight.
6. **Stars**: Always `var(--amz-star)` (`#FF9900`) — use ★★★★☆ Unicode or SVG.
7. **No rounded corners on images** — Amazon uses square/rectangular images.
8. **Dense information layout** — Amazon packs a lot in; don't leave excessive whitespace.
9. **Inline styles** — When generating HTML artifacts, use inline styles throughout for portability.

---

## Delivering Output

- Always produce **working HTML** (single file or React component, whichever the user asked for).
- If the user doesn't specify a framework, default to **plain HTML + inline CSS + vanilla JS**.
- Include realistic dummy data (Japanese product names, reasonable prices in yen, plausible review counts).
- Make interactive elements functional (hover states, cart counter increment, tab switching).
- Output should pass a "screenshot test" — a non-technical person should look at it and say "this looks like Amazon."
