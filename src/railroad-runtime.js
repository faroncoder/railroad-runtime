/**
 * Railroad Runtime v1.0.0
 * 
 * Governed execution of intent for dynamic web applications.
 * 
 * Makes DOM mutations explicit, auditable, and predictable through
 * a persistent lifecycle bus that enforces intentional rebinding.
 * 
 * Philosophy: Explicit > Automatic | Governed > Magic | Visible > Hidden
 * 
 * @license MIT
 * @author SignaVision Team
 * @see https://github.com/your-org/railroad-runtime
 */

(function(window) {
  'use strict';

  /**
   * RAILROAD — The persistent execution boundary
   * 
   * A lifecycle management system that survives DOM mutations in dynamic web applications.
   * Works with HTMX, vanilla JS, or any framework that manipulates the DOM.
   */
  window.RAILROAD = {
    version: '1.0.0',
    initialized: false,
    
    modules: {
      global: [],  // Run once on page load
      dom: []      // Run after every DOM change
    },

    /**
     * Register a module to the lifecycle bus
     * 
     * @param {Function} fn - Module initialization function (receives root element)
     * @param {Object} options - Configuration { type: 'global'|'dom', name: string }
     * 
     * @example
     * RAILROAD.register(function(root) {
     *   root.querySelectorAll('[data-feature]:not([data-bound])')
     *     .forEach(el => {
     *       el.dataset.bound = '1';
     *       attachBehavior(el);
     *     });
     * }, { type: 'dom', name: 'my_feature' });
     */
    register: function(fn, options) {
      options = options || {};
      var type = options.type || 'dom';
      var name = options.name || 'anonymous';
      
      if (type !== 'global' && type !== 'dom') {
        console.error('[RAILROAD] Invalid module type:', type);
        return;
      }

      this.modules[type].push({ fn: fn, name: name });
      
      if (this.debug) {
        console.log('[RAILROAD] Registered', type, 'module:', name);
      }
    },

    /**
     * Initialize modules on a context (internal)
     * 
     * @param {Document|HTMLElement} context - Target to initialize on
     * @param {string} trigger - What triggered this init
     */
    init: function(context, trigger) {
      context = context || document;
      trigger = trigger || 'manual';
      
      var moduleType = trigger === 'DOMContentLoaded' ? 'global' : 'dom';
      var modules = this.modules[moduleType];

      if (modules.length === 0) return;

      if (this.debug) {
        console.log('[RAILROAD] Initializing', modules.length, moduleType, 'modules (trigger:', trigger + ')');
      }

      for (var i = 0; i < modules.length; i++) {
        var module = modules[i];
        try {
          module.fn(context);
        } catch (e) {
          console.warn('[RAILROAD] Module "' + module.name + '" failed:', e);
        }
      }
    },

    /**
     * UNIVERSAL REBIND — Call this after ANY manual DOM mutation
     * 
     * This is the architectural invariant that makes everything work.
     * 
     * @param {Document|HTMLElement} root - Changed element or document
     * @param {string} source - What triggered the rebind (for debugging)
     * 
     * @example
     * // After fetch + innerHTML
     * container.innerHTML = html;
     * RAILROAD.rebind(container, 'fetch-load');
     * 
     * @example
     * // After replaceWith
     * oldElement.replaceWith(newElement);
     * RAILROAD.rebind(newElement, 'manual-replace');
     */
    rebind: function(root, source) {
      root = root || document;
      source = source || 'manual';
      
      if (this.debug) {
        console.log('[RAILROAD] Rebinding (source:', source + ')');
      }
      
      this.init(root, source);
    },

    /**
     * Enable/disable debug logging
     */
    enableDebug: function() {
      this.debug = true;
      console.log('[RAILROAD] Debug mode enabled');
    },

    disableDebug: function() {
      this.debug = false;
    },

    /**
     * List all registered modules (debugging)
     */
    listModules: function() {
      console.group('[RAILROAD] Registered Modules');
      console.log('Global modules:', this.modules.global.map(function(m) { return m.name; }));
      console.log('DOM modules:', this.modules.dom.map(function(m) { return m.name; }));
      console.groupEnd();
    }
  };

  /**
   * LIFECYCLE HOOKS
   */

  // 1. Page load — initialize global modules once
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.RAILROAD.init(document, 'DOMContentLoaded');
      window.RAILROAD.initialized = true;
    });
  } else {
    // DOMContentLoaded already fired
    window.RAILROAD.init(document, 'DOMContentLoaded');
    window.RAILROAD.initialized = true;
  }

  // 2. HTMX swap — rebind DOM modules to new content
  if (document.body) {
    document.body.addEventListener('htmx:afterSwap', function(e) {
      var target = e.detail ? e.detail.target : e.target;
      window.RAILROAD.init(target, 'htmx:afterSwap');
    });
  }

  // Expose for UMD/CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.RAILROAD;
  }

  console.log('[RAILROAD] v' + window.RAILROAD.version + ' initialized');

})(typeof window !== 'undefined' ? window : this);
