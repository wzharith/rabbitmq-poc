# rabbitmq-poc

RabbitMQ Playground

## What We Did

In this repository, we explored the following:

- Set up a RabbitMQ server locally.
- Created a producer that sends messages to a RabbitMQ queue.
- Developed a consumer that reads messages from the RabbitMQ queue.
- Demonstrated message acknowledgment and durability.
- Showcased error handling and retries.
- Monitored RabbitMQ using the management plugin.

This project serves as a playground to understand and experiment with RabbitMQ features.

## How to Run

1. **Set up RabbitMQ:**

   - Install RabbitMQ on your local machine. You can download it from [here](https://www.rabbitmq.com/download.html).
   - Start the RabbitMQ server.

2. **Install dependencies:**

   - Make sure you have Python installed.
   - Install the required Python packages using pip:
     ```sh
     pip install pika fastapi uvicorn
     ```

3. **Run the producer:**

   - Start the FastAPI server to handle task creation:
     ```sh
     uvicorn producer:app --reload
     ```

4. **Run the consumer:**

   - Start the consumer to process tasks from the RabbitMQ queue:
     ```sh
     python consumer.py
     ```

5. **Create tasks:**
   - Use an HTTP client like `curl` or Postman to create tasks. For example, using `curl`:
     ```sh
     curl -X POST "http://127.0.0.1:8000/task/" -H "Content-Type: application/json" -d "{\"task\": \"Task 1\"}"
     ```

The consumer will process the tasks and print the output to the console.
