#!/usr/bin/env bash


dir=.svelte-kit/cloudflare
cat ./objects.ts >> $dir/_worker.js

