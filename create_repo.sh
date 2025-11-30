#!/bin/bash
# Helper to create GitHub repo and push initial branches.
# Requires: git, gh (GitHub CLI) installed and authenticated.
REPO=${1:-canva-sell-template}
BRANCH=${2:-feature/full-deploy}

git init
git add .
git commit -m "Initial commit: canva selling template"
gh repo create "$REPO" --public --confirm
git branch -M main
git push -u origin main

git checkout -b $BRANCH
git commit --allow-empty -m "PR branch: $BRANCH"
git push -u origin $BRANCH

gh pr create --base main --head $BRANCH --title "Feature: full-production deploy" --body "Full production-ready app"
