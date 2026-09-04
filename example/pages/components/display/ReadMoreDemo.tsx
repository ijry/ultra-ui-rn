/**
 * ReadMore 展开阅读更多
 * 严格复刻 uview-plus pages/componentsC/readMore/readMore.nvue
 */
import React, { useRef, useState } from 'react';
import { UPParse, UPReadMore, type UPReadMoreRef } from 'ultra-ui-rn';
import { DemoPage, EventLog, PropsTable } from '../_shared';

const PROPS = [
  { prop: 'showHeight', type: 'number | string', default: '400', desc: '内容超出此高度才显示展开全文按钮' },
  { prop: 'toggle', type: 'boolean', default: 'false', desc: '展开后是否显示收起按钮' },
  { prop: 'closeText', type: 'string', default: "'展开阅读全文'", desc: '关闭时的提示文字' },
  { prop: 'openText', type: 'string', default: "'收起'", desc: '展开时的提示文字' },
  { prop: 'color', type: 'string', default: "'#2979ff'", desc: '提示文字的颜色' },
  { prop: 'fontSize', type: 'number | string', default: '14', desc: '提示文字的大小' },
  { prop: 'shadowStyle', type: 'ViewStyle', default: '—', desc: '折叠时按钮区域的样式（RN 无 CSS 渐变遮罩）' },
  { prop: 'textIndent', type: 'string', default: "'2em'", desc: '首行缩进（RN 无对应能力，no-op）' },
  { prop: 'name', type: 'string | number', default: "''", desc: '任意值，事件回调时回传' },
  { prop: 'customStyle', type: 'ViewStyle', default: '—', desc: '定义需要用到的外部样式' },
  { prop: 'onOpen', type: '(name) => void', default: '—', desc: '内容被展开时触发' },
  { prop: 'onClose', type: '(name) => void', default: '—', desc: '内容被收起时触发' },
  { prop: 'ref.init()', type: '() => void', default: '—', desc: '异步内容加载后重新测量高度（上游同名方法）' },
];

const CONTENT = `<p>浔阳江头夜送客，枫叶荻花秋瑟瑟。主人下马客在船，举酒欲饮无管弦。醉不成欢惨将别，别时茫茫江浸月。
忽闻水上琵琶声，主人忘归客不发。寻声暗问弹者谁，琵琶声停欲语迟。移船相近邀相见，添酒回灯重开宴。千呼万唤始出来，犹抱琵琶半遮面。转轴拨弦三两声，未成曲调先有情。弦弦掩抑声声思，似诉平生不得志。低眉信手续续弹，说尽心中无限事。轻拢慢捻抹复挑，初为《霓裳》后《六幺》。大弦嘈嘈如急雨，小弦切切如私语。嘈嘈切切错杂弹，大珠小珠落玉盘。间关莺语花底滑，幽咽泉流冰下难。冰泉冷涩弦凝绝，凝绝不通声暂歇。别有幽愁暗恨生，此时无声胜有声。银瓶乍破水浆迸，铁骑突出刀枪鸣。曲终收拨当心画，四弦一声如裂帛。东船西舫悄无言，唯见江心秋月白。
沉吟放拨插弦中，整顿衣裳起敛容。自言本是京城女，家在虾蟆陵下住。十三学得琵琶成，名属教坊第一部。曲罢曾教善才服，妆成每被秋娘妒。五陵年少争缠头，一曲红绡不知数。钿头银篦击节碎，血色罗裙翻酒污。今年欢笑复明年，秋月春风等闲度。弟走从军阿姨死，暮去朝来颜色故。门前冷落鞍马稀，老大嫁作商人妇。商人重利轻别离，前月浮梁买茶去。去来江口守空船，绕船月明江水寒。夜深忽梦少年事，梦啼妆泪红阑干。
我闻琵琶已叹息，又闻此语重唧唧。同是天涯沦落人，相逢何必曾相识！我从去年辞帝京，谪居卧病浔阳城。浔阳地僻无音乐，终岁不闻丝竹声。住近湓江地低湿，黄芦苦竹绕宅生。其间旦暮闻何物？杜鹃啼血猿哀鸣。春江花朝秋月夜，往往取酒还独倾。岂无山歌与村笛？呕哑嘲哳难为听。今夜闻君琵琶语，如听仙乐耳暂明。莫辞更坐弹一曲，为君翻作《琵琶行》。感我此言良久立，却坐促弦弦转急。凄凄不似向前声，满座重闻皆掩泣。座中泣下谁最多？江州司马青衫湿。</p>`;

const TAG_STYLE = { p: 'color: #606266; line-height: 24px;' };

export default function ReadMoreDemo() {
  const readMoreRef = useRef<UPReadMoreRef>(null);
  const [events, setEvents] = useState<string[]>([]);
  const log = (label: string, name: string | number) =>
    setEvents((prev) => [...prev, `${label}: ${JSON.stringify(name)}`]);

  return (
    <DemoPage>
      <UPReadMore
        onClose={(name) => log('close', name)}
        onOpen={(name) => log('open', name)}
        ref={readMoreRef}
        showHeight={200}
        toggle
      >
        <UPParse
          // 上游 @load 里 nextTick 后调用 uReadMoreRef.init()，此处等价
          content={CONTENT}
          onLoad={() => readMoreRef.current?.init()}
          tagStyle={TAG_STYLE}
        />
      </UPReadMore>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
