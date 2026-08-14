import os
from sqlalchemy import create_engine, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import sessionmaker, declarative_base, Mapped, mapped_column


engine = create_engine(os.environ.get("DATABASE_URL", "sqlite:///./dataBase.db"), echo=True)
Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String, nullable=False)

class Posts(Base):
    __tablename__ = 'posts'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    post_content: Mapped[str] = mapped_column(String)

class Likes(Base):
    __tablename__ = "likes"
    __table_args__ = (UniqueConstraint("user_id", "post_id"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'))
    post_id: Mapped[int] = mapped_column(Integer, ForeignKey('posts.id'))

Base.metadata.create_all(engine)

def get_db():
    db = Session()
    try: 
        yield db
    finally: 
        db.close()