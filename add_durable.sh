#!/usr/bin/env bash


dir=.svelte-kit/cloudflare
printf "export { BottomGearObject } from './src/lib/server/durrable/index.ts;'\n" >> $dir/_worker.js
