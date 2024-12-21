from fastapi import FastAPI
import pika

app = FastAPI()

RABBITMQ_HOST = "localhost"
QUEUE_NAME = "task_queue"


# Function to publish tasks to RabbitMQ
def publish_task(message: str):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.basic_publish(
        exchange="",
        routing_key=QUEUE_NAME,
        body=message,
        properties=pika.BasicProperties(
            delivery_mode=2,  # Make message persistent
        ),
    )
    print(f"Task published: {message}")
    connection.close()


@app.post("/task/")
async def create_task(task: str):
    publish_task(task)
    return {"status": "Task added to queue", "task": task}
