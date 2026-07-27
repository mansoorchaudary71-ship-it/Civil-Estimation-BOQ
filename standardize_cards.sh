#!/bin/bash
find src/components -type f -name "*.tsx" -exec sed -i -E 's/rounded-\[[0-9]+(px|rem)\]/rounded-2xl/g' {} +
find src/components -type f -name "*.tsx" -exec sed -i -E 's/rounded-3xl/rounded-2xl/g' {} +
find src/components -type f -name "*.tsx" -exec sed -i -E 's/shadow-\[[^\]]+\]/shadow-sm/g' {} +
