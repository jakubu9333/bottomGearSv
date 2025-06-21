#!/usr/bin/env bash


dir=.svelte-kit/cloudflare
cat ./src/objects.js >> $dir/_worker.js

