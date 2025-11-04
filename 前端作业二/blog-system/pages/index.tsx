import { GetStaticProps } from 'next'
import Link from 'next/link'
import Head from 'next/head'
import { getArticles } from '../lib/articles'

interface HomeProps {
  articles: any[]
  totalPages: number
}

export default function Home({ articles, totalPages }: HomeProps) {
  return (
    <>
      <Head>
        <title>首页 - 我的博客</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">我的博客</h1>
          <p className="text-xl text-gray-600">分享技术与思考</p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {articles.map((article) => (
            <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-3">
                  <Link href={`/articles/${article.slug}`} className="hover:text-blue-600">
                    {article.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.excerpt || article.content.substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <time dateTime={article.created_at}>
                    {new Date(article.created_at).toLocaleDateString('zh-CN')}
                  </time>
                  <span className="text-blue-600 hover:text-blue-800">
                    阅读全文 →
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">暂无文章</p>
            <Link href="/create" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              创建第一篇文章
            </Link>
          </div>
        )}

        <div className="text-center">
          <Link href="/create" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold">
            写新文章
          </Link>
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const { articles, totalPages } = await getArticles(1, 9)
    
    return {
      props: {
        articles,
        totalPages
      },
      revalidate: 60
    }
  } catch (error) {
    console.error('Error fetching articles:', error)
    return {
      props: {
        articles: [],
        totalPages: 0
      },
      revalidate: 60
    }
  }
}