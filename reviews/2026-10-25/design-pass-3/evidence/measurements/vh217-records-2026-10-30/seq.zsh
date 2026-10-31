#!/bin/zsh
# VH-217 #1: the groups of one side, in sequence, one at a time; stops at the first non-zero exit. Usage: zsh seq.zsh before|after <walker> <app> [groups…]
side=$1; W=$2; A=$3; shift 3
D=/Users/joe/UoN-Video-Helper-side/vh217-walk; cd "$D"
L=en-GB,zh-Hans,ms-MY; V=w1280,w640,w401,w400,w375,w320; M=light,dark,forced-light,forced-dark,font32,dark-font32,forced-light-font32,forced-dark-font32
typeset -A SC; SC=(a S-141,S-144 b S-142,S-143 c S-17,S-98 d S-95,S-96 e S-97,S-113 e2 S-97,S-113)
groups=("$@"); [ ${#groups} = 0 ] && groups=(a b c d e states)
for g in $groups; do
  if [[ "$g" = states* ]]; then job='mkdir -p "$OUTD/runs"; node vh217-states.mjs --out "$OUTD/runs/vh217-states.jsonl" --clips'
  else job="source ./jobs.zsh; walkset $side $g ${SC[$g]} $L $V $M"; fi
  zsh go.sh "$side-$g" "$side $g" "$W" "$A" "$job" > "$side-$g.go.out" 2>&1; rc=$?
  echo "$side-$g exit $rc $(date -u +%T)" >> "$side.seq.log"
  [ $rc = 0 ] || { echo "SEQ STOP $side-$g rc $rc" >> "$side.seq.log"; exit $rc; }
done
echo "SEQ DONE $side" >> "$side.seq.log"
