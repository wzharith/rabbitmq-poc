import random
import pika
import json
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from producer import Base, FileTask

DATABASE_URL = "postgresql://harith:harith123@localhost/harith"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

RABBITMQ_HOST = "localhost"
QUEUE_NAME = "file_tasks"


def process_file(task_id: str, filepath: str):
    random_time = random.randint(1, 10)
    time.sleep(random_time)  # Simulate file processing
    # Extract "dummy" data from file
    result = f"Processed content of {filepath}"
    print(result)
    return result


def on_message(ch, method, properties, body):
    message = json.loads(body.decode())
    task_id = message["task_id"]
    filepath = message["filename"]

    # Update DB with processing status
    db = SessionLocal()
    task = db.query(FileTask).filter(FileTask.id == task_id).first()
    task.status = "processing"
    db.commit()

    # Process file
    result = process_file(task_id, filepath)
    task.status = "completed"
    task.result = result
    db.commit()

    db.close()
    ch.basic_ack(delivery_tag=method.delivery_tag)


connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
channel = connection.channel()
channel.queue_declare(queue=QUEUE_NAME, durable=True)
channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue=QUEUE_NAME, on_message_callback=on_message)

print("Worker is ready. Waiting for tasks...")
channel.start_consuming()
