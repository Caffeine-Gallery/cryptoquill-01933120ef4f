import { backend } from "declarations/backend";

let quill;
const modal = document.getElementById('modal');
const postForm = document.getElementById('postForm');
const newPostBtn = document.getElementById('newPostBtn');
const cancelBtn = document.getElementById('cancelBtn');
const postsContainer = document.getElementById('posts');
const loadingElement = document.getElementById('loading');

// Initialize Quill editor
window.addEventListener('DOMContentLoaded', () => {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
    
    loadPosts();
});

// Event Listeners
newPostBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    resetForm();
});

postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const content = quill.root.innerHTML;

    try {
        modal.style.display = 'none';
        showLoading();
        
        await backend.createPost(title, content, author);
        await loadPosts();
        resetForm();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    }
});

// Helper Functions
async function loadPosts() {
    showLoading();
    try {
        const posts = await backend.getPosts();
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = '<p class="error">Failed to load posts. Please refresh the page.</p>';
    }
    hideLoading();
}

function displayPosts(posts) {
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p class="no-posts">No posts yet. Be the first to create one!</p>';
        return;
    }

    postsContainer.innerHTML = posts.map(post => `
        <article class="post">
            <h2>${post.title}</h2>
            <div class="post-meta">
                <span class="author">By ${post.author}</span>
                <span class="date">${formatDate(post.timestamp)}</span>
            </div>
            <div class="post-content">
                ${post.body}
            </div>
        </article>
    `).join('');
}

function formatDate(timestamp) {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function resetForm() {
    postForm.reset();
    quill.setContents([]);
}

function showLoading() {
    loadingElement.style.display = 'block';
}

function hideLoading() {
    loadingElement.style.display = 'none';
}
