import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import axios from "axios";
import type { BlogPost } from "./BlogPostCard";

interface NewPostFormProps {
  postTags: Array<string>;
  currentUser: string;
  editingPost: BlogPost | null;
  onCancelEdit: () => void;
  onPostSaved: () => Promise<void>;
}

export default function NewPostForm({
  postTags,
  currentUser,
  editingPost,
  onCancelEdit,
  onPostSaved,
}: NewPostFormProps) {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState(postTags[0] ?? "");
  const [body, setBody] = useState("");
  const [titleChanged, setTitleChanged] = useState(false);
  const [tagChanged, setTagChanged] = useState(false);
  const [bodyChanged, setBodyChanged] = useState(false);

  useEffect(() => {
    setTitle(editingPost?.title ?? "");
    setTag(editingPost?.tag ?? postTags[0] ?? "");
    setBody(editingPost?.body ?? "");
    setTitleChanged(false);
    setTagChanged(false);
    setBodyChanged(false);
  }, [editingPost, postTags]);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!currentUser) {
      window.alert("Please sign in before creating or editing a post.");
      return;
    }

    const emptyFields: string[] = [];
    if (!title.trim()) emptyFields.push("title");
    if (!tag.trim()) emptyFields.push("tag");
    if (!body.trim()) emptyFields.push("body");

    if (emptyFields.length > 0) {
      window.alert(`Please fill in the following fields: ${emptyFields.join(", ")}.`);
      return;
    }

    try {
      await axios.post("/submitpost", {
        postId: editingPost?.id ?? "",
        username: currentUser,
        creatorUserID: currentUser,
        title,
        tags: tag,
        body,
      });
      setTitle("");
      setTag(postTags[0] ?? "");
      setBody("");
      onCancelEdit();
      await onPostSaved();
    } catch (error) {
      console.error("Failed to save post:", error);
      window.alert("Unable to save the post. Please try again.");
    }
  }

  return (
    <div className="new-post-form">
      <form action="/" method="post" id="postform" onSubmit={handleSubmit}>
        <fieldset>
          <legend>{editingPost ? "Edit post:" : "Create new post:"}</legend>
          <div>
            <label>
              Username: <input name="username" form="postform" value={currentUser} readOnly />
            </label>
            <label>
              Title: <input name="title" form="postform" value={title}
                style={{ borderColor: titleChanged && !title.trim() ? "red" : undefined }}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setTitleChanged(true);
                }}
              />
            </label>
            <label> Tag:
              <select name="tags" form="postform" value={tag}
                style={{ borderColor: tagChanged && !tag.trim() ? "red" : undefined }}
                onChange={(event) => {
                  setTag(event.target.value);
                  setTagChanged(true);
                }}
              >
                {postTags.map(category => (
                  <option value={category}>{category}</option>
                ))}
              </select>
            </label>
            <br />
            <label className="new-post-body-text-label">Body:</label>
            <br />
            <textarea rows={6} cols={80} name="body" form="postform" className="new-post-body-text" value={body}
              style={{ borderColor: bodyChanged && !body.trim() ? "red" : undefined }}
              onChange={(event) => {
                setBody(event.target.value);
                setBodyChanged(true);
              }}
            />
            <br />
            <button type="submit" form="postform" id="form-submit-btn">
              {editingPost ? "Save Changes" : "Submit"}
            </button>
            {editingPost && (
              <button type="button" onClick={onCancelEdit}>Cancel</button>
            )}
            <span id="form-submit-error" style={{ color: 'brown', fontWeight: 'bold', marginLeft: '1rem', display: 'none' }}>
              All fields required!
            </span>
          </div>
        </fieldset>
      </form>
    </div>
  )
}