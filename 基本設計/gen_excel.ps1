$outPath = 'D:\IBMStudy\2026-c-02\基本設計\基本設計書.xlsx'

$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false
$xl.DisplayAlerts = $false
$wb = $xl.Workbooks.Add()

# Colors (Excel uses BGR COLORREF = R + G*256 + B*65536)
$cHeader = 31 + 52*256 + 96*65536    # RGB(31,52,96)  Navy
$cSub    = 218 + 227*256 + 243*65536 # RGB(218,227,243) Light Blue
$cLight  = 242 + 242*256 + 242*65536 # RGB(242,242,242) Light Gray
$cWhite  = 255 + 255*256 + 255*65536

function WriteCell($ws, $row, $col, $val, $bold=$false, $bg=-1, $fs=11, $wrap=$false) {
    $c = $ws.Cells.Item($row, $col)
    $c.Value2 = "$val"
    $c.Font.Bold = $bold
    $c.Font.Size = $fs
    if ($bg -ne -1) { $c.Interior.Color = $bg }
    if ($wrap) { $c.WrapText = $true }
}

function WriteHeaderRow($ws, $row, [string[]]$vals) {
    for ($i = 0; $i -lt $vals.Count; $i++) {
        $c = $ws.Cells.Item($row, $i+1)
        $c.Value2 = $vals[$i]
        $c.Font.Bold = $true
        $c.Font.Size = 11
        $c.Interior.Color = $cHeader
        $c.Font.Color = $cWhite
        $c.HorizontalAlignment = -4108
    }
}

# ============================================================
# Sheet1: システム概要
# ============================================================
$ws1 = $wb.Worksheets.Item(1)
$ws1.Name = 'システム概要'

WriteCell $ws1 1 1 '個人運営オンライン書店 基本設計書' $true -1 16
$ws1.Cells.Item(1,1).Font.Color = $cHeader
$ws1.Range('A1:F1').Merge()
WriteCell $ws1 2 1 '作成日: 2026-05-04    バージョン: 1.0.0' $false -1 10
$ws1.Range('A2:F2').Merge()

$r = 4
WriteCell $ws1 $r 1 'システム概要' $true $cHeader 12
$ws1.Cells.Item($r,1).Font.Color = $cWhite
$ws1.Range("A${r}:F${r}").Merge()
$r++

$rows1 = @(
    @('システム名',       '個人運営オンライン書店（購買フロー特化版）'),
    @('目的',             '購入希望者が書籍を見つけ、必要事項を入力して注文を完了するまでの購買フローを提供する'),
    @('対象ユーザー',     '書店サイトを訪れた購入希望者（会員登録不要）'),
    @('主な機能',         '書籍一覧閲覧 / 書籍詳細閲覧 / カート管理 / 注文フォーム入力 / 注文完了確認'),
    @('スコープ外',       'ログイン・会員管理 / 決済処理 / 在庫管理 / 管理画面 / レビュー / 検索・フィルター'),
    @('フロントエンド',   'Next.js 14 + TypeScript (React)'),
    @('バックエンド',     'Node.js + Express + TypeScript (REST API)'),
    @('データベース',     'MySQL 8.0'),
    @('インフラ',         'Docker / Docker Compose')
)
foreach ($row in $rows1) {
    $bg = if (($r % 2) -eq 0) { $cLight } else { -1 }
    WriteCell $ws1 $r 1 $row[0] $true $cSub
    WriteCell $ws1 $r 2 $row[1] $false $bg 11 $true
    $ws1.Range("B${r}:F${r}").Merge()
    $r++
}
$ws1.Columns.Item(1).ColumnWidth = 20
$ws1.Columns.Item(2).ColumnWidth = 70
$ws1.Rows.AutoFit()

# ============================================================
# Sheet2: 機能一覧
# ============================================================
$ws2 = $wb.Worksheets.Add()
$ws2.Move([System.Reflection.Missing]::Value, $wb.Worksheets.Item($wb.Worksheets.Count))
$ws2.Name = '機能一覧'

WriteCell $ws2 1 1 '機能一覧（ユーザー要件）' $true -1 14
$ws2.Range('A1:E1').Merge()

$r = 3
WriteHeaderRow $ws2 $r @('要件ID','画面','ユーザーがしたいこと','補足条件','対応URL')
$r++

