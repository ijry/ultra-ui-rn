import type { StyleProp, ViewStyle } from 'react-native';
import type { UPIndexValue } from '../index-list/UPIndexList';

export type UPCityItem = Record<string, unknown>;

export type UPCityLocationResult = {
  locationCity?: string;
  address?: { city?: string };
  [key: string]: unknown;
};

export type UPCityLocateProps = {
  indexList?: readonly UPIndexValue[];
  cityList?: readonly (readonly UPCityItem[])[];
  /**
   * Hot cities, rendered as a chip grid above the indexed groups (source `hotCity`).
   *
   * When omitted, `cityList[0]` is rendered as that chip grid instead — the
   * behaviour this component shipped with, kept so existing callers do not change.
   * Upstream passes `hotCity` *and* a `cityList` whose first group repeats the same
   * entries, and without the upstream component source it is not verifiable whether
   * it renders that first group as rows as well; passing `hotCity` here makes every
   * `cityList` group render as rows.
   */
  hotCity?: readonly UPCityItem[];
  locationType?: string;
  currentCity?: string;
  nameKey?: string;
  locate?: (locationType: string) => Promise<UPCityLocationResult>;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onLocationSuccess?: (result: UPCityLocationResult & { locationCity: string }) => void;
  onSelectCity?: (payload: { locationCity: string }) => void;
};
