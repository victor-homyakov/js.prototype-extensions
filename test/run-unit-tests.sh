#!/bin/sh

#for f in *unit-test.html; do opera "$f"; done
#find . -type f -regex .*unit-test.html | xargs firefox &

B=/opt/google/chrome/chrome
# chrome does not work with for, works with xargs
#B=firefox
# firefox does not work with for, works with xargs
#B=opera
# opera does not work with xargs
#B=x-www-browser
if test $1; then B=$1; fi
for f in *unit-test.html; do $B "$f"; done
#find . -type f -regex .*unit-test.html | xargs $B &
