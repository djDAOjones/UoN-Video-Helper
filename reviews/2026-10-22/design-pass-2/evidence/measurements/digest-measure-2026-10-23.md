<!-- markdownlint-disable -->
# measure — VH-172's priority run (2026-10-23)

Every rendered line with its text against 80 characters (40 CJK) and each block's widest line against 28rem (1.4.8; M-03).

Runs `priority-1-2026-10-23T12-47-49-793Z-0d4cac`, `priority-2-2026-10-23T13-16-30-886Z-48f1bc`, `priority-3-2026-10-23T13-56-31-192Z-b76894`, `priority-4-2026-10-23T14-33-32-479Z-b3e805`, `priority-part-2026-10-23T15-04-06-332Z-bbe3f1`. 691 records carry it, of 699 observed.

| | pass | fail | cannot determine | not applicable | exempt |
| --- | --- | --- | --- | --- | --- |
| records | 605 | 0 | 86 | 0 | — |
| rows | 43625 | 0 | 115 | 0 | 0 |

Records by mode and by view (pass / fail / cannot determine / not applicable):

| mode | light 424 / 0 / 57 / 0 · dark 20 / 0 / 5 / 0 · forced-light 20 / 0 / 5 / 0 · forced-dark 20 / 0 / 5 / 0 · spacing 74 / 0 / 0 / 0 · reduced-motion 11 / 0 / 0 / 0 · fallback 18 / 0 / 7 / 0 · font32 18 / 0 / 7 / 0 |
| --- | --- |
| view | w1280 284 / 0 / 85 / 0 · w375 76 / 0 / 0 / 0 · w320 206 / 0 / 0 / 0 · landscape 9 / 0 / 0 / 0 · short 9 / 0 / 0 / 0 · zoom200proxy 10 / 0 / 1 / 0 · zoom400proxy 11 / 0 / 0 / 0 |
| language | en-GB 365 / 0 / 0 / 0 · zh-Hans 92 / 0 / 86 / 0 · ms-MY 148 / 0 / 0 / 0 |

Not passing: 12 groups, by subject and reason, failures first.

