from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import uvicorn

from db_trening_repeat import get_db, User, Posts, Likes

app = FastAPI(title="Threds API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1",
        "http://localhost",
        "https://threds-frontend.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) # Подробнее 

class UserCreate(BaseModel):
    user_name: str = Field(max_length=12, min_length=3,)
    password: str = Field(max_length=15, min_length=7)

class UserLogin(BaseModel):
    user_name: str = Field(max_length=12, min_length=3)
    password: str = Field(max_length=15, min_length=7)

class PostCreate(BaseModel):
    content: str = Field(max_length=100, min_length=10)
    user_id: int

class PostResponse(BaseModel):
    id: int
    user_id: int
    content: str

class UserPost(BaseModel):
    user_id: int
    content: str

class DeletePost(BaseModel):
    user_id: int
    post_id: int

class LikesData(BaseModel):
    user_id: int
    post_id: int


@app.get("/all_user")
def all_user(db: Session = Depends(get_db)):
    users = db.query(User.user_name).all()
    return {"users" : [name for (name,) in users]}


@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(user_name=user.user_name, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Пользователь зарегистрирован успешно", "user_id": new_user.id}

@app.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.user_name == user.user_name).first()

    if not db_user:
        return JSONResponse({"detail": "Пользователь не найден"}, status_code=400)

    if db_user.password != user.password:
        return JSONResponse({"detail": "Пароль или юзер не верный"}, status_code=400)

    if db_user.user_name == user.user_name and db_user.password == user.password:
        return {"message": "Вход выполнен успешно", "user_id": db_user.id}

@app.post('/new_post')
def create_post(post: UserPost, db: Session = Depends(get_db)):
    new_post = Posts(post_content=post.content, user_id=post.user_id)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return { "message" : "Пост добавлен" }

@app.get("/all_posts")
def get_posts(user_id: int, db: Session = Depends(get_db)):
    all_posts = db.query(Posts, User).join(User, Posts.user_id == User.id).all()
    return {
        "posts" : [
            {
                "id" : post.id,
                "user_id" : post.user_id, 
                "user_name" : user.user_name, 
                "post_content" : post.post_content,
                "like_count" : db.query(Likes).filter(Likes.post_id == post.id).count(),
                "is_liked" : bool(db.query(Likes).filter(Likes.user_id == user_id, Likes.post_id == post.id).first())
            }
            for post, user in all_posts
        ]
    }

@app.post('/user_post')
def userPost(user_post: PostResponse, db: Session = Depends(get_db)):
    all_user_post = db.query(User, Posts).join(User, Posts.user_id == User.id).filter(User.id == user_post.user_id).all()
    return {
        "posts" : [
            {"id" : post.id, "post_content" : post.post_content, "user_name" : user.user_name}
            for user, post in all_user_post 
        ]
    }

@app.post('/delete_post')
def delete_post(user_post: DeletePost, db: Session = Depends(get_db)):
    post = db.query(Posts).filter(Posts.id == user_post.post_id).first()

    if not post:
        return JSONResponse({"detail": "Пост не найден"}, status_code=404)

    db.query(Likes).filter(Likes.post_id == post.id).delete()
    db.delete(post)
    db.commit()

    return {"message" : "Post delete"}


@app.post('/like')
def post_like(like_data: LikesData, db: Session = Depends(get_db)):
    db.add(Likes(user_id=like_data.user_id, post_id=like_data.post_id))
    db.commit()
    return {"message" : "Like added"}

@app.post('/unlike')
def unlike(like_data: LikesData, db: Session = Depends(get_db)):
    db.query(Likes).filter(
        Likes.user_id == like_data.user_id,
        Likes.post_id == like_data.post_id
    ).delete()
    db.commit()
    return {"message": "Like removed"}
    
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
