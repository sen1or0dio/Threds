# from sqlalchemy import create_engine, Integer, String
# from sqlalchemy.orm import sessionmaker, declarative_base, Mapped, mapped_column

# # create_engine - Функция для подключения к базе данных
# # sessionmaker - Сессия (временный рабочий сеанс) для добавления, получения, обновления и удаления данных
# # declarative_base - основа для создания будущих таблиц

# engine = create_engine("sqlite:///dataBase.db", echo=True)  # Создаём подключение к файлу SQLite
# Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)  # bind - привязать сессию к этому подключению
# Base = declarative_base()  # Создание родителя для таблиц


# class User(Base):
#     __tablename__ = "users"
#     id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
#     # primary_key = уникальный id, который не может повторяться
#     name: Mapped[str] = mapped_column(String, nullable=False)
#     # nullable - может ли поле быть пустым или нет
#     age: Mapped[int] = mapped_column(Integer)


# Base.metadata.create_all(engine)  # Добавление таблиц в базу данных


# def get_db():
#     # Функция-зависимость для FastAPI: открываем новую сессию для каждого запроса
#     db = Session()
#     try:
#         yield db  # передаём сессию в обработчик
#     finally:
#         db.close()  # закрытие сессии после завершения запроса






























# # 1. create_engine()
# # 2. sessionmaker()
# # 3. declarative_base()
# # 4. Создать модель таблицы
# # 5. Base.metadata.create_all()
# # 6. Открыть сессию
# # 7. Создать объект
# # 8. db.add()
# # 9. db.commit()
# # 10. db.query()
# # 11. db.close()