| subject | outcome | measurement | reason | records |
| --- | --- | --- | --- | --- |
| p.notification-body "发送电子邮件至 joe.bell@nottingham.ac.uk，提出更好的 | cannot-determine | worst 41 chars (15 CJK, 26 Latin), widest 379–758 of 448–896 px; "发送电子邮件至 joe.bell@nottingham.ac.uk，提出更好的措辞" | mixed scripts: each character against 40 and CJK 40 plus Latin 80 disagree; the reading is VH-173's | 86: S-05 zh-Hans w1280 light; S-03 zh-Hans w1280 light; S-24 zh-Hans w1280 light; S-16 zh-Hans w1280 light; S-41 zh-Hans w1280 light; S-48 zh-Hans w1280 light; +80 more |
| p.notification-body "由 lecture-30s.mp4 构成：完整视频（30秒钟）、更大/更好、镜 | cannot-determine | worst 43 chars (23 CJK, 20 Latin), widest 443 of 448 px; "由 lecture-30s.mp4 构成：完整视频（30秒钟）、更大/更好、镜头切换到" | mixed scripts: each character against 40 and CJK 40 plus Latin 80 disagree; the reading is VH-173's | 10: S-53 zh-Hans w1280 light; S-63 zh-Hans w1280 light; S-58 zh-Hans w1280 light; S-30 zh-Hans w1280 light; S-54a zh-Hans w1280 light; S-62 zh-Hans w1280 light; +4 more |
| p#statement-contact "如果您在使用本工具时发现问题，或需要以其他形式获取其中的信息，请发送电子邮件至 | cannot-determine | worst 44 chars (13 CJK, 31 Latin), widest 448 of 448 px; "信息，请发送电子邮件至 joe.bell@nottingham.ac.uk 联系 Joe" | mixed scripts: each character against 40 and CJK 40 plus Latin 80 disagree; the reading is VH-173's | 4: S-81 zh-Hans w1280 light; S-81 zh-Hans w1280 dark; S-81 zh-Hans w1280 forced-light; S-81 zh-Hans w1280 forced-dark |
| p#statement-enforcement "平等与人权委员会（Equality and Human Rights | cannot-determine | worst 46 chars (10 CJK, 36 Latin), widest 448 of 448 px; "平等与人权委员会（Equality and Human Rights Commission）" | mixed scripts: each character against 40 and CJK 40 plus Latin 80 disagree; the reading is VH-173's | 4: S-81 zh-Hans w1280 light; S-81 zh-Hans w1280 dark; S-81 zh-Hans w1280 forced-light; S-81 zh-Hans w1280 forced-dark |
| p.notification-body "由 Lecture_Week_3_Introduction_to_Bioche | cannot-determine | worst 58 chars (6 CJK, 52 Latin), widest 439 of 448 px; "由 Lecture_Week_3_Introduction_to_Biochemistry_v2.m" | mixed scripts: each character against 40 and CJK 40 plus Latin 80 disagree; the reading is VH-173's | 3: S-53-LW zh-Hans w1280 light; S-58-LW zh-Hans w1280 light; S-63-LW zh-Hans w1280 light |
| p.notification-body "由 lecture-30s.mp4 构成：完整视频（30秒钟）、更大/更好、蓝 | cannot-determine | worst 43 chars (23 CJK, 20 Latin), widest 443 of 448 px; "由 lecture-30s.mp4 构成：完整视频（30秒钟）、更大/更好、蓝色的结尾" | mixed scripts: each character against 40 and CJK 40 plus Latin 80 disagree; the reading is VH-173's | 2: S-55c zh-Hans w1280 light; S-91 zh-Hans w1280 light |
| p.notification-body "由 short-0.8s.mp4 构成：完整视频（1秒钟）、更大/更好、蓝色的 | cannot-determine | worst 42 chars (24 CJK, 18 Latin), widest 442 of 448 px; "由 short-0.8s.mp4 构成：完整视频（1秒钟）、更大/更好、蓝色的结尾图" | mixed scripts: each character against 40 and CJK 40 plus Latin 80 disagree; the reading is VH-173's | 1: S-55a zh-Hans w1280 light |
| p.notification-body "由 truncated-30s.mp4 构成：保留了 30秒钟 中的 21秒钟 | cannot-determine | worst 50 chars (16 CJK, 34 Latin), widest 438 of 448 px; "由 truncated-30s.mp4 构成：保留了 30秒钟 中的 21秒钟，从 0:00.0 到" | mixed scripts: each character against 40 and CJK 40 plus Latin 80 disagree; the reading is VH-173's | 1: S-64 zh-Hans w1280 light |
| p#feedback-status.status "您的消息过长，无法直接交给电子邮件应用。请选择“复制消息和详细信息” | cannot-determine | worst 45 chars (19 CJK, 26 Latin), widest 439 of 448 px; "息”，然后将其粘贴到发送至joe.bell@nottingham.ac.uk的电子邮件中。" | mixed scripts: each character against 40 and CJK 40 plus Latin 80 disagree; the reading is VH-173's | 1: S-79a zh-Hans w1280 light |
| p#feedback-status.status "您的电子邮件应用程序应该已经打开，邮件内容也已准备就绪，可以发送了。 | cannot-determine | worst 45 chars (19 CJK, 26 Latin), widest 448 of 448 px; "joe.bell@nottingham.ac.uk的电子邮件中。 部分详细信息无法放入邮件" | mixed scripts: each character against 40 and CJK 40 plus Latin 80 disagree; the reading is VH-173's | 1: S-79b zh-Hans w1280 light |
| p#feedback-status.status "已复制。请将其粘贴到发送至joe.bell@nottingham.a | cannot-determine | worst 45 chars (20 CJK, 25 Latin), widest 445 of 448 px; "已复制。请将其粘贴到发送至joe.bell@nottingham.ac.uk的电子邮件中。" | mixed scripts: each character against 40 and CJK 40 plus Latin 80 disagree; the reading is VH-173's | 1: S-80a zh-Hans w1280 light |
| p#submission-card-ids-error.field-error "“999999999999999999 | cannot-determine | worst 52 chars (7 CJK, 45 Latin), widest 445 of 448 px; "99999999999999999999999999999999999999999999”不是学号。" | mixed scripts: each character against 40 and CJK 40 plus Latin 80 disagree; the reading is VH-173's | 1: S-ID1 zh-Hans w1280 light |

