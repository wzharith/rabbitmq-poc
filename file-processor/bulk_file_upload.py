import concurrent.futures
import requests

# Define the URL and file path
url = "http://127.0.0.1:8000/upload/"
file_path = "/home/harith/Pictures/Screenshots/Screenshot from 2024-12-21 12-37-22.png"


# Function to make a single API call
def make_api_call():
    try:
        with open(file_path, "rb") as file:
            files = {"file": file}
            response = requests.post(url, files=files)
            return response.status_code, response.json()
    except FileNotFoundError:
        return 404, {"error": f"File not found: {file_path}"}
    except PermissionError:
        return 403, {"error": f"Permission denied: {file_path}"}
    except Exception as e:
        return 500, {"error": f"Unexpected error: {str(e)}"}


# Use ThreadPoolExecutor to make simultaneous API calls
def main():
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(make_api_call) for _ in range(10)]
        for future in concurrent.futures.as_completed(futures):
            status_code, response = future.result()
            print(f"Status Code: {status_code}, Response: {response}")


if __name__ == "__main__":
    main()
