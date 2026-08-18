/**
 * P47 — Ports of the uview-plus demo pages under `src/pages/template`
 * (15 business-template pages).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  UP,
  UPBadge,
  UPButton,
  UPCell,
  UPCellGroup,
  UPGap,
  UPIcon,
  UPImage,
  UPInput,
  UPKeyboard,
  UPMessageInput,
  UPNavbar,
  UPSwiper,
  UPSwitch,
  UPTabs,
  UPTextarea,
} from 'ultra-ui-rn';
import {
  DEMO_ADDRESSES,
  DEMO_COMMENTS,
  DEMO_MENU,
  DEMO_ORDERS,
  type DemoComment,
  type DemoPageProps,
} from './types';
import { RegionPicker } from './region-picker';

const MONEY = '￥';

/* ------------------------------------------------------------------ */
/* template/address/index — address list                               */
/* ------------------------------------------------------------------ */

export function AddressIndexPage({ open }: DemoPageProps) {
  return (
    <View>
      {DEMO_ADDRESSES.map((item) => (
        <View key={item.id} style={styles.addressItem}>
          <View style={styles.addressTop}>
            <Text style={styles.addressName}>{item.name}</Text>
            <Text style={styles.addressPhone}>{item.phone}</Text>
            <View style={styles.addressTagRow}>
              {item.tag.map((tag) => (
                <Text
                  key={tag}
                  style={[styles.addressTag, tag === '默认' && styles.addressTagRed]}
                >
                  {tag}
                </Text>
              ))}
            </View>
          </View>
          <View style={styles.addressBottom}>
            <Text style={{ flex: 1 }}>{item.site}</Text>
            <UPIcon color="#999999" name="edit-pen" size={20} />
          </View>
        </View>
      ))}
      <UPButton
        plain
        text="新建收货地址"
        type="primary"
        onClick={() => open('address-addSite')}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* template/address/addSite — address form                             */
/* ------------------------------------------------------------------ */

export function AddressAddSitePage(_props: DemoPageProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [detail, setDetail] = useState('');
  const [region, setRegion] = useState('');
  const [regionOpen, setRegionOpen] = useState(false);
  const [isDefault, setIsDefault] = useState<string | number | boolean>(false);
  const [tags, setTags] = useState<readonly string[]>(['家', '公司', '学校']);

  const toggleTag = (tag: string) => {
    setTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    );
  };

  return (
    <View>
      <View style={styles.formCard}>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>收货人</Text>
          <UPInput onChange={setName} placeholder="请填写收货人姓名" value={name} />
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>手机号码</Text>
          <UPInput onChange={setPhone} placeholder="请填写收货人手机号" type="number" value={phone} />
        </View>
        <Pressable onPress={() => setRegionOpen(true)} style={styles.formRow}>
          <Text style={styles.formLabel}>所在地区</Text>
          <Text style={[styles.formPlaceholder, region ? { color: '#303133' } : null]}>
            {region || '省市区县、乡镇等'}
          </Text>
          <UPIcon color="#909399" name="arrow-right" size={18} />
        </Pressable>
        <View style={[styles.formRow, { alignItems: 'flex-start', paddingVertical: 16 }]}>
          <Text style={styles.formLabel}>详细地址</Text>
          <UPTextarea
            height={90}
            onChange={setDetail}
            placeholder="街道、楼牌等"
            value={detail}
          />
        </View>
      </View>
      <View style={styles.formCard}>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>标签</Text>
          <View style={styles.tagRow}>
            {tags.map((tag) => (
              <Text
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[styles.formTag, tags.includes(tag) && styles.formTagActive]}
              >
                {tag}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.formRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.defaultTitle}>设置默认地址</Text>
            <Text style={styles.defaultTips}>提醒：每次下单会默认推荐该地址</Text>
          </View>
          <UPSwitch activeColor="#fa3534" onChange={setIsDefault} value={isDefault} />
        </View>
      </View>
      <UPButton
        text="保存地址"
        type="primary"
        onClick={() =>
          UP.toast.default(`已保存：${name || '未填'} / ${phone || '未填'} / ${region || '未选地区'}`)
        }
      />
      <RegionPicker onChangeShow={setRegionOpen} onConfirm={(value) => setRegion(value.join(' / '))} show={regionOpen} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* template/citySelect — region picker                                 */
/* ------------------------------------------------------------------ */

export function CitySelectPage(_props: DemoPageProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState('Picker值');
  return (
    <View>
      <Text style={styles.blockTitle}>演示效果</Text>
      <UPButton text="打开Picker" type="primary" onClick={() => setOpen(true)} />
      <Text style={styles.resultLine}>{result}</Text>
      <Text style={styles.blockTitle}>参数配置</Text>
      <Text style={styles.configItem}>状态</Text>
      <RegionPicker onChangeShow={setOpen} onConfirm={(value) => setResult(value.join('-'))} show={open} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* template/comment/index — comment list                               */
/* ------------------------------------------------------------------ */

export function CommentIndexPage({ open }: DemoPageProps) {
  const [comments, setComments] = useState<DemoComment[]>(DEMO_COMMENTS.map((c) => ({ ...c })));

  const toggleLike = (index: number) => {
    setComments((current) =>
      current.map((comment, i) =>
        i === index
          ? { ...comment, isLike: !comment.isLike, likeNum: comment.likeNum + (comment.isLike ? -1 : 1) }
          : comment,
      ),
    );
  };

  return (
    <View>
      {comments.map((comment, index) => (
        <View key={comment.id} style={styles.commentCard}>
          <View style={styles.commentTop}>
            <UPImage height={44} shape="circle" src={comment.url} width={44} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.commentTopRow}>
                <Text style={styles.commentName}>{comment.name}</Text>
                <View style={styles.likeBox}>
                  <Text style={[styles.likeNum, comment.isLike && { color: '#fa3534' }]}>
                    {comment.likeNum}
                  </Text>
                  <UPIcon
                    color={comment.isLike ? '#fa3534' : '#9a9a9a'}
                    name={comment.isLike ? 'thumb-up-fill' : 'thumb-up'}
                    onClick={() => toggleLike(index)}
                    size={15}
                  />
                </View>
              </View>
              <Text style={styles.commentContent}>{comment.contentText}</Text>
              {comment.replyList ? (
                <View style={styles.replyBox}>
                  {comment.replyList.map((reply, replyIndex) => (
                    <View key={replyIndex} style={styles.replyRow}>
                      <Text style={styles.replyName}>{reply.name}</Text>
                      <Text style={styles.replyText}>{reply.contentStr}</Text>
                    </View>
                  ))}
                  <Text style={styles.allReply} onPress={() => open('comment-reply')}>
                    共{comment.allReply}条回复 <UPIcon name="arrow-right" size={13} />
                  </Text>
                </View>
              ) : null}
              <View style={styles.commentBottom}>
                <Text style={styles.commentDate}>{comment.date}</Text>
                <Text style={styles.commentReplyBtn}>回复</Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* template/comment/reply — full reply list                            */
/* ------------------------------------------------------------------ */

export function CommentReplyPage(_props: DemoPageProps) {
  const [comments, setComments] = useState<DemoComment[]>(DEMO_COMMENTS.map((c) => ({ ...c })));
  const main = comments[0];

  const toggleLike = (index: number) => {
    setComments((current) =>
      current.map((comment, i) =>
        i === index
          ? { ...comment, isLike: !comment.isLike, likeNum: comment.likeNum + (comment.isLike ? -1 : 1) }
          : comment,
      ),
    );
  };

  return (
    <View>
      <View style={styles.commentCard}>
        <View style={styles.commentTop}>
          <UPImage height={44} shape="circle" src={main.url} width={44} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={styles.commentTopRow}>
              <Text style={styles.commentName}>{main.name}</Text>
              <View style={styles.likeBox}>
                <Text style={styles.likeNum}>{main.likeNum}</Text>
                <UPIcon
                  color={main.isLike ? '#fa3534' : '#9a9a9a'}
                  name={main.isLike ? 'thumb-up-fill' : 'thumb-up'}
                  onClick={() => toggleLike(0)}
                  size={15}
                />
              </View>
            </View>
            <Text style={styles.commentContent}>{main.contentText}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.replyHeading}>全部回复（{main.allReply}）</Text>
      {comments.map((comment, index) => (
        <View key={comment.id} style={styles.commentCard}>
          <View style={styles.commentTop}>
            <UPImage height={44} shape="circle" src={comment.url} width={44} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.commentTopRow}>
                <Text style={styles.commentName}>{comment.name}</Text>
                <View style={styles.likeBox}>
                  <Text style={[styles.likeNum, comment.isLike && { color: '#fa3534' }]}>
                    {comment.likeNum}
                  </Text>
                  <UPIcon
                    color={comment.isLike ? '#fa3534' : '#9a9a9a'}
                    name={comment.isLike ? 'thumb-up-fill' : 'thumb-up'}
                    onClick={() => toggleLike(index)}
                    size={15}
                  />
                </View>
              </View>
              <Text style={styles.commentDate}>{comment.date}</Text>
              <Text style={styles.commentContent}>{comment.contentText}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* template/coupon — coupon cards                                      */
/* ------------------------------------------------------------------ */

export function CouponPage(_props: DemoPageProps) {
  return (
    <View>
      {/* Meituan style */}
      <View style={styles.couponCard}>
        <View style={styles.couponBody}>
          <View style={styles.couponLeft}>
            <Text style={styles.couponSum}>{MONEY}<Text style={styles.couponNum}>8</Text></Text>
            <Text style={styles.couponType}>抵用券</Text>
          </View>
          <View style={styles.couponCenter}>
            <Text style={styles.couponTitle}>【洗牙】8元无门槛红包</Text>
            <Text style={styles.couponDate}>今日到期</Text>
          </View>
          <View style={styles.couponRight}>
            <Text style={styles.couponUseBtn}>立即使用</Text>
          </View>
        </View>
        <View style={styles.couponTipsRow}>
          <View style={styles.couponCircle} />
          <Text style={[styles.couponExplain, { flex: 1 }]}>满8.1元可用、限最新版本客户端使用</Text>
          <Text style={styles.couponRule}>使用规则 <UPIcon name="arrow-right" size={14} /></Text>
        </View>
      </View>
      {/* JD style */}
      <View style={styles.couponCard}>
        <View style={styles.couponBody}>
          <View style={styles.couponLeft}>
            <Text style={styles.couponSum}>{MONEY}<Text style={styles.couponNum}>100</Text></Text>
            <Text style={styles.couponType}>满149元可用</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.couponTitle}><Text style={styles.couponTag}>限品类东券</Text> 仅可购买个人护理部分商品</Text>
            <View style={styles.couponBottomRow}>
              <Text style={styles.couponDate}>2020.01.01-2020.01.31</Text>
              <Text style={styles.couponUseBtnSmall}>立即使用</Text>
            </View>
          </View>
        </View>
        <View style={styles.couponTipsRow}>
          <View style={styles.couponCircle} />
          <Text style={styles.couponExplain}><UPIcon color="#909399" name="zhuanfa" size={14} /> 可赠送</Text>
          <View style={styles.couponCircleRight} />
        </View>
      </View>
      {/* Taobao style */}
      <View style={[styles.couponCard, styles.couponCardTaobao]}>
        <View style={styles.couponBody}>
          <View style={styles.couponLeft}>
            <Text style={styles.couponSum}>{MONEY}<Text style={styles.couponNum}>50</Text></Text>
            <Text style={styles.couponType}>满200元可用</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.couponTitle}>【直营】精选洗护用品满减券</Text>
            <View style={styles.couponBottomRow}>
              <Text style={styles.couponDate}>2020.02.14-2020.03.31</Text>
              <Text style={styles.couponUseBtn}>立即使用</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* template/keyboardPay — pay keyboard                                 */
/* ------------------------------------------------------------------ */

export function KeyboardPayPage(_props: DemoPageProps) {
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState('');

  return (
    <View>
      <View style={{ padding: 20 }}>
        <UPButton onClick={() => setShow(true)} type="success">
          <UPIcon name="red-packet" /> <Text style={{ marginLeft: 8 }}>发送1.00元红包</Text>
        </UPButton>
      </View>
      <UPKeyboard
        closeOnClickOverlay={false}
        mode="number"
        onChange={(value) => {
          if (password.length < 6) setPassword((current) => `${current}${value}`);
        }}
        onClose={() => setShow(false)}
        show={show}
        tooltip={false}
      >
        <View style={styles.payBox}>
          <View style={styles.payTitleRow}>
            <Text style={styles.payAmount}>1.00<Text style={styles.payUnit}> 元</Text></Text>
            <UPIcon color="#333333" name="close" onClick={() => setShow(false)} size={16} />
          </View>
          <View style={styles.payInputRow}>
            <UPMessageInput
              disabledKeyboard
              dotFill
              maxlength={6}
              mode="box"
              onChange={setPassword}
              onFinish={(value) => {
                setShow(false);
                UP.toast.default(`支付成功：${value}`);
              }}
              value={password}
            />
          </View>
          <Text style={styles.payTips}>支付键盘</Text>
        </View>
      </UPKeyboard>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* template/login/index — phone login                                  */
/* ------------------------------------------------------------------ */

export function LoginIndexPage({ open }: DemoPageProps) {
  const [tel, setTel] = useState('');
  const valid = UP.test.mobile(tel);

  return (
    <View style={styles.loginWrap}>
      <Text style={styles.loginTitle}>欢迎登录</Text>
      <View style={styles.loginInput}>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setTel}
          placeholder="请输入手机号"
          placeholderTextColor="#c0c4cc"
          style={styles.loginInputNative}
          value={tel}
        />
      </View>
      <Text style={styles.loginTips}>未注册的手机号验证后自动创建账号</Text>
      <UPButton
        text="获取短信验证码"
        type={valid ? 'warning' : undefined}
        onClick={() => {
          if (valid) open('login-code');
          else UP.toast.default('请输入正确的手机号');
        }}
      />
      <View style={styles.loginAlternative}>
        <Text style={styles.loginLink}>密码登录</Text>
        <Text style={styles.loginLink}>遇到问题</Text>
      </View>
      <View style={styles.loginBottom}>
        <View style={styles.loginTypeRow}>
          <View style={styles.loginTypeItem}>
            <UPIcon color="rgb(83,194,64)" name="weixin-fill" size={22} />
            <Text style={styles.loginTypeText}>微信</Text>
          </View>
          <View style={styles.loginTypeItem}>
            <UPIcon color="rgb(17,183,233)" name="qq-fill" size={22} />
            <Text style={styles.loginTypeText}>QQ</Text>
          </View>
        </View>
        <Text style={styles.loginHint}>
          登录代表同意<Text style={styles.loginLink}>用户协议、隐私政策，</Text>并授权使用您的账号信息
        </Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* template/login/code — sms code page                                 */
/* ------------------------------------------------------------------ */

export function LoginCodePage(_props: DemoPageProps) {
  const [value, setValue] = useState('');
  const [second, setSecond] = useState(3);
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecond((current) => {
        const next = current - 1;
        if (next <= 0) {
          setShow(true);
          clearInterval(interval);
          if (value.length !== 4) setError(true);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.codeWrap}>
      <Text style={styles.codeTitle}>输入验证码</Text>
      <Text style={styles.codeTips}>验证码已发送至 +150****9320</Text>
      <UPMessageInput
        focus
        maxlength={4}
        mode="bottomLine"
        onChange={(next) => {
          setValue(next);
          setError(false);
        }}
        onFinish={(next) => {
          setValue(next);
          if (next.length === 4) UP.toast.default(`验证码: ${next}`);
        }}
        value={value}
      />
      {error ? <Text style={styles.codeError}>验证码错误，请重新输入</Text> : null}
      <View style={styles.captchaRow}>
        <Text
          onPress={() =>
            UP.toast.default('收不到验证码：重新获取 / 语音验证码（源页用 uni.showActionSheet）')
          }
          style={styles.captchaLink}
        >
          收不到验证码点这里
        </Text>
        {show ? null : <Text style={styles.captchaCount}>{second}秒后重新获取验证码</Text>}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* template/mallMenu/index1 — two-pane category menu                   */
/* ------------------------------------------------------------------ */

export function MallMenu1Page(_props: DemoPageProps) {
  const [current, setCurrent] = useState(0);
  return (
    <View>
      <View style={styles.searchBox}>
        <View style={styles.searchInner}>
          <UPIcon color="#909399" name="search" size={16} />
          <Text style={styles.searchText}>搜索uview-plus</Text>
        </View>
      </View>
      <View style={styles.menuWrap}>
        <ScrollView style={styles.menuLeft}>
          {DEMO_MENU.map((category, index) => (
            <Text
              key={category.name}
              onPress={() => setCurrent(index)}
              style={[
                styles.menuTab,
                current === index && styles.menuTabActive,
              ]}
            >
              {category.name}
            </Text>
          ))}
        </ScrollView>
        <ScrollView style={styles.menuRight}>
          <View style={styles.menuPage}>
            <View style={styles.menuClassItem}>
              <Text style={styles.menuClassTitle}>{DEMO_MENU[current].name}</Text>
              <View style={styles.menuGrid}>
                {DEMO_MENU[current].foods.map((food) => (
                  <View key={food.name} style={styles.menuThumb}>
                    <UPImage height={64} src={food.icon} width={64} />
                    <Text style={styles.menuFoodName}>{food.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* template/mallMenu/index2 — linked two-pane menu                     */
/* ------------------------------------------------------------------ */

export function MallMenu2Page(_props: DemoPageProps) {
  const [current, setCurrent] = useState(0);
  return (
    <View>
      <View style={styles.searchBox}>
        <View style={styles.searchInner}>
          <UPIcon color="#909399" name="search" size={16} />
          <Text style={styles.searchText}>搜索</Text>
        </View>
      </View>
      <View style={styles.menuWrap}>
        <ScrollView style={styles.menuLeft}>
          {DEMO_MENU.map((category, index) => (
            <Text
              key={category.name}
              onPress={() => setCurrent(index)}
              style={[styles.menuTab, current === index && styles.menuTabActive]}
            >
              {category.name}
            </Text>
          ))}
        </ScrollView>
        <ScrollView style={styles.menuRight}>
          {DEMO_MENU.map((category, index) => (
            <View key={category.name} style={styles.menuClassItem}>
              <Text style={styles.menuClassTitle}>{category.name}</Text>
              <View style={styles.menuGrid}>
                {category.foods.map((food) => (
                  <View key={food.name} style={styles.menuThumb}>
                    <UPImage height={64} src={food.icon} width={64} />
                    <Text style={styles.menuFoodName}>{food.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* template/order — order list with tabs + swiper                      */
/* ------------------------------------------------------------------ */

const ORDER_TABS = ['全部', '待付款', '待发货', '待收货', '待评价'];

function OrderList({ orders }: { orders: readonly typeof DEMO_ORDERS[number][] }) {
  const total = orders.reduce(
    (sum, order) => sum + order.goodsList.reduce((s, goods) => s + goods.price * goods.number, 0),
    0,
  );
  return (
    <View>
      {orders.map((order) => (
        <View key={order.id} style={styles.orderCard}>
          <View style={styles.orderTop}>
            <UPIcon color="rgb(94,94,94)" name="home" size={18} />
            <Text style={styles.orderStore}>{order.store}</Text>
            <UPIcon color="rgb(203,203,203)" name="arrow-right" size={14} />
            <Text style={[styles.orderDeal, { marginLeft: 'auto' }]}>{order.deal}</Text>
          </View>
          {order.goodsList.map((goods) => (
            <View key={goods.id} style={styles.orderItem}>
              <UPImage height={72} src={goods.goodsUrl} width={72} />
              <View style={styles.orderGoodsInfo}>
                <Text numberOfLines={2} style={styles.orderGoodsTitle}>{goods.title}</Text>
                <Text style={styles.orderGoodsType}>{goods.type}</Text>
                <Text style={styles.orderDelivery}>发货时间 {goods.deliveryTime}</Text>
              </View>
              <View style={styles.orderPriceBox}>
                <Text style={styles.orderPrice}>{MONEY}{goods.price.toFixed(2)}</Text>
                <Text style={styles.orderNumber}>x{goods.number}</Text>
              </View>
            </View>
          ))}
          <View style={styles.orderTotal}>
            共{order.goodsList.reduce((s, g) => s + g.number, 0)}件商品 合计:
            <Text style={styles.orderTotalPrice}> {MONEY}
              {order.goodsList.reduce((s, g) => s + g.price * g.number, 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.orderBottomRow}>
            <UPIcon color="rgb(203,203,203)" name="more-dot-fill" size={16} />
            <View style={{ flex: 1 }} />
            <Text style={styles.orderBtn}>查看物流</Text>
            <Text style={styles.orderBtn}>卖了换钱</Text>
            <Text style={[styles.orderBtn, styles.orderBtnPrimary]}>评价</Text>
          </View>
        </View>
      ))}
      <Text style={styles.orderLoadmore}>— 没有更多了 —</Text>
    </View>
  );
}

export function OrderPage(_props: DemoPageProps) {
  const [current, setCurrent] = useState(0);
  return (
    <View>
      <UPTabs
        current={current}
        list={ORDER_TABS.map((name) => ({ name }))}
        onChange={(_item, index) => setCurrent(index)}
      />
      <UPSwiper
        current={current}
        height={460}
        list={ORDER_TABS}
        onUpdateCurrent={setCurrent}
        renderItem={(_item, index) => (
          <ScrollView style={{ flex: 1 }}>
            <View style={{ paddingHorizontal: 12 }}>
              <OrderList orders={index === 0 ? DEMO_ORDERS : DEMO_ORDERS.slice(0, index + 1)} />
            </View>
          </ScrollView>
        )}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* template/submitBar — cart action bar                                */
/* ------------------------------------------------------------------ */

export function SubmitBarPage(_props: DemoPageProps) {
  return (
    <View style={styles.navigation}>
      <View style={styles.navLeft}>
        <View style={styles.navItem}>
          <UPIcon color="#909399" name="server-fill" size={18} />
          <Text style={styles.navText}>客服</Text>
        </View>
        <View style={styles.navItem}>
          <UPIcon color="#909399" name="home" size={18} />
          <Text style={styles.navText}>店铺</Text>
        </View>
        <View style={[styles.navItem, { position: 'relative' }]}>
          <UPBadge type="error" value={9}>
            <UPIcon color="#909399" name="shopping-cart" size={18} />
          </UPBadge>
          <Text style={styles.navText}>购物车</Text>
        </View>
      </View>
      <View style={styles.navRight}>
        <Text style={[styles.navBtn, styles.navBtnCart]}>加入购物车</Text>
        <Text style={[styles.navBtn, styles.navBtnBuy]}>立即购买</Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* template/wxCenter — WeChat profile page                             */
/* ------------------------------------------------------------------ */

export function WxCenterPage(_props: DemoPageProps) {
  return (
    <View>
      <UPNavbar border={false} fixed={false} right={<UPIcon color="#000000" name="camera-fill" size={24} />} title=" " />
      <View style={styles.wxUserBox}>
        <UPImage height={70} shape="circle" src="https://picsum.photos/seed/wx/140/140" width={70} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.wxName}>uview plus</Text>
          <Text style={styles.wxId}>微信号:test</Text>
        </View>
        <UPIcon color="#969799" name="scan" size={18} />
        <UPIcon color="#969799" name="arrow-right" size={18} />
      </View>
      <UPGap bgColor="#f2f2f2" height={10} />
      <UPCellGroup>
        <UPCell icon="rmb-circle" title="支付" />
      </UPCellGroup>
      <UPGap bgColor="#f2f2f2" height={10} />
      <UPCellGroup>
        <UPCell icon="star" title="收藏" />
        <UPCell icon="photo" title="相册" />
        <UPCell icon="coupon" title="卡券" />
        <UPCell icon="heart" title="关注" />
      </UPCellGroup>
      <UPGap bgColor="#f2f2f2" height={10} />
      <UPCellGroup>
        <UPCell icon="setting" title="设置" />
      </UPCellGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  addressBottom: {
    alignItems: 'center',
    flexDirection: 'row',
    fontSize: 13,
    marginTop: 8,
  },
  addressItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
  },
  addressName: {
    color: '#303133',
    fontSize: 16,
    fontWeight: '600',
  },
  addressPhone: {
    color: '#303133',
    fontSize: 16,
    marginLeft: 16,
  },
  addressTag: {
    color: '#606266',
    fontSize: 11,
    marginLeft: 8,
    paddingHorizontal: 4,
  },
  addressTagRed: {
    color: '#fa3534',
  },
  addressTagRow: {
    flexDirection: 'row',
  },
  addressTop: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  allReply: {
    color: '#3c9cff',
    fontSize: 12,
    marginTop: 8,
  },
  blockTitle: {
    color: '#303133',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 14,
  },
  captchaCount: {
    color: '#f29100',
    fontSize: 14,
  },
  captchaLink: {
    color: '#f29100',
    fontSize: 14,
  },
  captchaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  codeError: {
    color: '#fa3534',
    fontSize: 14,
    marginTop: 16,
  },
  codeTips: {
    color: '#606266',
    fontSize: 13,
    marginBottom: 40,
    marginTop: 12,
  },
  codeTitle: {
    color: '#303133',
    fontSize: 26,
    fontWeight: '600',
  },
  codeWrap: {
    paddingTop: 40,
  },
  commentBottom: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  commentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
  },
  commentContent: {
    color: '#303133',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  commentDate: {
    color: '#909399',
    flex: 1,
    fontSize: 12,
  },
  commentName: {
    color: '#303133',
    fontSize: 14,
    fontWeight: '600',
  },
  commentReplyBtn: {
    color: '#909399',
    fontSize: 12,
  },
  commentTop: {
    flexDirection: 'row',
  },
  commentTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  configItem: {
    color: '#606266',
    fontSize: 14,
    marginVertical: 10,
  },
  couponBody: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 16,
  },
  couponBottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  couponCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 14,
    overflow: 'hidden',
  },
  couponCardTaobao: {
    backgroundColor: '#ffffff',
  },
  couponCenter: {
    flex: 1,
    marginLeft: 12,
  },
  couponCircle: {
    backgroundColor: '#f7f8fa',
    borderRadius: 8,
    height: 16,
    marginRight: 8,
    width: 16,
  },
  couponCircleRight: {
    backgroundColor: '#f7f8fa',
    borderRadius: 8,
    height: 16,
    marginLeft: 8,
    width: 16,
  },
  couponDate: {
    color: '#909399',
    fontSize: 12,
    marginTop: 6,
  },
  couponExplain: {
    color: '#909399',
    fontSize: 11,
  },
  couponLeft: {
    alignItems: 'center',
    borderRightColor: '#f2f3f5',
    borderRightWidth: 1,
    paddingRight: 16,
    width: 110,
  },
  couponNum: {
    fontSize: 28,
    fontWeight: '700',
  },
  couponRight: {
    marginLeft: 12,
  },
  couponRule: {
    color: '#3c9cff',
    fontSize: 11,
    marginLeft: 8,
  },
  couponSum: {
    color: '#fa3534',
    fontSize: 16,
  },
  couponTag: {
    backgroundColor: '#ff7900',
    borderRadius: 2,
    color: '#ffffff',
    fontSize: 10,
    marginRight: 4,
    paddingHorizontal: 4,
  },
  couponTipsRow: {
    alignItems: 'center',
    borderTopColor: '#f2f3f5',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  couponTitle: {
    color: '#303133',
    fontSize: 14,
    fontWeight: '600',
  },
  couponType: {
    color: '#909399',
    fontSize: 11,
    marginTop: 4,
  },
  couponUseBtn: {
    backgroundColor: '#fa3534',
    borderRadius: 20,
    color: '#ffffff',
    fontSize: 12,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  couponUseBtnSmall: {
    backgroundColor: '#fa3534',
    borderRadius: 16,
    color: '#ffffff',
    fontSize: 11,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  defaultTips: {
    color: '#909399',
    fontSize: 12,
    marginTop: 4,
  },
  defaultTitle: {
    color: '#303133',
    fontSize: 14,
  },
  formPlaceholder: {
    color: '#c0c4cc',
    flex: 1,
    fontSize: 14,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  formLabel: {
    color: '#303133',
    fontSize: 14,
    width: 80,
  },
  formRow: {
    alignItems: 'center',
    borderBottomColor: '#f2f3f5',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 52,
  },
  formTag: {
    borderColor: '#dcdfe6',
    borderRadius: 4,
    borderWidth: 1,
    color: '#606266',
    fontSize: 12,
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  formTagActive: {
    backgroundColor: '#3c9cff',
    borderColor: '#3c9cff',
    color: '#ffffff',
  },
  likeBox: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  likeNum: {
    color: '#9a9a9a',
    fontSize: 12,
    marginRight: 4,
  },
  loginAlternative: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  loginBottom: {
    alignItems: 'center',
    marginTop: 60,
  },
  loginHint: {
    color: '#909399',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  loginInput: {
    borderBottomColor: '#dcdfe6',
    borderBottomWidth: 1,
    marginTop: 32,
  },
  loginInputNative: {
    color: '#303133',
    fontSize: 16,
    height: 44,
    padding: 0,
  },
  loginLink: {
    color: '#3c9cff',
  },
  loginTips: {
    color: '#909399',
    fontSize: 12,
    marginBottom: 40,
    marginTop: 10,
  },
  loginTitle: {
    color: '#303133',
    fontSize: 28,
    fontWeight: '700',
  },
  loginTypeItem: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  loginTypeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginTypeText: {
    color: '#606266',
    fontSize: 13,
    marginTop: 6,
  },
  loginWrap: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  menuClassItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
  },
  menuClassTitle: {
    color: '#303133',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  menuFoodName: {
    color: '#606266',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuLeft: {
    backgroundColor: '#f7f8fa',
    width: 90,
  },
  menuPage: {
    padding: 10,
  },
  menuRight: {
    backgroundColor: '#f2f3f5',
    flex: 1,
  },
  menuTab: {
    color: '#909399',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 16,
    textAlign: 'center',
  },
  menuTabActive: {
    backgroundColor: '#ffffff',
    color: '#303133',
    fontWeight: '600',
  },
  menuThumb: {
    alignItems: 'center',
    marginBottom: 12,
    width: '33.3%',
  },
  menuWrap: {
    flexDirection: 'row',
    height: 420,
  },
  navigation: {
    alignItems: 'center',
    borderColor: '#e4e7ed',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 40,
    padding: 8,
  },
  navBtn: {
    borderRadius: 18,
    color: '#ffffff',
    fontSize: 13,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navBtnBuy: {
    backgroundColor: '#ff7900',
  },
  navBtnCart: {
    backgroundColor: '#ed3f14',
    marginRight: 12,
  },
  navItem: {
    alignItems: 'center',
    marginHorizontal: 14,
  },
  navLeft: {
    flex: 1,
    flexDirection: 'row',
  },
  navRight: {
    flexDirection: 'row',
  },
  navText: {
    color: '#606266',
    fontSize: 11,
    marginTop: 4,
  },
  orderBottomRow: {
    alignItems: 'center',
    borderTopColor: '#f2f3f5',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingTop: 10,
  },
  orderBtn: {
    borderColor: '#dcdfe6',
    borderRadius: 14,
    borderWidth: 1,
    color: '#606266',
    fontSize: 12,
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  orderBtnPrimary: {
    borderColor: '#fa3534',
    color: '#fa3534',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
  },
  orderDeal: {
    color: '#606266',
    fontSize: 12,
    marginLeft: 6,
  },
  orderDelivery: {
    color: '#909399',
    fontSize: 11,
    marginTop: 4,
  },
  orderGoodsInfo: {
    flex: 1,
    marginLeft: 10,
  },
  orderGoodsTitle: {
    color: '#303133',
    fontSize: 13,
    lineHeight: 18,
  },
  orderGoodsType: {
    color: '#909399',
    fontSize: 11,
    marginTop: 4,
  },
  orderItem: {
    flexDirection: 'row',
    marginTop: 12,
  },
  orderLoadmore: {
    color: '#909399',
    fontSize: 12,
    paddingVertical: 16,
    textAlign: 'center',
  },
  orderNumber: {
    color: '#909399',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
  },
  orderPrice: {
    color: '#fa3534',
    fontSize: 14,
  },
  orderPriceBox: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  orderStore: {
    color: '#303133',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 6,
  },
  orderTop: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  orderTotal: {
    color: '#606266',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'right',
  },
  orderTotalPrice: {
    color: '#fa3534',
    fontWeight: '600',
  },
  payAmount: {
    color: '#303133',
    fontSize: 22,
    fontWeight: '700',
  },
  payBox: {
    backgroundColor: '#ffffff',
    padding: 16,
  },
  payInputRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  payTips: {
    color: '#909399',
    fontSize: 12,
    paddingVertical: 12,
    textAlign: 'center',
  },
  payTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payUnit: {
    fontSize: 14,
    fontWeight: '400',
  },
  replyBox: {
    backgroundColor: '#f7f8fa',
    borderRadius: 6,
    marginTop: 8,
    padding: 8,
  },
  replyHeading: {
    color: '#606266',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 4,
  },
  replyName: {
    color: '#3c9cff',
    fontSize: 12,
  },
  replyRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  replyText: {
    color: '#606266',
    flex: 1,
    fontSize: 12,
    marginLeft: 6,
  },
  resultLine: {
    color: '#606266',
    fontSize: 14,
    marginVertical: 16,
  },
  searchBox: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  searchInner: {
    alignItems: 'center',
    backgroundColor: '#f2f3f5',
    borderRadius: 20,
    flexDirection: 'row',
    height: 36,
    paddingHorizontal: 14,
  },
  searchText: {
    color: '#909399',
    fontSize: 13,
    marginLeft: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wxId: {
    color: '#909399',
    fontSize: 13,
    marginTop: 6,
  },
  wxName: {
    color: '#303133',
    fontSize: 18,
    fontWeight: '600',
  },
  wxUserBox: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    padding: 16,
  },
});
