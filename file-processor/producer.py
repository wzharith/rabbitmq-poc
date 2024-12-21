from fastapi import FastAPI, UploadFile, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import pika
import uuid
import os
import json

# Database setup
DATABASE_URL = "postgresql://harith:harith123@localhost/harith"
Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class FileTask(Base):
    __tablename__ = "file_tasks"
    id = Column(String, primary_key=True, index=True)
    filename = Column(String, index=True)
    status = Column(String, default="queued")
    result = Column(Text, nullable=True)


Base.metadata.create_all(bind=engine)

# RabbitMQ setup
RABBITMQ_HOST = "localhost"
QUEUE_NAME = "file_tasks"


def publish_task(task_id: str, filename: str):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    message = {"task_id": task_id, "filename": filename}
    channel.basic_publish(
        exchange="",
        routing_key=QUEUE_NAME,
        body=json.dumps(message),
        properties=pika.BasicProperties(delivery_mode=2),
    )
    connection.close()


app = FastAPI()


@app.post("/upload/")
async def upload_file(file: UploadFile):
    # Save file locally
    task_id = str(uuid.uuid4())
    file_location = f"uploads/{task_id}_{file.filename}"
    os.makedirs("uploads", exist_ok=True)
    with open(file_location, "wb") as f:
        f.write(await file.read())

    # Save task in DB
    db = SessionLocal()
    db_task = FileTask(id=task_id, filename=file.filename)
    db.add(db_task)
    db.commit()
    db.close()

    # Queue the task
    publish_task(task_id, file_location)
    return {"task_id": task_id, "message": "File uploaded and task queued"}


@app.get("/status/{task_id}/")
async def get_status(task_id: str):
    db = SessionLocal()
    task = db.query(FileTask).filter(FileTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"task_id": task_id, "status": task.status, "result": task.result}


@app.get("/files/")
async def get_all_files():
    db = SessionLocal()
    try:
        tasks = db.query(FileTask).all()
        return [
            {
                "task_id": task.id,
                "filename": task.filename,
                "status": task.status,
                "result": task.result
            }
            for task in tasks
        ]
    finally:
        db.close()
