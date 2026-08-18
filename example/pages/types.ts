/**
 * P47 — Shared page props and demo data for the source demo page ports.
 * Data mirrors what the uview-plus demo pages hard-code in their <script>.
 */
import type { DemoPageId } from './registry';

export interface DemoPageProps {
  /** Navigate to another page of the set (mirrors uni.navigateTo). */
  open: (id: DemoPageId) => void;
}

export interface DemoAddress {
  id: number;
  name: string;
  phone: string;
  tag: string[];
  site: string;
}

export const DEMO_ADDRESSES: readonly DemoAddress[] = [
  { id: 1, name: '游X', phone: '183****5523', tag: ['默认', '家'], site: '广东省深圳市宝安区 自由路66号' },
  { id: 2, name: '李XX', phone: '183****5555', tag: ['公司'], site: '广东省深圳市宝安区 翻身路xx号' },
  { id: 3, name: '王YY', phone: '153****5555', tag: [], site: '广东省深圳市宝安区 平安路13号' },
];

export interface DemoReply {
  name: string;
  contentStr: string;
}

export interface DemoComment {
  id: number;
  name: string;
  date: string;
  contentText: string;
  url: string;
  allReply: number;
  likeNum: number;
  isLike: boolean;
  replyList?: readonly DemoReply[];
}

export const DEMO_COMMENTS: readonly DemoComment[] = [
  {
    id: 1,
    name: '叶轻眉',
    date: '12-25 18:58',
    contentText: '我不信伊朗会没有后续反应，美国肯定会为今天的事情付出代价的',
    url: 'https://picsum.photos/seed/comment1/72/72',
    allReply: 12,
    likeNum: 33,
    isLike: false,
    replyList: [
      { name: 'uview', contentStr: 'uview是基于uniapp的一个UI框架，代码优美简洁，宇宙超级无敌彩虹旋转好用，用它！' },
      { name: '粘粘', contentStr: '今天吃什么，明天吃什么，晚上吃什么，我只是一只小猫咪为什么要烦恼这么多' },
    ],
  },
  {
    id: 2,
    name: '叶轻眉1',
    date: '01-25 13:58',
    contentText: '我不信伊朗会没有后续反应，美国肯定会为今天的事情付出代价的',
    url: 'https://picsum.photos/seed/comment2/72/72',
    allReply: 0,
    likeNum: 11,
    isLike: false,
  },
  {
    id: 3,
    name: '叶轻眉2',
    date: '03-25 13:58',
    contentText: '先人一步，全面掌握产品信息',
    url: 'https://picsum.photos/seed/comment3/72/72',
    allReply: 3,
    likeNum: 5,
    isLike: false,
    replyList: [{ name: '管理员', contentStr: '感谢反馈，我们已记录该建议。' }],
  },
];

/** Province / city / area columns for the region picker (address + citySelect). */
export const DEMO_REGION: readonly { label: string; children: readonly { label: string; children: readonly string[] }[] }[] = [
  {
    label: '广东省',
    children: [
      {
        label: '深圳市',
        children: ['宝安区', '南山区', '福田区', '罗湖区'],
      },
      {
        label: '广州市',
        children: ['天河区', '越秀区', '海珠区'],
      },
    ],
  },
  {
    label: '浙江省',
    children: [
      {
        label: '杭州市',
        children: ['西湖区', '余杭区', '滨江区'],
      },
      {
        label: '宁波市',
        children: ['海曙区', '鄞州区'],
      },
    ],
  },
  {
    label: '江苏省',
    children: [
      {
        label: '南京市',
        children: ['玄武区', '鼓楼区'],
      },
    ],
  },
];

export interface DemoGoods {
  id: number;
  title: string;
  type: string;
  deliveryTime: string;
  price: number;
  number: number;
  goodsUrl: string;
}

export interface DemoOrder {
  id: number;
  store: string;
  deal: string;
  goodsList: readonly DemoGoods[];
}

export const DEMO_ORDERS: readonly DemoOrder[] = [
  {
    id: 1,
    store: '天猫旗舰店',
    deal: '交易成功',
    goodsList: [
      {
        id: 1,
        title: '纯棉短袖T恤男款夏季薄款透气宽松半袖体恤圆领打底衫',
        type: '白色 / M',
        deliveryTime: '48小时内发货',
        price: 59.9,
        number: 1,
        goodsUrl: 'https://picsum.photos/seed/goods1/160/160',
      },
      {
        id: 2,
        title: '休闲直筒牛仔裤男夏季薄款宽松九分裤',
        type: '浅蓝 / 32',
        deliveryTime: '72小时内发货',
        price: 129,
        number: 1,
        goodsUrl: 'https://picsum.photos/seed/goods2/160/160',
      },
    ],
  },
  {
    id: 2,
    store: '京东自营',
    deal: '待收货',
    goodsList: [
      {
        id: 3,
        title: '无线蓝牙耳机入耳式降噪运动跑步超长续航',
        type: '黑色',
        deliveryTime: '48小时内发货',
        price: 199,
        number: 2,
        goodsUrl: 'https://picsum.photos/seed/goods3/160/160',
      },
    ],
  },
  {
    id: 3,
    store: '优衣库官方旗舰店',
    deal: '待评价',
    goodsList: [
      {
        id: 4,
        title: '男士摇粒绒拉链外套立领保暖休闲夹克',
        type: '藏青 / L',
        deliveryTime: '24小时内发货',
        price: 249,
        number: 1,
        goodsUrl: 'https://picsum.photos/seed/goods4/160/160',
      },
    ],
  },
];

export interface DemoMenuCategory {
  name: string;
  foods: readonly { name: string; icon: string }[];
}

export const DEMO_MENU: readonly DemoMenuCategory[] = [
  {
    name: '热销',
    foods: [
      { name: '小笼包', icon: 'https://picsum.photos/seed/food1/72/72' },
      { name: '豆浆', icon: 'https://picsum.photos/seed/food2/72/72' },
      { name: '油条', icon: 'https://picsum.photos/seed/food3/72/72' },
      { name: '皮蛋瘦肉粥', icon: 'https://picsum.photos/seed/food4/72/72' },
    ],
  },
  {
    name: '主食',
    foods: [
      { name: '扬州炒饭', icon: 'https://picsum.photos/seed/food5/72/72' },
      { name: '牛肉面', icon: 'https://picsum.photos/seed/food6/72/72' },
      { name: '黄焖鸡米饭', icon: 'https://picsum.photos/seed/food7/72/72' },
    ],
  },
  {
    name: '饮品',
    foods: [
      { name: '柠檬茶', icon: 'https://picsum.photos/seed/food8/72/72' },
      { name: '冰美式', icon: 'https://picsum.photos/seed/food9/72/72' },
      { name: '奶茶', icon: 'https://picsum.photos/seed/food10/72/72' },
    ],
  },
  {
    name: '甜点',
    foods: [
      { name: '提拉米苏', icon: 'https://picsum.photos/seed/food11/72/72' },
      { name: '芝士蛋糕', icon: 'https://picsum.photos/seed/food12/72/72' },
    ],
  },
];