$reqs = @(
    @('U-01','商品一覧','販売中の書籍をまとめて見たい','グリッド形式で複数冊を一覧できること','/'),
    @('U-02','商品一覧','各書籍の基本情報を把握したい','書影・タイトル・著者・価格が見えること','/'),
    @('U-03','商品一覧','気になる本の詳細を見たい','商品詳細画面へ遷移できること','/ → /books/:id'),
    @('U-04','商品詳細','書籍の詳しい情報を確認したい','書影・タイトル・著者・価格・説明文が見えること','/books/:id'),
    @('U-05','商品詳細','カートに追加したい','ボタン1つで追加できること','/books/:id'),
    @('U-06','商品詳細','追加後も継続閲覧できる','カートに追加しても画面遷移しないこと','/books/:id'),
    @('U-07','カート','カート内容を確認したい','書名・単価・数量・小計が見えること','/cart'),
    @('U-08','カート','冊数を変更したい','数量変更でリアルタイムに合計が変わること','/cart'),
    @('U-09','カート','不要な本を削除したい','削除後に合計金額が即時更新されること','/cart'),
    @('U-10','カート','合計金額を確認したい','合計金額が常時表示されること','/cart'),
    @('U-11','カート','注文手続きに進みたい','注文フォーム画面へ遷移できること','/cart → /checkout'),
    @('U-12','注文フォーム','顧客情報を入力したい','氏名・メール・住所の3項目が必須入力','/checkout'),
    @('U-13','注文フォーム','入力ミスに気づきたい','未入力や形式不正でエラーメッセージ表示','/checkout'),
    @('U-14','注文フォーム','注文内容を確認しながら入力したい','注文商品と合計金額が同画面で見えること','/checkout'),
    @('U-15','注文フォーム','注文を確定したい','注文するボタン1つで完了画面へ','/checkout → /complete/:id'),
    @('U-16','注文完了','注文受付を確認したい','注文完了メッセージが表示されること','/complete/:orderId'),
    @('U-17','注文完了','注文番号を受け取りたい','注文番号が画面上に表示されること','/complete/:orderId'),
    @('U-18','注文完了','トップへ戻れる','商品一覧へ戻るリンクがあること','/complete/:orderId → /')
)
foreach ($req in $reqs) {
    $bg = if (($r % 2) -eq 0) { $cLight } else { -1 }
    for ($i = 0; $i -lt $req.Count; $i++) {
        WriteCell $ws2 $r ($i+1) $req[$i] $false $bg 10 $true
    }
    $r++
}
$ws2.Columns.Item(1).ColumnWidth = 8
$ws2.Columns.Item(2).ColumnWidth = 12
$ws2.Columns.Item(3).ColumnWidth = 28
$ws2.Columns.Item(4).ColumnWidth = 34
$ws2.Columns.Item(5).ColumnWidth = 22
$ws2.Rows.AutoFit()

# ============================================================
# Sheet3: 画面一覧
# ============================================================
$ws3 = $wb.Worksheets.Add()
$ws3.Move([System.Reflection.Missing]::Value, $wb.Worksheets.Item($wb.Worksheets.Count))
$ws3.Name = '画面一覧'

WriteCell $ws3 1 1 '画面一覧' $true -1 14
$ws3.Range('A1:F1').Merge()

$r = 3
WriteHeaderRow $ws3 $r @('画面No','画面名','URL','説明','対応要件','備考')
$r++

$screens = @(
    @('S-01','商品一覧','/',                '書籍をグリッド形式で一覧表示。書影・タイトル・著者・価格を各カードに表示。','U-01〜U-03','初期表示画面'),
    @('S-02','商品詳細','/books/:id',       '書籍の詳細情報を表示しカートへの追加を行う。','U-04〜U-06','パスパラメータ: id'),
    @('S-03','カート',  '/cart',            'カート内書籍の確認・数量変更・削除・合計確認・注文手続き進行。','U-07〜U-11','カートが空の場合は空状態を表示'),
    @('S-04','注文フォーム','/checkout',    '顧客情報入力フォームと注文内容確認。バリデーション付き。','U-12〜U-15','カートが空の場合は一覧へ誘導'),
    @('S-05','注文完了','/complete/:orderId','注文完了メッセージ・注文番号・注文内容・一覧へのリンクを表示。','U-16〜U-18','パスパラメータ: orderId')
)
foreach ($scr in $screens) {
    $bg = if (($r % 2) -eq 0) { $cLight } else { -1 }
    for ($i = 0; $i -lt $scr.Count; $i++) {
        WriteCell $ws3 $r ($i+1) $scr[$i] $false $bg 10 $true
    }
    $r++
}
$ws3.Columns.Item(1).ColumnWidth = 8
$ws3.Columns.Item(2).ColumnWidth = 14
$ws3.Columns.Item(3).ColumnWidth = 22
$ws3.Columns.Item(4).ColumnWidth = 40
$ws3.Columns.Item(5).ColumnWidth = 12
$ws3.Columns.Item(6).ColumnWidth = 24
$ws3.Rows.AutoFit()

