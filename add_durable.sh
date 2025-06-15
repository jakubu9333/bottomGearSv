#!/usr/bin/env bash


dir=.svelte-kit/cloudflare
cat ./objects.js >> $dir/_worker.js

