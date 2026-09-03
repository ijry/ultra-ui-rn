/**
 * Barcode 条形码
 * 严格复刻 uview-plus pages/componentsD/barcode/barcode.nvue
 */
import React from 'react';
import { UPBarcode } from 'ultra-ui-rn';
import { DemoPage, PageItem } from '../_shared';

export default function BarcodeDemo() {
  return (
    <DemoPage>
      <PageItem title="CODE128 条形码">
        <UPBarcode
          fontSize={16}
          format="CODE128"
          height={70}
          value="1234567890"
        />
      </PageItem>

      <PageItem title="EAN-13 条形码">
        <UPBarcode
          fontSize={16}
          format="EAN13"
          height={70}
          value="5901234123457"
        />
      </PageItem>

      <PageItem title="EAN-8 条形码">
        <UPBarcode
          fontSize={11}
          format="EAN8"
          height={70}
          value="96385074"
        />
      </PageItem>

      <PageItem title="UPC-A 条形码">
        <UPBarcode
          fontSize={16}
          format="UPCA"
          height={70}
          value="123456789012"
        />
      </PageItem>

      <PageItem title="CODE39 条形码">
        <UPBarcode
          fontSize={16}
          format="CODE39"
          height={70}
          value="CODE39"
        />
      </PageItem>

      <PageItem title="EAN-5 补充码">
        <UPBarcode
          fontSize={14}
          format="EAN5"
          height={60}
          value="12345"
          width={100}
        />
      </PageItem>

      <PageItem title="EAN-2 补充码">
        <UPBarcode
          fontSize={14}
          format="EAN2"
          height={60}
          value="12"
          width={100}
        />
      </PageItem>

      <PageItem title="自定义样式条形码">
        <UPBarcode
          background="#F0F0F0"
          fontSize={14}
          format="CODE128"
          height={70}
          lineColor="#FF0000"
          textPosition="top"
          value="CUSTOM123"
          width={200}
        />
      </PageItem>
    </DemoPage>
  );
}
