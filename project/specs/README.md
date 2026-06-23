# specs/ について

このディレクトリは GitHub Spec Kit の `specify init` 実行後、機能(feature)単位で
自動生成される仕様・計画・タスクの出力先。

```
specs/
└── 001-invoice-export/        ← /speckit.specify 実行時にブランチ名から自動生成
    ├── spec.md                ← 仕様(何を・なぜ)
    ├── plan.md                ← 技術計画(/speckit.plan)
    └── tasks.md                ← タスク分解(/speckit.tasks)
```

- プロジェクト全体の要件・仕様は `docs/requirements/requirements.md` と `docs/specs/spec.md` に記載する(従来通り)
- **機能追加・改修ごとの**仕様・計画・タスクはこの `specs/` 配下にSpec Kitが生成する
- 生成された `plan.md` `tasks.md` は `.specify/memory/constitution.md` の制約を満たしているか
  `/speckit.analyze` で確認すること
