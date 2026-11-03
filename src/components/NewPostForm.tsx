interface NewPostFormProps {
  postTags: Array<string>
}

export default function NewPostForm({postTags}: NewPostFormProps) {

  return (
    <div className="new-post-form">
      <form action="/" method="post" id="postform">
        <fieldset>
          <legend> Create new post: </legend>
          <div>
            <input type="hidden" name="postId" form="postform" />
            <label>
              Username: <input name="username" form="postform" />
            </label>
            <label>
              Title: <input name="title" form="postform" />
            </label>
            <label> Tag:
              <select name="tags" form="postform">
                {postTags.map(category => (
                  <option value={category}>{category}</option>
                ))}
              </select>
            </label>
            <br />
            <label className="new-post-body-text-label">Body:</label>
            <br />
            <textarea rows={6} cols={80} name="body" form="postform" className="new-post-body-text"></textarea>
            <br />
            <button type="submit" form="postform" id="form-submit-btn">Submit</button>
            <button type="submit" form="postform" id="form-submit-edit-btn" style={{ display: 'none' }}>Submit Edit</button>
            <button type="button" form="postform" id="form-cancel-edit-btn" style={{ display: 'none' }}>Cancel Edit</button>
            <span id="form-submit-error" style={{ color: 'brown', fontWeight: 'bold', marginLeft: '1rem' }}>
              All fields required!
            </span>
          </div>
        </fieldset>
      </form>
    </div>
  )
}