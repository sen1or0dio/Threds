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
const confirmDeleteButton = document.querySelector('#delete-modal .modal-confirm')
const cancelDeleteButton = document.querySelector('#delete-modal .modal-cancel')
const addPostButton = document.querySelector('#add-post-button')
const addPostModal = document.querySelector('#add-post-modal')
const addPostCancel = document.querySelector('#add-post-cancel')
const addPostSubmit = document.querySelector('#add-post-submit')
const newPostInput = document.querySelector('.new-post-input')
const authToggle = document.querySelector('#auth-toggle')
const pageLabel = document.querySelector('#page-label')

let userId = null
let postToDelete = null
let currentPage = 'home'
let isLoginMode = true

console.log('Threds v8 loaded')

fetch('https://threds-backend-production.up.railway.app/all_user').catch(() => {})
setInterval(() => {
    fetch('https://threds-backend-production.up.railway.app/all_user').catch(() => {})
}, 240000)

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
        localStorage.setItem('threds_user_id', data.user_id)
        homePage.style.display = 'flex'
        registrationPage.style.display = 'none'
        addPostButton.style.display = 'flex'
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
            localStorage.setItem('threds_user_id', data.user_id)
            homePage.style.display = 'flex'
            registrationPage.style.display = 'none'
            addPostButton.style.display = 'flex'
            loadAllPosts()
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

async function fetchWithRetry(url, options, retries = 5) {
    let lastError

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fetch(url, options)
        } catch (error) {
            lastError = error
            if (attempt < retries) {
                const delay = [2000, 4000, 8000, 15000][attempt - 1] || 15000
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }

    throw lastError
}

function cancelDelete() {
    deleteModal.style.display = 'none'
    postToDelete = null
}

async function confirmDelete() {
    if (!postToDelete) {
        cancelDelete()
        return
    }

    const confirmButton = document.querySelector('#delete-confirm')
    const originalText = confirmButton.textContent
    confirmButton.disabled = true
    confirmButton.textContent = 'Удаляю...'

    try {
        const response = await fetchWithRetry('https://threds-backend-production.up.railway.app/delete_post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postToDelete, user_id: userId })
        })

        const data = await response.json()

        if (!response.ok) {
            alert('Ошибка удаления: ' + (data.detail || 'неизвестная ошибка'))
            confirmButton.disabled = false
            confirmButton.textContent = originalText
            return
        }
    } catch (error) {
        alert('Не удалось удалить пост. Проверь интернет и попробуй ещё раз.')
        confirmButton.disabled = false
        confirmButton.textContent = originalText
        return
    }

    deleteModal.style.display = 'none'
    postToDelete = null

    if (currentPage === 'myposts') {
        loadMyPosts()
    } else {
        loadAllPosts()
    }
}

cancelDeleteButton.addEventListener('click', cancelDelete)
confirmDeleteButton.addEventListener('click', confirmDelete)

window.addEventListener('error', (event) => {
    const banner = document.createElement('div')
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff4d4d;color:#fff;z-index:99999;padding:10px;font-size:13px;text-align:center'
    banner.textContent = 'JS ERROR: ' + event.message
    document.body.appendChild(banner)
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

    if (currentPage === 'myposts') {
        loadMyPosts()
    } else {
        loadAllPosts()
    }
})

function loadAllPosts() {
    fetch(`https://threds-backend-production.up.railway.app/all_posts?user_id=${userId}`)
    .then( response => response.json())
    .then(data => renderPosts(data.posts.sort((a, b) => b.id - a.id)))
    .catch(() => {
        all_posts.innerHTML = '<p class="post-text">Не удалось загрузить посты</p>'
    })
}

function loadMyPosts() {
    fetch(`https://threds-backend-production.up.railway.app/all_posts?user_id=${userId}`)
    .then( response => response.json())
    .then(data => renderPosts(data.posts.filter(post => post.user_id === userId).sort((a, b) => b.id - a.id), true))
    .catch(() => {
        all_posts.innerHTML = '<p class="post-text">Не удалось загрузить твои посты</p>'
    })
}

document.querySelectorAll('.nav-item').forEach(item => {
    if (item.id === 'logout-button') {
        return
    }

    item.addEventListener('click', () => {
        const page = item.dataset.page
        currentPage = page

        if (page === 'home') {
            pageLabel.textContent = 'Main Page'
        } else if (page === 'myposts') {
            pageLabel.textContent = 'My posts'
        } else if (page === 'users') {
            pageLabel.textContent = 'All users'
        }

        if (page === 'home' || page === 'myposts') {
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

document.querySelector('#logout-button').addEventListener('click', () => {
    localStorage.removeItem('threds_user_id')
    userId = null
    currentPage = 'home'
    isLoginMode = true
    login_button.style.display = 'block'
    regist_button.style.display = 'none'
    authToggle.textContent = 'Нет аккаунта? Зарегистрируйся!'
    usernameInput.value = ''
    passwordInput.value = ''
    addPostButton.style.display = 'none'
    homePage.style.display = 'none'
    registrationPage.style.display = 'flex'
    all_posts.innerHTML = ''
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

const savedUserId = localStorage.getItem('threds_user_id')

if (savedUserId) {
    userId = parseInt(savedUserId)
    homePage.style.display = 'flex'
    registrationPage.style.display = 'none'
    addPostButton.style.display = 'flex'
    loadAllPosts()
}