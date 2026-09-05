-- ============================================================
-- 003-bookstore-purchase-flow / 書籍シードデータ（デモ用）
-- status='selling' を 26 件、status='unlisted' を 3 件投入。
-- 既定 pageSize=12 で 3 ページ以上になる件数。
-- cover_image_url は全件 /images/books/placeholder.svg に統一（A2 / T010b）。
-- ============================================================

SET NAMES utf8mb4;

INSERT INTO books (title, author, price, cover_image_url, description, status) VALUES
  ('吾輩は猫である',        '夏目 漱石',   780, '/images/books/placeholder.svg', '英語教師・珍野苦沙弥のもとに飼われる猫の視点で、明治の知識人たちの生態を風刺的に描く長編小説。', 'selling'),
  ('こころ',                '夏目 漱石',   690, '/images/books/placeholder.svg', '「先生」と「私」の交流を軸に、罪の意識と孤独を見つめた漱石後期の代表作。', 'selling'),
  ('坊っちゃん',            '夏目 漱石',   620, '/images/books/placeholder.svg', '四国の中学校に赴任した江戸っ子教師の痛快な奮闘を、歯切れのよい一人称で描く。', 'selling'),
  ('門',                    '夏目 漱石',   640, '/images/books/placeholder.svg', 'ひっそりと暮らす夫婦の日常に差す影を通して、過去の負い目と救いの不在を描く。', 'selling'),
  ('羅生門・鼻',            '芥川 龍之介', 560, '/images/books/placeholder.svg', '荒廃した都を舞台にした表題作ほか、人間のエゴイズムを鋭く切り取る初期短編集。', 'selling'),
  ('地獄変',                '芥川 龍之介', 580, '/images/books/placeholder.svg', '芸術の完成に取り憑かれた絵師・良秀の悲劇を描く、芥川の芸術至上主義の極点。', 'selling'),
  ('人間失格',              '太宰 治',     600, '/images/books/placeholder.svg', '「恥の多い生涯を送って来ました」——道化を演じ続けた男の手記という形式の告白小説。', 'selling'),
  ('走れメロス',            '太宰 治',     520, '/images/books/placeholder.svg', '友を人質に走る青年の姿に信実を託した表題作を含む短編集。', 'selling'),
  ('斜陽',                  '太宰 治',     580, '/images/books/placeholder.svg', '没落貴族の家に生きる母娘を通して、戦後の価値の崩壊と再生への渇望を描く。', 'selling'),
  ('銀河鉄道の夜',          '宮沢 賢治',   700, '/images/books/placeholder.svg', 'ジョバンニとカムパネルラが銀河を旅する幻想的な物語。賢治の死生観が結晶した未完の名作。', 'selling'),
  ('注文の多い料理店',      '宮沢 賢治',   540, '/images/books/placeholder.svg', '山奥の西洋料理店に迷い込んだ紳士たちを待つ皮肉な顛末。童話集の表題作ほか収録。', 'selling'),
  ('風の又三郎',            '宮沢 賢治',   560, '/images/books/placeholder.svg', '転校生の少年をめぐる山あいの村の子どもたちのひと夏を、風の気配とともに描く。', 'selling'),
  ('雪国',                  '川端 康成',   720, '/images/books/placeholder.svg', '雪深い温泉町を舞台に、島村と駒子の関わりを繊細な感覚描写でつづるノーベル賞作家の代表作。', 'selling'),
  ('伊豆の踊子',            '川端 康成',   500, '/images/books/placeholder.svg', '旅の学生と踊子の淡い交流を、みずみずしい抒情でとらえた青春小説。', 'selling'),
  ('金閣寺',                '三島 由紀夫', 830, '/images/books/placeholder.svg', '金閣に美の絶対を見た青年僧が放火に至るまでの内面を、緻密な論理と絢爛な文体で追う。', 'selling'),
  ('潮騒',                  '三島 由紀夫', 640, '/images/books/placeholder.svg', '小さな島の若い漁師と海女の恋を、古典的な均整をもって描いた物語。', 'selling'),
  ('細雪（上）',            '谷崎 潤一郎', 880, '/images/books/placeholder.svg', '大阪・蒔岡家の四姉妹の日々を、失われゆく上方の暮らしとともに丹念につづる長編。', 'selling'),
  ('春琴抄',                '谷崎 潤一郎', 560, '/images/books/placeholder.svg', '盲目の三味線の師・春琴と、献身する佐助の異様な愛の形を描く。', 'selling'),
  ('舞姫',                  '森 鴎外',     500, '/images/books/placeholder.svg', 'ベルリン留学の官吏・太田豊太郎と踊子エリスの悲恋を、雅文体でつづる近代文学の起点。', 'selling'),
  ('高瀬舟',                '森 鴎外',     480, '/images/books/placeholder.svg', '罪人を護送する高瀬舟の一夜を通して、安楽死と足るを知ることの意味を問う短編。', 'selling'),
  ('智恵子抄',              '高村 光太郎', 620, '/images/books/placeholder.svg', '妻・智恵子への愛と喪失をうたった詩集。「あどけない話」ほかを収録。', 'selling'),
  ('一握の砂',              '石川 啄木',   540, '/images/books/placeholder.svg', '三行書きの短歌で日々の哀歓を刻んだ啄木の第一歌集。', 'selling'),
  ('たけくらべ',            '樋口 一葉',   520, '/images/books/placeholder.svg', '吉原近くの子どもたちの淡い恋と別れを、擬古文の名文で描く。', 'selling'),
  ('三四郎',                '夏目 漱石',   660, '/images/books/placeholder.svg', '熊本から上京した小川三四郎が、都会と学問と恋のあいだで揺れる青春を描く。', 'selling'),
  ('それから',              '夏目 漱石',   660, '/images/books/placeholder.svg', '働かない高等遊民・代助が、友の妻への思いに向き合っていく心理小説。', 'selling'),
  ('風立ちぬ',              '堀 辰雄',     560, '/images/books/placeholder.svg', 'サナトリウムで過ごす「私」と婚約者・節子の日々を、死を見据えつつ静かにつづる。', 'selling'),
  ('道草',                  '夏目 漱石',   680, '/images/books/placeholder.svg', '（在庫調整中）漱石が唯一自伝的題材を扱った長編。現在は非公開。', 'unlisted'),
  ('或る女',                '有島 武郎',   740, '/images/books/placeholder.svg', '（公開準備中）奔放に生きた葉子の運命を描く長編。', 'unlisted'),
  ('田園の憂鬱',            '佐藤 春夫',   600, '/images/books/placeholder.svg', '（公開停止中）都会を離れた青年の神経の揺らぎを描く散文詩的小説。', 'unlisted');
