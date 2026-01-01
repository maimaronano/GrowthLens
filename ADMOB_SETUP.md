# Google AdMob 収益化ガイド

このアプリにはGoogle AdMob広告が統合されており、収益化が可能です。

## 📋 目次

1. [AdMobアカウントのセットアップ](#admobアカウントのセットアップ)
2. [広告ユニットの作成](#広告ユニットの作成)
3. [広告IDの設定](#広告idの設定)
4. [テスト方法](#テスト方法)
5. [広告の種類](#広告の種類)
6. [ベストプラクティス](#ベストプラクティス)

## 🚀 AdMobアカウントのセットアップ

### 1. AdMobアカウントを作成

1. [Google AdMob](https://admob.google.com/)にアクセス
2. Googleアカウントでログイン
3. 新しいアプリを登録
   - アプリ名: `GrowthLens`
   - プラットフォーム: iOS / Android
   - アプリは公開済みか: いいえ（開発中の場合）

### 2. アプリIDを取得

- iOS: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`
- Android: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`

## 📱 広告ユニットの作成

### 必要な広告ユニット

1. **バナー広告** (Banner)
   - 画面下部や記事の間に表示される小さな広告
   - サイズ: Adaptive Banner推奨

2. **インタースティシャル広告** (Interstitial) ※オプション
   - 全画面広告
   - 画面遷移時に表示

3. **リワード広告** (Rewarded) ※将来の拡張用
   - 動画視聴で報酬を得る広告
   - ユーザーに特典を提供する際に使用

### 広告ユニットの作成手順

1. AdMobコンソールで「アプリ」→対象アプリを選択
2. 「広告ユニット」タブを開く
3. 「広告ユニットを追加」をクリック
4. 広告フォーマットを選択（バナー/インタースティシャル/リワード）
5. 広告ユニット名を入力（例: `GrowthLens_Banner`）
6. 設定を保存して広告ユニットIDを取得

## ⚙️ 広告IDの設定

### 1. アプリIDの設定

`app.json`を編集：

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
      }
    },
    "android": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
      }
    },
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
          "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
        }
      ]
    ]
  }
}
```

### 2. 広告ユニットIDの設定

`src/config/admob.ts`を編集：

```typescript
export const ADMOB_CONFIG = {
  banner: {
    ios: __DEV__ 
      ? "ca-app-pub-3940256099942544/2934735716" // テスト用
      : "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY", // 本番用
    android: __DEV__ 
      ? "ca-app-pub-3940256099942544/6300978111" // テスト用
      : "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY", // 本番用
  },
  // ... 他の広告タイプも同様に設定
};
```

## 🧪 テスト方法

### 開発中のテスト

- `__DEV__`フラグが`true`の場合、自動的にテスト広告IDが使用されます
- テスト広告は必ず表示され、クリックしても収益は発生しません
- 実際の広告IDでテストすることは**禁止**されています（アカウント停止のリスク）

### テスト広告の確認

```bash
# 開発モードで起動
npm start

# iOS シミュレーターで起動
npm run ios

# Android エミュレーターで起動
npm run android
```

広告が表示されれば成功です。

## 📊 広告の種類と配置

### 現在実装済み

#### 1. バナー広告（Banner Ad）
- **配置場所**: 
  - ホーム画面の上部
  - ログ一覧画面のフィルター下
- **特徴**: 
  - 常に表示される小さな広告
  - ユーザー体験を損なわない
  - 安定した収益源

#### 2. インタースティシャル広告（Interstitial Ad）
- **配置場所**: ※将来実装
  - ログ保存後（5回に1回など）
  - 画面遷移時（適度な頻度で）
- **特徴**:
  - 全画面広告で高いCPM
  - 表示頻度に注意が必要
  - ユーザー体験とのバランスが重要

### 広告配置のベストプラクティス

```typescript
// ホーム画面での使用例
<BannerAdComponent />

// インタースティシャル広告の使用例（将来）
const { show } = useInterstitialAd();

const onLogSave = async () => {
  await saveLog();
  
  // 5回に1回広告を表示
  if (logCount % 5 === 0) {
    show();
  }
};
```

## ✅ ベストプラクティス

### 1. 広告の表示頻度

- **バナー広告**: 常時表示OK
- **インタースティシャル広告**: 
  - 最低でも1分間隔を空ける
  - ユーザーアクション後に表示
  - 連続表示は避ける

### 2. ユーザー体験の維持

```
良い例：
✅ 記事を読み終わった後に全画面広告
✅ 自然な画面遷移時に広告
✅ 広告をスキップできるオプション

悪い例：
❌ アプリ起動直後に全画面広告
❌ ユーザーアクション中に広告を挿入
❌ 広告を連続して表示
```

### 3. AdMobポリシーの遵守

⚠️ **重要**: 以下の行為は禁止されています

- 自分の広告をクリックする
- ユーザーに広告クリックを促す
- 誤クリックを誘発するUI配置
- コンテンツが不十分なページに広告を配置

### 4. プライバシーとGDPR対応

```typescript
// 非パーソナライズ広告をリクエスト（GDPR対応）
InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});
```

## 📈 収益の最大化

### 1. 広告配置の最適化

- ユーザーが最も長く滞在する画面に広告を配置
- スクロール途中に広告を挟む（記事型コンテンツの場合）
- 画面サイズに応じた適応型バナーを使用

### 2. eCPMの向上

- 高品質なコンテンツを提供
- ユーザーのエンゲージメントを高める
- アプリの使用頻度を増やす

### 3. A/Bテスト

- 広告の配置場所をテスト
- 広告の種類をテスト
- 表示タイミングをテスト

## 🔧 トラブルシューティング

### 広告が表示されない

1. **AdMobアカウントが有効か確認**
   - AdMobコンソールで広告ユニットのステータスを確認

2. **広告IDが正しいか確認**
   - `src/config/admob.ts`の設定を再確認
   - テスト広告IDで試す

3. **ログを確認**
   ```
   Console: "AdMob initialized"
   Console: "Banner ad loaded"
   ```

4. **ビルド設定を確認**
   ```bash
   # プロジェクトをクリーンビルド
   npx expo prebuild --clean
   ```

### 広告がテスト広告のまま

- `__DEV__`フラグがfalseになっているか確認
- `src/config/admob.ts`の本番用IDを設定
- プロダクションビルドを作成

## 📚 参考リソース

- [Google AdMob公式ドキュメント](https://admob.google.com/home/resources/)
- [React Native Google Mobile Ads](https://docs.page/invertase/react-native-google-mobile-ads)
- [AdMobポリシー](https://support.google.com/admob/answer/6128543)
- [収益の最適化ガイド](https://support.google.com/admob/answer/9943959)

## 💰 収益の確認

1. [AdMobコンソール](https://admob.google.com/)にログイン
2. 左メニューの「レポート」を選択
3. 収益、インプレッション、クリック率などを確認

---

**注意**: 本番環境にデプロイする前に、必ずテスト広告IDから実際の広告IDに切り替えてください。
