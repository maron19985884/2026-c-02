# 既存システム改修（Brownfield）運用ガイド

## 結論
既存システムの改修では、システム全体を仕様化するのではなく、**「改修する変更点だけ」を対象にした狭いスコープのspec（change-spec）を作成する**運用が、Spec Kit公式・実務事例の両方で推奨されています。

## 理由
Spec Kit公式READMEは「既存プロジェクトについては、Spec Kit本体（ツール）の更新と、機能仕様（specs/配下）の更新を分けて管理し、意図した挙動が変わったときにspecs/を更新する」という運用（Evolving Specsガイド）を推奨しています。
出典: https://github.com/github/spec-kit/blob/main/README.md

また、Spec Kitの公式Discussionでも「既存の複雑な機能を全て再実装するのは非現実的であり、spec自体を正とする考え方と、変更作業を分離する必要がある」という課題が議論されています。
出典: https://github.com/github/spec-kit/discussions/746 、 https://github.com/github/spec-kit/discussions/152

## 具体的な運用方法

### 1. 改修単位でのspec作成（推奨パターン）
- システム全体のspecを最初に作ろうとしない。**これから改修する範囲だけ**を対象に `/speckit.specify` を実行する。
- 例: 「請求書PDF出力機能に消費税表示を追加する」という改修であれば、その範囲だけをspec化する。

### 2. 既存コードの調査を最初に行う
- 改修前に、対象モジュールの現状仕様・制約をAIエージェントに調査させ、`plan.md`の前提条件として明記する。
- `constitution.md`に記載できない詳細な既存設計書・コーディング規約（`.cursor/rules/`等の既存ドキュメント）がある場合は、`constitution.md`から参照する形にし、内容を丸ごと転記しない。

### 3. 改修specのテンプレート（`.specify/templates/overrides/`に配置）
`docs/change-spec-template.md` を参照。改修前後の差分・影響範囲・既存テストへの影響を明記する欄を追加している。

### 4. 段階的にspec化範囲を広げる
- 1回の改修ごとにspecを積み重ねることで、頻繁に改修されるモジュールは自然とspecのカバレッジが高まっていく（インクリメンタルなspec化）。
- 全体を一度にリバースエンジニアリングしてspec化する方法は、AIが生成したspecが実際の意図と食い違うリスクが高いため、公式・実務双方で推奨されていません。
出典: https://intent-driven.dev/blog/2026/03/10/spec-driven-development-brownfield/

## 💡 Claude補足
- **注意点**: 既存システム改修用の非公式extension（例: `spec-kit-brownfield`、`speckit.brownfield.scan`等のコマンドを追加するもの）がコミュニティから公開されていますが、これらは **GitHub公式（github/spec-kit）が提供するものではなく、サードパーティのコミュニティ拡張**です。導入前に必ずソースコードを確認し、自己責任で利用してください。
- **落とし穴**: 複数リポジトリに機能が分散している場合（Webアプリ・マイクロサービス・共通モジュールなど）、1つのspecで全リポジトリをカバーしようとすると管理が破綻しやすいという課題が公式Discussionでも報告されています。リポジトリ単位・機能単位でspecを分割する設計を検討してください。
- **確証が取れなかった情報**: 既存システム改修に関する「公式のBrownfield拡張機能」が今後GitHub公式から提供される予定があるかどうかは、2026年7月13日時点の検索結果では確認できませんでした。
