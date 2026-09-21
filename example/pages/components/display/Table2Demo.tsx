/**
 * Table2 表格2
 * 严格复刻 uview-plus pages/componentsB/table2/table2.nvue
 */
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  UPButton,
  UPPopup,
  UPTable2,
  UPTag,
  toast,
  type UPTable2CellPayload,
  type UPTable2Column,
  type UPTable2SpanPayload,
  type UPTable2SpanResult,
} from 'ultra-ui-rn';
import { DemoPage, EventLog, PropsTable, Section } from '../_shared';

const PROPS = [
  { prop: 'data', type: 'T[]', default: '[]', desc: '表格数据' },
  { prop: 'columns', type: 'Table2Column[]', default: '[]', desc: '列配置：key/title/width/align/headerAlign/fixed/type/style/sortable' },
  { prop: 'rowKey', type: 'string', default: "'id'", desc: '行数据的唯一标识字段' },
  { prop: 'stripe', type: 'boolean', default: 'false', desc: '是否显示斑马纹' },
  { prop: 'border', type: 'boolean', default: 'false', desc: '是否显示纵向边框' },
  { prop: 'height', type: 'number | string', default: "'auto'", desc: '表格高度' },
  { prop: 'maxHeight', type: 'number | string', default: "'auto'", desc: '表格最大高度' },
  { prop: 'rowHeight', type: 'number | string', default: '36', desc: '行高（RN 虚拟化要求定高）' },
  { prop: 'showHeader', type: 'boolean', default: 'true', desc: '是否显示表头' },
  { prop: 'fixedHeader', type: 'boolean', default: 'true', desc: '表头是否固定' },
  { prop: 'highlightCurrentRow', type: 'boolean', default: 'false', desc: '是否高亮当前行' },
  { prop: 'currentRowKey', type: 'Key | null', default: 'null', desc: '当前高亮行的 key（受控）' },
  { prop: 'selectedRowKeys', type: 'Key[]', default: '—', desc: '选中行的 key（受控）' },
  { prop: 'defaultSelectedRowKeys', type: 'Key[]', default: '[]', desc: '默认选中行的 key' },
  { prop: 'expandRowKeys', type: 'Key[]', default: '[]', desc: '展开行的 key（受控）' },
  { prop: 'defaultExpandedRowKeys', type: 'Key[]', default: '[]', desc: '默认展开行的 key' },
  { prop: 'defaultExpandAll', type: 'boolean', default: 'false', desc: '是否默认展开所有行' },
  { prop: 'treeProps', type: '{ children, hasChildren }', default: "{ children: 'children', hasChildren: 'hasChildren' }", desc: '树形结构的字段名' },
  { prop: 'lazy', type: 'boolean', default: 'false', desc: '是否懒加载子节点' },
  { prop: 'load', type: '(row, payload, resolve) => void', default: '—', desc: '懒加载子节点的方法' },
  { prop: 'sortable', type: "boolean | 'custom'", default: 'false', desc: '是否开启排序' },
  { prop: 'multiSort', type: 'boolean', default: 'false', desc: '是否支持多列排序' },
  { prop: 'sortOrders', type: 'Order[]', default: "['ascending', 'descending']", desc: '点击表头的排序循环顺序' },
  { prop: 'sortBy', type: 'string | string[] | fn', default: '—', desc: '排序取值字段或取值函数' },
  { prop: 'sortMethod', type: '(a, b, field, ctx) => number', default: '—', desc: '自定义比较函数' },
  { prop: 'filters', type: 'Record<string, unknown>', default: '{}', desc: '筛选条件，按包含匹配' },
  { prop: 'showOverflowTooltip', type: 'boolean', default: 'false', desc: '内容超出是否截断（RN 无浮层提示）' },
  { prop: 'emptyText', type: 'ReactNode', default: "'暂无数据'", desc: '无数据时的提示' },
  { prop: 'mainCol', type: 'string', default: "''", desc: '树形主列的 key，该列渲染展开箭头' },
  { prop: 'expandWidth', type: 'number | string', default: '25', desc: '展开箭头占位宽度' },
  { prop: 'rowStyle', type: 'ViewStyle | (payload) => ViewStyle', default: '—', desc: '行样式' },
  { prop: 'cellStyle', type: '(payload) => ViewStyle & TextStyle', default: '—', desc: '单元格样式；文字色等 TextStyle 落到单元格文字' },
  { prop: 'spanMethod', type: '(payload) => [rowspan, colspan]', default: '—', desc: '合并单元格' },
  { prop: 'onRowClick', type: '(row, payload) => void', default: '—', desc: '点击行时触发' },
  { prop: 'onCellClick', type: '(payload) => void', default: '—', desc: '点击单元格时触发' },
  { prop: 'onSelect', type: '(row, rows, keys) => void', default: '—', desc: '勾选某行时触发' },
  { prop: 'onSelectAll', type: '(rows, keys) => void', default: '—', desc: '勾选表头全选时触发' },
  { prop: 'onSelectionChange', type: '(rows, keys) => void', default: '—', desc: '选中项变化时触发' },
  { prop: 'onSortChange', type: '(conditions) => void', default: '—', desc: '排序条件变化时触发' },
  { prop: 'onFilterChange', type: '(filters) => void', default: '—', desc: 'filters 变化时触发（须为稳定引用）' },
  { prop: 'onCurrentChange', type: '(current, previous) => void', default: '—', desc: '高亮行变化时触发' },
  { prop: 'onExpandChange', type: '(keys, row) => void', default: '—', desc: '展开行变化时触发' },
  { prop: 'onHeaderClick', type: '(column, index) => void', default: '—', desc: '点击表头时触发' },
  { prop: 'onScroll', type: '(scrollTop) => void', default: '—', desc: '表格纵向滚动时触发' },
];

