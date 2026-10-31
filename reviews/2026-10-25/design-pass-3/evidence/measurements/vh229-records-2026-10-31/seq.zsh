#!/bin/zsh
# VH-229 #1: the groups of one side, in sequence, one at a time; stops at the first non-zero exit. Usage: zsh seq.zsh before|after <walker> <app> [groups…]
side=$1; W=$2; A=$3; shift 3
D=/Users/joe/UoN-Video-Helper-side/vh229-walk; cd "$D"
L=en-GB,zh-Hans,ms-MY; V4=w1280,w640,w375,w320; M5=light,dark,forced-light,forced-dark,font32; V=w1280,w640,w401,w400,w375,w320; M=light,dark,forced-light,forced-dark,font32,dark-font32,forced-light-font32,forced-dark-font32
groups=("$@"); [ ${#groups} = 0 ] && groups=(six a b c states)
for g in $groups; do
  case "$g" in
    six) job='node "$WALKER/rings-179.mjs" v18';;
    sixopen) job='node vh229-six.mjs v18';;
    a) job="source ./jobs.zsh; walkset $side a S-03,S-144 $L $V4 $M5";;
    b) job="source ./jobs.zsh; walkset $side b S-141,S-144 $L $V $M";;
    c) job="source ./jobs.zsh; walkset $side c S-142,S-143 $L $V $M";;
    probe|probe2|probe3) job='mkdir -p "$OUTD/runs"; OUT="$OUTD/runs/vh229-behaviour.jsonl" node vh229-behaviour.mjs';;
    c2) job="source ./jobs.zsh; walkset $side c2 S-143 $L $V $M";;
    states2) job='mkdir -p "$OUTD/runs"; node vh229-states-onset.mjs --out "$OUTD/runs/vh229-states.jsonl" --clips';;
    c3) job="source ./jobs.zsh; walkset $side c3 S-143 $L $V dark-font32";;
    states) job='mkdir -p "$OUTD/runs"; node vh229-states.mjs --out "$OUTD/runs/vh229-states.jsonl" --clips';;
    *) echo "unknown $g"; exit 2;;
  esac
  zsh go.sh "$side-$g" "$side $g" "$W" "$A" "$job" > "$side-$g.go.out" 2>&1; rc=$?
  echo "$side-$g exit $rc $(date -u +%T)" >> "$side.seq.log"
  [ $rc = 0 ] || { echo "SEQ STOP $side-$g rc $rc" >> "$side.seq.log"; exit $rc; }
done
echo "SEQ DONE $side" >> "$side.seq.log"
