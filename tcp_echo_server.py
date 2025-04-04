import socket
import threading

HOST = 'localhost'
PORT = 1234

def handle_client(conn, addr):
    print(f"[TCP Server] Connection from {addr}")
    with conn, conn.makefile('r') as reader, conn.makefile('w') as writer:
        for line in reader:
            message = line.strip()
            print(f"[TCP Server] Received: {message}")
            response = f"{message}tcp\n"
            print(f"[TCP Server] Sending: {response.strip()}")
            writer.write(response)
            writer.flush()
    print(f"[TCP Server] Connection closed: {addr}")

def start_server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen()
        print(f"[TCP Server] Listening on {HOST}:{PORT}")
        while True:
            conn, addr = s.accept()
            threading.Thread(target=handle_client, args=(conn, addr), daemon=True).start()

if __name__ == "__main__":
    start_server()
