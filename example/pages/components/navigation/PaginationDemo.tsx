/**
 * UPPagination 组件示例 — 分页
 * 展示：基础分页、总数显示、每页条数选择
 */
import React, { useState } from 'react';
import { UPPagination } from 'ultra-ui-rn';
import { DemoPage, Section, Value, PropsTable, EventLog } from '../_shared';

const PROPS = [
 { prop: 'currentPage', type: 'number', default: '1', desc: '当前页码' },
 { prop: 'pageSize', type: 'number', default: '10', desc: '每页条数' },
 { prop: 'total', type: 'number', default: '0', desc: '总条数' },
 { prop: 'layout', type: 'string', default: '—', desc: '组件布局（逗号分隔：prev,pager,next,total,sizes）' },
 { prop: 'hideOnSinglePage', type: 'boolean', default: 'false', desc: '只有一页时隐藏' },
 { prop: 'buttonBgColor', type: 'string', default: '—', desc: '按钮背景色' },
 { prop: 'pageSizes', type: 'number[]', default: '—', desc: '可选每页条数数组' },
 { prop: 'onCurrentChange', type: '(page: number) => void', default: '—', desc: '页码变化回调' },
 { prop: 'onSizeChange', type: '(size: number) => void', default: '—', desc: '每页条数变化回调' },
];

export default function PaginationDemo() {
 const [page, setPage] = useState(1);
 const [events, setEvents] = useState<string[]>([]);
 const log = (e: string) => setEvents((p) => [...p, e]);

 return (
 <DemoPage>
 <Section title="基础用法">
 <UPPagination
 total={100}
 pageSize={10}
 currentPage={page}
 layout="prev, pager, next"
 onCurrentChange={(p) => { setPage(p); log(`page: ${p}`); }}
 />
 <Value label="当前页" value={page} />
 </Section>

 <Section title="带总数">
 <UPPagination
 total={200}
 pageSize={10}
 currentPage={3}
 layout="total, prev, pager, next"
 />
 </Section>

 <Section title="带每页条数选择">
 <UPPagination
 total={500}
 pageSize={20}
 currentPage={1}
 layout="sizes, prev, pager, next"
 pageSizes={[10, 20, 50, 100]}
 onSizeChange={(s) => log(`size: ${s}`)}
 />
 </Section>

 <Section title="完整布局">
 <UPPagination
 total={500}
 pageSize={20}
 currentPage={5}
 layout="total, sizes, prev, pager, next"
 pageSizes={[10, 20, 50]}
 />
 </Section>

 <PropsTable rows={PROPS} />
 <EventLog events={events} />
 </DemoPage>
 );
}
