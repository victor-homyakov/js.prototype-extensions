#!/bin/sh
if ! test $1; then set $1 x-www-browser; fi
for f in *func-test.html; do $1 "$f"; done
