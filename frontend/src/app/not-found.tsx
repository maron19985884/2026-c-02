import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-5xl font-bold text-gray-300">404</p>
      <h1 className="text-xl font-semibold text-gray-700">
        書籍が見つかりません
      </h1>
      <p className="text-gray-500 text-sm">
        指定されたページは存在しないか、削除された可能性があります。
      </p>
      <Link
        href="/"
        className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
      >
        商品一覧へ戻る
      </Link>
    </div>
  );
}
