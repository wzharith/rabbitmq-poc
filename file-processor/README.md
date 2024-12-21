# File Processor

This project demonstrates a file processing system using RabbitMQ and FastAPI. The goal is to show how RabbitMQ can be used to handle file processing tasks asynchronously.

## Project Structure

- `producer.py`: Contains the FastAPI application to create file processing tasks.
- `consumer.py`: Contains the consumer that processes the file tasks from the RabbitMQ queue.
- `bulk_file_upload.py`: Script to perform simultaneous API calls for testing.
- `README.md`: This file.

## Getting Started

### Prerequisites

- Python 3.8+
- RabbitMQ server

### How to Run

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

   - Start the FastAPI server to handle file processing task creation:
     ```sh
     uvicorn producer:app --reload
     ```

4. **Run the consumer:**

   - Start the consumer to process file tasks from the RabbitMQ queue:
     ```sh
     python consumer.py
     ```

5. **Create file processing tasks:**

   - Use an HTTP client like `curl` or Postman to create file processing tasks. For example, using `curl`:
     ```sh
     curl -X POST "http://127.0.0.1:8000/task/" -H "Content-Type: application/json" -d "{\"file_path\": \"/path/to/file\"}"
     ```

6. **Test simultaneous API calls:**
   - Run the `bulk_file_upload.py` script to perform 10 simultaneous API calls:
     ```sh
     python test_api_calls.py
     ```

The consumer will process the file tasks and print the output to the console.
