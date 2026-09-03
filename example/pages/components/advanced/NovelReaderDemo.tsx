/**
 * NovelReader 小说阅读器
 * 严格复刻 uview-plus pages/componentsD/novelReader/novelReader.nvue
 */
import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { UPNovelReader } from 'ultra-ui-rn';
import type { NovelChapter, NovelProgress, NovelReaderSettings } from 'ultra-ui-rn/src/components/novel-reader';

const createParagraph = (title: string, body: string) => `${title}。${body} ${body}`;

const CHAPTERS: NovelChapter[] = [
  {
    content: [
      createParagraph('清晨的雾还没有散去', '山城的邮差已经沿着石阶向上走'),
      '他把一封没有署名的信放在门檐下，信纸上只有一句话：请在月亮升起以前，去旧车站等我。',
      '林砚读完信，抬头看见屋后的远山像一排沉默的屏风。这个季节少有人来，旧车站也早已停运多年。',
      '他收好信纸，带上手电和一件薄外套。院门外的风从峡谷里吹来，带着潮湿的草木气息。',
      '下山的路比记忆中更长，沿途的店铺都还关着门，只有河面上浮着一层微光，像有人提前点亮了夜色。',
    ].join('\n'),
    id: 'chapter-1',
    title: '第一章 远山来信',
  },
  {
    content: [
      '旧车站藏在杉树林后面，站牌上的字已经被雨水冲淡。林砚推开铁门时，门轴发出一声长久的叹息。',
      '候车室里没有灯，墙上的时钟停在十七点三十二分。长椅上积着灰尘，却留有一小块刚刚被擦拭过的地方。',
      '他按照信上的时间等候，远处的铁轨始终没有传来声响。直到月亮越过屋顶，一束车灯突然穿过树林。',
      '那不是普通的列车，车厢没有编号，窗户里也看不见乘客。车门打开后，里面传出熟悉的铃声。',
      '林砚想起许多年前失踪的父亲，也想起父亲离开那天说过的话：有些路只能走一遍。',
    ].join('\n'),
    id: 'chapter-2',
    title: '第二章 旧车站',
  },
  {
    content: [
      '列车驶入河谷后，窗外的景色开始倒退。山壁上的树木像一排排翻动的书页，重复着从未改变的季节。',
      '林砚在车厢尽头找到一张木桌，桌上摆着一本旧笔记。第一页写着他的名字，日期却是二十年前。',
      '笔记记录了父亲寻找星门的过程，也记录了每次经过河谷时听见的回声。那些回声总会回答尚未问出口的问题。',
      '当列车停在无名隧道前，车厢里的铃声再次响起。林砚合上笔记，决定沿着铁轨走进黑暗。',
      '隧道深处传来水滴声，他打开手电，发现墙上刻着一串方向相反的箭头，尽头写着：不要相信回声。',
    ].join('\n'),
    id: 'chapter-3',
    title: '第三章 河谷回声',
  },
  {
    content: [
      '隧道另一端是一间没有门窗的石室。石室中央放着一张桌子，桌上摊开的书册没有任何文字。',
      '林砚伸手触碰书页，空白上浮现出一行新的字迹。那是他刚才在车站没有说出口的疑问。',
      '每当他读完一页，下一页便会出现一段记忆。记忆中的父亲站在月台上，身旁还有一个年幼的林砚。',
      '原来那封信不是从远方寄来，而是从他一直不愿回想的那一天寄来。时间在石室里没有方向。',
      '他终于明白，所谓星门并不是通往别处的门，而是一条允许人重新面对选择的路。',
    ].join('\n'),
    id: 'chapter-4',
    title: '第四章 无字之页',
  },
  {
    content: '',
    id: 'chapter-5',
    title: '第五章 空白章节',
  },
  {
    content: '这一章将在完成前置阅读后解锁。',
    id: 'chapter-6',
    title: '第六章 尚未解锁',
  },
];

export default function NovelReaderDemo() {
  const [currentChapter, setCurrentChapter] = useState<NovelChapter>(CHAPTERS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message?: string } | null>(null);
  const [progress, setProgress] = useState<NovelProgress>({
    chapterIndex: 0,
    offset: 0,
    paragraphIndex: 0,
  });
  const [settings, setSettings] = useState<NovelReaderSettings>({
    animation: true,
    contentWidth: '92%',
    fontFamily: 'system',
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 1.8,
    paragraphSpacing: 16,
    theme: 'day',
  });
  const requestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChapterRequest = (payload: { chapterIndex: number; chapter: NovelChapter }) => {
    const target = CHAPTERS[payload.chapterIndex];
    if (!target || loading) return;

    setLoading(true);
    setError(null);
    if (requestTimer.current) clearTimeout(requestTimer.current);
    requestTimer.current = setTimeout(() => {
      try {
        setCurrentChapter(target);
        setProgress({
          chapterIndex: payload.chapterIndex,
          offset: 0,
          paragraphIndex: 0,
        });
      } catch (requestError) {
        setError(requestError as { message?: string });
      } finally {
        setLoading(false);
      }
    }, 240);
  };

  const handleChapterPrefetch = (payload: { chapterIndex: number }) => {
    // Prefetch logic - in upstream this would fetch data
    return CHAPTERS[payload.chapterIndex];
  };

  const handleProgressChange = (value: NovelProgress) => {
    setProgress(value);
  };

  const handleSettingsChange = (value: NovelReaderSettings) => {
    setSettings(value);
  };

  const handleRetry = (payload: { chapterIndex: number }) => {
    setError(null);
    handleChapterRequest({ chapterIndex: payload.chapterIndex, chapter: CHAPTERS[payload.chapterIndex] });
  };

  React.useEffect(() => {
    return () => {
      if (requestTimer.current) clearTimeout(requestTimer.current);
    };
  }, []);

  return (
    <View style={s.novelReaderDemo}>
      <UPNovelReader
        bookId="demo-novel"
        chapters={CHAPTERS}
        currentChapter={currentChapter}
        error={error}
        loading={loading}
        mode="scroll"
        progress={progress}
        settings={settings}
        onChapterPrefetch={handleChapterPrefetch}
        onChapterRequest={handleChapterRequest}
        onProgressChange={handleProgressChange}
        onRetry={handleRetry}
        onSettingsChange={handleSettingsChange}
      />
      {/* // Upstream has toolbar-extra slot with mode toggle, but local component does not support children/slots */}
    </View>
  );
}

const s = StyleSheet.create({
  novelReaderDemo: { flex: 1, height: '100%', overflow: 'hidden', width: '100%' },
});
