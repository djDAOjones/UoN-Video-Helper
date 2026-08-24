# Repaired Transcript / Initial Video App Development Brief

I would like to develop a self-contained web app for novice users, primarily staff at the University of Nottingham. Its purpose would be to improve the consistency of educational video and reduce some of the technical burden involved in preparing video for publication.

## Branding

The app should allow users to add approved animated branding sequences to the video.

There will be two separate animated sequences:

- An opening animation for the beginning of the video
- A closing animation for the end of the video

These should be controlled by separate toggle options so that users can choose:

- Opening animation
- Closing animation
- Both
- Neither

The precise animation files, formats, duration, scaling and treatment of source audio during the animations will need to be confirmed — **will take advice, TBC**.

## Audio processing

The app should apply automatic loudness normalisation so that speech is clear and comfortably loud without creating audible pumping or unnatural changes in level.

The provisional target loudness is:

- **−16 LUFS integrated loudness — will take advice, TBC**
- **−3 dBTP true-peak ceiling — will take advice, TBC**

It should also apply gentle dynamic processing where appropriate, probably consisting of:

- Light speech compression
- Appropriate make-up gain
- A subtle true-peak limiter

The exact compression ratio, threshold, attack, release, make-up gain and limiter behaviour should be determined through testing — **will take advice, TBC**.

### Windowed loudness processing

The intention behind “windowed loudness normalisation” is to analyse and adjust loudness over time windows within the video, rather than calculating one value for the whole file and applying a single uniform gain adjustment.

The aim is to improve consistency between quieter and louder sections while avoiding:

- Audible pumping
- Rapid or distracting level changes
- Amplification of pauses and background noise
- Unnatural changes to speech dynamics

The most suitable method may involve short-term or momentary loudness measurement, gated loudness analysis, dynamic normalisation, compression, or a combination of these approaches.

The precise approach and window duration will require technical advice and testing — **will take advice, TBC**.

### Audio-quality checks

Where technically practical, the app should perform basic audio-quality checks and warn the user about possible problems, such as:

- Clipping or distorted audio
- Audio that is unusually quiet
- Excessive background noise
- Large or rapid variations in volume
- Possible pumping caused by existing processing
- Extended silence
- Audio that remains outside the intended loudness range after processing

These checks should be presented as warnings rather than definitive diagnoses.

The reliability and feasibility of each warning will need to be evaluated — **will take advice, TBC**.

## Video outputs

The default output format should be H.264 video in an MP4 container because this provides broad compatibility across browsers, devices and institutional systems.

The app should offer two main output options.

### 1. Source-matched output

This version should remain as close to the source as reasonably possible while converting it to a standard H.264 MP4.

It should normally retain:

- The original resolution
- The original frame rate
- The original aspect ratio

The purpose of this option is compatibility, branding and audio consistency rather than a substantial reduction in file size.

Where direct stream copying is not possible because branding or audio processing has been applied, the app should use a high-quality re-encoding preset.

The exact encoding preset will be confirmed later — **will take advice, TBC**.

### 2. Compressed output

This version should create a smaller file using a carefully chosen balance between quality and file size.

The compression settings should preserve:

- The legibility of PowerPoint slides
- The clarity of diagrams and on-screen text
- Clear and intelligible speech
- Acceptable image quality
- Reliable playback on mobile devices
- Accessibility for users with slow or unreliable internet connections
- Usability for students studying internationally or while travelling

The compressed output will probably also use H.264 in an MP4 container.

The exact resolution, codec profile, quality setting, bitrate range, audio bitrate and frame-rate handling are not yet fixed — **will take advice, TBC**.

Representative educational videos should be used to test the presets, including:

- Webcam recordings
- PowerPoint-based presentations
- Screen recordings
- Talking-head videos
- Videos containing detailed text or diagrams
- Videos with mixed speech and music

## Future format support

A WebM output option could be implemented in the underlying application but kept disabled or hidden at launch.

This would make it easier to expose WebM later without redesigning the processing workflow.

MP4 should remain the initial user-facing format because it is more broadly compatible.

The choice of WebM codec and the value of including it in the initial implementation are **TBC — will take advice**.

## File duration and size limits

A provisional maximum source-video duration of approximately **one hour** should be considered.

A provisional maximum source-file size of approximately **4 GB** should also be considered.

These are not yet confirmed limits. Browser memory restrictions, device performance, file-system APIs and FFmpeg/WebAssembly limitations may require lower limits.

The app should ideally assess the selected file and the user’s device before processing begins.

Final limits will be based on technical testing and browser support — **will take advice, TBC**.

## Technical requirements

The application should:

