document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('postform');
    const submitButton = document.getElementById('form-submit-btn');
    const submitEditButton = document.getElementById('form-submit-edit-btn');
    const cancelEditButton = document.getElementById('form-cancel-edit-btn');
    const usernameInput = postForm.elements.username;
    const formError = document.getElementById('form-submit-error');
    const formLegend = document.querySelector('.new-post-form legend');
    const postListFilter = document.getElementById('filter-posts-form');
    const filterDropdown = document.getElementById('filter-dropdown');

    function resetEditMode() {
        postForm.reset();
        postForm.elements.postId.value = '';
        usernameInput.disabled = false;
        submitButton.style.display = '';
        submitEditButton.style.display = 'none';
        cancelEditButton.style.display = 'none';
        formError.style.display = 'none';
        formLegend.innerHTML = 'Create new post:';
    }

    resetEditMode();
    cancelEditButton.addEventListener('click', resetEditMode);

    postForm.addEventListener('submit', (event) => {
        const postId = postForm.elements.postId;

        // check all fields for content
        if (postForm.elements.username.value.trim() === ''
            || postForm.elements.title.value.trim() === ''
            || postForm.elements.body.value.trim() === '') {
            event.preventDefault();
            formError.style.display = 'inline-block';
            return;
        }

        // create id if needed
        if (!postId.value) {
            postId.value = generateBlogId();
        }

        // reenable the username field so that it can be submitted
        usernameInput.disabled = false;

        // form data is sent to backend via form's tags' properties
    });

    // functionality for the cards' edit button
    document.querySelectorAll('.edit-post').forEach((editButton) => {
        editButton.addEventListener('click', function (event) {
            event.preventDefault();
            const card = this.closest('.card');
            postForm.elements.postId.value = card.dataset.id;
            document.querySelector('[name="title"]').value = card.dataset.title;
            document.querySelector('[name="tags"]').value = card.dataset.tag;
            document.querySelector('[name="username"]').value = card.dataset.author;
            document.querySelector('[name="body"]').value = card.dataset.body;
            formLegend.innerHTML = 'Edit post:';
            usernameInput.disabled = true;
            submitButton.style.display = 'none';
            submitEditButton.style.display = '';
            cancelEditButton.style.display = '';
        });
    });

    // functionality for the cards' delete button
    document.querySelectorAll('.delete-post').forEach((deleteButton) => {
        deleteButton.addEventListener('click', function (event) {
            event.preventDefault();
            const card = this.closest('.card');
            // create POST /delete request
            fetch('/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ postId: card.dataset.id }),
            }).then(() => {
                // reload the page to get updated cards from the backend
                window.location.reload();
            });
        });
    });

    // clear error on form changed
    postForm.addEventListener('input', () => {
        formError.style.display = 'none';
    });

    // filter posts
    postListFilter.addEventListener('input', (event) => {
        event.preventDefault();
        const filterTag = filterDropdown.value;
        document.querySelectorAll('.card').forEach((card) => {
            const postTag = card.querySelector('.card-tag').innerHTML.trim();
            if (filterTag === 'All' || filterTag === postTag) {
                card.style.display = 'block';
            }
            else {
                card.style.display = 'none';
            }
        });
    })
});

function generateBlogId() {
    // check if browser has crypto library
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}