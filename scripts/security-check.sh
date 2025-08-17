#!/bin/bash

# NutriSensia Security Check Script
# Vérifie que le workflow sécurisé est respecté

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to check current branch
check_current_branch() {
    local current_branch=$(git branch --show-current)
    echo "Current branch: $current_branch"
    
    if [ "$current_branch" = "main" ]; then
        print_warning "You are on main branch. Be careful!"
        print_warning "Remember: Never commit directly to main"
    elif [ "$current_branch" = "develop" ]; then
        print_warning "You are on develop branch. Be careful!"
        print_warning "Remember: Use Pull Requests for changes"
    elif [[ "$current_branch" =~ ^feature/ ]]; then
        print_status "You are on a feature branch. This is good!"
    elif [[ "$current_branch" =~ ^hotfix/ ]]; then
        print_status "You are on a hotfix branch. This is good!"
    else
        print_warning "You are on an unknown branch: $current_branch"
    fi
}

# Function to check for uncommitted changes
check_uncommitted_changes() {
    if ! git diff-index --quiet HEAD --; then
        print_warning "You have uncommitted changes:"
        git status --short
        echo ""
        print_status "Consider committing your changes before proceeding"
    else
        print_status "No uncommitted changes found"
    fi
}

# Function to check recent commits
check_recent_commits() {
    print_header "Recent Commits"
    git log --oneline -5
    echo ""
}

# Function to check branch status
check_branch_status() {
    print_header "Branch Status"
    
    # Check if we're behind or ahead
    local current_branch=$(git branch --show-current)
    local behind=$(git rev-list --count HEAD..origin/$current_branch 2>/dev/null || echo "0")
    local ahead=$(git rev-list --count origin/$current_branch..HEAD 2>/dev/null || echo "0")
    
    if [ "$behind" -gt 0 ]; then
        print_warning "Your branch is $behind commits behind origin/$current_branch"
        print_status "Consider: git pull origin $current_branch"
    fi
    
    if [ "$ahead" -gt 0 ]; then
        print_status "Your branch is $ahead commits ahead of origin/$current_branch"
        print_status "Consider: git push origin $current_branch"
    fi
    
    if [ "$behind" -eq 0 ] && [ "$ahead" -eq 0 ]; then
        print_status "Your branch is up to date with origin/$current_branch"
    fi
}

# Function to check for feature branches that should be cleaned up
check_feature_branches() {
    print_header "Feature Branches"
    
    local feature_branches=$(git branch --list "feature/*" --merged develop 2>/dev/null || true)
    
    if [ -n "$feature_branches" ]; then
        print_warning "The following feature branches are merged and can be deleted:"
        echo "$feature_branches" | sed 's/^/  /'
        echo ""
        print_status "Consider: git branch -d <branch-name>"
    else
        print_status "No merged feature branches found"
    fi
}

# Function to check for security issues
check_security_issues() {
    print_header "Security Check"
    
    # Check for sensitive files
    local sensitive_files=(".env" ".env.local" ".env.production" "secrets.json" "config.json")
    local found_sensitive=false
    
    for file in "${sensitive_files[@]}"; do
        if [ -f "$file" ]; then
            print_error "Sensitive file found: $file"
            print_error "Make sure this file is in .gitignore"
            found_sensitive=true
        fi
    done
    
    if [ "$found_sensitive" = false ]; then
        print_status "No sensitive files found in working directory"
    fi
    
    # Check .gitignore
    if [ -f ".gitignore" ]; then
        print_status ".gitignore file exists"
    else
        print_warning ".gitignore file missing"
    fi
}

# Function to check workflow compliance
check_workflow_compliance() {
    print_header "Workflow Compliance"
    
    local current_branch=$(git branch --show-current)
    
    # Check if we're trying to commit directly to main
    if [ "$current_branch" = "main" ]; then
        print_error "⚠️  SECURITY WARNING: You are on main branch!"
        print_error "   Never commit directly to main"
        print_error "   Use Pull Requests instead"
        echo ""
        print_status "Recommended workflow:"
        print_status "1. git checkout develop"
        print_status "2. git pull origin develop"
        print_status "3. git checkout -b feature/your-feature"
        print_status "4. Make your changes"
        print_status "5. Create Pull Request on GitHub"
    fi
    
    # Check if we're trying to commit directly to develop
    if [ "$current_branch" = "develop" ]; then
        print_warning "⚠️  You are on develop branch"
        print_warning "   Consider using a feature branch instead"
        echo ""
        print_status "Recommended:"
        print_status "git checkout -b feature/your-feature"
    fi
}

# Function to show help
show_help() {
    print_header "NutriSensia Security Check"
    echo ""
    echo "Usage: ./scripts/security-check.sh [options]"
    echo ""
    echo "Options:"
    echo "  --full     Run all security checks"
    echo "  --quick    Run quick checks only"
    echo "  --help     Show this help message"
    echo ""
    echo "Checks performed:"
    echo "  - Current branch status"
    echo "  - Uncommitted changes"
    echo "  - Recent commits"
    echo "  - Branch synchronization"
    echo "  - Feature branch cleanup"
    echo "  - Security issues"
    echo "  - Workflow compliance"
}

# Main script logic
case "$1" in
    "--full"|"")
        print_header "NutriSensia Security Check - Full Scan"
        echo ""
        check_current_branch
        echo ""
        check_uncommitted_changes
        echo ""
        check_recent_commits
        check_branch_status
        echo ""
        check_feature_branches
        echo ""
        check_security_issues
        echo ""
        check_workflow_compliance
        echo ""
        print_header "Security Check Complete"
        ;;
    "--quick")
        print_header "NutriSensia Security Check - Quick Scan"
        echo ""
        check_current_branch
        echo ""
        check_uncommitted_changes
        echo ""
        check_workflow_compliance
        echo ""
        print_header "Quick Security Check Complete"
        ;;
    "--help"|"-h"|"help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
