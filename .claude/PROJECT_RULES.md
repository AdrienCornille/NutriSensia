# NutriSensia - Project Rules

**Last Updated:** 2024-12-06
**Purpose:** Prevent technical debt accumulation and maintain project organization

---

## 🎯 Core Principles

These rules exist because of recurring startup issues caused by project complexity. Following these rules prevents >1.5h debugging sessions.

---

## 📁 Rule 1: Documentation Placement

### ✅ DO

- **ALL documentation files** go in `docs/` directory
- Use descriptive subdirectories within `docs/`:
  - `docs/guides/` - User and developer guides
  - `docs/architecture/` - System architecture documentation
  - `docs/api/` - API documentation
  - `docs/troubleshooting/` - Problem-solving guides
  - `docs/archive/` - Historical documentation

### ❌ DON'T

- **NEVER** create .md files at the project root (except the 4 essentials)
- **NEVER** create numbered documentation files like `GUIDE_1.md`, `GUIDE_2.md`
- **NEVER** create debug documentation at root

### 📋 Root-Level Documentation Exceptions

**ONLY these 4 files are allowed at root:**

1. `README.md` - Main project documentation
2. `CONTRIBUTING.md` - Contribution guidelines
3. `CLAUDE.md` - Instructions for Claude Code
4. `CHANGELOG.md` - Version history (if needed)

### 🔧 Enforcement

If you create documentation during a session:

```bash
# Correct placement
touch docs/guides/new-feature-guide.md

# Incorrect placement - FORBIDDEN
touch NEW_FEATURE_GUIDE.md
```

---

## 🧪 Rule 2: Temporary Files & Scripts

### ✅ DO

- **Prefix all temporary files** with `temp-`
- **Prefix all test files** with `test-`
- Add temporary patterns to `.gitignore` immediately
- Place temporary scripts in `scripts/temp/` directory

### ❌ DON'T

- **NEVER** commit files prefixed with `temp-` or `test-`
- **NEVER** create one-off scripts at root
- **NEVER** leave diagnostic files uncommitted for >24h

### 📋 Naming Conventions

```bash
# Temporary scripts - MUST use temp- prefix
scripts/temp/temp-fix-user-migration.js
scripts/temp/temp-data-cleanup.js

# Test files - MUST use test- prefix
test-api-endpoint.html
test-authentication-flow.js

# Permanent scripts - descriptive names
scripts/production/setup-database.js
scripts/development/seed-data.js
```

### 🔧 Enforcement

```bash
# Add to .gitignore immediately when creating temp files
echo "temp-*.js" >> .gitignore
echo "test-*.html" >> .gitignore
```

### ♻️ Cleanup Protocol

- **Daily**: Review and delete temp- files no longer needed
- **Weekly**: Move surviving temp- scripts to proper locations or archive
- **Monthly**: Audit scripts/ directory for unused files

---

## 🧹 Rule 3: Regular Maintenance

### 📅 Monthly Maintenance Checklist

**First Friday of each month:**

```bash
# 1. Count files at root (target: ≤10 files)
ls -1 | wc -l

# 2. Identify documentation to archive
ls -1 *.md | grep -v -E '(README|CONTRIBUTING|CLAUDE|CHANGELOG)\.md'

# 3. Check for temporary files
find . -name 'temp-*' -o -name 'test-*' | head -20

# 4. Review scripts directory
ls -1 scripts/*.js 2>/dev/null | wc -l

# 5. Check project size
du -sh . && du -sh node_modules
```

### 🎯 Maintenance Targets

- Root directory: ≤10 files total (excluding hidden files)
- Root .md files: ≤4 files (README, CONTRIBUTING, CLAUDE, CHANGELOG)
- Root scripts: 0 files (all in scripts/ subdirectories)
- Temp files: 0 files older than 7 days
- Project size: <1GB total

### 🔧 Automated Cleanup Script

Run monthly or when root exceeds 15 files:

```bash
# Archive old documentation
mkdir -p docs/archive/$(date +%Y-%m)
find . -maxdepth 1 -name '*.md' \
  ! -name 'README.md' \
  ! -name 'CONTRIBUTING.md' \
  ! -name 'CLAUDE.md' \
  ! -name 'CHANGELOG.md' \
  -exec mv {} docs/archive/$(date +%Y-%m)/ \;

# Clean temporary files
find . -name 'temp-*' -mtime +7 -delete
find . -name 'test-*.html' -mtime +7 -delete
find . -name 'test-*.js' -not -path './node_modules/*' -mtime +7 -delete

# Archive old scripts
mkdir -p scripts/archive/$(date +%Y-%m)
find . -maxdepth 1 -name '*.js' -exec mv {} scripts/archive/$(date +%Y-%m)/ \;
```

---

## 🚨 Debug Session Protocol

When debugging issues (especially startup problems):

### ✅ DO

1. Create a timestamped directory: `docs/archive/debug-sessions/YYYY-MM-DD-issue-name/`
2. Document all findings in a single file within that directory
3. Move the entire directory to archive when issue is resolved
4. Update `docs/troubleshooting/` with the solution

### ❌ DON'T

- Create `FIX_*.md`, `DEBUG_*.md`, `ERROR_*.md` files at root
- Create multiple numbered diagnostic files
- Leave debug files uncommitted

### 📋 Example Debug Session

