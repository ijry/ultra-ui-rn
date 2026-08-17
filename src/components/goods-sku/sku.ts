export type SkuLeaf = { id: string | number; name: string };

export type SkuTreeItem = {
  name: string;
  label?: string;
  children: readonly SkuLeaf[];
};

export type SkuComb = Record<string, unknown> & {
  stock?: number;
  quantity?: number;
  price?: number;
};

export type SelectedSku = Record<string, string | number>;

export function isAllSelected(selected: SelectedSku, skuTree: readonly SkuTreeItem[]): boolean {
  return Object.keys(selected).filter((key) => selected[key] !== '').length === skuTree.length;
}

/** Find the exact sku combination in skuList for a fully-selected set. */
export function getSkuComb(
  selected: SelectedSku,
  skuList: readonly SkuComb[],
): SkuComb | null {
  const full = { ...selected };
  Object.keys(full).forEach((key) => {
    if (!full[key]) delete full[key];
  });
  for (let i = 0; i < skuList.length; i += 1) {
    const sku = skuList[i];
    let match = true;
    for (const key of Object.keys(full)) {
      if (sku[key] !== full[key]) {
        match = false;
        break;
      }
    }
    if (match) return sku;
  }
  return null;
}

/** Whether a leaf (under skuKey) is selectable given the current selection. */
export function isDisabled(
  selected: SelectedSku,
  skuTree: readonly SkuTreeItem[],
  skuList: readonly SkuComb[],
  skuKey: string,
  skuValueId: string | number,
): boolean {
  const temp = { ...selected, [skuKey]: skuValueId };
  if (isAllSelected(temp, skuTree)) {
    return !getSkuComb(temp, skuList);
  }
  for (let i = 0; i < skuList.length; i += 1) {
    const sku = skuList[i];
    let match = true;
    for (const key of Object.keys(temp)) {
      if (temp[key] && sku[key] !== temp[key]) {
        match = false;
        break;
      }
    }
    if (match) return false;
  }
  return true;
}

export function selectedText(
  selected: SelectedSku,
  skuTree: readonly SkuTreeItem[],
): string {
  const names: string[] = [];
  Object.keys(selected).forEach((key) => {
    const value = selected[key];
    if (!value) return;
    skuTree.forEach((treeItem) => {
      if (treeItem.name !== key) return;
      treeItem.children.forEach((leaf) => {
        if (leaf.id === value) names.push(leaf.name);
      });
    });
  });
  return names.join(', ');
}
