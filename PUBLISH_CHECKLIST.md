# 🚀 Quick Publish Checklist

Use this checklist before publishing to NPM.

## Pre-Publish Checklist

### 1. Code Quality
- [ ] All TypeScript files compile without errors
- [ ] No lint warnings or errors
- [ ] Code follows project conventions
- [ ] All functions are properly typed

### 2. Documentation
- [ ] README.md is complete and up-to-date
- [ ] Installation instructions are clear
- [ ] All framework examples work correctly
- [ ] API documentation is accurate
- [ ] CHANGELOG.md updated (if applicable)

### 3. Package Configuration
- [ ] `package.json` version is correct
- [ ] `package.json` keywords are appropriate
- [ ] Repository URL is correct
- [ ] Author information is accurate
- [ ] License is specified (MIT)
- [ ] "files" array includes necessary files

### 4. Build & Test
- [ ] Clean build successful: `rm -rf dist && npm run build`
- [ ] All expected files in `dist/` folder
- [ ] Type definitions generated (`.d.ts` files)
- [ ] Both ESM and CJS builds exist
- [ ] Test package locally with `npm link`

### 5. Git & Version Control
- [ ] All changes committed
- [ ] Working directory clean (`git status`)
- [ ] On correct branch (usually `main`)
- [ ] Latest changes pulled from remote

### 6. NPM Account
- [ ] Logged into NPM: `npm whoami`
- [ ] Have publishing rights
- [ ] 2FA configured (if enabled)

### 7. Pre-Publish Validation
- [ ] Dry run successful: `npm publish --dry-run`
- [ ] Verify files to be published look correct
- [ ] No sensitive files included
- [ ] File size is reasonable

## Publishing Steps

```bash
# 1. Clean and build
rm -rf dist
npm install
npm run build

# 2. Verify build
ls -la dist/

# 3. Update version (choose one)
npm version patch   # Bug fixes: 1.0.0 -> 1.0.1
npm version minor   # New features: 1.0.0 -> 1.1.0
npm version major   # Breaking changes: 1.0.0 -> 2.0.0

# 4. Dry run (review output)
npm publish --dry-run

# 5. Publish to NPM
npm publish --access public

# 6. Push to Git
git push origin main --tags

# 7. Create GitHub Release (optional but recommended)
# Go to: https://github.com/DevRohit06/discord-lanyard-activity/releases/new
```

## Post-Publish Checklist

- [ ] Package appears on NPM: https://www.npmjs.com/package/discord-lanyard-activity
- [ ] Version number is correct on NPM
- [ ] Install test: `npm install discord-lanyard-activity` in new project
- [ ] Demo site updated with new version
- [ ] Git tag created and pushed
- [ ] GitHub release created with changelog
- [ ] Documentation links work
- [ ] Announced on relevant channels (optional)

## Version Guidelines

| Type | When to Use | Example |
|------|-------------|---------|
| **Patch** | Bug fixes, typos, minor improvements | 1.0.0 → 1.0.1 |
| **Minor** | New features, backward compatible | 1.0.0 → 1.1.0 |
| **Major** | Breaking changes, API changes | 1.0.0 → 2.0.0 |

## Quick Commands Reference

```bash
# Check version
npm version

# View package on NPM
npm view discord-lanyard-activity

# Check download stats
npm view discord-lanyard-activity

# Login to NPM
npm login

# Verify login
npm whoami

# Logout
npm logout

# Deprecate version
npm deprecate discord-lanyard-activity@1.0.0 "Message here"
```

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Permission Errors
```bash
# Re-login to NPM
npm logout
npm login
```

### Version Already Exists
```bash
# Update version number
npm version patch
```

## Emergency: Unpublish

⚠️ **Use only within 72 hours and for critical issues!**

```bash
# Unpublish specific version
npm unpublish discord-lanyard-activity@1.0.0

# Unpublish entire package (NOT RECOMMENDED)
npm unpublish discord-lanyard-activity --force
```

---

**Remember**: Once published, a package version is permanent. Always double-check before publishing!

For detailed instructions, see [PUBLISHING.md](./PUBLISHING.md)
