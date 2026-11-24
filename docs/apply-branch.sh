#!/usr/bin/env bash
# Run from a clone of TheHighBrid/Gelato, with this folder alongside it.
set -e
git checkout main && git pull
git checkout -b feature/melato-rack
cp -v melato-rack/sections/*   sections/
cp -v melato-rack/snippets/*   snippets/
cp -v melato-rack/assets/*     assets/
cp -v melato-rack/templates/*  templates/
cp -v melato-rack/docs/MELATO_RACK_README.md docs/
node scripts/validate-melato-product-page-bible.mjs || true
git add sections snippets assets templates docs
git commit -m "feat: add Melato Rack section (clothing-rack showroom)"
git push -u origin feature/melato-rack
