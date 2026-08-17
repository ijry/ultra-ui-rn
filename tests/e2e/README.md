# P0 Native Smoke Tests

1. Run `npm install` in the repository root and `npm install` in `example/`.
2. Run `cd example && npx react-native-asset` to link `uicon-iconfont.ttf`.
3. Start Android with `cd example && npm run android`; on macOS run `bundle exec pod install && npm run ios`.
4. Verify the Info button increments `Clicks` exactly once per press.
5. Verify Disabled and Loading buttons do not increment `Clicks`.
6. Verify Primary is `#3c9cff`, success Plain has a white background with `#5ac725` border, and icon colors match their token.
7. Verify Search, Done, and Error font glyphs render without fallback rectangles.
