# Publishing to NPM - Complete Guide

This guide will walk you through the process of publishing `discord-lanyard-activity` to NPM.

## Prerequisites

Before publishing, ensure you have:

1. ✅ **NPM Account**: Create one at [npmjs.com](https://www.npmjs.com/signup)
2. ✅ **Node.js & npm**: Installed on your system
3. ✅ **Git**: Version control setup
4. ✅ **Package Built**: Run `npm run build` successfully

## Step 1: Prepare Your Package

### 1.1 Verify package.json

Ensure your `package.json` has the correct information:

```json
{
  "name": "discord-lanyard-activity",
  "version": "1.0.0",
  "description": "A headless, framework-agnostic Discord activity tracker using Lanyard API",
  "author": "DevRohit06",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/DevRohit06/discord-lanyard-activity.git"
  },
  "keywords": [
    "discord",
    "lanyard",
    "activity",
    "presence",
    "tracker",
    "react",
    "vue",
    "svelte",
    "typescript"
  ],
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

### 1.2 Check .npmignore

Create or update `.npmignore` to exclude unnecessary files:

```
# Source files
src/
tsconfig.json
tsup.config.ts

# Development files
demo/
examples/
node_modules/
.git/
.github/
.vscode/

# Testing
test/
tests/
*.test.ts
*.spec.ts

# Build files
*.log
.DS_Store
.env
.env.local
```

### 1.3 Ensure README is Complete

Your `README.md` should include:
- Clear description
- Installation instructions
- Usage examples for all frameworks
- API documentation
- Links to demo and repository

### 1.4 Add/Update LICENSE

Ensure you have a LICENSE file (MIT is common):

```
MIT License

Copyright (c) 2025 DevRohit06

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

## Step 2: Build and Test

### 2.1 Clean Build

```bash
# Remove old build files
rm -rf dist/

# Install dependencies
npm install

# Build the package
npm run build
```

### 2.2 Test the Build

Verify all files are generated correctly:

```bash
ls -la dist/
```

You should see:
- `index.js` / `index.mjs`
- `index.d.ts` / `index.d.mts`
- `frameworks/react.js` / `frameworks/react.mjs`
- `frameworks/vue.js` / `frameworks/vue.mjs`
- `frameworks/svelte.js` / `frameworks/svelte.mjs`
- Type definition files (`.d.ts`)

### 2.3 Test Locally (Optional but Recommended)

Test your package locally before publishing:

```bash
# Create a symlink
npm link

# In another project directory
cd /path/to/test-project
npm link discord-lanyard-activity

# Test the package
# Then unlink when done
npm unlink discord-lanyard-activity
```

## Step 3: Login to NPM

### 3.1 Login via CLI

```bash
npm login
```

Enter:
- **Username**: Your NPM username
- **Password**: Your NPM password
- **Email**: Your public email (will be shown on NPM)
- **OTP**: Two-factor authentication code (if enabled)

### 3.2 Verify Login

```bash
npm whoami
```

Should display your NPM username.

## Step 4: Publish the Package

### 4.1 Check What Will Be Published

Perform a dry run to see what files will be included:

```bash
npm publish --dry-run
```

Review the output carefully. It should only include:
- `dist/` folder
- `package.json`
- `README.md`
- `LICENSE`

### 4.2 Publish to NPM

**First Time Publishing:**

```bash
npm publish --access public
```

> **Note**: Use `--access public` for scoped packages or to ensure it's public.

**Subsequent Updates:**

```bash
# Update version first
npm version patch  # for bug fixes (1.0.0 -> 1.0.1)
# or
npm version minor  # for new features (1.0.0 -> 1.1.0)
# or
npm version major  # for breaking changes (1.0.0 -> 2.0.0)

# Then publish
npm publish
```

### 4.3 Verify Publication

1. Visit: `https://www.npmjs.com/package/discord-lanyard-activity`
2. Check that all information is correct
3. Verify the version number
4. Test installation: `npm install discord-lanyard-activity`

## Step 5: Post-Publication

### 5.1 Tag the Release in Git

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 5.2 Create a GitHub Release

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Select the tag you just created
4. Add release notes describing changes
5. Publish the release

### 5.3 Update Documentation

Update your README and demo site with:
- NPM badge: `[![npm version](https://badge.fury.io/js/discord-lanyard-activity.svg)](https://www.npmjs.com/package/discord-lanyard-activity)`
- Installation instructions
- Latest version number

## Step 6: Maintenance & Updates

### Publishing Updates

When you make changes and want to publish an update:

```bash
# 1. Make your changes
# 2. Build the package
npm run build

# 3. Update version
npm version patch  # or minor/major

# 4. Commit and tag
git add .
git commit -m "chore: release v1.0.1"
git push

# 5. Publish to NPM
npm publish

# 6. Push tags
git push --tags
```

### Version Guidelines (Semantic Versioning)

- **Patch** (1.0.x): Bug fixes, minor changes
- **Minor** (1.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

## Troubleshooting

### Common Issues

#### "You do not have permission to publish"
```bash
# Make sure you're logged in
npm whoami

# Try logging out and back in
npm logout
npm login
```

#### "Package name already exists"
```bash
# Check if the name is taken
npm search discord-lanyard-activity

# You may need to:
# 1. Use a scoped package: @your-username/discord-lanyard-activity
# 2. Choose a different name
```

#### "Version already published"
```bash
# Update the version number
npm version patch
# Then publish again
npm publish
```

#### "Missing required files"
```bash
# Make sure you've built the package
npm run build

# Check the files that will be included
npm publish --dry-run
```

### Unpublishing (Use with Caution)

If you need to unpublish (within 72 hours):

```bash
# Unpublish a specific version
npm unpublish discord-lanyard-activity@1.0.0

# Unpublish entire package (NOT RECOMMENDED)
npm unpublish discord-lanyard-activity --force
```

> ⚠️ **Warning**: Unpublishing can break projects that depend on your package. Only do this for critical security issues or within the first 72 hours.

## Best Practices

1. ✅ **Always test locally** before publishing
2. ✅ **Use semantic versioning** correctly
3. ✅ **Write clear changelogs** for each release
4. ✅ **Keep README up-to-date** with latest features
5. ✅ **Tag releases in Git** to match NPM versions
6. ✅ **Test in multiple frameworks** before major releases
7. ✅ **Monitor issues and PRs** on GitHub
8. ✅ **Respond to bug reports** promptly
9. ✅ **Keep dependencies updated** for security
10. ✅ **Write good commit messages** for version history

## Useful Commands

```bash
# Check current version
npm version

# View package info
npm view discord-lanyard-activity

# View all versions published
npm view discord-lanyard-activity versions

# Deprecate a version
npm deprecate discord-lanyard-activity@1.0.0 "Please upgrade to 1.0.1"

# Update package on NPM registry
npm publish

# View download stats
npm view discord-lanyard-activity

# Search for your package
npm search discord-lanyard-activity
```

## Resources

- [NPM Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [Publishing Scoped Packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)
- [NPM CLI Commands](https://docs.npmjs.com/cli/v8/commands)

---

## Quick Publishing Checklist

Before each publish, verify:

- [ ] All tests pass
- [ ] Package builds successfully (`npm run build`)
- [ ] README is up to date
- [ ] Version number is incremented
- [ ] CHANGELOG is updated (if you have one)
- [ ] Git working directory is clean
- [ ] You're logged into NPM (`npm whoami`)
- [ ] Dry run looks correct (`npm publish --dry-run`)
- [ ] You're on the correct Git branch (usually `main`)

Then:

```bash
npm run build
npm version [patch|minor|major]
npm publish
git push && git push --tags
```

Good luck with your publish! 🚀
