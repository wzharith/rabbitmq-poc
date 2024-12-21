#!/usr/bin/env python
import pika

try:
    # Establish connection to RabbitMQ
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host='localhost')
    )
    
    # Create a channel
    channel = connection.channel()
    
    # Purge the queue
    message_count = channel.queue_purge(queue='file_tasks')
    print(f"Successfully purged the 'file_tasks' queue")
    
except pika.exceptions.AMQPConnectionError:
    print("Failed to connect to RabbitMQ. Is the server running?")
except pika.exceptions.AMQPChannelError as e:
    print(f"Channel error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
finally:
    # Close the connection if it was established
    if 'connection' in locals() and connection.is_open:
        connection.close()
        print("Connection closed")

