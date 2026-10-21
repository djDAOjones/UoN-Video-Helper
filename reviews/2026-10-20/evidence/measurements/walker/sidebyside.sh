#!/bin/zsh
# Before against after (VH-143): VH-124's after-capture beside the same state now, padded to one
# height on white with a 24 px gutter. Usage: sidebyside.sh <before.png> <after.png> <out.png>
set -e
B="$1"; A="$2"; O="$3"
HB=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$B")
HA=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$A")
H=$(( HB > HA ? HB : HA ))
ffmpeg -v error -y -i "$B" -i "$A" -filter_complex "[0:v]pad=iw+24:${H}:0:0:white[l];[1:v]pad=iw:${H}:0:0:white[r];[l][r]hstack=inputs=2" "$O"
