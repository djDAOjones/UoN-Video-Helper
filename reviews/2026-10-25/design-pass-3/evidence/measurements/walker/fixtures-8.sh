#!/bin/zsh
# VH-198: pass 3's fixtures N6 to N14 (scenarios-2026-10-25.md, "Faults and
# fixtures this needs"), beside fixtures.sh's N1 to N5, which calls this at its
# end. Phase 8's item runners made them in scratch; the pass's walker makes
# them here. Nothing here comes from samples/, and nothing is written there.
#   zsh fixtures-8.sh <fixtures dir>      (ffmpeg on the PATH)
set -e
OUT="$1"
mkdir -p "$OUT"
V="-f lavfi -i testsrc2=size=1280x720:rate=25"
A="-f lavfi -i sine=frequency=440:sample_rate=48000"
ENC="-c:v libx264 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart"
# N9 and N10 are made from N1's lecture: fixtures.sh's recipe, if it is not there yet.
[[ -f "$OUT/lecture-30s.mp4" ]] || ffmpeg -v error -y ${=V} ${=A} -t 30 -af "volume=-13dB,aformat=channel_layouts=stereo" ${=ENC} "$OUT/lecture-30s.mp4"

# N6, heavy limiting (S-135 to S-138, S-151, S-152): a 440 Hz tone at about
# -46 dBFS (0.005) and, every 250 ms, a 3 ms burst of 2 kHz at about
# -10.5 dBFS (0.3), mono, as VH-193's matrix made it (its bite read 20.13 LU;
# the burst's shape and rate read back from that file's samples). The pilot
# reads the bite again from the worker's "chain planned" line.
ffmpeg -v error -y ${=V} -f lavfi -i "aevalsrc=0.005*sin(2*PI*440*t)+0.3*lt(mod(t\,0.25)\,0.003)*sin(2*PI*2000*t):s=48000:c=mono" -t 20 ${=ENC} "$OUT/clicks-20s.mp4"

# N7, the 1% boundary (S-94): N2's still recipe at 1,000 and 1,100 s.
ffmpeg -v error -y -f lavfi -i testsrc2=size=1920x1080:rate=1 -frames:v 1 "$OUT/still8-1080p.png"
for D in 1000 1100; do
  ffmpeg -v error -y -loop 1 -framerate 25 -i "$OUT/still8-1080p.png" ${=A} -t $D -af "volume=-13dB,aformat=channel_layouts=stereo" -c:v libx264 -preset ultrafast -tune stillimage -crf 40 -pix_fmt yuv420p -c:a aac -b:a 64k -movflags +faststart "$OUT/still-${D}s.mp4"
done

# N12 (to be proved), a slides stand-in (S-110): the same still held 60 s at a
# constant 2.6 Mbit/s with filler (x264 nal-hrd=cbr), so its frames do not
# change and its density, about 0.05 bits a pixel a frame, sits under
# CONTENT_SCREEN_MAX_SOURCE_BITS_PER_PIXEL_PER_FRAME (0.08).
ffmpeg -v error -y -loop 1 -framerate 25 -i "$OUT/still8-1080p.png" ${=A} -t 60 -af "volume=-13dB,aformat=channel_layouts=stereo" -c:v libx264 -preset veryfast -pix_fmt yuv420p -b:v 2600k -minrate 2600k -maxrate 2600k -bufsize 5200k -x264-params nal-hrd=cbr:force-cfr=1 -c:a aac -b:a 128k -movflags +faststart "$OUT/slides-60s.mp4"
rm "$OUT/still8-1080p.png"

# N8, late sound (S-99 to S-102), as VH-185 made it: 10 s of picture with AAC
# sound from 4 s (its first packet, the encoder's priming, about 21.3 ms
# earlier); the control from 3.4 s; and from 9.7 s, about 300 ms of sound.
for OFF in 4 3.4 9.7; do
  NAME=$([[ $OFF == 4 ]] && echo late-sound-10s.mp4 || echo late-sound-${OFF}s-10s.mp4)
  ffmpeg -v error -y ${=V} -itsoffset $OFF ${=A} -t 10 -af "volume=-13dB,aformat=channel_layouts=stereo" ${=ENC} "$OUT/$NAME"
done

# N14 (to be proved), VH-185's frame-snap case (S-153): N8's recipe at 25 fps,
# the sound offset so that its first decoded sample, after the priming, falls
# at 3.71 s. Kept only if 3.71 to 4.10 s holds under 400 ms of sound and the
# range placed on frames (to 4.12 s) over it; the pilot reads the first packet.
ffmpeg -v error -y ${=V} -itsoffset 3.71 ${=A} -t 10 -af "volume=-13dB,aformat=channel_layouts=stereo" ${=ENC} "$OUT/late-sound-3.71s-25fps-10s.mp4"

# N9, the unchecked caption warning (S-105): lecture-30s.mp4 remuxed to
# Matroska and kept. N1's lecture-30s.mkv is another file, made and deleted by
# fixtures.sh before this runs.
ffmpeg -v error -y -i "$OUT/lecture-30s.mp4" -c copy "$OUT/lecture-30s.mkv"

# N10, "Less than a second" (S-103): the first 0.4 s of lecture-30s.mp4, re-encoded.
ffmpeg -v error -y -i "$OUT/lecture-30s.mp4" -t 0.4 ${=ENC} "$OUT/short-0.4s.mp4"

# N11 (to be proved), a duration not written (S-104): 10 s of VP9 and Opus
# muxed to a pipe, so the muxer cannot go back for its duration.
ffmpeg -v error -y -f lavfi -i testsrc2=size=640x360:rate=25 ${=A} -t 10 -af "volume=-13dB" -c:v libvpx-vp9 -deadline realtime -cpu-used 8 -b:v 500k -c:a libopus -b:a 64k -f webm pipe:1 > "$OUT/noduration-10s.webm"

# N13, a made twin of the closing assets (S-140): 5 s of 1080p testsrc2 as
# QuickTime Animation, no audio.
ffmpeg -v error -y -f lavfi -i testsrc2=size=1920x1080:rate=25 -t 5 -an -c:v qtrle "$OUT/qtrle-5s.mov"

ls -la "$OUT"
