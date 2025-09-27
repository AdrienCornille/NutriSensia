#!/bin/bash

# NutriSensia Git Workflow Script
# Usage: ./scripts/git-workflow.sh [command] [options]

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

# Function to check if we're on the correct branch
check_branch() {
    local expected_branch=$1
    local current_branch=$(git branch --show-current)
    
    if [ "$current_branch" != "$expected_branch" ]; then
        print_error "You must be on $expected_branch branch. Current branch: $current_branch"
        exit 1
    fi
}

# Function to check if there are uncommitted changes
check_clean_working_directory() {
    if ! git diff-index --quiet HEAD --; then
        print_error "You have uncommitted changes. Please commit or stash them first."
        exit 1
    fi
}

# Function to start a new feature
start_feature() {
    local feature_name=$1
    
    if [ -z "$feature_name" ]; then
        print_error "Feature name is required. Usage: ./scripts/git-workflow.sh start-feature <feature-name>"
        exit 1
    fi
    
    print_header "Starting new feature: $feature_name"
    
    # Check if we're on develop branch
    check_branch "develop"
    
    # Check for uncommitted changes
    check_clean_working_directory
    
    # Pull latest changes
    print_status "Pulling latest changes from develop..."
    git pull origin develop
    
    # Create feature branch
    local branch_name="feature/$feature_name"
    print_status "Creating feature branch: $branch_name"
    git checkout -b "$branch_name"
    
    print_status "Feature branch created successfully!"
    print_status "You can now start developing. When ready, use: ./scripts/git-workflow.sh finish-feature"
}

# Function to finish a feature
finish_feature() {
    print_header "Finishing current feature"
    
    # Get current branch name
    local current_branch=$(git branch --show-current)
    
    # Check if we're on a feature branch
    if [[ ! "$current_branch" =~ ^feature/ ]]; then
        print_error "You must be on a feature branch to finish a feature. Current branch: $current_branch"
        exit 1
    fi
    
    # Check for uncommitted changes
    check_clean_working_directory
    
    # Run tests
    print_status "Running tests..."
    npm run test
    
    # Run linting
    print_status "Running linting..."
    npm run lint
    
    # Build project
    print_status "Building project..."
    npm run build
    
    # Switch to develop
    print_status "Switching to develop branch..."
    git checkout develop
    
    # Pull latest changes
    print_status "Pulling latest changes..."
    git pull origin develop
    
    # Merge feature branch
    print_status "Merging feature branch..."
    git merge "$current_branch" --no-ff -m "feat: merge $current_branch"
    
    # Delete feature branch
    print_status "Deleting feature branch..."
    git branch -d "$current_branch"
    
    # Push changes
    print_status "Pushing changes to develop..."
    git push origin develop
    
    print_status "Feature completed successfully!"
}

# Function to start a hotfix
start_hotfix() {
    local hotfix_name=$1
    
    if [ -z "$hotfix_name" ]; then
        print_error "Hotfix name is required. Usage: ./scripts/git-workflow.sh start-hotfix <hotfix-name>"
        exit 1
    fi
    
    print_header "Starting hotfix: $hotfix_name"
    
    # Check if we're on main branch
    check_branch "main"
    
    # Check for uncommitted changes
    check_clean_working_directory
    
    # Pull latest changes
    print_status "Pulling latest changes from main..."
    git pull origin main
    
    # Create hotfix branch
    local branch_name="hotfix/$hotfix_name"
    print_status "Creating hotfix branch: $branch_name"
    git checkout -b "$branch_name"
    
    print_status "Hotfix branch created successfully!"
}

# Function to finish a hotfix
finish_hotfix() {
    local version=$1
    
    if [ -z "$version" ]; then
        print_error "Version is required. Usage: ./scripts/git-workflow.sh finish-hotfix <version>"
        exit 1
    fi
    
    print_header "Finishing hotfix for version: $version"
    
    # Get current branch name
    local current_branch=$(git branch --show-current)
    
    # Check if we're on a hotfix branch
    if [[ ! "$current_branch" =~ ^hotfix/ ]]; then
        print_error "You must be on a hotfix branch to finish a hotfix. Current branch: $current_branch"
        exit 1
    fi
    
    # Check for uncommitted changes
    check_clean_working_directory
    
    # Run tests
    print_status "Running tests..."
    npm run test
    
    # Switch to main
    print_status "Switching to main branch..."
    git checkout main
    
    # Pull latest changes
    print_status "Pulling latest changes..."
    git pull origin main
    
    # Merge hotfix branch
    print_status "Merging hotfix branch..."
    git merge "$current_branch" --no-ff -m "fix: merge $current_branch"
    
    # Create version tag
    print_status "Creating version tag: $version"
    git tag -a "$version" -m "Release $version"
    
    # Switch to develop
    print_status "Switching to develop branch..."
    git checkout develop
    
    # Pull latest changes
    print_status "Pulling latest changes..."
    git pull origin develop
    
    # Merge hotfix branch
    print_status "Merging hotfix to develop..."
    git merge "$current_branch" --no-ff -m "fix: merge $current_branch to develop"
    
    # Delete hotfix branch
    print_status "Deleting hotfix branch..."
    git branch -d "$current_branch"
    
    # Push changes and tags
    print_status "Pushing changes and tags..."
    git push origin main develop
    git push origin "$version"
    
    print_status "Hotfix completed successfully!"
}

# Function to show status
show_status() {
    print_header "Git Workflow Status"
    
    echo "Current branch: $(git branch --show-current)"
    echo "Last commit: $(git log -1 --oneline)"
    echo ""
    
    echo "Recent branches:"
    git branch -r --sort=-committerdate | head -10
    echo ""
    
    echo "Recent tags:"
    git tag --sort=-version:refname | head -5
}

# Function to show help
show_help() {
    print_header "NutriSensia Git Workflow"
    echo ""
    echo "Usage: ./scripts/git-workflow.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  start-feature <name>    Start a new feature branch"
    echo "  finish-feature          Finish the current feature branch"
    echo "  start-hotfix <name>     Start a new hotfix branch"
    echo "  finish-hotfix <version> Finish the current hotfix branch"
    echo "  status                  Show current git status"
    echo "  help                    Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/git-workflow.sh start-feature auth-system"
    echo "  ./scripts/git-workflow.sh finish-feature"
    echo "  ./scripts/git-workflow.sh start-hotfix critical-bug"
    echo "  ./scripts/git-workflow.sh finish-hotfix v1.0.1"
}

# Main script logic
case "$1" in
    "start-feature")
        start_feature "$2"
        ;;
    "finish-feature")
        finish_feature
        ;;
    "start-hotfix")
        start_hotfix "$2"
        ;;
    "finish-hotfix")
        finish_hotfix "$2"
        ;;
    "status")
        show_status
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
