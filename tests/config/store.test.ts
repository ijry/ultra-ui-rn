import {
  getUPConfig,
  resetUPConfigForTests,
  setUPConfig,
} from '../../src/config/store';

const packageJson = jest.requireActual('../../package.json') as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
};

afterEach(resetUPConfigForTests);

it('declares optional picker peers for upload integration', () => {
  expect(packageJson.peerDependencies).toEqual(
    expect.objectContaining({
      '@react-native-documents/picker': expect.any(String),
      'react-native-image-picker': expect.any(String),
    }),
  );
  expect(packageJson.peerDependenciesMeta).toEqual(
    expect.objectContaining({
      '@react-native-documents/picker': { optional: true },
      'react-native-image-picker': { optional: true },
    }),
  );
});

it('merges P32 upload and lazy-load defaults through setUPConfig', () => {
  resetUPConfigForTests();

  expect(getUPConfig().props.upload).toEqual(
    expect.objectContaining({
      accept: 'image',
      autoUpload: true,
      deletable: true,
      maxCount: 9,
      name: 'file',
      previewImage: true,
    }),
  );
  expect(getUPConfig().props.lazyLoad).toEqual(
    expect.objectContaining({
      height: 100,
      mode: 'aspectFill',
      once: true,
      threshold: 0,
      width: 100,
    }),
  );

  setUPConfig({
    props: {
      lazyLoad: { threshold: 80 },
      upload: { accept: 'all', maxCount: 3 },
    },
  });

  expect(getUPConfig().props.upload).toEqual(
    expect.objectContaining({ accept: 'all', autoUpload: true, maxCount: 3 }),
  );
  expect(getUPConfig().props.lazyLoad).toEqual(
    expect.objectContaining({ once: true, threshold: 80 }),
  );
});

it('declares the FlashList runtime dependency for P33', () => {
  expect(packageJson.dependencies).toEqual(
    expect.objectContaining({ '@shopify/flash-list': '^2.3.2' }),
  );
});

it('merges tree defaults through setUPConfig', () => {
  resetUPConfigForTests();

  expect(getUPConfig().props.tree).toEqual(
    expect.objectContaining({
      accordion: false,
      checkStrictly: false,
      defaultCheckedKeys: [],
      defaultExpandedKeys: [],
      defaultExpandAll: false,
      fieldNames: {
        children: 'children',
        disabled: 'disabled',
        label: 'label',
        nodeKey: 'id',
      },
      highlightCurrent: false,
      showCheckbox: false,
    }),
  );

  setUPConfig({
    props: {
      tree: {
        accordion: true,
        indent: 40,
        showCheckbox: true,
      },
    },
  });

  expect(getUPConfig().props.tree).toEqual(
    expect.objectContaining({ accordion: true, indent: 40, showCheckbox: true }),
  );
});

it('merges waterfall defaults through setUPConfig', () => {
  resetUPConfigForTests();

  expect(getUPConfig().props.waterfall).toEqual(
    expect.objectContaining({
      addTime: 200,
      columns: 2,
      columnsMin: 2,
      idKey: 'id',
      minColumnWidth: 230,
      optimizeItemArrangement: false,
      value: [],
    }),
  );

  setUPConfig({
    props: {
      waterfall: {
        addTime: 0,
        columns: 'auto',
        minColumnWidth: 180,
      },
    },
  });

  expect(getUPConfig().props.waterfall).toEqual(
    expect.objectContaining({
      addTime: 0,
      columns: 'auto',
      minColumnWidth: 180,
      optimizeItemArrangement: false,
    }),
  );
});

it('merges a color override without losing source defaults', () => {
  setUPConfig({ color: { primary: '#000000' } });

  expect(getUPConfig().color.primary).toBe('#000000');
  expect(getUPConfig().color.error).toBe('#f56c6c');
});

it('merges picker prop overrides without losing source picker defaults', () => {
  setUPConfig({ props: { picker: { title: 'Configured picker' } } });

  expect(getUPConfig().props.picker.title).toBe('Configured picker');
  expect(getUPConfig().props.picker.itemHeight).toBe(44);
});

it('merges keyboard prop overrides without losing source keyboard defaults', () => {
  setUPConfig({
    props: {
      carKeyboard: { random: true },
      keyboard: { confirmText: 'Submit' },
      numberKeyboard: { dotDisabled: true },
    },
  });

  expect(getUPConfig().props.keyboard.confirmText).toBe('Submit');
  expect(getUPConfig().props.keyboard.mode).toBe('number');
  expect(getUPConfig().props.keyboard.safeAreaInsetBottom).toBe(true);
  expect(getUPConfig().props.numberKeyboard.dotDisabled).toBe(true);
  expect(getUPConfig().props.numberKeyboard.mode).toBe('number');
  expect(getUPConfig().props.carKeyboard.random).toBe(true);
});

it('merges tooltip prop overrides without losing source tooltip defaults', () => {
  setUPConfig({ props: { tooltip: { buttons: ['Archive'], showCopy: false } } });

  expect(getUPConfig().props.tooltip.buttons).toEqual(['Archive']);
  expect(getUPConfig().props.tooltip.showCopy).toBe(false);
  expect(getUPConfig().props.tooltip.triggerMode).toBe('longpress');
  expect(getUPConfig().props.tooltip.overlay).toBe(true);
});

it('merges code prop overrides without losing source code defaults', () => {
  setUPConfig({ props: { code: { changeText: 'Again X', keepRunning: true } } });

  expect(getUPConfig().props.code.changeText).toBe('Again X');
  expect(getUPConfig().props.code.keepRunning).toBe(true);
  expect(getUPConfig().props.code.seconds).toBe(60);
  expect(getUPConfig().props.code.endText).toBe('重新获取');
});
