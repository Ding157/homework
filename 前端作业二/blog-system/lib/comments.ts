import { supabase } from './supabase'

export interface Comment {
  id: string
  article_id: string
  author_name: string
  author_email: string
  content: string
  created_at: string
}

export async function getComments(articleId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    throw new Error(`Failed to fetch comments: ${error.message}`)
  }
  return data || []
}

export async function createComment(commentData: Omit<Comment, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('comments')
    .insert([commentData])
    .select()
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    throw new Error(`Failed to create comment: ${error.message}`)
  }
  return data
}

export async function deleteComment(id: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting comment:', error)
    throw new Error(`Failed to delete comment: ${error.message}`)
  }
}