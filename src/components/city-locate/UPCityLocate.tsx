import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { UPIndexAnchor, UPIndexItem, UPIndexList } from '../index-list';
import { UPLine } from '../line';
import type { UPCityItem, UPCityLocateProps, UPCityLocationResult } from './types';

export type { UPCityLocateProps } from './types';

const locatingText = '定位中....';
const failedText = '定位失败';

function resultCity(result: UPCityLocationResult): string {
  if (typeof result.locationCity === 'string' && result.locationCity) return result.locationCity;
  return typeof result.address?.city === 'string' ? result.address.city : '';
}

export function UPCityLocate(input: UPCityLocateProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.cityLocate, ...input } as UPCityLocateProps;
  const [locationCity, setLocationCity] = useState(input.currentCity || locatingText);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(false);
  const locate = input.locate;
  const onLocationSuccess = input.onLocationSuccess;

  const requestLocation = useCallback(() => {
    if (!locate) return;
    const requestId = ++requestIdRef.current;
    void locate(props.locationType ?? 'wgs84').then((result) => {
      if (requestId !== requestIdRef.current) return;
      const city = resultCity(result);
      if (!city) {
        setLocationCity(failedText);
        return;
      }
      setLocationCity(city);
      onLocationSuccess?.({ ...result, locationCity: city });
    }).catch(() => {
      if (requestId === requestIdRef.current) setLocationCity(failedText);
    });
  }, [locate, onLocationSuccess, props.locationType]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      requestLocation();
    }
    if (input.currentCity) {
      requestIdRef.current += 1;
      setLocationCity(input.currentCity);
    }
  }, [input.currentCity, requestLocation]);

  const selectCity = (city: UPCityItem) => {
    const name = String(city[props.nameKey ?? 'name'] ?? '');
    if (!name) return;
    requestIdRef.current += 1;
    setLocationCity(name);
    input.onSelectCity?.({ locationCity: name });
  };

  const cityList = (props.cityList ?? []) as readonly (readonly UPCityItem[])[];
  const indexes = props.indexList ?? [];
  return (
    <View style={input.customStyle} testID="up-city-locate">
      <UPIndexList
        header={(
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ color: '#909399', fontSize: 13, marginBottom: 6 }}>当前定位城市</Text>
            <Pressable
              accessibilityLabel="定位城市"
              accessibilityRole="button"
              onPress={requestLocation}
              style={{ alignSelf: 'flex-start', minHeight: 30, paddingVertical: 4 }}
              testID="up-city-locate-location"
            >
              <Text style={{ color: '#303133', fontSize: 15 }} testID="up-city-locate-status">{locationCity}</Text>
            </Pressable>
          </View>
        )}
        indexList={indexes}
      >
        {cityList.map((group, groupIndex) => {
          const index = indexes[groupIndex];
          const anchorText = typeof index === 'object' && index !== null
            ? String(index.key ?? index.name ?? '')
            : String(index ?? '');
          return (
            <UPIndexItem key={`${anchorText}-${groupIndex}`}>
              <UPIndexAnchor text={anchorText} />
              {groupIndex === 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, paddingVertical: 8 }}>
                  {group.map((city, cityIndex) => {
                    const name = String(city[props.nameKey ?? 'name'] ?? '');
                    return (
                      <Pressable
                        accessibilityLabel={name}
                        accessibilityRole="button"
                        key={`${name}-${cityIndex}`}
                        onPress={() => selectCity(city)}
                        style={{ backgroundColor: '#ffffff', borderColor: '#ededed', borderWidth: 1, margin: 5, paddingHorizontal: 12, paddingVertical: 6 }}
                        testID={`up-city-locate-hot-${groupIndex}-${cityIndex}`}
                      >
                        <Text style={{ color: '#303133', fontSize: 14 }}>{name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : group.map((city, cityIndex) => {
                const name = String(city[props.nameKey ?? 'name'] ?? '');
                return (
                  <View key={`${name}-${cityIndex}`}>
                    <Pressable
                      accessibilityLabel={name}
                      accessibilityRole="button"
                      onPress={() => selectCity(city)}
                      style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 }}
                      testID={`up-city-locate-city-${groupIndex}-${cityIndex}`}
                    >
                      <Text style={{ color: '#303133', fontSize: 15 }}>{name}</Text>
                    </Pressable>
                    <UPLine />
                  </View>
                );
              })}
            </UPIndexItem>
          );
        })}
      </UPIndexList>
    </View>
  );
}
