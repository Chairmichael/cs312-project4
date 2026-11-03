export interface BlogPost {
  id: string;
  title: string;
  tag: string;
  creator_name: string;
  creatorUserID: string;
  body: string;
  date_created: Date | string;
}

interface BlogPostCardProps {
  post: BlogPost;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function BlogPostCard({ post, canManage, onEdit, onDelete }: BlogPostCardProps) {
  const dateCreated = new Date(post.date_created);

  return (
    <div
      className="card"
      data-title={post.title}
      data-tag={post.tag}
      data-creator-name={post.creator_name}
      data-body={post.body}
      data-id={post.id}
    >
      <h2 style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        {post.title}
        <span className="card-tag">{post.tag}</span>
        <span className="card-date">
          {' '}posted {dateCreated.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
      </h2>
      <h4 style={{ marginTop: '0rem' }}>
        <span style={{ fontWeight: 'normal' }}>by</span>{' '}
        <i>{post.creator_name}</i>
      </h4>
      <p>{post.body}</p>
      {canManage && (
        <>
          <button type="button" onClick={onEdit} style={{ marginRight: '1rem' }}>
            Edit
          </button>
          <button type="button" onClick={onDelete}>
            Delete
          </button>
        </>
      )}
    </div>
  );
}