# ============================================================
# Sheet4: API一覧
# ============================================================
$ws4 = $wb.Worksheets.Add()
$ws4.Move([System.Reflection.Missing]::Value, $wb.Worksheets.Item($wb.Worksheets.Count))
$ws4.Name = 'API一覧'

WriteCell $ws4 1 1 'API一覧' $true -1 14
$ws4.Range('A1:G1').Merge()

$r = 3
WriteHeaderRow $ws4 $r @('API ID','メソッド','パス','説明','主なリクエスト','主なレスポンス','利用画面')
$r++

$apis = @(
    @('API-01','GET', '/health',           'バックエンド起動確認',                                          '-',                                                                    'status, message',                     '-'),
    @('API-02','GET', '/api/books',        '書籍一覧取得（全件・ID昇順）',                                   '-',                                                                    'Book[] (id,title,author,price,...)',   'S-01'),
    @('API-03','GET', '/api/books/:id',    '書籍詳細取得',                                                   'パスパラメータ: id (整数)',                                             'Bookオブジェクト',                    'S-02'),
    @('API-04','POST','/api/orders',       '注文作成。トランザクション処理。バリデーションあり。',            'customer_name, customer_email, customer_address, items[{book_id,quantity}]', 'id, order_number, total_amount',      'S-04'),
    @('API-05','GET', '/api/orders/:id',   '注文詳細取得（明細含む）',                                       'パスパラメータ: id (整数)',                                             'Order + items[]',                     'S-05')
)
foreach ($api in $apis) {
    $bg = if (($r % 2) -eq 0) { $cLight } else { -1 }
    for ($i = 0; $i -lt $api.Count; $i++) {
        WriteCell $ws4 $r ($i+1) $api[$i] $false $bg 10 $true
    }
    $r++
}
$ws4.Columns.Item(1).ColumnWidth = 8
$ws4.Columns.Item(2).ColumnWidth = 8
$ws4.Columns.Item(3).ColumnWidth = 20
$ws4.Columns.Item(4).ColumnWidth = 30
$ws4.Columns.Item(5).ColumnWidth = 38
$ws4.Columns.Item(6).ColumnWidth = 28
$ws4.Columns.Item(7).ColumnWidth = 10
$ws4.Rows.AutoFit()

# ============================================================
# Sheet5: DB概要
# ============================================================
$ws5 = $wb.Worksheets.Add()
$ws5.Move([System.Reflection.Missing]::Value, $wb.Worksheets.Item($wb.Worksheets.Count))
$ws5.Name = 'DB概要'

WriteCell $ws5 1 1 'DB概要（テーブル一覧）' $true -1 14
$ws5.Range('A1:E1').Merge()

$r = 3
WriteHeaderRow $ws5 $r @('テーブル名','論理名','主なカラム','説明','関連テーブル')
$r++

$tables = @(
    @('books',       '書籍',    'id, title, author, price, description, image_url',                            '販売書籍マスター。初期8件のサンプルデータあり。',                  'order_items（book_id参照）'),
    @('orders',      '注文',    'id, order_number, customer_name, customer_email, customer_address, total_amount', '注文ヘッダー。order_number は ORD-YYYYMMDDHHmmss-XXXX 形式。', 'order_items（1:N）'),
    @('order_items', '注文明細', 'id, order_id, book_id, title, price, quantity',                              '注文明細。title・price は注文時スナップショット保持。',             'orders（N:1）')
)
foreach ($tbl in $tables) {
    $bg = if (($r % 2) -eq 0) { $cLight } else { -1 }
    for ($i = 0; $i -lt $tbl.Count; $i++) {
        WriteCell $ws5 $r ($i+1) $tbl[$i] $false $bg 10 $true
    }
    $r++
}
$ws5.Columns.Item(1).ColumnWidth = 14
$ws5.Columns.Item(2).ColumnWidth = 10
$ws5.Columns.Item(3).ColumnWidth = 46
$ws5.Columns.Item(4).ColumnWidth = 36
$ws5.Columns.Item(5).ColumnWidth = 24
$ws5.Rows.AutoFit()

# 先頭シートをアクティブに
$wb.Worksheets.Item(1).Activate()

# 保存 (51 = xlOpenXMLWorkbook)
$wb.SaveAs($outPath, 51)
$wb.Close($false)
$xl.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($xl) | Out-Null
Write-Output 'Excel generated: ' + $outPath
