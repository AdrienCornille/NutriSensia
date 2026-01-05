#!/bin/bash

# NutriSensia Project Health Check
# Run this script weekly or when suspecting project complexity issues

echo "🏥 === NutriSensia Project Health Check ==="
echo ""
echo "📅 Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Change to project root
cd "$(dirname "$0")/.." || exit 1

# 1. Root file count
echo "📁 File Organization"
echo "────────────────────"
ROOT_COUNT=$(ls -1 | wc -l | tr -d ' ')
echo "  Root files: $ROOT_COUNT (target: ≤10)"

if [ "$ROOT_COUNT" -gt 10 ]; then
  echo "  ⚠️  Too many files at root!"
else
  echo "  ✅ Root directory clean"
fi

# 2. Root .md count
MD_COUNT=$(ls -1 *.md 2>/dev/null | wc -l | tr -d ' ')
echo "  Root .md files: $MD_COUNT (target: ≤4)"

if [ "$MD_COUNT" -gt 4 ]; then
  echo "  ⚠️  Too many .md files! Archive them:"
  ls -1 *.md 2>/dev/null | grep -v -E '(README|CONTRIBUTING|CLAUDE|CHANGELOG)\.md'
else
  echo "  ✅ Documentation files organized"
fi

# 3. Root scripts count
SCRIPTS_COUNT=$(ls -1 *.js 2>/dev/null | wc -l | tr -d ' ')
echo "  Root .js files: $SCRIPTS_COUNT (target: 0)"

if [ "$SCRIPTS_COUNT" -gt 0 ]; then
  echo "  ⚠️  Scripts at root! Move to scripts/:"
  ls -1 *.js 2>/dev/null
else
  echo "  ✅ No scripts at root"
fi

echo ""

# 4. Temporary files
echo "🧪 Temporary Files"
echo "──────────────────"
TEMP_COUNT=$(find . -maxdepth 1 -name 'temp-*' -o -name 'test-*.html' -o -name 'test-*.js' 2>/dev/null | wc -l | tr -d ' ')
echo "  Temporary files at root: $TEMP_COUNT (target: 0)"

if [ "$TEMP_COUNT" -gt 0 ]; then
  echo "  ⚠️  Temporary files found:"
  find . -maxdepth 1 \( -name 'temp-*' -o -name 'test-*.html' -o -name 'test-*.js' \) 2>/dev/null
else
  echo "  ✅ No temporary files"
fi

echo ""

# 5. Project size
echo "💾 Project Size"
echo "───────────────"
TOTAL_SIZE=$(du -sh . 2>/dev/null | awk '{print $1}')
NODE_SIZE=$(du -sh node_modules 2>/dev/null | awk '{print $1}')
DOCS_SIZE=$(du -sh docs 2>/dev/null | awk '{print $1}')

echo "  Total size: $TOTAL_SIZE"
echo "  node_modules: $NODE_SIZE"
echo "  docs: $DOCS_SIZE"

# Check if project is too large
TOTAL_MB=$(du -sm . 2>/dev/null | awk '{print $1}')
if [ "$TOTAL_MB" -gt 1024 ]; then
  echo "  ⚠️  Project exceeds 1GB!"
else
  echo "  ✅ Project size acceptable"
fi

echo ""

# 6. Security check
echo "🔒 Security"
echo "───────────"
if command -v npm &> /dev/null; then
  npm audit --summary 2>/dev/null | grep -A 5 "found"
else
  echo "  npm not available"
fi

echo ""

# 7. Git status
echo "📝 Git Status"
echo "─────────────"
if git rev-parse --git-dir > /dev/null 2>&1; then
  UNTRACKED=$(git ls-files --others --exclude-standard | wc -l | tr -d ' ')
  MODIFIED=$(git ls-files --modified | wc -l | tr -d ' ')

  echo "  Untracked files: $UNTRACKED"
  echo "  Modified files: $MODIFIED"

  if [ "$UNTRACKED" -gt 10 ]; then
    echo "  ⚠️  Many untracked files - consider committing or adding to .gitignore"
  fi
else
  echo "  Not a git repository"
fi

echo ""

# 8. Overall health assessment
echo "🎯 Overall Health"
echo "─────────────────"

ISSUES=0

if [ "$ROOT_COUNT" -gt 10 ]; then
  ((ISSUES++))
fi

if [ "$MD_COUNT" -gt 4 ]; then
  ((ISSUES++))
fi

if [ "$SCRIPTS_COUNT" -gt 0 ]; then
  ((ISSUES++))
fi

if [ "$TEMP_COUNT" -gt 0 ]; then
  ((ISSUES++))
fi

if [ "$TOTAL_MB" -gt 1024 ]; then
  ((ISSUES++))
fi

if [ "$ISSUES" -eq 0 ]; then
  echo "✅ PROJECT HEALTH: EXCELLENT"
  echo ""
  echo "All metrics are within target ranges."
  echo "No action needed."
elif [ "$ISSUES" -le 2 ]; then
  echo "⚠️  PROJECT HEALTH: GOOD (with minor issues)"
  echo ""
  echo "Found $ISSUES issue(s). Review warnings above."
  echo "Consider running cleanup during next maintenance window."
else
  echo "❌ PROJECT HEALTH: NEEDS ATTENTION"
  echo ""
  echo "Found $ISSUES issue(s) that may impact performance."
  echo ""
  echo "Recommended actions:"
  echo "  1. Run monthly cleanup: bash scripts/monthly-cleanup.sh"
  echo "  2. Archive documentation: mv *.md docs/archive/\$(date +%Y-%m)/"
  echo "  3. Remove temporary files: rm temp-* test-*.html test-*.js"
  echo "  4. Review scripts directory"
fi

echo ""
echo "────────────────────────────────────────────────"
echo "For detailed cleanup instructions, see:"
echo "  .claude/PROJECT_RULES.md"
echo "────────────────────────────────────────────────"
