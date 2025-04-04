import socket
import time

# Server details
SERVER_HOST = '127.0.0.1'  # Server's IP address (localhost)
SERVER_PORT = 5006         # Port number (make sure it matches the server's port)

def send_message(sock, message):
    message = message.encode()
    length = len(message).to_bytes(4, byteorder='big')  # 4-byte length prefix
    sock.send(length + message)

def receive_message(sock):
    # First read the 4-byte length prefix
    length_data = sock.recv(4)
    if not length_data:
        return None
    length = int.from_bytes(length_data, byteorder='big')
    
    # Then read the actual message
    data = sock.recv(length)
    return data.decode()

def main():
    # Create a TCP/IP socket
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    try:
        # Connect to the server
        client_socket.connect((SERVER_HOST, SERVER_PORT))
        print(f"Connected to server at {SERVER_HOST}:{SERVER_PORT}")
        print("Type messages to send to server. Type 'exit' to quit.")
        
        while True:
            # Get user input
            message = input("Enter message: ")
            
            if message.lower() == 'exit':
                break
                
            # Send the message
            send_message(client_socket, message)
            
            # Receive and print response
            response = client_socket.recv(1024)
            if response is None:
                print("Server closed connection")
                break
            print(f"Server response: {response.decode()}")
            
    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        # Close the socket connection
        client_socket.close()
        print("Connection closed.")

if __name__ == '__main__':
    main()
