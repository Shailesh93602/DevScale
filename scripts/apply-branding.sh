#!/bin/bash
# ============================================================
# EduScale Branding Protection Script
# ============================================================
# Run this AFTER syncing from MrEngineer (Exavel)
# to re-apply all EduScale personal branding overrides.

set -e

FRONTEND="Frontend/src"

echo ""
echo "🎨 EduScale Branding Protection Script"
echo "======================================="

# ── 1. Exavel Replacements ──────────────────────────────────
# Find all files with "Exavel" case-insensitive and replace with Shailesh Chaudhari or remove.
echo "→ Removing Exavel Technologies references..."
find "$FRONTEND" -type f -name "*.tsx" -o -name "*.ts" | while read -r file; do
    if grep -iq "exavel" "$file"; then
        # Use GNU/BSD compatible sed (empty string after -i) to replace
        sed -i '' 's/Exavel Technologies/Shailesh Chaudhari/g' "$file" 2>/dev/null || sed -i 's/Exavel Technologies/Shailesh Chaudhari/g' "$file"
        sed -i '' 's/A Product of Exavel//g' "$file" 2>/dev/null || sed -i 's/A Product of Exavel//g' "$file"
        sed -i '' 's/Visit Exavel Technologies/View Portfolio/g' "$file" 2>/dev/null || sed -i 's/Visit Exavel Technologies/View Portfolio/g' "$file"
    fi
done

# ── 2. Page Title & Metadata ────────────────────────────────
echo "→ Fixing page metadata..."
LAYOUT="$FRONTEND/app/layout.tsx"
if [ -f "$LAYOUT" ]; then
    sed -i '' "s/title: 'Mr\. Engineers'/title: {\n    default: 'EduScale | All-in-One Engineering Learning Platform',\n    template: '%s | EduScale',\n  }/g" "$LAYOUT" 2>/dev/null || \
    sed -i "s/title: 'Mr\. Engineers'/title: {\n    default: 'EduScale | All-in-One Engineering Learning Platform',\n    template: '%s | EduScale',\n  }/g" "$LAYOUT"
fi

# ── 3. Navbar Logo ──────────────────────────────────────────
echo "→ Fixing Navbar logo..."
NAV="$FRONTEND/components/Navbar/index.tsx"
if [ -f "$NAV" ]; then
    sed -i '' 's/Mr\.Eng/EduScale/g' "$NAV" 2>/dev/null || sed -i 's/Mr\.Eng/EduScale/g' "$NAV"
fi

# ── 4. Constants ───────────────────────────────────────────
echo "→ Fixing constants file..."
CONSTS="$FRONTEND/constants/index.tsx"
if [ -f "$CONSTS" ]; then
    sed -i '' "s/name: 'EduScales'/name: 'EduScale'/g" "$CONSTS" 2>/dev/null || sed -i "s/name: 'EduScales'/name: 'EduScale'/g" "$CONSTS"
    sed -i '' "s/name: 'MrEngineer'/name: 'EduScale'/g" "$CONSTS" 2>/dev/null || sed -i "s/name: 'MrEngineer'/name: 'EduScale'/g" "$CONSTS"
    sed -i '' "s/contact@EduScales\.com/contact@eduscale.app/g" "$CONSTS" 2>/dev/null || sed -i "s/contact@EduScales\.com/contact@eduscale.app/g" "$CONSTS"
fi

# ── 5. Java boilerplate ─────────────────────────────────────
echo "→ Fixing Java coding challenge boilerplate..."
CHALLFILE="$FRONTEND/app/coding-challenges/\[id\]/CodingChallenge.tsx"
if [ -f "$CHALLFILE" ]; then
    sed -i '' 's/class EduScales {/class Solution {/g' "$CHALLFILE" 2>/dev/null || sed -i 's/class EduScales {/class Solution {/g' "$CHALLFILE"
fi

echo "✅ Branding protection complete!"
