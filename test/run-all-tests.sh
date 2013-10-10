#!/bin/sh
if ! test $1; then set $1 x-www-browser; fi
for f in *test.html; do $1 "$f"; done
#$1 *test.html &
#find . -type f -regex .*test.html | xargs $1