# Changelog

All notable changes to Railroad Runtime will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-09

### Added
- **Core runtime system** with persistent lifecycle bus
- **Module registration** (`RAILROAD.register`)
- **Universal rebind** (`RAILROAD.rebind`)
- **HTMX integration** (automatic `htmx:afterSwap` hook)
- **Global and DOM module types**
- **Debug mode** with logging
- **UMD/CommonJS support**
- **Complete documentation** (README, GUIDE)
- **Working examples** (basic.html)
- **MIT License**

### Features
- ✅ Framework-agnostic (works with HTMX, vanilla JS, Alpine, Turbo)
- ✅ Idempotency pattern support
- ✅ State persistence across DOM swaps
- ✅ Automatic rebinding for HTMX
- ✅ Manual rebind for any DOM mutation
- ✅ Module debugging and introspection
- ✅ ES5 compatible (IE11 with polyfills)
- ✅ ~2KB minified + gzipped

### Philosophy
> Modules board once, ride forever, work at every station.
>
> The coupling is: `RAILROAD.rebind()`

---

**Initial Release** - Solves the DOM-coupled behavior problem that many frameworks couldn't solve.
