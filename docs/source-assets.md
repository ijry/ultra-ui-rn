# Source Assets

`src/icons/uicon-iconfont.ttf` is copied verbatim from uview-plus 3.8.86 at `components/u-icon/upicon.ttf`. It is distributed under the source repository's MIT license, reproduced at the repository root in `LICENSE`.

`src/icons/upicon-map.ts` is generated from `components/u-icon/icons.js` and contains the upstream `uicon-*` name-to-Unicode map. Regenerate it from this repository root with:

```sh
node scripts/generate-upicon-map.mjs
```

The script defaults to the sibling `../uview-plus` repository. Set `UP_ICON_SOURCE` to an absolute `icons.js` path when regenerating from another checkout.