```bash
# Create debug session directory
mkdir -p docs/archive/debug-sessions/2024-12-06-server-startup

# Document investigation
touch docs/archive/debug-sessions/2024-12-06-server-startup/investigation.md

# When resolved, add to troubleshooting guide
touch docs/troubleshooting/server-startup-issues.md
```

---

## 📊 Git Commit Standards

### ✅ DO

- Commit cleanup work with `🧹 chore:` prefix
- Commit documentation with `📝 docs:` prefix
- Use descriptive commit messages
- Create backup commits before major changes

### ❌ DON'T

- Commit with generic messages like "updates" or "fixes"
- Mix cleanup work with feature commits
- Commit without testing first

### 📋 Commit Message Format

```bash
# Good examples
git commit -m "🧹 chore: archive old debug documentation to docs/archive/"
git commit -m "📝 docs: add troubleshooting guide for server startup issues"
git commit -m "♻️ refactor: move temporary scripts to scripts/temp/"

# Bad examples - AVOID
git commit -m "updates"
git commit -m "fix stuff"
git commit -m "temp"
```

---

## 🔒 .gitignore Protection

### Required Patterns

Ensure `.gitignore` contains these patterns:

```gitignore
# Archives (never commit)
docs/archive/
scripts/archive/

# Temporary files (never commit)
temp-*
*.temp
*.tmp
*.backup
*.old

# Debug files (never commit)
DIAGNOSTIC_*.md
CORRECTIONS_*.md
*_FIX.md
*_DEBUG.md
*_ERROR*.md
DEBUG_*.md
FIX_*.md

# Test files (never commit unless in __tests__ directories)
test-*.html
test-*.js
!**/__tests__/**/*.test.js
!**/__tests__/**/*.test.ts

# Build artifacts
.next/
out/
dist/
build/
*.log
```

---

## 📈 Health Check Script

Create `scripts/health-check.sh` for quick status:

```bash
#!/bin/bash

echo "=== NutriSensia Project Health Check ==="
echo ""

# Root file count
ROOT_COUNT=$(ls -1 | wc -l)
echo "📁 Root files: $ROOT_COUNT (target: ≤10)"

# Root .md count
MD_COUNT=$(ls -1 *.md 2>/dev/null | wc -l)
echo "📝 Root .md files: $MD_COUNT (target: ≤4)"

# Temporary files
TEMP_COUNT=$(find . -name 'temp-*' -o -name 'test-*' | wc -l)
echo "🧪 Temporary files: $TEMP_COUNT (target: 0)"

# Project size
TOTAL_SIZE=$(du -sh . | awk '{print $1}')
NODE_SIZE=$(du -sh node_modules 2>/dev/null | awk '{print $1}')
echo "💾 Total size: $TOTAL_SIZE (node_modules: $NODE_SIZE)"

# Security check
echo ""
echo "🔒 Security vulnerabilities:"
npm audit --summary

echo ""
if [ $ROOT_COUNT -le 10 ] && [ $MD_COUNT -le 4 ] && [ $TEMP_COUNT -eq 0 ]; then
  echo "✅ Project health: GOOD"
else
  echo "⚠️  Project health: NEEDS ATTENTION"
fi
```

Run weekly:

```bash
bash scripts/health-check.sh
```

---

## 🎓 Why These Rules Exist

**Problem:** NutriSensia repeatedly failed to start, requiring >1.5h debugging sessions

**Root Cause:** Project complexity from accumulation of:

- 80 .md files at root (should be 4)
- 23 .js scripts at root (should be 0)
- Hundreds of debug/fix/diagnostic files
- Unclear organization after Cursor → Claude Code transition

**Solution:** These rules prevent the accumulation that caused the problem

**Result After Phase 1 Cleanup:**

- Root .md files: 80 → 4 (95% reduction)
- Root scripts: 23 → 3 (87% reduction)
- Server startup: Works reliably
- Time to debug: 1.5h → 0h

---

## 🚀 Quick Reference

### Before Starting Work

```bash
# Check project health
bash scripts/health-check.sh

# Ensure server starts cleanly
npm run dev:clean
```

### During Development

```bash
# Create documentation
touch docs/guides/my-feature.md          # ✅ Correct
# NOT: touch MY_FEATURE_GUIDE.md         # ❌ Wrong

# Create temporary script
touch scripts/temp/temp-migration.js     # ✅ Correct
# NOT: touch migration-script.js         # ❌ Wrong

# Add to .gitignore immediately
echo "scripts/temp/" >> .gitignore
```

### End of Day

```bash
# Clean up temporary files
rm temp-*.js test-*.html

# Commit documentation changes
git add docs/
git commit -m "📝 docs: add feature documentation"
```

### Monthly Maintenance

```bash
# Run health check
bash scripts/health-check.sh

# Archive old files
bash scripts/monthly-cleanup.sh

# Review and commit
git add -A
git commit -m "🧹 chore: monthly project cleanup"
```

---

## ⚖️ Rule Enforcement

**For Claude Code:**

- ALWAYS follow these rules when creating files
- REMIND the user if they request violating these rules
- SUGGEST the correct location for new files
- OFFER to run cleanup when detecting violations

**For Developers:**

- These rules are MANDATORY for all contributors
- Pre-commit hooks enforce .gitignore patterns
- Monthly audits ensure compliance
- Non-compliance causes startup issues (proven)

---

**Remember:** These rules exist because violating them caused >1.5h debugging sessions. Following them saves time and prevents frustration.
