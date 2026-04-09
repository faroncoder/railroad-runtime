# Publishing Guide

## Prerequisites

1. **npm account**: https://www.npmjs.com/signup
2. **GitHub account**: https://github.com
3. **npm CLI installed**: `npm install -g npm`

## Step 1: Prepare Repository

### 1.1 Create GitHub Repository

```bash
# Initialize git
cd railroad-runtime
git init
git add .
git commit -m "Initial release v1.0.0"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/railroad-runtime.git
git branch -M main
git push -u origin main
```

### 1.2 Update package.json URLs

Replace `your-org` with your GitHub username:

```json
{
  "repository": "https://github.com/YOUR_USERNAME/railroad-runtime.git",
  "bugs": "https://github.com/YOUR_USERNAME/railroad-runtime/issues",
  "homepage": "https://github.com/YOUR_USERNAME/railroad-runtime#readme"
}
```

## Step 2: Build

```bash
# Install dev dependencies
npm install

# Build distribution files
npm run build

# Verify dist/ folder created:
ls -la dist/
# Should show:
# - railroad-runtime.js (dev)
# - railroad-runtime.min.js (prod)
```

## Step 3: Test Locally

### 3.1 Test in Browser

```bash
# Open examples/basic.html in browser
# Click buttons, verify toasts work after swaps
```

### 3.2 Test npm Package Locally

```bash
# In railroad-runtime directory:
npm link

# In another project:
npm link railroad-runtime

# Test import
node -e "const R = require('railroad-runtime'); console.log(R.version);"
```

## Step 4: Publish to npm

### 4.1 Login to npm

```bash
npm login
# Enter username, password, email
```

### 4.2 Dry Run

```bash
npm publish --dry-run
# Review what will be published
```

### 4.3 Publish

```bash
npm publish
# Package published to https://www.npmjs.com/package/railroad-runtime
```

### 4.4 Verify

```bash
# View on npm
open https://www.npmjs.com/package/railroad-runtime

# Install from npm
npm install railroad-runtime
```

## Step 5: CDN Availability

After publishing to npm, package is automatically available on CDNs:

### unpkg

```html
<!-- Latest version -->
<script src="https://unpkg.com/railroad-runtime"></script>

<!-- Specific version -->
<script src="https://unpkg.com/railroad-runtime@1.0.0/dist/railroad-runtime.min.js"></script>

<!-- Development version -->
<script src="https://unpkg.com/railroad-runtime@1.0.0/dist/railroad-runtime.js"></script>
```

### jsDelivr

```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/npm/railroad-runtime"></script>

<!-- Specific version -->
<script src="https://cdn.jsdelivr.net/npm/railroad-runtime@1.0.0/dist/railroad-runtime.min.js"></script>
```

### cdnjs (Requires submission)

Submit at: https://github.com/cdnjs/packages/issues/new

## Step 6: Create Release on GitHub

```bash
# Tag the release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# On GitHub:
# 1. Go to Releases
# 2. Click "Create a new release"
# 3. Select tag: v1.0.0
# 4. Title: Railroad Runtime v1.0.0
# 5. Description: Copy from CHANGELOG.md
# 6. Attach dist files
# 7. Publish
```

## Step 7: Announce

### npm README

Already done automatically from README.md

### GitHub Topics

Add topics to repository:
- `htmx`
- `lifecycle`
- `dom`
- `javascript`
- `spa`
- `runtime`

### Communities

- **HTMX Discord**: Share in #show-and-tell
- **Reddit**: r/javascript, r/webdev
- **Hacker News**: Show HN: Railroad Runtime
- **Twitter/X**: Tweet with hashtags #htmx #javascript

## Updating

### Minor/Patch Updates

```bash
# Update version
npm version patch  # or minor, major
# This creates git tag automatically

# Build
npm run build

# Publish
npm publish

# Push tag
git push && git push --tags
```

### Breaking Changes

```bash
npm version major
npm run build
npm publish
git push && git push --tags

# Update CHANGELOG.md with breaking changes
```

## Troubleshooting

### Package name taken

```bash
# Try scoped package
npm publish --access public @your-username/railroad-runtime
```

### Build fails

```bash
# Install terser
npm install --save-dev terser

# Manual build
cp src/railroad-runtime.js dist/
npx terser src/railroad-runtime.js -c -m -o dist/railroad-runtime.min.js
```

### CDN not updating

- unpkg: Can take ~5 minutes
- jsDeliver: Can take ~15 minutes  
- Add `?v=1.0.0` query param to bust cache

## Maintenance

### Check Downloads

```bash
npm info railroad-runtime
# Shows download stats
```

### Monitor Issues

- Watch GitHub issues
- Respond to bug reports
- Review pull requests

### Version Lifecycle

```
1.0.0 → Initial release
1.0.x → Bug fixes (backward compatible)
1.x.0 → New features (backward compatible)
2.0.0 → Breaking changes
```

## Resources

- npm docs: https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry
- unpkg: https://unpkg.com
- jsDelivr: https://www.jsdelivr.com
- Semantic versioning: https://semver.org

---

**Ready to publish?**

```bash
cd railroad-runtime
npm install
npm run build
npm publish
```

🚂 Welcome to the railroad!
