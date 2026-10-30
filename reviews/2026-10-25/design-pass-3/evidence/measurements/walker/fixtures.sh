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
# VH-215 (S-23w, S-23wn): the cut WebM, VH-158's T90 of a-vp9opus.webm. 10 s of
# testsrc2 and a sine in VP9 and Opus, written to a file so the muxer goes back
# for its sizes, SeekHead and Duration, with its Cues at the end; then the
# first 90 % of its bytes, as N1 is cut.
ffmpeg -v error -y ${=V} ${=A} -t 10 -af "volume=-13dB,aformat=channel_layouts=stereo" -c:v libvpx-vp9 -deadline realtime -cpu-used 8 -b:v 500k -c:a libopus -b:a 64k "$OUT/a-vp9opus.webm"
SIZE=$(stat -f %z "$OUT/a-vp9opus.webm")
head -c $(( SIZE * 9 / 10 )) "$OUT/a-vp9opus.webm" > "$OUT/cut-short-10s.webm"
rm "$OUT/a-vp9opus.webm"

# N2, long low-cost 1080p stills (S-24, S-25, and the running states): one
# frame held, so the file is small and quick to make, while the job still
# encodes every frame. Probed on 23 October on this Mac (VH-171; Codex astra's
# method check, M-07): 3,600 s estimated 15 minutes, the ready band (the
# running states' long job); 10,800 s estimated 40, the warn band (S-24). The
# slow band (S-25, over 60 minutes) is not reached by length: a 21,600 s still
# never settled within 5- or 15-minute limits, its pre-flight reading the
# whole audio. S-25 takes the 10,800 s still on a slowed device instead: CDP
# Emulation.setCPUThrottlingRate was tried and does not reach the job worker
# (refused on a worker's session; on the page's the estimate stays 45 min), so
# the worker's clock is run at twice real time (faults.mjs F13; about 1 h 25
# min, "This will work, but it will be slow"). So by default only the 10,800 s
# still is made beside the 3,600 s one; LONG_WARN_S overrides 10,800, and
# LONG_SLOW_S, unset by default, adds one more still of that length.
ffmpeg -v error -y -f lavfi -i testsrc2=size=1920x1080:rate=1 -frames:v 1 "$OUT/still-1080p.png"
for D in 3600 ${LONG_WARN_S:-10800} ${LONG_SLOW_S:-}; do
  ffmpeg -v error -y -loop 1 -framerate 25 -i "$OUT/still-1080p.png" -f lavfi -i "sine=frequency=440:sample_rate=48000" -t $D -af "volume=-13dB,aformat=channel_layouts=stereo" -c:v libx264 -preset ultrafast -tune stillimage -crf 40 -pix_fmt yuv420p -c:a aac -b:a 64k -movflags +faststart "$OUT/still-${D}s.mp4"
done
rm "$OUT/still-1080p.png"

# N3, float PCM with a burst above +6 dBFS at 0:12 (S-27, decode damage): a
# tone at -13 dBFS and 100 ms at about +8.5 dBFS, carried as pcm_f32le in MOV.
ffmpeg -v error -y ${=V} -f lavfi -i "aevalsrc=0.224*sin(2*PI*440*t)*(1+11*between(t\,12\,12.1)):s=48000:c=stereo" -t 30 -c:v libx264 -preset veryfast -pix_fmt yuv420p -c:a pcm_f32le "$OUT/burst-float-30s.mov"

# N4, a clip shorter than the closing's 1 s onset (S-55, the freeze fallback).
ffmpeg -v error -y ${=V} ${=A} -t 0.8 -af "volume=-13dB" ${=ENC} "$OUT/short-0.8s.mp4"

# N5, clipped loud sound (S-19; loud-30s does not clip, M-07): a 440 Hz sine
# driven to 1.6 and hard-clipped at full scale, stereo, 30 s, so far more than
# ten decoded samples reach -0.1 dBTP (src/config/audio.ts clippingDbtp).
ffmpeg -v error -y ${=V} -f lavfi -i "aevalsrc=max(-1\,min(1\,1.6*sin(2*PI*440*t))):s=48000:c=stereo" -t 30 ${=ENC} "$OUT/clipped-30s.mp4"

# VH-180 (V-47, as VH-174 made them for D-04): sources the frame-rate note is
# raised for, 10 s at 640 x 360. 45 fps conforms up to 50, 120 fps down to 60.
for R in 45 120; do
  ffmpeg -v error -y -f lavfi -i testsrc2=size=640x360:rate=$R ${=A} -t 10 -af "volume=-13dB" ${=ENC} "$OUT/hfr-${R}fps-10s.mp4"
done

# VH-198: pass 3's fixtures N6 to N14, in their own script.
zsh "${0:A:h}/fixtures-8.sh" "$OUT"
