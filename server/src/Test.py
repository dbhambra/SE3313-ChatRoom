import socket

# Server details
#SERVER_HOST = '127.0.0.1'  # Server's IP address (localhost)
SERVER_HOST = '172.30.171.229'
SERVER_PORT = 5006         # Port number (make sure it matches the server's port)

def main():
    # Create a TCP/IP socket
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    try:
        # Connect to the server
        client_socket.connect((SERVER_HOST, SERVER_PORT))
        print(f"Connected to server at {SERVER_HOST}:{SERVER_PORT}")
        
        # Send a message to the server
        message = "Hello, Server!"
        client_socket.sendall(message.encode())
        print(f"Message sent: {message}")
        
    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        # Close the socket connection
        client_socket.close()
        print("Connection closed.")

if __name__ == '__main__':
    main()