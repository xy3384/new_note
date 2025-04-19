import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">页面未找到</p>
      <Link href="/" className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800">
        返回首页
      </Link>
    </div>
  )
}
