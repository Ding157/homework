import { supabase } from './supabase'

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  author_id: string
  created_at: string
  updated_at: string
  published: boolean
}

export async function getArticles(page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1

  const { data, error, count } = await supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(start, end)

  if (error) {
    console.error('Error fetching articles:', error)
    throw new Error(`Failed to fetch articles: ${error.message}`)
  }
  
  return {
    articles: data || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize)
  }
}

export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) {
    console.error('Error fetching article:', error)
    throw new Error(`Failed to fetch article: ${error.message}`)
  }
  
  return data
}

export async function createArticle(articleData: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'author_id'>) {
  const { data, error } = await supabase
    .from('articles')
    .insert([{
      ...articleData,
      author_id: 'default-author' // 暂时使用默认作者ID
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating article:', error)
    throw new Error(`Failed to create article: ${error.message}`)
  }
  return data
}

export async function updateArticle(id: string, articleData: Partial<Article>) {
  const { data, error } = await supabase
    .from('articles')
    .update({
      ...articleData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating article:', error)
    throw new Error(`Failed to update article: ${error.message}`)
  }
  return data
}

export async function deleteArticle(id: string) {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting article:', error)
    throw new Error(`Failed to delete article: ${error.message}`)
  }
}

export async function getAllArticleSlugs() {
  const { data, error } = await supabase
    .from('articles')
    .select('slug')
    .eq('published', true)

  if (error) {
    console.error('Error fetching slugs:', error)
    throw new Error(`Failed to fetch slugs: ${error.message}`)
  }
  return data || []
}