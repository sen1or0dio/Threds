const regist_button = document.querySelector('.registration-button')
const login_button = document.querySelector('.login-button')
const usernameInput = document.querySelector('.username-input')
const passwordInput = document.querySelector('.password-input')
const homePage = document.querySelector('.main-section')
const registrationPage = document.querySelector('.registration-main-block')
const postInput = document.querySelector('.post-input')
const postButton = document.querySelector('.post-button')
const all_posts = document.querySelector('.posts-container')
const deleteModal = document.querySelector('#delete-modal')
const confirmDeleteButton = document.querySelector('.modal-confirm')
const cancelDeleteButton = document.querySelector('.modal-cancel')
const addPostButton = document.querySelector('#add-post-button')
const addPostModal = document.querySelector('#add-post-modal')
const addPostCancel = document.querySelector('#add-post-cancel')
const addPostSubmit = document.querySelector('#add-post-submit')
const newPostInput = document.querySelector('.new-post-input')
const authToggle = document.querySelector('#auth-toggle')

let userId = null
let postToDelete = null
let currentPage = 'home'
let isLoginMode = true

authToggle.addEventListener('click', () => {
    isLoginMode = !isLoginMode

    if (isLoginMode) {
        login_button.style.display = 'block'
        regist_button.style.display = 'none'
        authToggle.textContent = 'Нет аккаунта? Зарегистрируйся!'
    } else {
        login_button.style.display = 'none'
        regist_button.style.display = 'block'
        authToggle.textContent = 'Уже есть аккаунт? Войти'
    }
})


regist_button.addEventListener('click', async () => {
    const userName = usernameInput.value.trim()
    const password = passwordInput.value

    if (!userName || !password) {
        alert('Введите логин и пароль')
        return
    }

    try {
        const response = await fetch('https://threds-backend-production.up.railway.app/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_name: userName, password })
        })

        const data = await response.json()

        if (!response.ok) {
            const message = Array.isArray(data.detail) ? data.detail[0].msg : (data.detail || 'Ошибка регистрации')
            throw new Error(message)
        }

        alert(data.message || 'Успешно')

        userId = data.user_id
        homePage.style.display = 'flex'
        registrationPage.style.display = 'none'
        loadAllPosts()
    } catch (error) {
        alert(error.message)
    }
})

login_button.addEventListener('click', async () => {
    const userName = usernameInput.value.trim()
    const password = passwordInput.value

    if (!userName || !password) {
        alert('Введите логин и пароль')
        return
    }

    try {
        const response = await fetch('https://threds-backend-production.up.railway.app/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_name: userName, password })
        })

        const data = await response.json()

        if(!userName || !password) {
            alert('Введите логин и пароль')
            return
        }

        if (!response.ok) {
            const message = Array.isArray(data.detail) ? data.detail[0].msg : data.detail
            throw new Error(message)
        }

        if(response.ok) {
            userId = data.user_id
            homePage.style.display = 'flex'
            registrationPage.style.display = 'none'

        }
    } catch (error) {
        alert(error.message)
    }
})

if (postButton) {
    postButton.addEventListener('click', async () => {
        const postContent = postInput.value.trim()

        if(!postContent) {
            alert('Введите текст поста')
            return
        }

        try {
            const response = await fetch("https://threds-backend-production.up.railway.app/new_post", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: postContent,  user_id: userId})
            })

        }catch (error){

        }
    })
}

