import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { getArticleBySlug, getAllArticleSlugs } from '../../lib/articles'
import { getComments, createComment, Comment } from '../../lib/comments'

interface ArticlePageProps {
  article: any
}

export default function ArticlePage({ article }: ArticlePageProps) {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentForm, setCommentForm] = useState({
    author_name: '',
    author_email: '',
    content: ''
  })

  // 加载评论
  useEffect(() => {
    if (article?.id) {
      loadComments()
    }
  }, [article?.id])

  const loadComments = async () => {
    setLoading(true)
    try {
      const commentsData = await getComments(article.id)
      setComments(commentsData)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCommentLoading(true)

    try {
      await createComment({
        article_id: article.id,
        ...commentForm
      })
      
      // 清空表单并重新加载评论
      setCommentForm({ author_name: '', author_email: '', content: '' })
      await loadComments()
      alert('评论发布成功！')
    } catch (error) {
      console.error('Error creating comment:', error)
      alert('发布评论失败，请稍后重试')
    } finally {
      setCommentLoading(false)
    }
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCommentForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (router.isFallback) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">文章未找到</h1>
          <p className="text-gray-600">抱歉，您查找的文章不存在。</p>
          <a href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            返回首页
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{article.title} - 我的博客</title>
        <meta name="description" content={article.excerpt || article.content.substring(0, 160)} />
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 文章内容 */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-8">
            <header className="mb-8 border-b pb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <time dateTime={article.created_at}>
                  发布于 {new Date(article.created_at).toLocaleDateString('zh-CN')}
                </time>
                {article.updated_at !== article.created_at && (
                  <span>
                    更新于 {new Date(article.updated_at).toLocaleDateString('zh-CN')}
                  </span>
                )}
              </div>
            </header>

            {article.excerpt && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-800 italic">{article.excerpt}</p>
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              {article.content.split('\n').map((paragraph: string, index: number) => (
                <p key={index} className="mb-4 leading-7">
                  {paragraph || <br />}
                </p>
              ))}
            </div>

            <footer className="mt-12 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <a
                  href="/"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← 返回首页
                </a>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  回到顶部 ↑
                </button>
              </div>
            </footer>
          </div>
        </article>

        {/* 评论区域 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">评论 ({comments.length})</h2>

            {/* 评论表单 */}
            <form onSubmit={handleCommentSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">发表评论</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 mb-1">
                    姓名 *
                  </label>
                  <input
                    type="text"
                    id="author_name"
                    name="author_name"
                    value={commentForm.author_name}
                    onChange={handleCommentChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="您的姓名"
                  />
                </div>
                <div>
                  <label htmlFor="author_email" className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱 *
                  </label>
                  <input
                    type="email"
                    id="author_email"
                    name="author_email"
                    value={commentForm.author_email}
                    onChange={handleCommentChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="您的邮箱"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  评论内容 *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={commentForm.content}
                  onChange={handleCommentChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="写下您的评论..."
                />
              </div>
              <button
                type="submit"
                disabled={commentLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {commentLoading ? '发布中...' : '发布评论'}
              </button>
            </form>

            {/* 评论列表 */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map(comment => (
                  <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{comment.author_name}</h4>
                        <p className="text-sm text-gray-500">{comment.author_email}</p>
                      </div>
                      <time className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                      </time>
                    </div>
                    <p className="text-gray-700 leading-6">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无评论，快来发表第一条评论吧！
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const articles = await getAllArticleSlugs()
    
    const paths = articles.map((article) => ({
      params: { slug: article.slug },
    }))

    return {
      paths,
      fallback: true
    }
  } catch (error) {
    console.error('Error generating paths:', error)
    return {
      paths: [],
      fallback: true
    }
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const article = await getArticleBySlug(params?.slug as string)
    
    return {
      props: {
        article
      },
      revalidate: 300
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    return {
      notFound: true
    }
  }
}