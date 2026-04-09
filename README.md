<img width="691" height="795" alt="openart-image_1775755360079_a1e0769a_1775755360132_79dff5bc" src="https://github.com/user-attachments/assets/28381b0c-aa4c-4328-a920-9a00d573f7ba" />


# Railroad Runtime

> **Governed execution of intent** for dynamic web applications.

**A single JavaScript file (2KB) that serves as an execution substrate for building persistent UI behaviors.**

Not a framework. A foundation.

🚂 **Modules board once, ride forever, work at every station.**

## The Philosophy

Other libraries detect DOM changes automatically (MutationObserver).  
**Railroad enforces explicit governance** — every mutation must declare itself.

```javascript
// ❌ Automatic (ungoverned)
container.innerHTML = html;  // Stimulus detects silently

// ✅ Governed (explicit intent)
container.innerHTML = html;
RAILROAD.rebind(container, 'api-update');  // Declares intent
```

**Result:** Every DOM mutation is visible, traceable, and auditable.

```javascript
// Modules register once
RAILROAD.register(function(root) {
  root.querySelectorAll('[data-feature]:not([data-bound])')
    .forEach(el => {
      el.dataset.bound = '1';  // Idempotency marker
      attachBehavior(el);
    });
}, { type: 'dom', name: 'my_feature' });

// After any DOM change, rebind
container.innerHTML = html;
RAILROAD.rebind(container, 'manual-update');  // ← All modules re-run
```

## Installation

**Option 1: Copy the single file** (recommended for simplicity)
```bash
# Just copy railroad-runtime.js to your project
curl -O https://unpkg.com/railroad-runtime/dist/railroad-runtime.js
```

**Option 2: CDN**
```html
<script src="https://unpkg.com/railroad-runtime@1.0.0/dist/railroad-runtime.min.js"></script>
```

**Option 3: npm**
```bash
npm install railroad-runtime
```

```javascript
import RAILROAD from 'railroad-runtime';
```

**That's it. One file. Zero dependencies.**

## Quick Start

### 1. Load Railroad

```html
<script src="railroad-runtime.min.js"></script>
```

### 2. Register Modules

```javascript
// DOM module - runs after every swap/rebind
RAILROAD.register(function(root) {
  root.querySelectorAll('[data-tooltip]:not([data-bound])')
    .forEach(el => {
      el.dataset.bound = '1';
      new Tooltip(el);
    });
}, { type: 'dom', name: 'tooltips' });

// Global module - runs once on page load
RAILROAD.register(function() {
  initAnalytics();
}, { type: 'global', name: 'analytics' });
```

### 3. Use in HTML

```html
<!-- HTMX swap - automatic rebind -->
<div hx-get="/content" hx-target="#container">
  <button data-tooltip="Hello">Hover me</button>
</div>

<!-- Manual DOM change - call rebind -->
<script>
  fetch('/api/data').then(html => {
    container.innerHTML = html;
    RAILROAD.rebind(container, 'fetch-load');  // ← REQUIRED
  });
</script>
```

## API

### `RAILROAD.register(fn, options)`

Register a module to the lifecycle bus.

**Parameters:**
- `fn` (Function): Module function that receives `root` element
- `options.type` ('global'|'dom'): When to run (default: 'dom')
- `options.name` (string): Module name for debugging

```javascript
RAILROAD.register(function(root) {
  // Your initialization code
}, { type: 'dom', name: 'feature_name' });
```

### `RAILROAD.rebind(root, source)`

**☠️ THE INVARIANT:** Call after ANY manual DOM mutation.

**Parameters:**
- `root` (Element): Changed element or document
- `source` (string): Debug label

```javascript
// After innerHTML
element.innerHTML = html;
RAILROAD.rebind(element, 'innerHTML');

// After replaceWith
oldElement.replaceWith(newElement);
RAILROAD.rebind(newElement, 'replace');

// After appendChild
container.appendChild(newChild);
RAILROAD.rebind(newChild, 'append');
```

### `RAILROAD.listModules()`

List all registered modules (debugging).

### `RAILROAD.enableDebug()` / `RAILROAD.disableDebug()`

Toggle debug logging.

## Patterns

### Idempotency (Required)

All DOM modules MUST use markers to prevent double-binding:

```javascript
✅ CORRECT:
root.querySelectorAll('[data-feature]:not([data-bound])')
  .forEach(el => {
    el.dataset.bound = '1';  // Mark as processed
    attach(el);
  });

❌ WRONG:
root.querySelectorAll('[data-feature]')  // Runs every swap!
  .forEach(el => attach(el));  // 💥 Double-binds!
```

### Module Types

