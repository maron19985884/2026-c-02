# 会社固有Lintルールのpreset化ガイド

## 結論
Lintルールなど組織固有の規約は、Spec Kitの **preset機能** として切り出すことで、
コア部分（`.specify/`）を変更せずに会社ごとの品質基準を適用できます。

## 理由
Spec Kit公式ドキュメントでは、presetsは「Spec Kitの動作を変更する（新機能は追加しない）」ための仕組みとして定義されており、
コンプライアンス指向のspec形式の強制、ドメイン固有用語の使用、組織標準のplan/tasksへの適用の例が挙げられています。
テンプレートは実行時にスタック（extension/preset/project-local overrides）を上から順に解決し、
最初に一致したものが使われます。優先度が同じ場合は最も優先度の高いものが有効になります。
出典: https://github.com/github/spec-kit/blob/main/README.md

## 具体的な手順
1. **利用可能なpreset/extensionを確認する**
   ```
   specify preset search
   specify extension search
   ```
2. **既存presetがなければ、自社用に新規作成する**
   - Lintコマンド（例: `npm run lint`, `ruff check .`）と、`constitution.md`のセクション1に対応する具体的なルールセット（`.eslintrc`, `pyproject.toml`の`[tool.ruff]`など）をpresetパッケージにまとめる。
3. **project-local overrideで一時的な調整をする場合**
   - 単発プロジェクトのみ調整したい場合は、preset全体を作らず `.specify/templates/overrides/` に該当テンプレートを配置する。
4. **導入**
   ```
   specify preset add <company-preset-name>
   ```
   installed後、コマンドファイルが `.claude/commands/` 等のエージェントディレクトリに書き込まれる。

## 💡 Claude補足
- **注意点**: presetとextensionは役割が異なる。「新しい機能（コマンド）を追加する」ならextension、「既存の挙動・テンプレートを上書きする」ならpresetを使う。Lintルールの適用は基本的に後者（preset）に該当する。
- **落とし穴**: 複数のpreset/extensionが同じコマンドを提供する場合は優先度の高い方が有効になり、削除時は次点のものへ自動的に戻る仕組みになっている。複数社共通で使う場合は優先度設計を事前に決めておくこと。
- **次のステップ**: 実際に自社preset名で `specify preset search` を実行した結果は組織のバージョンやカタログ登録状況に依存するため、貴社環境で必ず実行確認してください（本ガイド作成時点でのコマンド仕様は2026年7月13日時点の公式READMEに基づく）。
