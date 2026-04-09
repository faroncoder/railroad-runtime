# Railroad Runtime Documentation

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [API Reference](#api-reference)
3. [Patterns](#patterns)
4. [Integration Guides](#integration-guides)
5. [Troubleshooting](#troubleshooting)

## Core Concepts

### The Problem

When you use HTMX, vanilla `fetch()` + `innerHTML`, or any library that swaps DOM content, event listeners and behaviors attached to the old DOM are destroyed:

```javascript
// ❌ Traditional approach breaks
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', handleClick);  // Lost on swap!
});
```

### The Solution

Railroad Runtime provides a **persistent lifecycle bus** where modules register once and automatically re-initialize after any DOM change:

```javascript
// ✅ Railroad approach survives swaps
RAILROAD.register(function(root) {
  root.querySelectorAll('button:not([data-bound])')
    .forEach(btn => {
      btn.dataset.bound = '1';  // Idempotency marker
      btn.addEventListener('click', handleClick);
    });
}, { type: 'dom', name: 'buttons' });
```

### Module Types

**Global Modules** (`type: 'global'`)
- Run **once** on page load
- Persist state across all swaps
- Use for: analytics, theme initialization, WebSocket connections

**DOM Modules** (`type: 'dom'`)
- Run **after every** DOM change
- Rebind to new content
- Use for: event listeners, tooltips, drag-drop, form validation

### The Invariant

**Rule:** After ANY manual DOM change, call `RAILROAD.rebind()`

```javascript
container.innerHTML = html;
RAILROAD.rebind(container, 'source-name');  // ← REQUIRED
```

## API Reference

### RAILROAD.register(fn, options)

Register a module to the lifecycle bus.

**Parameters:**
```javascript
fn       : Function(root) - Initialization function
options  : {
  type: 'global' | 'dom',  // When to run (default: 'dom')
  name: string             // Module name for debugging
}
```

**Example:**
```javascript
RAILROAD.register(function(root) {
  // Initialize your feature
  root.querySelectorAll('[data-tooltip]:not([data-bound])')
    .forEach(el => {
      el.dataset.bound = '1';
      new Tooltip(el);
    });
}, { type: 'dom', name: 'tooltips' });
```

### RAILROAD.rebind(root, source)

Re-initialize modules after manual DOM changes.

**Parameters:**
```javascript
root   : Element | Document  // Changed element (default: document)
source : string              // Debug label ('fetch', 'manual', etc.)
```

**Example:**
```javascript
// After innerHTML
element.innerHTML = html;
RAILROAD.rebind(element, 'innerHTML-update');

// After replaceWith
oldElement.replaceWith(newElement);
RAILROAD.rebind(newElement, 'replace');

// After appendChild
container.appendChild(newChild);
RAILROAD.rebind(newChild, 'append');
```

### RAILROAD.listModules()

List all registered modules (console output).

```javascript
RAILROAD.listModules();
// Output:
// Global modules: ['analytics', 'theme']
// DOM modules: ['tooltips', 'validation', 'drag-drop']
```

### RAILROAD.enableDebug() / disableDebug()

Toggle verbose logging for debugging.

```javascript
RAILROAD.enableDebug();
// [RAILROAD] Registered dom module: tooltips
// [RAILROAD] Initializing 3 dom modules (trigger: htmx:afterSwap)
```

## Patterns

### Idempotency (Critical)

All DOM modules MUST prevent double-binding using markers:

```javascript
// ✅ CORRECT - Uses :not([data-bound])
root.querySelectorAll('[data-feature]:not([data-bound])')
  .forEach(el => {
    el.dataset.bound = '1';  // Mark as processed
    attachBehavior(el);
  });

// ❌ WRONG - No marker, binds multiple times
root.querySelectorAll('[data-feature]')
  .forEach(el => {
    attachBehavior(el);  // 💥 Doubles on every swap!
  });
```

### State Persistence

State outside the module function persists across swaps:

```javascript
// Persistent state (survives swaps)
var clickCount = 0;
var instances = [];

RAILROAD.register(function(root) {
  clickCount++;  // Increments each time
  console.log('Module run #' + clickCount);
  
  root.querySelectorAll('[data-widget]:not([data-bound])')
    .forEach(el => {
      el.dataset.bound = '1';
      var widget = new Widget(el);
      instances.push(widget);  // Persists
    });
}, { type: 'dom', name: 'widgets' });
```

### Cleanup Pattern

For modules that create globals or need cleanup:

```javascript
var instances = [];

RAILROAD.register(function(root) {
  // Cleanup old instances
  instances.forEach(function(inst) {
    inst.destroy && inst.destroy();
  });
  instances = [];
  
  // Create new instances
  root.querySelectorAll('[data-widget]:not([data-bound])')
    .forEach(function(el) {
      el.dataset.bound = '1';
      instances.push(new Widget(el));
    });
}, { type: 'dom', name: 'widgets' });
```

### Dynamic Loading

Load dependencies on-demand:

```javascript
RAILROAD.register(function(root) {
  if (typeof SomeLibrary === 'undefined') {
    // Load library first
    loadScript('/libs/some-library.js', function() {
      initFeature(root);
    });
  } else {
    initFeature(root);
  }
}, { type: 'dom', name: 'feature' });
```

## Integration Guides

### HTMX

Automatic integration (no extra code needed):

```html
<script src="railroad-runtime.min.js"></script>
<script src="htmx.min.js"></script>

<!-- Modules automatically rebind on htmx:afterSwap -->
<button hx-get="/content" hx-target="#panel">Load</button>
```

### Vanilla JavaScript

Call `rebind()` after manual changes:

```javascript
// fetch + innerHTML
fetch('/api/data')
  .then(r => r.text())
  .then(html => {
    container.innerHTML = html;
    RAILROAD.rebind(container, 'fetch-load');  // ← Required
  });

// createElement + appendChild
var newDiv = document.createElement('div');
newDiv.innerHTML = '<button data-tooltip="Hello">Hover</button>';
container.appendChild(newDiv);
RAILROAD.rebind(newDiv, 'append');  // ← Required
```

### Alpine.js

Works alongside Alpine:

```html
<script src="railroad-runtime.min.js"></script>
<script src="alpine.min.js"></script>

<div x-data="{ open: false }">
  <!-- Railroad handles tooltips, Alpine handles state -->
  <button @click="open = !open" data-tooltip="Click me">Toggle</button>
</div>
```

### Turbo/Hotwire

Hook into Turbo events:

```javascript
document.addEventListener('turbo:render', function() {
  RAILROAD.rebind(document.body, 'turbo-render');
});
```

## Troubleshooting

### Modules Not Running

**Symptom:** Behaviors don't work after swap

**Check:**
1. Is `railroad-runtime.js` loaded before your modules?
2. Did you call `RAILROAD.rebind()` after manual DOM changes?
3. Enable debug: `RAILROAD.enableDebug()`

**Debug:**
```javascript
RAILROAD.listModules();  // See registered modules
RAILROAD.enableDebug();  // Watch execution
```

### Double-Binding

**Symptom:** Click handlers fire twice, tooltips duplicate

**Fix:** Add idempotency markers:

```javascript
// Before
root.querySelectorAll('[data-feature]')  // ❌

// After
root.querySelectorAll('[data-feature]:not([data-bound])')  // ✅
  .forEach(el => el.dataset.bound = '1');
```

### State Not Persisting

**Symptom:** Counter resets, instances lost

**Fix:** Define state outside module function:

```javascript
// ❌ Wrong - state inside module
RAILROAD.register(function(root) {
  var count = 0;  // Resets every swap!
});

// ✅ Correct - state outside module  
var count = 0;  // Persists
RAILROAD.register(function(root) {
  count++;  // Increments across swaps
});
```

### HTMX Not Triggering Rebind

**Symptom:** HTMX swaps don't auto-rebind

**Check:** Railroad loaded before HTMX fires events:

```html
<!-- Correct order -->
<script src="htmx.min.js"></script>
<script src="railroad-runtime.min.js"></script>
```

### Performance Issues

**Symptom:** Slow after many swaps

**Optimize:**
1. Use specific selectors (not `*`)
2. Add cleanup in modules
3. Limit search scope (use `root` parameter)

```javascript
// ❌ Slow
document.querySelectorAll('[data-feature]')

// ✅ Fast
root.querySelectorAll('[data-feature]:not([data-bound])')
```

## Advanced Usage

### Conditional Registration

```javascript
if (userHasPermission) {
  RAILROAD.register(adminFeature, { type: 'dom', name: 'admin' });
}
```

### Module Dependencies

```javascript
RAILROAD.register(function(root) {
  if (!window.DependencyModule) {
    console.warn('Dependency not loaded');
    return;
  }
  initMyModule(root);
}, { type: 'dom', name: 'dependent' });
```

### Testing

```javascript
// In tests, manually trigger rebind
container.innerHTML = testHTML;
RAILROAD.rebind(container, 'test');

// Verify module executed
expect(container.querySelector('[data-bound]')).toBeTruthy();
```

---

For more examples, see `/examples` folder or visit the [GitHub repo](https://github.com/your-org/railroad-runtime).
