import NewPostForm from '../components/NewPostForm';
import { BlogPostCard } from '../components/BlogPostCard';
import type { BlogPost } from '../components/BlogPostCard';
import './style.css'

const postTags: Array<string> = [];

export default function BlogPage() {
  return (
    <NewPostForm postTags={postTags} />
  //   {
  //   getPosts().map(postData => (
  //     <BlogPostCard post={postData} />
  //   ))
  // }
  );
}

// function getPosts(): Array<BlogPost> { return [{}]; }