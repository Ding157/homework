import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TestSupabase() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .limit(5)

        if (error) throw error
        
        setArticles(data || [])
      } catch (error) {
        console.error('连接测试失败:', error)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  if (loading) return <div>测试数据库连接中...</div>

  return (
    <div>
      <h1>Supabase 连接测试</h1>
      <p>找到 {articles.length} 篇文章</p>
      <ul>
        {articles.map(article => (
          <li key={article.id}>{article.title}</li>
        ))}
      </ul>
    </div>
  )
}