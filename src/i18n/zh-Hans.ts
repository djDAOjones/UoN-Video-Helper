/**
 * Every string the page can show (VH-105), from the "Chinese (Simplified)"
 * column of the filled translator's sheet:
 *
 *   reviews/2026-10-18/VH-105-strings-filled.csv
 *
 * Written by `scripts/strings-table.mjs`: change the sheet and regenerate,
 * never this file. Machine translation, with the agent's repairs listed in
 * the sheet's last column, until a native-speaking reviewer signs it off.
 */

import type { Messages } from './index'

export const zhHans: Messages = {
  meta: {
    locale: 'zh-Hans',
    durationList: 'narrow',
    separators: {
      list: '，',
      series: '；',
      sentences: '',
    },
  },
  app: {
    title: 'UoN 视频助手',
    description:
      '在视频中添加经诺丁汉大学批准的品牌标识和一致的音频电平，即可获得优化后的文件，而无需将其上传到任何地方。',
    skipLink: '跳至内容',
  },
  language: {
    label: '页面语言',
    switched: '页面语言：{name}。',
    machine: {
      title: '机器翻译',
      text: '本页面由机器从英文翻译而来，部分措辞可能有误。',
      link: '发送电子邮件至 {address}，提出更好的措辞',
    },
  },
  lede: {
    intro: '此工具对您的视频执行以下操作：',
    promises: ['添加已批准的品牌标识。', '确保音量稳定。', '输出优化后的文件类型和大小。'],
    privacy: '您的视频在您的设备上进行处理，不会上传，原始文件也不会改变。',
  },
  browserNote: {
    pending: '此工具专为 Chrome 浏览器设计和构建，因此其他浏览器可能无法正常运行。',
    notPassed:
      '此工具专为 Chrome 浏览器设计和构建，但此浏览器尚未通过运行此工具所需的全部检查。页面底部的系统检查信息显示了缺失的功能。',
    passed: '此工具专为 Chrome 浏览器设计和构建，且此浏览器已通过运行此工具所需的检查。',
  },
  videoKind: {
    label: '视频类型',
    options: {
      staff: '教职员工视频',
      submission: '学生提交作品',
    },
    result: {
      staff: '由您选择结尾图形，以及是否显示“{words}”。',
      submission: '如果视频有结尾图形，图形会显示“{words}”。',
    },
  },
  videoLanguage: {
    label: '视频语言',
    helper: '工具添加到视频中的文字使用此语言。',
    typed: '您输入的内容将按原样保留。',
    nextVideo: '对视频类型或视频语言的更改将用于您制作的下一个视频。',
  },
  steps: {
    choose: '选择一个视频',
    trim: '修剪',
    titleCard: '标题卡',
    closing: '结尾品牌标识',
    preset: '文件大小/质量',
    create: '制作',
  },
  choose: {
    starting: '正在检查此浏览器能否运行本工具……',
    dropHint: '或者把它拖放到这里。',
    dropHeld: '松开即可读取此视频。',
    reading: '正在读取视频……',
    drop: {
      making: '正在制作视频。请取消当前视频，或等待制作完成后再选择其他视频。',
      saving: '视频正在保存。请停止保存或等待保存完成后再选择其他视频。',
      starting: '工具仍在准备中。请稍后再次拖放视频。',
      unavailable: '此浏览器无法运行该工具，因此无法在此处读取视频。以下消息说明了解决方法。',
      nothing: '没有拖放任何可读取的内容。请拖放一个视频文件。',
      several: '那总共有{count}个文件。一次拖放一个视频。',
      notVideo:
        '那不是视频文件。请拖放一个视频文件，例如文件名以 .mp4 或 .mov 结尾的文件，或者在上方选择一个。',
    },
  },
  source: {
    readSummary: '视频已读取。',
    noSound: '没有音频。',
    properties: '视频属性',
    lossesTitle: '未导入新文件',
    rows: {
      duration: '时长',
      videoFormat: '视频格式',
      fileSize: '文件大小',
      resolution: '分辨率',
      frameRate: '帧率',
      soundFormat: '音频格式',
      soundChannels: '音频声道',
      sampleRate: '音频采样率',
      sound: '音频',
      captions: '字幕',
      fileType: '文件类型',
    },
    cannotDecodeVideo: '此浏览器无法读取此视频格式。',
    cannotDecodeAudio: '此浏览器无法读取此音频格式。',
    rotated: '旋转了{degrees}°。输出结果将保持竖直状态。',
    variesOnAverage: '平均 {rate}，但会有波动',
    variesNote:
      'Teams、Zoom 和屏幕录制的录像帧率通常会波动。输出文件将采用稳定的帧速率，以确保音频和画面同步。',
    outputRate: '输出将以 {rate} 速率运行，因此某些帧将会重复。',
    sampleRate: '{kilohertz} kHz — 每秒 {hertz} 次采样',
    noSoundTrack: '未找到音轨',
    noSoundNote: '音量调整需要音频。其他工作照常进行。',
    captionsUnchecked: '无法在此类文件中进行检查',
    captionsFound: '已找到 {found}',
    captionsNone: '此文件中未找到任何内容',
    captionTracks: {
      one: '{count} 条字幕轨道',
      other: '{count} 条字幕轨道',
    },
    chapterTracks: {
      one: '{count} 条章节轨道',
      other: '{count} 条章节轨道',
    },
    moreVideoTracks: {
      one: '另外 {count} 条视频轨道',
      other: '另外 {count} 条视频轨道',
    },
    moreSoundTracks: {
      one: '另外 {count} 条音轨',
      other: '另外 {count} 条音轨',
    },
    losses: {
      extraTracksTitle: '此文件包含{found}',
      extraTracksDetail:
        '新文件将保留一个画面和一个音轨——即视频属性中列出的那些。其他画面和音轨将不会被保留，其中一个可能包含备选方案，例如其他语言或音频描述。如果您需要这些备选方案，请将原始文件与新文件一起保留。',
      uncheckedTitle: '无法检查字幕和章节轨道',
      uncheckedDetail:
        '此类文件无法检查是否包含字幕轨道或章节轨道。如果您的文件包含这些轨道，它们不会被保留。',
      captionsConsequence:
        '新文件将不包含字幕轨道，因此字幕必须由您发布视频的平台提供。EchoVideo 会在上传后自动生成字幕，因此请检查这些字幕。如果您直接发送文件，请自行添加字幕。绘制在画面中的字幕将保留。',
      chaptersConsequence: '新文件中将不会包含章节内容。',
      keepOriginals: '如果需要原始轨道，请将此文件与新文件一起保留。',
    },
  },
  trim: {
    intro:
      '可选。您可以剪掉开头或结尾不需要的内容。如果不进行任何操作，则会保留整个视频。预览会按原样播放您的原始视频，因为调整音量和添加结尾图形都是在制作视频时进行的。',
    noPreview: '此文件没有预览功能。您仍然可以设置时间。',
    start: '开始',
    end: '结尾',
    startTime: '开始时间',
    endTime: '结束时间',
    setStart: '将开始设在此处',
    setEnd: '将结束设在此处',
    format: '分钟和秒，例如 1:05.5，或者秒，例如 65.5。',
    useWhole: '使用完整视频',
    reading: '正在读取视频……',
    unreadable: '没有视频可供剪辑，因为无法读取该文件。',
    tooShort: '它比 {seconds} 秒短，因此不能进行裁剪。',
    keepingWhole: '保留整个视频，{duration}。',
    keeping: '保留 {duration} 中的 {kept}。',
    handleBeginning: '开始',
    handleEnd: '结束',
    problem: {
      notATime: {
        start: '开始时间以分钟和秒的形式写出，例如 1:05.5，或者以秒的形式写出，例如 65.5。',
        end: '将结束时间写成分钟和秒，例如 1:05.5，或者只写秒，例如 65.5。',
      },
      afterEnd: {
        start: '开始时间在视频结束后，视频时长为 {length}。',
        end: '结束时间在视频结束后，视频时长为 {length}。',
      },
      notTimes: '无法将开始时间或结束时间识别为时间。',
      startAfterEnd: '开头在视频结尾之后。',
      endBeforeStart: '结束必须在开始之后。',
      keepAtLeast: '至少保留 {seconds} 秒的视频。',
    },
    correctToContinue: '在步骤 2 中更正开始时间和结束时间，即可继续。',
  },
  titleCard: {
    legend: '标题卡',
    intro: '在视频开始前显示 {seconds} 秒的卡片，蓝底白字。',
    add: '添加标题卡',
    title: '标题',
    department: '院系',
    authors: '作者',
    date: '日期',
    dateHelper: '已填入以视频语言显示的今天日期。',
    dateHelperNext: '您可以更改或清除它。',
    forSubmission: '学生提交作品始终带有标题卡。',
    fieldsRule: '请填写标题、院系或作者，即可制作卡片。',
    fieldsRuleNext: '日期已为您填好。',
    full: '此字段已满，其余内容未添加。',
    refused: {
      field: '内容太长，无法放入卡片。请缩短。',
      card: '这些字段合起来太长，无法放入卡片。请缩短此字段或其他字段。',
    },
    empty: '请填写标题、院系或作者，或取消勾选“添加标题卡”。',
    correctToContinue: '在步骤 3 中更正标题卡，即可继续。',
    submission: {
      fieldsRule: '四个字段都必须填写。',
      assignment: '作业标题或编号',
      module: '模块代码和名称',
      convenor: '模块负责人或导师',
      ids: '学号',
      idsHelper: '每个学号（学生身份编号）为 {digits} 位数字。',
      idsHelperNext: '最多输入 {max} 个，用空格、逗号或换行分隔。请勿填写姓名。',
      filled: '卡片上还会显示时长 {running} 和今天的日期，并注明这是卡片制作日期，而非提交日期。',
      missing: {
        assignment: '请输入作业标题或编号。',
        module: '请输入模块代码和名称。',
        convenor: '请输入模块负责人或导师的姓名。',
        ids: '请至少输入一个学号。',
      },
      idNotAnId: '“{id}”不是学号。学号为 {digits} 位数字。',
      idTwice: '{id} 在列表中出现了两次。请删除一个。',
      idsTooMany: '这里有 {count} 个学号。卡片最多可容纳 {max} 个。',
    },
    card: {
      module: '模块',
      convenor: '模块负责人或导师',
      ids: {
        one: '学号',
        other: '学号',
      },
      running: '时长',
      made: '卡片制作日期',
      madeValue: '{date}（非提交日期）',
    },
  },
  closing: {
    legend: '结尾品牌标识',
    typeLabel: '动画类型',
    types: {
      cut: '切',
      fade: '淡入',
      slide: '滑动',
      none: '无',
    },
    onsetLabel: '动画起始方式',
    onsets: {
      existing: '覆盖现有画面',
      freeze: '覆盖生成的定格画面',
    },
    helpLabel: '关于动画起始方式',
    helpExistingTerm: '覆盖现有画面',
    helpExistingText: '— 结尾图形会在视频的最后一秒上播放，并在逐渐出现的过程中覆盖这一秒。',
    helpFreezeTerm: '覆盖生成的定格画面',
    helpFreezeText:
      '— 最后一帧画面会额外停留一秒钟。结尾图形会覆盖这一秒，所以视频中的所有内容都不会被遮挡。',
    colourLabel: '颜色',
    colours: {
      blue: '蓝色的',
      white: '白色的',
    },
    internalLabel: '仅供内部使用',
    internalWords: '仅供内部使用',
    notUsedWith: {
      cut: '不与“切”一起使用。',
      none: '不与“无”一起使用。',
    },
    internalForSubmission: '学生提交作品始终启用。',
    result: {
      none: '不会添加大学结尾图形。',
      adds: {
        one: '增加 {count} 秒。',
        other: '增加 {count} 秒。',
      },
      internal: '卡片会在标志下方显示“{words}”。',
      cut: {
        blue: '视频切换到蓝色结束卡。{adds}',
        white: '视频切换到白色结束卡。{adds}',
      },
      overFreeze: {
        blue: {
          fade: '在蓝色结尾图形淡入时，最后一帧画面会保持静止，所以不会遮挡任何内容。{adds}',
          slide: '在蓝色结尾图形滑入时，最后一帧画面会被保留，所以不会遮挡任何内容。{adds}',
        },
        white: {
          fade: '最后一帧画面会在白色结尾图形淡入时保持静止，所以不会遮挡任何内容。{adds}',
          slide: '最后一帧画面保持静止，同时白色结尾图形滑入，因此不会遮挡任何内容。{adds}',
        },
      },
      overPicture: {
        blue: {
          fade: '蓝色的结尾图形在视频最后一秒逐渐淡入，最终覆盖住视频内容。{adds}',
          slide: '蓝色的结尾图形在视频最后一秒滑入并覆盖住画面。{adds}',
        },
        white: {
          fade: '白色结尾图形逐渐淡入，覆盖了视频的最后一秒。{adds}',
          slide: '白色结尾图形在视频最后一秒滑入并覆盖住画面。{adds}',
        },
      },
    },
  },
  preset: {
    legend: '文件大小/质量',
    labels: {
      best: '更大/更好',
      smaller: '更小/减少',
    },
    details: {
      best: '例如 EchoVideo 或 YouTube 等。',
      smaller: '适用于上传到 Moodle 作业、通过即时消息或电子邮件发送等。',
    },
  },
  create: {
    lockedStopping: '任务停止过程中已锁定。',
    note: '制作完成的视频会一直显示在这里，直到您开始制作另一个视频或关闭此标签页。请在此之前保存。',
    announceProgress: '播报进度',
    announceHelp: '视频制作过程中，会为屏幕阅读器大声朗读每个阶段。最终结果总会播报。',
    progressLabel: '制作你的视频',
    create: '制作视频',
    cancel: '取消',
    continueAnyway: '继续',
    stopCheck: '停止检查',
    checkAgain: '再次检查',
    stopSaving: '停止保存',
    save: '保存视频',
    saved: '已保存',
    discard: '扔掉它，重新开始',
    keep: '留着它',
    lockedMaking: '视频制作期间已锁定。',
    lockedSaving: '视频保存期间已锁定。',
  },
  status: {
    saveFailedNext: '您可以再次尝试保存。',
    saveFailedWhat: '视频保存失败。',
    stoppingAfterFailure: '任务正在停止。请稍候再试。',
    checking: '正在将此视频与您的设备进行比对……',
    checkStopped: '检查已停止。',
    stoppingSave: '正在停止保存……',
    cancelling: '正在取消……',
    cancelled: '已取消。未保存任何内容，您的原始文件保持不变。',
    saving: '正在保存……',
    saveStopped: '保存已停止。视频仍在这里，您随时可以保存。',
    notSaved: '未保存。视频仍在这里，您随时可以保存。',
    refusedSource:
      '这就是您最初使用的文件。请选择不同的名称或文件夹，因为此工具绝不会更改您的原始文件。',
    saved:
      '已保存。请打开保存的文件进行检查，然后将其上传到您要使用的地方，或者在步骤 1 中选择另一个视频。',
    storageWayOut: '减少视频长度，选择“{smaller}”，或者释放一些空间，然后按“再次检查”。',
    creating: '正在制作视频。{notice}',
    ready: '您的视频已准备就绪。',
    couldNotCreate: '视频无法制作。{sentence}',
    verdictSpoken: '设备检查完成。{heading}。',
  },
  discard: {
    title: '此视频尚未保存',
    delivered: '您的下载可能仍在进行中。重新开始将会丢弃您刚刚制作的视频。',
    unsaved: '您尚未保存刚刚制作的视频。重新开始将会丢弃该视频。',
    spoken: '此视频尚未保存。{question}',
  },
  result: {
    finished: '完成的视频 — {size}',
    previous: '上一个视频 — {size}',
    lifetime: '视频尚未保存。它会一直显示在这里，直到您开始制作另一个视频或关闭此标签页。',
    lifetimeDelivered: '它会一直显示在这里，直到你开始制作另一个视频或关闭此标签页。',
    keptWhole: '完整视频（{duration}）',
    keptPart: '保留了 {duration} 中的 {kept}，从 {from} 到 {to}',
    closingNone: '无大学结尾图形',
    closingInternal: '{closing}，并标注“{words}”',
    closingCut: {
      blue: '镜头切换到蓝色结束卡',
      white: '切到白色结束卡',
    },
    closingOverFreeze: {
      blue: {
        fade: '蓝色的结尾图形逐渐淡入，覆盖了最后一帧画面',
        slide: '蓝色的结尾图形滑入到最后一帧画面上方',
      },
      white: {
        fade: '白色结尾图形逐渐淡入，覆盖了最后一帧',
        slide: '白色结尾图形滑入到最后一帧上方',
      },
    },
    closingOverPicture: {
      blue: {
        fade: '蓝色的结尾图形逐渐淡入，覆盖画面',
        slide: '蓝色的结尾图形滑入画面上方',
      },
      white: {
        fade: '白色结尾图形逐渐淡入画面',
        slide: '白色结尾图形滑入画面上方',
      },
    },
    summary: '由 {name} 构成：{part}、{output}、{closing}。',
    summaryWithCard: {
      staff: '由 {name} 构成：{seconds} 秒的教职员工标题卡，随后是{part}、{output}、{closing}。',
      submission:
        '由 {name} 构成：{seconds} 秒的学生提交作品卡，随后是{part}、{output}、{closing}。',
    },
    videoLanguage: '视频语言：{language}。',
    notLoaded: '由于结尾图形无法加载，因此未包含在视频中。其他所有步骤均已按要求完成。',
    endedEarly: {
      picture: '您选择的文件提前结束。画面在{stops}处停止，而全长应为{end}。',
      sound: '您选择的文件提前结束。音频在{stops}处停止，而全长应为{end}。',
      together: '您选择的文件提前结束。画面和音频在{stops}处停止，而全长应为{end}。',
      both: '您选择的文件提前结束。画面在{picture}处停止，音频在{sound}处停止，而全长应为{end}。',
      held: '从那里到结尾图形，视频会一直停留在最后一帧画面。',
      next: '如果您有完整的副本，请用它重新制作视频。',
    },
    fellBackToCut: {
      blue: {
        fade: '您选择了“淡入”，但动画无法加载，因此视频将切换到蓝色结束卡片。',
        slide: '您选择了“滑动”，但动画无法加载，因此视频将切换到蓝色结束卡片。',
      },
      white: {
        fade: '您选择了“淡入”，但动画无法加载，因此视频将切换到白色结束卡片。',
        slide: '您选择了“滑动”，但动画无法加载，因此视频将切换到白色结束卡片。',
      },
    },
    fellBackToFreeze: {
      blue: {
        fade: '您的视频时长短于淡入淡出动画。蓝色结尾图形是在保留的最后一帧上淡入，而不是在画面上淡入。',
        slide: '您的视频比滑动动画短。蓝色的结尾图形不是覆盖在图片上，而是覆盖在最后一帧画面上。',
      },
      white: {
        fade: '您的视频时长短于淡入淡出动画。白色结尾图形淡入淡出效果是在最后一帧画面上叠加，而不是在原画面上叠加。',
        slide: '您的视频比滑动动画短。白色的结尾图形不是覆盖在图片上，而是覆盖在最后一帧画面上。',
      },
    },
    fellBackToPicture: {
      blue: {
        fade: '蓝色的结尾图形会淡入画面，而不是像选择的那样淡入最后一帧画面。',
        slide: '蓝色的结尾图形会滑入画面上方，而不是像选择的那样滑入保留的最后一帧上方。',
      },
      white: {
        fade: '白色结尾图形会淡入画面，而不是像选择的那样淡入最后一帧画面。',
        slide: '白色结尾图形会滑入画面上方，而不是像选择的那样滑入保留的最后一帧上方。',
      },
    },
  },
  progress: {
    stages: {
      preparing: '准备中',
      analysing: '分析音频',
      encoding: '视频编码',
      finishing: '完成文件',
      checking: '检查文件',
    },
    milestones: ['完成四分之一', '完成一半', '已完成四分之三'],
    stagePercent: '{stage} — {percent}',
    stageMilestone: '{stage} — {milestone}',
    timeLeft: '大约还剩{time}',
    fewSecondsLeft: '还剩几秒钟',
    withTimeLeft: '{progress}。{left}',
    job: '此视频：{kind}。视频语言：{language}。',
    ready: '准备好',
    title: {
      stage: '{stage} — {app}',
      ready: '准备就绪 — {app}',
      failed: '未制作 — {app}',
      cancelled: '已取消 — {app}',
    },
    jobNotice: '视频制作过程中，请保持此标签页可见且电脑处于唤醒状态。关闭标签页即结束任务。',
  },
  preflight: {
    headings: {
      proceed: '准备就绪',
      warn: '准备好了，只需知道一件事',
      warnSeveral: {
        '2': '准备好了，有两件事需要了解',
        '3': '准备好了，以下三件事你需要知道',
        '4': '准备好了，以下四件事你需要知道',
        '5': '准备好了，以下五件事你需要知道',
        '6': '准备好了，以下六件事你需要知道',
        other: '准备好了，有{count}件你需要知道的事情',
      },
      discourage: '这样做可行，但速度会很慢',
      mobile: '这可能无法在手机或平板电脑上完成',
      block: '无法在此处运行',
    },
    tryChrome: '本工具专为电脑上的 Chrome 浏览器而设计——请在 Chrome 浏览器上尝试使用。',
    chromeLacks:
      '此 Chrome 浏览器版本可能已过期，或者此计算机上的某个设置可能已关闭此功能。请更新 Chrome 浏览器，或咨询计算机管理员。',
    reasons: {
      noWebCodecs: '此浏览器无法处理视频。{remedy}',
      noAacEncodeHere: '此浏览器无法为视频文件添加音频。{remedy}',
      noAacEncodeElsewhere:
        '此浏览器无法为视频文件添加音频。{remedy} Firefox 可以播放视频，但无法创建所需的音频。',
      noH264Encode: '此浏览器无法创建此工具所需的视频格式。{remedy}',
      noSourceDecodeHere:
        '此浏览器无法读取此文件中的图片或音频。该文件可能以编辑软件专用格式保存。请将其重新导出为 MP4 格式（文件名以 .mp4 结尾），然后选择该文件。',
      noSourceDecodeElsewhere:
        '此浏览器无法读取此文件中的图片或音频。{remedy} 如果也无法打开，则该文件可能以编辑软件专用格式保存。请将其重新导出为 MP4 格式——文件名以 .mp4 结尾的文件。',
      noOpfsHere:
        '此浏览器无法为该工具提供制作视频所需的空间。如果您使用隐私浏览模式，通常使用普通窗口即可；否则，可能是此计算机上的某个设置阻止了网站存储——请咨询管理员。',
      noOpfsElsewhere:
        '此浏览器无法为工具提供制作视频所需的空间。{remedy} 如果您使用隐私浏览模式，通常使用普通窗口即可。',
      insecureContext:
        '此页面需要安全连接才能处理您的视频。请使用 https:// 地址打开，如果您自行运行，则请使用 localhost。',
      insufficientStorageResolvable:
        '此设备上的可用空间不足。此作业需要大约 {size} 的工作空间。请释放一些空间后重试，或保留更少的视频内容，或选择 {smaller}。',
      insufficientStorage:
        '此设备上的可用空间不足。此作业需要大约 {size} 的工作空间。请释放一些空间后重试。',
      storageUnknown:
        '此浏览器不会显示剩余空间。如果空间不足，任务将停止，且不会保存任何内容。您的原始文件不受影响。',
      veryLongJob: '这大约需要{time}。您可以继续操作，但使用台式电脑会快得多。',
      veryLongJobUnknown: '这将花费很长时间。你可以继续操作，但使用台式电脑会快得多。',
      longJob: '这大约需要{time}。任务运行期间请保持此标签页打开，因为关闭标签页会停止任务。',
      longJobUnknown: '这需要一些时间。任务运行期间请保持此标签页打开，因为关闭标签页会停止任务。',
      mobileDevice:
        '手机和平板电脑处理这类任务的速度远比电脑慢，而且浏览器可能会为了释放内存而中途终止任务。如果可以，请使用电脑。',
      estimateUnavailable: '我们无法确定这台设备需要多长时间才能完成。您可以继续操作。',
    },
    shouldTake: '这大约需要{time}。',
    shouldTakeFewSeconds: '这应该只需要几秒钟。',
    sizeUpTo: '预计大小最大可达{size}。',
    sameSize: '您的视频已经按照此设置进行了最大程度的压缩，因此新文件的大小将大致相同。',
    slides:
      '这看起来像是幻灯片或屏幕录像，所以文件大小会进一步缩小。如果主要是摄像机拍摄的视频，请选择{best}。',
  },
  warnings: {
    soundHeading: '值得了解的音频特性',
    finishedHeading: '关于最终视频值得了解的事项',
    reassurance: '这些都不会阻止您继续操作。您的原始文件也不会因此而改变。',
    spoken: '{heading}：{titles}。',
    endsEarly: {
      heading: '文件提前结束',
      detail:
        '音频在{stops}处停止，而全长应为{end}。文件可能在复制或录制时被中断。{stops}之后，新视频将没有声音。如果您有完整的副本，请改为选择该副本。',
    },
    cutShort: {
      heading: '视频文件比预期短',
      detail:
        '文件可能在复制或录制时被中断。请在使用前检查新视频。如果您有完整的副本，请改为选择该副本。',
    },
    noAudio: {
      heading: '这段视频没有音频',
      detail:
        '由于没有需要调节音量的音频，所以后续工作将在没有音频的情况下进行。如果您需要音频，请在发布前检查录音。',
    },
    decodeDamage: {
      heading: {
        one: '一处损坏的片段将被静音',
        other: '多处损坏的片段将被静音',
      },
      detail: {
        one: '在原始视频的{times}处，文件中有一段噪声，响度超出未损坏的音频可能达到的水平。它来自文件本身的损坏，而不是您的视频。这不到一秒的片段将改为静音，因此没有人会听到它，电平调整也仍能正常进行。',
        other:
          '在原始视频的{times}处，文件中有几段噪声，响度超出未损坏的音频可能达到的水平。它们来自文件本身的损坏，而不是您的视频。每段不到一秒的片段都将改为静音，因此没有人会听到它们，电平调整也仍能正常进行。',
      },
      more: {
        one: '另外 {count} 处',
        other: '另外 {count} 处',
      },
    },
    clipping: {
      heading: '音频某些地方可能会失真',
      detail:
        '录音通常会达到最大音量，因此部分音频可能会出现削波失真。这通常意味着麦克风的音量设置过高。虽然电平调整仍在进行，但录音中已存在的失真无法消除。',
    },
    veryQuiet: {
      heading: '这段录音声音很小',
      detail:
        '音量远低于舒适的聆听水平。电平调整会提高它的音量，但提高轻声说话的音量也会同时提高房间里录下的其他声音。',
    },
    highlyVariable: {
      heading: '音量变化很大',
      detail:
        '音量最大和最小的部分相距甚远。音量校正会逐渐修正缓慢的偏差，速度慢到人耳无法察觉，但句子之间突然出现的差异仍然存在。',
    },
    noisy: {
      heading: '可能存在背景噪音',
      detail:
        '即使最安静的时刻也难免会有一些声音——风扇声、空调声，或是嘈杂的房间声。这个工具并不能消除噪音，而且提高语音音量也会使背景噪音增大。',
    },
    extendedSilence: {
      heading: '有一段漫长的寂静时期',
      detail:
        '在一段连续的录音中，大约有{duration}的近乎静音的时间。如果这是有意为之，则没有问题。如果不是，建议在发布前检查一下录音。',
    },
    targetMissed: {
      heading: '最终的音量还没有完全达到通常的水平',
      detail: '视频播放没问题；只是听起来可能比用这个工具调音的其他视频略微安静或响亮一些。',
    },
    metadataLost: {
      heading: '无法复制文件的标题、作者和日期',
      detail:
        '图片和音频不受影响。如果您的原文件包含标题、作者或日期，新文件中将不会包含这些信息。您仍然可以在上传文件时自行添加。',
    },
  },
  announce: {
    lossesCount: {
      '1': '关于新文件的内容，需要了解一点。',
      '2': '关于新文件的内容，有两件事需要了解。',
      '3': '关于新文件的内容，你需要了解三件事。',
      '4': '关于新文件的内容，你需要了解以下四点。',
      other: '关于新文件的内容，你需要了解的{count}件事。',
    },
    lossSaid: '{title}。{detail}',
  },
  failure: {
    originalUnchanged: '您的原始文件未被更改。',
    unreadable: {
      what: '此文件无法作为视频读取。',
      notAVideo:
        '此文件无法作为视频读取。它可能不是视频文件，也可能已损坏。视频文件的名称通常以 .mp4、.mov、.mkv 或 .webm 结尾。',
      soundOnly:
        '此文件包含音频但没有视频。此工具用于在视频中添加品牌标识，因此需要包含画面的文件。',
      noTracks: '此文件中未找到视频或音频。文件可能不完整，或者保存方式不正确。',
      readError: '读取此文件时出错。文件可能已损坏，或者格式与此工具不兼容。',
      tookTooLong: '读取此文件耗时比预期长，或者该工具遇到了问题。',
      next: '请选择其他文件，或者使用创建该文件的应用程序将其另存为文件名以 .mp4 结尾的文件。',
    },
    badTrim: {
      what: '开始时间和结束时间无法使用。',
      next: '在步骤 2 中更正开始时间和结束时间，然后重试。',
    },
    unlevellable: {
      what: '由于这段录音的音频无法达到正常水平，所以没有制作视频。',
      next: '请使用“发送反馈”按钮报告问题，该按钮会附上有助于解决问题的详细信息。',
    },
    outputLoudness: {
      what: '最终的音频没有达到正常水平，所以视频没有保留。',
    },
    outputPeak: {
      what: '最终的音频在峰值处音量过大，因此视频没有保留。',
    },
    outputUnreadable: {
      what: '由于制作完成的视频无法重新读取，因此没有保存。',
    },
    outOfSpace: {
      what: '该设备运行到一半时工作空间不足了。',
      next: '腾出一些空间，或者选择{smaller}，然后重试。',
    },
    encoderRefused: {
      what: '这个浏览器在视频编码过程中停止了。',
      next: '请尝试“文件大小/质量”下的另一个选项。如果问题再次出现，请使用“发送反馈”按钮报告问题，该按钮会附上有助于解决问题的详细信息。',
    },
    checkFailed: {
      what: '设备检查未完成。',
      next: '点击“再次检查”重新运行一次检查。如果检查仍然失败，请使用“发送反馈”按钮报告问题。',
    },
    timedOut: {
      what: '由于该任务停止报告进度，因此被停止了。',
    },
    titleCardRefused: {
      what: '标题卡的文字无法放入视频，因此视频未制作。',
      next: '在步骤 3 中缩短标题卡的字段，然后重试。',
    },
    unknown: {
      what: '视频制作过程中出现错误。',
    },
    tryAgain:
      '请再试一次。如果问题再次出现，请使用“发送反馈”按钮报告问题，该按钮会附上有助于解决问题的详细信息。',
    startup: {
      insecure: '此页面需要建立安全连接才能处理您的视频。请通过以 https:// 开头的地址打开它。',
      noWebCodecs: '此浏览器无法处理视频，因此该工具无法在此运行。{remedy}',
      noH264: '此浏览器无法创建此工具所需的视频格式，因此该工具无法在此处运行。{remedy}',
      noWorkingStore:
        '此浏览器没有为该工具提供足够的空间来制作视频。如果您使用隐私浏览模式，通常可以使用普通窗口。{remedy}',
      workerNotStarted:
        '执行操作的工具部分未启动。请重新加载页面。如果问题再次出现，请使用“发送反馈”按钮报告问题。',
    },
    captured:
      '工具出现故障。正在制作的视频可能无法完成；您的原始文件不受影响。请使用“报告此问题”按钮报告，该按钮会附上这些详细信息。',
  },
  systemCheck: {
    summary: '系统检查 — {result}',
    results: {
      problems: {
        one: '{count} 个问题',
        other: '{count} 个问题',
      },
      warnings: {
        one: '{count} 个警告',
        other: '{count} 个警告',
      },
      checking: '检查中',
      allPassed: '全部通过',
    },
    marks: {
      pass: '好的',
      fail: '不',
      warn: '!',
      pending: '……',
    },
    rows: {
      secure: '安全连接（存储访问所需）',
      webcodecs: '浏览器中的视频处理（WebCodecs）',
      h264: '该工具生成的视频格式为（H.264）',
      aac: '该工具生成的音频格式（AAC）',
      opfs: '私人工作存储',
      worker: '后台处理',
    },
    values: {
      checking: '检查中',
      available: '可用的',
      notAvailable: '无法使用',
      supported: '支持',
      notSupported: '不支持',
      aacNotSupported: '不支持——此处无法制作带音频的视频',
      failedToStart: '启动失败',
      readyIn: '准备时间：{time}',
      noResponse: '没有回应',
    },
  },
  errors: {
    revealed: '发现问题。请使用“捕获的错误”中的“报告此问题”发送详细信息。',
    heading: '捕获的错误',
    technicalDetails: '技术细节',
    report: '报告此问题',
  },
  feedback: {
    open: '发送反馈',
    heading: '发送反馈',
    intro: '您的邮件将通过您自己的电子邮件应用程序发送到 {address}。您将在邮件发送前看到它。',
    messageLabel: '您的留言',
    writeFirst: '请先写好信息。',
    whatSent: '将随邮件发送的内容',
    whatSentDetail:
      '有助于查找问题的详细信息包括：工具版本、您使用的浏览器、您进行到了哪一步以及视频时长、图像尺寸和格式。这些信息绝不包含视频本身、视频名称或视频中的任何内容。',
    openEmail: '打开电子邮件应用程序',
    copy: '复制消息和详细信息',
    close: '关闭',
    tooLong:
      '您的消息过长，无法直接交给电子邮件应用。请选择“复制消息和详细信息”，然后将其粘贴到发送至{address}的电子邮件中。',
    opened:
      '您的电子邮件应用程序应该已经打开，邮件内容也已准备就绪，可以发送了。如果没有，请选择“复制消息和详细信息”，然后将其粘贴到发送至{address}的电子邮件中。',
    someOmitted: '部分详细信息无法放入邮件中；“复制消息和详细信息”包含全部内容。',
    copied: '已复制。请将其粘贴到发送至{address}的电子邮件中。',
    couldNotCopy: '无法复制。请打开“将随邮件发送的内容”，选择详细信息，然后将其复制到您的邮件中。',
    onlyInCopy: '邮件内容太长，只保存在“复制消息和详细信息”中：',
  },
  statement: {
    heading: '无障碍声明',
    covers: '本声明适用于 UoN 视频助手，即您当前所在的页面。',
    aim: '我们希望尽可能多的人都能使用本工具。您应当能够：',
    abilities: [
      '仅使用键盘操作本工具。',
      '配合屏幕阅读器使用本工具，屏幕阅读器会朗读每个阶段和结果。',
      '将页面放大至 200%，且文字不会超出屏幕。',
      '使用您自己设定的颜色，以及电脑的高对比度模式。',
      '在电脑设置中关闭页面上的动态效果。',
    ],
    plain: '页面用语简明易懂，文字与背景之间对比鲜明。',
    limits: {
      heading: '本工具的无障碍程度',
      intro: '我们知道，本工具有些部分尚未完全实现无障碍：',
      items: [
        '本工具专为电脑上的 Google Chrome 浏览器打造。在其他浏览器中，它可能无法正常运行。',
        '中文和马来文页面由机器翻译而成。我们正在请通晓相应语言的同事核对译文，在核对完成之前，部分用语可能有误。',
        '中文文字使用您电脑自带的中文字体，因此在不同电脑上的显示效果可能有所不同。',
        '预览按原样播放您自己的视频。视频的字幕、口述影像和其他替代内容，以及画面是否闪烁，都取决于您的录制内容。',
        '部分缩写没有写出全称。UoN 是诺丁汉大学（University of Nottingham）的缩写。其他缩写包括文件大小单位，例如 MB 和 GB；以及视频格式名称，例如 H.264 和 AAC。',
      ],
    },
    contact: {
      heading: '反馈与联系方式',
      text: '如果您在使用本工具时发现问题，或需要以其他形式获取其中的信息，请发送电子邮件至 {address} 联系 Joe Bell。',
    },
    enforcement: {
      heading: '执行程序',
      text: '平等与人权委员会（Equality and Human Rights Commission）负责执行无障碍法规。如果您对我们就投诉作出的答复不满意，可以联系{service}寻求帮助。',
      service: '平等咨询与支持服务（Equality Advisory and Support Service，在新标签页中打开）',
    },
    compliance: {
      heading: '合规状态',
      text: '本工具部分符合《Web 内容无障碍指南》（WCAG）2.2 版的 AA 级标准，AA 级是该指南三个级别中的中间一级。这是由于“本工具的无障碍程度”中列出的各项，也因为尚无人使用屏幕阅读器或其他辅助技术测试过本工具。我们的目标是达到最高的 AAA 级。',
    },
    testing: {
      heading: '我们如何测试本工具',
      wave: '我们于{date}使用 WebAIM 推出的网页无障碍评估工具 WAVE 检查了本页面。本页面得分为 10 分（满分 10 分）。',
      automated:
        '每次代码更改时，自动化测试都会检查文字与背景之间的对比度，以及英文用语的阅读难度。',
      manual:
        '在开发过程中，我们还在 Chrome 浏览器中以全部三种语言、按电脑和手机的屏幕宽度对其进行了人工检查。',
    },
    plans: {
      heading: '接下来的测试计划',
      intro: '我们尚未进行以下测试。只有完成这些测试，我们才能说本工具完全符合该指南：',
      items: [
        '仅使用键盘操作本工具。',
        '在 Windows 系统的 Chrome 浏览器中配合 NVDA 屏幕阅读器使用本工具，以及在 Mac 电脑上配合 VoiceOver 使用。',
        '将页面放大至 400%，以及在 320 像素宽的屏幕上使用。',
        '使用 Windows 对比度主题。',
      ],
      optionalIntro: '我们还在考虑：',
      optionalItems: [
        '使用第二种自动化工具，例如 axe 或 Lighthouse。',
        '邀请使用本工具的残障员工参与测试。',
      ],
    },
    about: {
      heading: '关于本声明',
      dates: '本声明撰写于{date}，并已由 Joe Bell 审核。我们将在{reviewDate}之前再次审核本声明。',
    },
  },
  footer: {
    feedbackForm: '填写反馈表（在新标签页中打开）',
    contact: {
      intro: '如需有关本工具的帮助：',
      creators: 'Teams 上的创作团队（在新标签页中打开）',
      learningContent: '发送电子邮件至学习内容团队',
    },
  },
  save: {
    pickerDescription: 'MP4 视频（.mp4）',
    stem: '视频',
    marks: {
      branded: '品牌',
      levelled: '音量已调整',
      converted: '转换',
    },
    fileName: '{stem} ({mark}).mp4',
    downloadIos: '保存到“文件”应用的“下载”文件夹中',
    downloadOther: '保存到您的下载文件夹',
    download:
      '{where} — 浏览器可能仍在处理视频。完成后，将其上传到您要使用的地方，或在步骤 1 中选择另一个视频。',
  },
  format: {
    unknown: '未知',
    lessThanASecond: '不到一秒',
    fewSeconds: '几秒钟',
    frameRate: '每秒 {rate} 帧',
    resolution: '{width} × {height}',
    channels: {
      mono: '单声道（一个声道）',
      stereo: '立体声（双声道）',
      surround51: '5.1环绕声',
      surround71: '7.1环绕声',
      several: '{count} 个声道',
    },
  },
}
