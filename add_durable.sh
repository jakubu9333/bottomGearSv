#!/usr/bin/env bash


dir=.svelte-kit/cloudflare
mv ./objects.ts $dir/objects.ts
printf "export { BottomGearObject } from './objects.ts;'\n" >> $dir/_worker.js