function renderPosts(posts, showDelete = false) {
    all_posts.innerHTML = ''

    posts.forEach(post => {
        
        const author = post.user_name || 'Я'
        const canDelete = showDelete

        const postWrapper = document.createElement('div')
        postWrapper.classList.add('post-wrapper')
        postWrapper.innerHTML = `
            <p class="post-author">${author}</p>
            <div class="postBlock">
                <p class="post-text">${post.post_content}</p>
                <button class="like-button ${post.is_liked ? 'liked' : ''}">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span class="like-count">${post.like_count || 0}</span>
                </button>
                ${canDelete ? `<button class="delete-button">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>` : ''}
            </div>
        `

        const likeButton = postWrapper.querySelector('.like-button')

        likeButton.addEventListener('click', async () => {
            const isLiked = likeButton.classList.contains('liked')
            const endpoint = isLiked ? 'unlike' : 'like'

            await fetch(`https://threds-backend-production.up.railway.app/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, post_id: post.id })
            })

            const countSpan = likeButton.querySelector('.like-count')
            let count = parseInt(countSpan.textContent) || 0

            likeButton.classList.toggle('liked')
            countSpan.textContent = isLiked ? count - 1 : count + 1
        })

        if (canDelete) {
            const deleteButton = postWrapper.querySelector('.delete-button')

            deleteButton.addEventListener('click', () => {
                postToDelete = post.id
                deleteModal.style.display = 'flex'
            })
        }

        all_posts.appendChild(postWrapper)
    });
}

cancelDeleteButton.addEventListener('click', () => {
    deleteModal.style.display = 'none'
    postToDelete = null
})

confirmDeleteButton.addEventListener('click', async () => {
    await fetch('https://threds-backend-production.up.railway.app/delete_post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postToDelete, user_id: userId })
    })

    deleteModal.style.display = 'none'
    postToDelete = null

    if (currentPage === 'myposts') {
        loadMyPosts()
    } else {
        loadAllPosts()
    }
})

addPostButton.addEventListener('click', () => {
    addPostModal.style.display = 'flex'
})

addPostCancel.addEventListener('click', () => {
    addPostModal.style.display = 'none'
    newPostInput.value = ''
})

addPostSubmit.addEventListener('click', async () => {
    const content = newPostInput.value.trim()

    if (!content) {
        return
    }

    await fetch('https://threds-backend-production.up.railway.app/new_post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, content })
    })

    addPostModal.style.display = 'none'
    newPostInput.value = ''
    loadMyPosts()
})

function loadAllPosts() {
    fetch(`https://threds-backend-production.up.railway.app/all_posts?user_id=${userId}`)
    .then( response => response.json())
    .then(data => renderPosts(data.posts))
    .catch(() => {
        all_posts.innerHTML = '<p class="post-text">Не удалось загрузить посты</p>'
    })
}

function loadMyPosts() {
    fetch('https://threds-backend-production.up.railway.app/user_post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 0, content: '', user_id: userId })
    })
    .then( response => response.json())
    .then(data => renderPosts(data.posts, true))
    .catch(() => {
        all_posts.innerHTML = '<p class="post-text">Не удалось загрузить твои посты</p>'
    })
}

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelector('.menu-toggle').checked = false

        const page = item.dataset.page
        currentPage = page

        if (page === 'myposts') {
            addPostButton.style.display = 'flex'
        } else {
            addPostButton.style.display = 'none'
        }

        if (page === 'home') {
            loadAllPosts()
        }

        if (page === 'myposts') {
            loadMyPosts()
        }

        if (page === 'users') {
            loadAllUsers()
        }
    })
})

function loadAllUsers() {
    fetch('https://threds-backend-production.up.railway.app/all_user')
    .then( response => response.json())
    .then(data => {
        all_posts.innerHTML = ''

        const grid = document.createElement('div')
        grid.classList.add('users-grid')

        data.users.forEach(user => {
            const card = document.createElement('div')
            card.classList.add('user-card')
            card.innerHTML = `
                <div class="user-avatar">${user.charAt(0).toUpperCase()}</div>
                <p class="user-name">${user}</p>
            `
            grid.appendChild(card)
        })

        all_posts.appendChild(grid)
    })
    .catch(() => {
        all_posts.innerHTML = '<p class="post-text">Не удалось загрузить пользователей</p>'
    })
}

loadAllPosts()