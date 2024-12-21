import pika
import time

RABBITMQ_HOST = "localhost"
QUEUE_NAME = "task_queue"


# Callback function to process tasks
def process_task(ch, method, properties, body):
    task = body.decode()
    print(f"Processing task: {task}")
    time.sleep(8)  # Simulate some work
    print(f"Task completed: {task}")
    ch.basic_ack(delivery_tag=method.delivery_tag)


# Setup RabbitMQ connection
connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
channel = connection.channel()
channel.queue_declare(queue=QUEUE_NAME, durable=True)
channel.basic_qos(prefetch_count=1)  # Fair dispatch
channel.basic_consume(queue=QUEUE_NAME, on_message_callback=process_task)

print("Worker is waiting for tasks...")
channel.start_consuming()