type Row = { id: number; name: string; age: number };
type TreeRow = { id: number; name: string; age?: number; age2?: number; children?: TreeRow[] };
type FixedRow = {
  id: number;
  name: string;
  age: number;
  age2: number;
  age3: number;
  age4: number;
  age5: number;
  age6: number;
  age7: number;
  age8: number;
  age9: number;
  age10: number;
  age11: number;
};
type SpanRow = { id: number; name: string; age: number; address: string; department: string };

const tableData: Row[] = [
  { id: 1, name: '张三', age: 25 },
  { id: 2, name: '李四', age: 30 },
];
// 上游 11 列中有 10 列共用 key: 'age'（用于演示横向滚动）。UPTable2 的 column.key
// 同时兼任取值字段和 React key，重复的 key 会触发 React 重复 key 警告。
const columns: UPTable2Column<Row>[] = [
  { title: '姓名', key: 'name', width: '50px', align: 'center' },
  { title: '年龄', key: 'age', width: '50px', align: 'right', headerAlign: 'center' },
  { title: '年龄', key: 'age', width: '50px' },
  { title: '年龄', key: 'age', width: '50px' },
  { title: '年龄', key: 'age', width: '50px' },
  { title: '年龄', key: 'age', width: '50px' },
  { title: '年龄', key: 'age', width: '50px' },
  { title: '年龄', key: 'age', width: '50px' },
  { title: '年龄', key: 'age', width: '50px' },
  { title: '年龄', key: 'age', width: '50px' },
  { title: '年龄', key: 'age', width: '50px' },
];
const columnsStyle: UPTable2Column<Row>[] = [
  { title: '姓名', key: 'name', width: '50px' },
  // 与上游逐字一致：column.style 现在同时作用于表头和该列每个单元格，文字色 color
  // 会落到默认单元格文字上（backgroundColor 落到单元格盒子）。
  {
    title: '年龄',
    key: 'age',
    width: '50px',
    style: { backgroundColor: 'red', color: '#fff', justifyContent: 'center' },
  },
  { title: '年龄', key: 'age', width: '50px' },
];
const cellStyleFunc = (scope: UPTable2CellPayload<Row>) => {
  if (scope.column.key === 'age' && String(scope.row.age) === '25') {
    // 与上游一致：盒子背景蓝、文字黄。
    return { backgroundColor: 'blue', color: 'yellow' };
  }
  return {};
};
const columnsCheck: UPTable2Column<Row>[] = [
  // 复选框列（上游该列没有 key，本地 UPTable2Column.key 是必填项）
  { key: 'selection', type: 'selection', width: '50px' },
  // 普通列
  { title: '姓名', key: 'name' },
  { title: '年龄', key: 'age' },
];
const columns2: UPTable2Column<Row>[] = [
  { title: '姓名', key: 'name', sortable: true },
  { title: '年龄', key: 'age', sortable: true },
];
const filters = { name: '张' };
const tableData3: TreeRow[] = [
  {
    id: 1,
    name: '部门A',
    age: 25,
    age2: 25,
    children: [
      {
        id: 2,
        name: '员工1',
        age: 22,
        age2: 25,
        children: [
          { id: 22, name: '员工22', age: 22, age2: 25 },
          { id: 32, name: '员工32', age: 24, age2: 25 },
        ],
      },
      { id: 3, name: '员工2', age: 24, age2: 25 },
    ],
  },
  { id: 4, name: '部门B', age: 30 },
];
// 上游用表级 #cell 插槽统一渲染；本地只有列级 renderCell，故逐列挂同一个函数
const treeCell = (scope: UPTable2CellPayload<TreeRow>): React.ReactNode => {
  if (scope.column.key === 'actions') {
    return <UPTag size="mini" text="编辑" type="primary" />;
  }
  const value = (scope.row as Record<string, unknown>)[scope.column.key];
  return <Text>{value === undefined || value === null || value === '' ? '-' : String(value)}</Text>;
};
const columns3: UPTable2Column<TreeRow>[] = [
  { key: 'selection', type: 'selection', width: '50px' },
  // 上游注释掉了 { title: '', type: 'expand', width: '50px' }
  { title: '名称', key: 'name', width: '150px', fixed: 'left', renderCell: treeCell },
  { title: '年龄', key: 'age', width: '80px', renderCell: treeCell },
  { title: '年龄', key: 'age2', width: '80px', renderCell: treeCell },
  { title: '操作', key: 'actions', width: '150px', renderCell: treeCell },
];
const columnsFixed: UPTable2Column<FixedRow>[] = [
  { title: '名称', key: 'name', width: '50px' },
  { title: '年龄', key: 'age', width: '60px', fixed: 'left' },
  { title: '年龄2', key: 'age2', width: '60px' },
  { title: '年龄3', key: 'age3', width: '60px' },
  { title: '年龄4', key: 'age4', width: '60px', fixed: 'left' },
  { title: '年龄4', key: 'age4', width: '60px' },
  { title: '年龄5', key: 'age5', width: '60px' },
  { title: '年龄6', key: 'age6', width: '60px' },
  { title: '年龄7', key: 'age7', width: '60px' },
  { title: '年龄8', key: 'age8', width: '60px' },
  { title: '年龄9', key: 'age9', width: '60px' },
  { title: '年龄10', key: 'age10', width: '66px' },
  { title: '年龄11', key: 'age11', width: '66px' },
];
const tableDataFixed: FixedRow[] = [
  { id: 1, name: '张三', age: 25, age2: 25, age3: 25, age4: 25, age5: 25, age6: 25, age7: 25, age8: 25, age9: 25, age10: 25, age11: 25 },
  { id: 2, name: '李四', age: 25, age2: 25, age3: 25, age4: 25, age5: 25, age6: 25, age7: 25, age8: 25, age9: 25, age10: 25, age11: 25 },
];
// 单元格合并示例数据
const tableSpanData: SpanRow[] = [
  { id: 1, name: '张三', age: 25, address: '北京市朝阳区', department: '技术部' },
  { id: 2, name: '李四', age: 30, address: '北京市朝阳区', department: '技术部' },
  { id: 3, name: '王五', age: 28, address: '上海市浦东新区', department: '销售部' },
  { id: 4, name: '赵六', age: 35, address: '广州市天河区', department: '人事部' },
];
const columnsSpan: UPTable2Column<SpanRow>[] = [
  { title: 'ID', key: 'id', width: '50px' },
  { title: '姓名', key: 'name', width: '100px', align: 'center' },
  { title: '年龄', key: 'age', width: '100px', align: 'center' },
  { title: '地址', key: 'address', width: '150px', align: 'center' },
  { title: '部门', key: 'department', width: '100px' },
];
// 单元格合并方法
const arraySpanMethod = ({
  rowIndex,
  columnIndex,
}: UPTable2SpanPayload<SpanRow>): UPTable2SpanResult => {
  // 合并第1行的第1列和第2列单元格
  if (rowIndex === 0 && columnIndex === 1) {
    return [1, 2]; // 合并两行，一列
  } else if (rowIndex === 0 && columnIndex === 2) {
    // 对于被合并的单元格，返回 [0, 0]
    return [0, 0];
  }

  // 合并第1列的第0行和第1行单元格
  if (rowIndex === 0 && columnIndex === 3) {
    return [2, 1]; // 合并两行，一列
  } else if (rowIndex === 1 && columnIndex === 3) {
    return [0, 0];
  }

  // 合并第4列的第0行和第1行单元格
  if (rowIndex === 0 && columnIndex === 4) {
    return [2, 1]; // 合并两行，一列
  } else if (rowIndex === 1 && columnIndex === 4) {
    return [0, 0];
  }

  // 默认不合并
  return [1, 1];
};

