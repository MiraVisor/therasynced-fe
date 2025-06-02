#!/bin/bash

# Skip build if branch starts with feat/docs-
if [[ "$VERCEL_GIT_COMMIT_REF" == none/* ]]; then
  echo "🛑 Skipping Vercel build for branch: $VERCEL_GIT_COMMIT_REF"
  exit 0
fi

# Proceed with the build
exit 1