| Type | Runs When | Use For |
|------|-----------|---------|
| `global` | Once on page load | Analytics, theme, websockets |
| `dom` | After every DOM change | Tooltips, drag-drop, validation |

### HTMX Integration

```html
<!-- Automatic - RAILROAD watches htmx:afterSwap -->
<button hx-get="/data" hx-target="#panel">Load</button>
```

### Manual DOM Changes

```javascript
// ⚠️ ALWAYS call rebind after manual changes
container.innerHTML = html;
RAILROAD.rebind(container, 'source');

// ⚠️ Applies to: innerHTML, replaceWith, appendChild, etc.
```

## Examples

### Toast Notifications

```javascript
RAILROAD.register(function(root) {
  root.querySelectorAll('[data-toast]:not([data-bound])')
    .forEach(el => {
      el.dataset.bound = '1';
      el.addEventListener('click', function() {
        showToast(this.dataset.toast);
      });
    });
}, { type: 'dom', name: 'toasts' });
```

### Form Validation

```javascript
RAILROAD.register(function(root) {
  root.querySelectorAll('form[data-validate]:not([data-bound])')
    .forEach(form => {
      form.dataset.bound = '1';
      form.addEventListener('submit', validateForm);
    });
}, { type: 'dom', name: 'validation' });
```

### Drag and Drop

```javascript
RAILROAD.register(function(root) {
  root.querySelectorAll('[data-draggable]:not([data-bound])')
    .forEach(el => {
      el.dataset.bound = '1';
      el.draggable = true;
      el.addEventListener('dragstart', handleDrag);
    });
}, { type: 'dom', name: 'drag_drop' });
```

## Works With

- ✅ HTMX (explicit lifecycle layer)
- ✅ Vanilla JavaScript (explicit control)
- ✅ Alpine.js (governs non-reactive behaviors)
- ✅ Turbo/Hotwire (explicit rebind on navigate)
- ✅ Any framework (adds governance layer)

## Why Governed > Automatic

| Approach | Detection | Audit Trail | Predictability |
|----------|-----------|-------------|----------------|
| **Stimulus** | Automatic (MutationObserver) | Hidden | Magic |
| **Alpine** | Automatic (MutationObserver) | Hidden | Reactive |
| **Railroad** | **Explicit (`rebind()`)** | **Visible** | **Governed** |

**Governed execution means:**
- 🔍 Code reviews can verify all rebind points
- 📊 Debug logs show exactly what triggered rebind
- 🎯 Performance is predictable (no observer overhead)
- ✅ Compliance: full audit trail of DOM mutations

## Philosophy

> RAILROAD is a train that never stops.  
> Modules board once, ride forever, work at every station (DOM swap).
>
> **The governance is: `RAILROAD.rebind()`**
>
> Every DOM mutation must declare its intent.  
> No silent changes. No hidden magic. Full visibility.

## What This Enables

Railroad is an **execution substrate** — a foundation for building:

- 🎨 **Visual editors** (cascading panels, live preview, state preservation)
- 🧩 **Component systems** (persistent widgets, reusable behaviors)
- 📝 **Form builders** (dynamic fields, validation, multi-step flows)
- 🎯 **Interactive dashboards** (real-time updates, filters, drill-downs)
- 🛠️ **Admin tools** (inline editing, drag-drop, live config)
- 🎪 **Any UI that needs governed state across DOM mutations**

**Not a framework.** A substrate that makes frameworks possible.

The single-file nature means you can:
- ✅ Copy it into your project
- ✅ Modify it for your needs
- ✅ Fork it without npm dependencies
- ✅ Build proprietary tools on top
- ✅ Learn from it (175 lines, readable)

**Example:** One developer built a **cascading panel system** (Furl) on top of Railroad that handles:
- Nested slide-down panels with breadcrumb navigation
- State preservation across HTMX swaps
- Automatic cleanup on panel close
- Smooth animations and transitions

**All possible because Railroad provides the governed execution layer.**

## Browser Support

- Modern browsers (ES5+)
- IE11 with polyfills

## Size

- **Development:** ~5KB unminified
- **Production:** ~2KB minified + gzipped

## License

MIT

## Learn More

- **[Governance Model](docs/GOVERNANCE.md)** - Why explicit > automatic
- **[Substrate Philosophy](docs/SUBSTRATE.md)** - What can be built on Railroad
- **[Complete Guide](docs/GUIDE.md)** - Patterns and integrations

## Contributing

Issues and PRs welcome at https://github.com/your-org/railroad-runtime

---

**Not a framework. A foundation.**  
**One file. Zero dependencies. Infinite potential.** 🚂

---

**Made with 🚂 by developers tired of broken event listeners**
