import socket
import time
# Server details
SERVER_HOST = '127.0.0.1'  # Server's IP address (localhost)
SERVER_PORT = 5006         # Port number (make sure it matches the server's port)


def send_message(sock, message):
    message = message.encode()
    length = len(message).to_bytes(4, byteorder='big')  # 4-byte length prefix
    sock.send(length + message)

def main():
    # Create a TCP/IP socket
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    try:
        # Connect to the server
        client_socket.connect((SERVER_HOST, SERVER_PORT))
        print(f"Connected to server at {SERVER_HOST}:{SERVER_PORT}")
         
        message = "2;PEER_1"
        send_message(client_socket, message)

        response = client_socket.recv(1024)  # buffer size = 1024 bytes
        print(f"Server response: {response.decode()}")

        message = "4;1"
        send_message(client_socket, message)
        response = client_socket.recv(1024)  # buffer size = 1024 bytes
        print(f"Server response: {response.decode()}")
        message = input("You [should be 1;<TEXT>]: ")
        send_message(client_socket,message)
        response = client_socket.recv(1024)  # buffer size = 1024 bytes
        print(f"Server response: {response.decode()}")


    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        # Close the socket connection
        client_socket.close()
        print("Connection closed.")

if __name__ == '__main__':
    main()
