#!/bin/bash

# 🚀 Push to GitHub
# This script will push your code to GitHub

echo "🚀 Pushing Ecosphere app to GitHub..."

# Check if GitHub remote exists
if ! git remote get-url github >/dev/null 2>&1; then
    echo "❌ GitHub remote not found!"
    echo "Please add your GitHub repository first:"
    echo "git remote add github https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u github master

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Your repository: $(git remote get-url github)"
else
    echo "❌ Failed to push to GitHub"
    echo "Please check your authentication and try again"
fi
