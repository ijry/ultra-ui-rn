/**
 * Pagination 分页器
 * 严格复刻 uview-plus pages/componentsD/pagination/pagination.nvue
 */
import React, { useState } from 'react';
import { UPPagination } from 'ultra-ui-rn';
import { DemoPage, Section, PropsTable, EventLog } from '../_shared';

const PROPS = [
  { prop: 'currentPage', type: 'number', default: '1', desc: '当前页码' },
  { prop: 'pageSize', type: 'number', default: '10', desc: '每页条数' },
  { prop: 'total', type: 'number', default: '0', desc: '总条数' },
  { prop: 'pageSizes', type: 'PaginationSize[]', default: '[]', desc: '每页条数的可选项' },
  { prop: 'layout', type: 'string', default: '—', desc: '布局，逗号分隔（prev / pager / next / total / sizes）' },
  { prop: 'prevText', type: 'string', default: '—', desc: '上一页按钮文案，缺省时显示箭头图标' },
  { prop: 'nextText', type: 'string', default: '—', desc: '下一页按钮文案，缺省时显示箭头图标' },
  { prop: 'hideOnSinglePage', type: 'boolean', default: 'false', desc: '只有一页时是否隐藏' },
  { prop: 'onCurrentChange', type: '(page: number) => void', default: '—', desc: '页码改变时触发' },
  { prop: 'onSizeChange', type: '(size: number) => void', default: '—', desc: '每页条数改变时触发' },
];

const pageSizes = [
  { label: '10条/页', value: 10 },
  { label: '20条/页', value: 20 },
  { label: '30条/页', value: 30 },
];

export default function PaginationDemo() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [events, setEvents] = useState<string[]>([]);

  const handleCurrentChange = (page: number) => {
    setCurrentPage(page);
    setEvents((prev) => [...prev, `当前页: ${page}`]);
  };

  const handleSizeChange = (size: number) => {
    setPageSize(size);
    setEvents((prev) => [...prev, `每页条数: ${size}`]);
  };

  return (
    <DemoPage>
      <Section title="基础">
        <UPPagination
          currentPage={currentPage}
          layout="prev, total, next"
          onCurrentChange={handleCurrentChange}
          onSizeChange={handleSizeChange}
          pageSize={pageSize}
          pageSizes={pageSizes}
          total={100}
        />
      </Section>

      <Section title="上一页下一页文案">
        <UPPagination
          currentPage={currentPage}
          layout="prev, total, next"
          nextText="下一页"
          onCurrentChange={handleCurrentChange}
          onSizeChange={handleSizeChange}
          pageSize={pageSize}
          pageSizes={pageSizes}
          prevText="上一页"
          total={100}
        />
      </Section>

      <Section title="显示分页切换">
        <UPPagination
          currentPage={currentPage}
          layout="prev, pager, next"
          onCurrentChange={handleCurrentChange}
          onSizeChange={handleSizeChange}
          pageSize={pageSize}
          pageSizes={pageSizes}
          total={100}
        />
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}
