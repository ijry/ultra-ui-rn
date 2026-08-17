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
