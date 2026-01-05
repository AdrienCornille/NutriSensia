#!/bin/bash

# NutriSensia Monthly Cleanup Script
# Run this on the first Friday of each month to prevent technical debt accumulation

set -e  # Exit on error

echo "🧹 === NutriSensia Monthly Cleanup ==="
echo ""
echo "📅 Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Change to project root
cd "$(dirname "$0")/.." || exit 1

# Create archive directories with current month
ARCHIVE_MONTH=$(date +%Y-%m)
mkdir -p "docs/archive/$ARCHIVE_MONTH"
mkdir -p "scripts/archive/$ARCHIVE_MONTH"

echo "📦 Archive directories created:"
echo "  - docs/archive/$ARCHIVE_MONTH"
echo "  - scripts/archive/$ARCHIVE_MONTH"
echo ""

# Track changes
CHANGES_MADE=0

# 1. Archive documentation files
echo "📝 Step 1: Archiving documentation files..."
echo "──────────────────────────────────────────"

DOCS_TO_ARCHIVE=$(find . -maxdepth 1 -name '*.md' \
  ! -name 'README.md' \
  ! -name 'CONTRIBUTING.md' \
  ! -name 'CLAUDE.md' \
  ! -name 'CHANGELOG.md' \
  2>/dev/null | wc -l | tr -d ' ')

if [ "$DOCS_TO_ARCHIVE" -gt 0 ]; then
  echo "Found $DOCS_TO_ARCHIVE documentation file(s) to archive:"
  find . -maxdepth 1 -name '*.md' \
    ! -name 'README.md' \
    ! -name 'CONTRIBUTING.md' \
    ! -name 'CLAUDE.md' \
    ! -name 'CHANGELOG.md' \
    -exec basename {} \;

  echo ""
  read -p "Archive these files? (y/N) " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    find . -maxdepth 1 -name '*.md' \
      ! -name 'README.md' \
      ! -name 'CONTRIBUTING.md' \
      ! -name 'CLAUDE.md' \
      ! -name 'CHANGELOG.md' \
      -exec mv {} "docs/archive/$ARCHIVE_MONTH/" \;
    echo "✅ Documentation files archived"
    ((CHANGES_MADE++))
  else
    echo "⏭️  Skipped"
  fi
else
  echo "✅ No documentation files to archive"
fi

echo ""

# 2. Archive root scripts
echo "🔧 Step 2: Archiving root scripts..."
echo "────────────────────────────────────"

SCRIPTS_TO_ARCHIVE=$(ls -1 *.js 2>/dev/null | wc -l | tr -d ' ')

if [ "$SCRIPTS_TO_ARCHIVE" -gt 0 ]; then
  echo "Found $SCRIPTS_TO_ARCHIVE script(s) at root:"
  ls -1 *.js 2>/dev/null

  echo ""
  read -p "Archive these scripts? (y/N) " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    mv *.js "scripts/archive/$ARCHIVE_MONTH/" 2>/dev/null || true
    echo "✅ Scripts archived"
    ((CHANGES_MADE++))
  else
    echo "⏭️  Skipped"
  fi
else
  echo "✅ No scripts to archive"
fi

echo ""

# 3. Remove temporary files
echo "🗑️  Step 3: Cleaning temporary files..."
echo "───────────────────────────────────────"

# Find temp files older than 7 days
TEMP_FILES=$(find . -maxdepth 1 \( -name 'temp-*' -o -name 'test-*.html' -o -name 'test-*.js' \) -mtime +7 2>/dev/null | wc -l | tr -d ' ')

if [ "$TEMP_FILES" -gt 0 ]; then
  echo "Found $TEMP_FILES temporary file(s) older than 7 days:"
  find . -maxdepth 1 \( -name 'temp-*' -o -name 'test-*.html' -o -name 'test-*.js' \) -mtime +7 2>/dev/null

  echo ""
  read -p "Delete these files? (y/N) " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    find . -maxdepth 1 \( -name 'temp-*' -o -name 'test-*.html' -o -name 'test-*.js' \) -mtime +7 -delete 2>/dev/null
    echo "✅ Temporary files removed"
    ((CHANGES_MADE++))
  else
    echo "⏭️  Skipped"
  fi