- Run entirely in the browser
- Perform all processing on the user’s device
- Avoid uploading video or audio to a server
- Require no server-side video-processing infrastructure
- Be deployable as a static website hosted by the University
- Use dependencies with licences that permit institutional use, modification and redistribution
- Avoid paid, proprietary or otherwise restrictive processing components
- Preserve the user’s privacy by keeping source media on their device
- Provide a simple interface suitable for novice users

Browser-based technologies such as FFmpeg compiled to WebAssembly, WebCodecs or a combination of the two should be investigated.

The selected approach will need to account for:

- Browser compatibility
- Device memory
- Processing speed
- Multi-threading support
- Large-file handling
- Browser security restrictions
- Local temporary storage
- Progress reporting
- Cancellation and recovery from errors

The final technical approach is **TBC — will take advice**.

## Browser and device support

The minimum supported browsers and devices have not yet been decided.

The app should ideally support current institutional and mainstream browsers, but the precise browser matrix will depend on the processing technology selected.

Possible considerations include:

- Chrome and Chromium-based browsers
- Microsoft Edge
- Firefox
- Safari on macOS
- Managed University devices
- Older devices with limited memory
- Browsers without WebCodecs or SharedArrayBuffer support

A recommended minimum browser and device specification should be developed — **will take advice, TBC**.

## Mobile support

The interface should be responsive and readable on phones and tablets.

However, mobile support should initially mean that users can view and understand the interface, rather than guaranteeing that substantial video processing will work on a phone.

On phones, the app may display a warning such as:

> Video processing can require significant memory and processing power. For reliable results, use a supported desktop or laptop computer.

The app may prevent processing on clearly unsupported devices or allow users to continue after acknowledging the warning.

The exact mobile behaviour is **TBC — will take advice**.

## Device capability checks and alerts

The app should check whether the user’s device appears capable of completing the requested task before processing begins.

Possible checks may include:

- Available browser features
- Available memory, where this can be estimated
- Source-file size
- Source-video duration
- Resolution and frame rate
- Supported codecs
- Multi-threading support
- Available local storage
- Whether the device is a phone or tablet
- Whether the browser tab is likely to remain active during processing

The app should provide clear alerts where the device may not be able to complete the task.

Possible messages include:

- The file is too large for this device.
- This browser does not support the required processing features.
- Your device may not have enough memory to process this video.
- Processing this video on a phone is not recommended.
- There is not enough temporary storage available.
- The selected format is not supported by this browser.
- Processing stopped before completion. Your original file has not been changed.

The precise checks that browsers can reliably perform, and the thresholds used for warnings or blocking, are **TBC — will take advice**.

## Subtitles, captions and metadata

The app should not create, edit, remove or otherwise alter subtitle or caption content.

Where subtitles, captions, chapters or relevant metadata are embedded in the source file, the app should preserve them where technically possible.

The app should avoid interfering with:

- Embedded subtitle tracks
- Closed-caption tracks
- Chapter markers
- Language metadata
- Accessibility metadata
- Existing audio-track labels
- Other relevant container metadata

However, re-encoding or changing containers may make preservation technically difficult in some cases.

The exact level of metadata and subtitle preservation that can be guaranteed is **TBC — will take advice**.

Where preservation is not possible, the app should warn the user before processing.

## Overall user experience

The interface should shield novice users from unnecessary technical choices.

In its simplest form, the workflow should be:

1. Select a video.
2. Allow the app to check the file and device.
3. Review any compatibility or capacity warnings.
4. Choose whether to add the opening animation.
5. Choose whether to add the closing animation.
6. Select either the source-matched or compressed output.
7. Review any audio-quality warnings.
8. Process the video.
9. Download the finished file.

Advanced encoding and audio-processing settings should not normally be exposed to the user.

The app should explain what it is doing in plain language and provide:

- Clear progress information
- An estimated processing stage, if not a reliable completion time
- A cancel option
- Clear error messages
- Reassurance that the original file is not altered
- Advice when a different computer or browser is required

## Provisional decisions and open questions

The current provisional requirements are:

- Separate animated opening and closing branding sequences
- Target loudness of −16 LUFS — **will take advice, TBC**
- True-peak ceiling of −3 dBTP — **will take advice, TBC**
- Windowed or dynamic loudness management — **will take advice, TBC**
- H.264 MP4 as the primary output format
- Source-matched and compressed output options
- Exact encoding presets — **will take advice, TBC**
- Maximum duration of approximately one hour — **will take advice, TBC**
- Maximum file size of approximately 4 GB — **will take advice, TBC**
- Minimum browser and device requirements — **will take advice, TBC**
- Mobile-friendly interface, with desktop processing recommended — **will take advice, TBC**
- Device capability checks and clear failure warnings — **will take advice, TBC**
- Preservation of existing subtitles, captions and relevant metadata without editing them — **will take advice, TBC**
- Browser-only processing with no server-side media handling
- Dependencies suitable for institutional use and redistribution
