import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import NewPostForm from '../components/NewPostForm';
import { BlogPostCard } from '../components/BlogPostCard';
import type { BlogPost } from '../components/BlogPostCard';
import './style.css'

const postTags = ['Tech', 'Lifestyle', 'Education', 'Hobby', 'Business'];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [error, setError] = useState('');
  const [currentUser] = useState(() => localStorage.getItem('username') ?? '');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const refreshPosts = useCallback(async () => {
    try {
      const response = await axios.get<BlogPost[]>('/posts');
      setPosts(response.data);
      setError('');
    } catch (requestError) {
      console.error('Failed to load posts:', requestError);
      setError('Unable to load posts. Please try again later.');
    }
  }, []);

  useEffect(() => {
    void refreshPosts();
  }, [refreshPosts]);

  async function deletePost(post: BlogPost) {
    if (!window.confirm(`Delete "${post.title}"?`)) return;

    try {
      await axios.post('/delete', { postId: post.id, username: currentUser });
      await refreshPosts();
    } catch (requestError) {
      console.error('Failed to delete post:', requestError);
      window.alert('Unable to delete the post.');
    }
  }

  return (
    <>
      <NewPostForm
        postTags={postTags}
        currentUser={currentUser}
        editingPost={editingPost}
        onCancelEdit={() => setEditingPost(null)}
        onPostSaved={async () => {
          setEditingPost(null);
          await refreshPosts();
        }}
      />
      {error && <p role="alert">{error}</p>}
      {posts.map(postData => (
        <BlogPostCard
          key={postData.id}
          post={postData}
          canManage={Boolean(currentUser) && postData.creatorUserID === currentUser}
          onEdit={() => setEditingPost(postData)}
          onDelete={() => void deletePost(postData)}
        />
      ))}
    </>
  );
}