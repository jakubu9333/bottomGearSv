#!/usr/bin/env bash


dir=.svelte-kit/cloudflare
printf "export { default } from './src/lib/server/durrable/index.ts;\n" >> $dir/_worker.js
