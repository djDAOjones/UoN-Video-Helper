#!/bin/zsh
# ffmpeg fixtures for the audit walk. Nothing here comes from samples/.
set -e
OUT="$1"
mkdir -p "$OUT"
V="-f lavfi -i testsrc2=size=1280x720:rate=25"
A="-f lavfi -i sine=frequency=440:sample_rate=48000"
ENC="-c:v libx264 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart"

# A slide-lecture stand-in at about -16.7 LUFS: a tone at -13 dBFS, stereo. The 6-minute 1080p one is the desktop walk's main file.
ffmpeg -v error -y ${=V} ${=A} -t 130 -af "volume=-13dB,aformat=channel_layouts=stereo" ${=ENC} "$OUT/lecture-130s.mp4"
ffmpeg -v error -y -f lavfi -i testsrc2=size=1920x1080:rate=25 ${=A} -t 360 -af "volume=-13dB,aformat=channel_layouts=stereo" ${=ENC} "$OUT/lecture-360s.mp4"
ffmpeg -v error -y ${=V} ${=A} -t 60 -af "volume=-13dB,aformat=channel_layouts=stereo" ${=ENC} "$OUT/lecture-60s.mp4"
ffmpeg -v error -y ${=V} ${=A} -t 30 -af "volume=-13dB,aformat=channel_layouts=stereo" ${=ENC} "$OUT/lecture-30s.mp4"

# A caption track inside the file (mov_text), 12 s.
printf '1\n00:00:01,000 --> 00:00:04,000\nFirst line\n\n2\n00:00:05,000 --> 00:00:08,000\nSecond line\n' > "$OUT/caps.srt"
ffmpeg -v error -y ${=V} ${=A} -i "$OUT/caps.srt" -t 12 -af "volume=-13dB" -map 0:v -map 1:a -map 2:s -c:s mov_text ${=ENC} "$OUT/captioned-12s.mp4"

# No sound at all, 10 s.
ffmpeg -v error -y ${=V} -t 10 -an -c:v libx264 -preset veryfast -pix_fmt yuv420p -movflags +faststart "$OUT/silent-10s.mp4"

# Too short to trim: 2 s.
ffmpeg -v error -y ${=V} ${=A} -t 2 -af "volume=-13dB" ${=ENC} "$OUT/short-2s.mp4"

# Very quiet sound (-45 dBFS) and clipped loud sound, 30 s each.
ffmpeg -v error -y ${=V} ${=A} -t 30 -af "volume=-45dB" ${=ENC} "$OUT/quiet-30s.mp4"
ffmpeg -v error -y ${=V} -f lavfi -i "sine=frequency=440:sample_rate=48000,volume=12dB" -t 30 ${=ENC} "$OUT/loud-30s.mp4"

# 4:3, 20 s.
ffmpeg -v error -y -f lavfi -i testsrc2=size=640x480:rate=25 ${=A} -t 20 -af "volume=-13dB" ${=ENC} "$OUT/fourbythree-20s.mp4"

# A ProRes master Chrome cannot decode, 1080p, 3 s, silent.
ffmpeg -v error -y -f lavfi -i testsrc2=size=1920x1080:rate=25 -t 3 -an -c:v prores_ks -profile:v 0 "$OUT/prores-1080p.mov"

# A text file wearing a video's name.
printf 'This is not a video.\n' > "$OUT/notvideo.mp4"

# A file cut short after its index: reads, then fails part-way.
SIZE=$(stat -f %z "$OUT/lecture-30s.mp4")
head -c $(( SIZE * 7 / 10 )) "$OUT/lecture-30s.mp4" > "$OUT/truncated-30s.mp4"

# Long names with nowhere to break (VH-165, V-34): 100 W's, and an ordinary name joined by underscores.
cp "$OUT/lecture-30s.mp4" "$OUT/$(printf 'W%.0s' {1..100}).mp4"
cp "$OUT/lecture-30s.mp4" "$OUT/Lecture_Week_3_Introduction_to_Biochemistry_v2.mp4"

# PLAN-7 (VH-171): the scenarios' new fixtures, N1-N4.
# N1, a cut-short MKV (S-23): a Segment that runs past the file's end (VH-158).
ffmpeg -v error -y ${=V} ${=A} -t 30 -af "volume=-13dB,aformat=channel_layouts=stereo" -c:v libx264 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 128k "$OUT/lecture-30s.mkv"
SIZE=$(stat -f %z "$OUT/lecture-30s.mkv")
head -c $(( SIZE * 7 / 10 )) "$OUT/lecture-30s.mkv" > "$OUT/cut-short-30s.mkv"
rm "$OUT/lecture-30s.mkv"

# N2, long low-cost 1080p stills (S-24, S-25): one frame held, so the file is
# small and quick to make, while the job still encodes every frame. Their
# lengths are sized in the pilot to estimate 20-60 minutes and over 60
# (src/config/thresholds.ts ESTIMATE_BANDS); LONG_WARN_S and LONG_SLOW_S set them.
ffmpeg -v error -y -f lavfi -i testsrc2=size=1920x1080:rate=1 -frames:v 1 "$OUT/still-1080p.png"
for D in ${LONG_WARN_S:-3600} ${LONG_SLOW_S:-10800}; do
  ffmpeg -v error -y -loop 1 -framerate 25 -i "$OUT/still-1080p.png" -f lavfi -i "sine=frequency=440:sample_rate=48000" -t $D -af "volume=-13dB,aformat=channel_layouts=stereo" -c:v libx264 -preset ultrafast -tune stillimage -crf 40 -pix_fmt yuv420p -c:a aac -b:a 64k -movflags +faststart "$OUT/still-${D}s.mp4"
done
rm "$OUT/still-1080p.png"

# N3, float PCM with a burst above +6 dBFS at 0:12 (S-27, decode damage): a
# tone at -13 dBFS and 100 ms at about +8.5 dBFS, carried as pcm_f32le in MOV.
ffmpeg -v error -y ${=V} -f lavfi -i "aevalsrc=0.224*sin(2*PI*440*t)*(1+11*between(t\,12\,12.1)):s=48000:c=stereo" -t 30 -c:v libx264 -preset veryfast -pix_fmt yuv420p -c:a pcm_f32le "$OUT/burst-float-30s.mov"

# N4, a clip shorter than the closing's 1 s onset (S-55, the freeze fallback).
ffmpeg -v error -y ${=V} ${=A} -t 0.8 -af "volume=-13dB" ${=ENC} "$OUT/short-0.8s.mp4"

ls -la "$OUT"
