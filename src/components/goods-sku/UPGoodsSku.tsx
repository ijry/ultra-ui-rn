import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { UPPopup } from '../popup';
import { getSkuComb, isDisabled, selectedText, type SelectedSku, type SkuComb, type SkuTreeItem } from './sku';

export type UPGoodsSkuProps = {
  goodsInfo?: Record<string, unknown>;
  skuTree?: readonly SkuTreeItem[];
  skuList?: readonly SkuComb[];
  maxBuy?: number;
  confirmText?: string;
  closeable?: boolean;
  pageInline?: boolean;
  /** Source `trigger` slot. */
  renderTrigger?: () => React.ReactNode;
  /** Source `header` slot. */
  renderHeader?: () => React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  /** Source `open` event: fires when the sku popup opens. */
  onOpen?: () => void;
  /** Source `close` event: fires when the sku popup closes. */
  onClose?: () => void;
  /** Source `confirm` event: payload { sku, goodsInfo, num, selectedText }. */
  onConfirm?: (payload: { sku: SkuComb | null; goodsInfo: Record<string, unknown>; num: number; selectedText: string }) => void;
};

export function UPGoodsSku(input: UPGoodsSkuProps): React.JSX.Element {
  const props = { ...useUPConfig().props.goodsSku, ...input } as UPGoodsSkuProps;
  const skuTree = props.skuTree ?? [];
  const skuList = props.skuList ?? [];
  const goodsInfo = props.goodsInfo ?? {};
  const [show, setShow] = useState(Boolean(props.pageInline));
  const [selected, setSelected] = useState<SelectedSku>({});
  const [buyNum, setBuyNum] = useState(1);

  useEffect(() => {
    if (props.pageInline) setShow(true);
  }, [props.pageInline]);

  const open = () => {
    setShow(true);
    input.onOpen?.();
  };

  const comb = getSkuComb(selected, skuList);
  const stock = comb
    ? comb.stock ?? comb.quantity ?? 0
    : (goodsInfo.stock as number | undefined) ?? (goodsInfo.quantity as number | undefined) ?? 0;
  const maxBuyNum = stock > (props.maxBuy ?? 999) ? props.maxBuy ?? 999 : stock;
  const canBuy =
    Object.keys(selected).filter((key) => selected[key] !== '').length === skuTree.length &&
    buyNum > 0 &&
    stock > 0;

  const confirm = () => {
    if (!canBuy) return;
    input.onConfirm?.({
      sku: comb,
      goodsInfo,
      num: buyNum,
      selectedText: selectedText(selected, skuTree),
    });
  };

  const toggle = (skuKey: string, leafId: string | number) => {
    if (isDisabled(selected, skuTree, skuList, skuKey, leafId)) return;
    setSelected((prev) => {
      const next = { ...prev };
      if (next[skuKey] === leafId) next[skuKey] = '';
      else next[skuKey] = leafId;
      return next;
    });
  };

  return (
    <View style={input.customStyle} testID="up-goods-sku">
      <Pressable onPress={open} testID="up-goods-sku-trigger">
        {props.renderTrigger ? props.renderTrigger() : <View style={{ minHeight: 44 }} />}
      </Pressable>
      <UPPopup
        closeOnClickOverlay={props.closeable}
        mode="bottom"
        onChangeShow={(next) => {
          setShow(next);
          if (!next) input.onClose?.();
        }}
        onClose={input.onClose}
        pageInline={props.pageInline}
        round={20}
        show={show}
      >
        <View style={{ maxHeight: 420, paddingHorizontal: 16, paddingTop: 16 }} testID="up-goods-sku-panel">
          {props.renderHeader ? (
            props.renderHeader()
          ) : (
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              {props.goodsInfo?.image || props.goodsInfo?.picture ? (
                <Image
                  source={{ uri: String(props.goodsInfo.image || props.goodsInfo.picture) }}
                  style={{ backgroundColor: '#f2f3f5', borderRadius: 8, height: 88, width: 88 }}
                />
              ) : (
                <View style={{ backgroundColor: '#f2f3f5', borderRadius: 8, height: 88, width: 88 }} />
              )}
              <View style={{ justifyContent: 'center', marginLeft: 12 }}>
                <Text style={{ color: '#fa3534', fontSize: 20, fontWeight: '700' }}>
                  ¥{Number(comb?.price ?? goodsInfo.price ?? 0)}
                </Text>
                <Text style={{ color: '#909399', fontSize: 13, marginTop: 4 }}>库存 {stock} 件</Text>
                <Text style={{ color: '#909399', fontSize: 13, marginTop: 4 }}>已选: {selectedText(selected, skuTree) || '请选择规格'}</Text>
              </View>
            </View>
          )}
          <ScrollView style={{ maxHeight: 220 }}>
            {skuTree.map((treeItem) => (
              <View key={treeItem.name} style={{ marginBottom: 14 }} testID={`up-goods-sku-spec-${treeItem.name}`}>
                <Text style={{ color: '#303133', fontSize: 15, fontWeight: '600', marginBottom: 8 }}>
                  {treeItem.label ?? treeItem.name}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {treeItem.children.map((leaf) => {
                    const active = selected[treeItem.name] === leaf.id;
                    const disabled = isDisabled(selected, skuTree, skuList, treeItem.name, leaf.id);
                    return (
                      <Pressable
                        disabled={disabled}
                        key={String(leaf.id)}
                        onPress={() => toggle(treeItem.name, leaf.id)}
                        style={{
                          backgroundColor: active ? '#2979ff' : disabled ? '#f2f3f5' : '#f7f8fa',
                          borderColor: active ? '#2979ff' : 'transparent',
                          borderRadius: 4,
                          borderWidth: 1,
                          marginRight: 8,
                          marginBottom: 8,
                          opacity: disabled ? 0.5 : 1,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                        }}
                        testID={`up-goods-sku-leaf-${treeItem.name}-${leaf.id}`}
                      >
                        <Text style={{ color: active ? '#ffffff' : disabled ? '#c0c4cc' : '#303133', fontSize: 13 }}>
                          {leaf.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ color: '#303133', fontSize: 15, fontWeight: '600' }}>购买数量</Text>
              <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                <Pressable
                  onPress={() => setBuyNum((prev) => Math.max(1, prev - 1))}
                  style={{ borderColor: '#dcdfe6', borderWidth: 1, height: 28, justifyContent: 'center', width: 28 }}
                  testID="up-goods-sku-minus"
                >
                  <Text style={{ color: '#303133', fontSize: 16, textAlign: 'center' }}>−</Text>
                </Pressable>
                <Text style={{ color: '#303133', fontSize: 15, minWidth: 40, textAlign: 'center' }} testID="up-goods-sku-num">
                  {buyNum}
                </Text>
                <Pressable
                  onPress={() => setBuyNum((prev) => Math.min(maxBuyNum || 1, prev + 1))}
                  style={{ borderColor: '#dcdfe6', borderWidth: 1, height: 28, justifyContent: 'center', width: 28 }}
                  testID="up-goods-sku-plus"
                >
                  <Text style={{ color: '#303133', fontSize: 16, textAlign: 'center' }}>+</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
          <Pressable
            disabled={!canBuy}
            onPress={confirm}
            style={{
              backgroundColor: canBuy ? '#fa3534' : '#f0f0f0',
              borderRadius: 22,
              height: 44,
              justifyContent: 'center',
              marginBottom: 16,
              opacity: canBuy ? 1 : 0.6,
            }}
            testID="up-goods-sku-confirm"
          >
            <Text style={{ color: canBuy ? '#ffffff' : '#c0c4cc', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
              {props.confirmText}
            </Text>
          </Pressable>
        </View>
      </UPPopup>
    </View>
  );
}
