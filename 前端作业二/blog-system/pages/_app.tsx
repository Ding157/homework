import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>我的博客 - 分享技术与思考</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="个人博客系统，分享技术与思考" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <a href="/" className="text-xl font-bold text-gray-900">我的博客</a>
              <div className="space-x-4">
                <a href="/" className="text-gray-600 hover:text-gray-900">首页</a>
                <a href="/create" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  写文章
                </a>
              </div>
            </div>
          </div>
        </nav>
        <Component {...pageProps} />
      </div>
    </>
  )
}