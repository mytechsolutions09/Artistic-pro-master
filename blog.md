# Lurevi Blog Styling & Formatting Guidelines

This document details the layout, styling, and schema rules for writing SEO-optimized blog posts for the Lurevi platform.

## 1. Raw HTML Formatting
Always write blog post content using raw HTML tags rather than Markdown elements to ensure Tailwind and dynamic styles render correctly.
*   **Headers**: Use `<h2>`, `<h3>`, and `<h4>` tags.
*   **Paragraphs**: Wrap all body text in `<p>...</p>` blocks.
*   **Lists**: Use standard `<ul>` with `<li>` tags for bullet points.
*   **Tables**: Style tables cleanly with thin borders:
    ```html
    <table class="min-w-full border-collapse border border-gray-200 mt-4 mb-6 text-sm">
      <thead>
        <tr class="bg-gray-50 text-left">
          <th class="border border-gray-200 px-4 py-2 font-semibold">Column 1</th>
          ...
        </tr>
      </thead>
      ...
    </table>
    ```

## 2. Image Sizing Override
The dynamic Next.js blog post route (`app/blog/[slug]/page.tsx`) forces image heights to auto (`[&_img]:h-auto`) to scale user-uploaded content safely. 
To prevent this rule from breaking multi-column grids (like featured product cards), always specify inline height styles using `!important`:
```html
<img src="IMAGE_URL" class="w-full object-cover" style="height: 192px !important; object-fit: cover;" />
```

## 3. Button Styling (Outline / No-Background)
Lurevi blogs use transparent outline-styled buttons in product grids to maintain a clean, aesthetic look:
```html
<a href="/shop" class="px-3 py-1 border border-amber-600 text-amber-600 hover:bg-amber-50 rounded text-xs font-medium transition-colors font-sans">
  Shop Gifts
</a>
```
*   **Do not use**: Solid backgrounds like `bg-amber-600 text-white`.
*   **Do use**: Border outlines (`border border-theme-600`), theme text colors (`text-theme-600`), and subtle hover fills (`hover:bg-theme-50`).

## 4. FAQ Schema Structure
Frequently Asked Questions must use the specific class and tag markup below so the Next.js page parser can auto-generate the Google `FAQPage` JSON-LD schema:
```html
<div class="faq-item">
  <p><strong>Is art prints gift India a good choice for housewarmings?</strong></p>
  <p>Yes, framed art prints make excellent housewarming (Griha Pravesh) gifts in India...</p>
</div>
```
*   The parent element must be `<div class="faq-item">`.
*   The question must be wrapped in `<p><strong>...</strong></p>`.
*   The answer must be wrapped in standard `<p>...</p>` blocks immediately following the question.

## 5. Standard Internal Linking
To maximize SEO link equity and conversion rates, insert links to active pages:
*   Art Collections index: `/categories`
*   Art Shop: `/shop`
*   Dedicated Gifts Portal: `/gifts`
*   Category collections: `/categories/minimalist`, `/categories/abstract`, `/categories/nature`, `/categories/monochrome`, etc.