else
  echo "✅ No old temporary files found"
fi

echo ""

# 4. Clean node_modules cache if too large
echo "💾 Step 4: Checking node_modules size..."
echo "────────────────────────────────────────"

if [ -d "node_modules" ]; then
  NODE_SIZE_MB=$(du -sm node_modules 2>/dev/null | awk '{print $1}')
  echo "node_modules size: ${NODE_SIZE_MB}MB"

  if [ "$NODE_SIZE_MB" -gt 800 ]; then
    echo "⚠️  node_modules is large (>800MB)"
    echo ""
    read -p "Clean and reinstall? This may take a few minutes. (y/N) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "Cleaning node_modules..."
      rm -rf node_modules package-lock.json .next node_modules/.cache
      npm cache clean --force
      echo "Reinstalling dependencies..."
      npm install
      echo "✅ Dependencies reinstalled"
      ((CHANGES_MADE++))
    else
      echo "⏭️  Skipped"
    fi
  else
    echo "✅ node_modules size is acceptable"
  fi
fi

echo ""

# 5. Clear Next.js cache
echo "🔄 Step 5: Clearing Next.js build cache..."
echo "──────────────────────────────────────────"

if [ -d ".next" ]; then
  NEXT_SIZE=$(du -sh .next 2>/dev/null | awk '{print $1}')
  echo ".next cache size: $NEXT_SIZE"

  rm -rf .next
  echo "✅ Next.js cache cleared"
  ((CHANGES_MADE++))
else
  echo "✅ No Next.js cache to clear"
fi

echo ""

# 6. Security audit
echo "🔒 Step 6: Security audit..."
echo "───────────────────────────"

if command -v npm &> /dev/null; then
  npm audit --summary

  VULNERABILITIES=$(npm audit --json 2>/dev/null | grep -o '"total": [0-9]*' | head -1 | grep -o '[0-9]*')

  if [ "${VULNERABILITIES:-0}" -gt 0 ]; then
    echo ""
    echo "⚠️  Found $VULNERABILITIES vulnerabilities"
    read -p "Run npm audit fix? (y/N) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
      npm audit fix
      echo "✅ Security fixes applied"
      ((CHANGES_MADE++))
    else
      echo "⏭️  Skipped - Remember to address these manually"
    fi
  else
    echo "✅ No vulnerabilities found"
  fi
fi

echo ""

# 7. Summary and Git commit
echo "📊 === Cleanup Summary ==="
echo ""

if [ "$CHANGES_MADE" -gt 0 ]; then
  echo "Changes made: $CHANGES_MADE action(s)"
  echo ""
  echo "Git status:"
  git status --short 2>/dev/null || echo "Not a git repository"

  echo ""
  read -p "Create cleanup commit? (y/N) " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add -A 2>/dev/null || true
    git commit -m "🧹 chore: monthly cleanup - $ARCHIVE_MONTH

- Archived documentation to docs/archive/$ARCHIVE_MONTH/
- Archived scripts to scripts/archive/$ARCHIVE_MONTH/
- Removed temporary files
- Cleared build caches
- Performed security audit

Monthly maintenance as per .claude/PROJECT_RULES.md" 2>/dev/null || echo "Nothing to commit or git error"

    echo "✅ Cleanup commit created"
  else
    echo "⏭️  No commit created"
  fi
else
  echo "✅ No changes needed - project is already clean!"
fi

echo ""
echo "🎉 Monthly cleanup complete!"
echo ""
echo "Next steps:"
echo "  1. Run health check: bash scripts/health-check.sh"
echo "  2. Test dev server: npm run dev"
echo "  3. Next cleanup: First Friday of $(date -d '+1 month' '+%B %Y' 2>/dev/null || date -v+1m '+%B %Y' 2>/dev/null || echo 'next month')"
echo ""
echo "────────────────────────────────────────────────"