export default function Table2Demo() {
  const [currentRowId, setCurrentRowId] = useState<string | number>('');
  const [popupShow, setPopupShow] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const log = (label: string, payload: unknown) =>
    setEvents((prev) => [...prev, `${label}: ${JSON.stringify(payload)}`]);

  const handleRowClick = (row: Row) => {
    setCurrentRowId(row.id);
    log('row-click', row);
  };
  const handleSelectionChange = (rows: readonly Row[]) => log('selection-change', rows);
  // UPTable2 在 effect 里派发 onFilterChange，依赖回调自身的引用：内联箭头会
  // 每次渲染重新触发 → setState → 再渲染，形成死循环，故必须是稳定引用。
  const onFilterChange = useCallback((next: Readonly<Record<string, unknown>>) => {
    setEvents((prev) => [...prev, `filter-change: ${JSON.stringify(next)}`]);
  }, []);
  const handlePopupRowClick = (row: Row) => {
    log('popup row-click', row);
    toast.default(`选中: ${row.name}`);
    setPopupShow(false);
  };

  return (
    <DemoPage>
      {/* 上游各表都不设 height（默认 auto）。RN 下 UPTable2 内部是 flex:1 + FlashList，
          父级高度不确定时会塌成 0，故各表显式给出高度。 */}
      <Section title="基础表格（斑马纹 + 边框）">
        <UPTable2
          border
          columns={columns}
          data={tableData}
          height="120px"
          onRowClick={handleRowClick}
          stripe
        />
      </Section>

      <Section title="表格样式自定义">
        {/* 上游此处还写了空的 <template #cell="scope"></template>，会把所有单元格清空；
            本地保留默认单元格渲染，否则看不出样式效果。 */}
        <UPTable2
          cellStyle={cellStyleFunc}
          columns={columnsStyle}
          data={tableData}
          height="120px"
          onRowClick={handleRowClick}
          stripe
        />
      </Section>

      <Section title="支持单选的表格">
        <UPTable2
          columns={columns}
          currentRowKey={currentRowId}
          data={tableData}
          height="120px"
          highlightCurrentRow
          onRowClick={handleRowClick}
        />
      </Section>

      <Section title="支持复选框的表格">
        <UPTable2
          columns={columnsCheck}
          data={tableData}
          height="120px"
          onSelectionChange={handleSelectionChange}
          rowKey="id"
        />
      </Section>

      <Section title="支持排序与筛选">
        <UPTable2
          columns={columns2}
          data={tableData}
          filters={filters}
          height="120px"
          multiSort
          onFilterChange={onFilterChange}
          onSortChange={(conditions) =>
            log('sort-change', conditions.map((item) => ({ field: item.field, order: item.order })))
          }
          sortable
        />
      </Section>

      <Section title="列固定">
        {/* 本地 fixed: 'left' 是叠在滚动层左侧的浮层，不会把固定列前移到最左，
            所以声明在固定列之前的普通列会被浮层盖住。 */}
        <UPTable2 columns={columnsFixed} data={tableDataFixed} height="120px" />
      </Section>

      <Section title="树形结构">
        {/* 逐字照抄上游，包括 expandRowKeys=['1']。上游 columns3 里的
            `{ title: '', type: 'expand' }` 本来就是注释掉的（table2.nvue:202），
            所以上游这一节同样没有展开箭头，本地不补。
            唯一落差：上游给的是字符串 '1'，本地按 rowKey='id' 解析出的 key 是数字 1，
            类型不同故命中不了，预展开不生效（已记入 REPLICATION_GAPS）。 */}
        <UPTable2
          columns={columns3}
          data={tableData3}
          expandRowKeys={['1']}
          height="120px"
          onExpandChange={(keys) => log('expand-change', keys)}
          treeProps={{ children: 'children' }}
        />
      </Section>

      {/* 单元格合并示例 */}
      <Section title="单元格合并">
        <UPTable2
          border
          columns={columnsSpan}
          data={tableSpanData}
          height="190px"
          spanMethod={arraySpanMethod}
        />
      </Section>

      {/* 新增弹窗示例 */}
      <Section title="弹窗中使用表格">
        <UPButton onClick={() => setPopupShow(true)}>打开弹窗表格</UPButton>
        <UPPopup
          closeable
          mode="bottom"
          onChangeShow={setPopupShow}
          onClose={() => setPopupShow(false)}
          round={10}
          show={popupShow}
        >
          <View style={s.popupTableWrap}>
            <UPTable2
              border
              columns={columns}
              data={tableData}
              height="300px"
              onRowClick={handlePopupRowClick}
              stripe
            />
          </View>
        </UPPopup>
      </Section>

      <EventLog events={events} />
      <PropsTable rows={PROPS} />
    </DemoPage>
  );
}

const s = StyleSheet.create({
  popupTableWrap: { padding: 10 },
});
