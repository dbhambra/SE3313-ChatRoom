import socket
import struct

def send(sock, msg):
    msg_encoded = msg.encode()
    sock.send(struct.pack('!I', len(msg_encoded)) + msg_encoded)

def receive(sock):
    raw_len = sock.recv(4)
    if not raw_len: return None
    msg_len = struct.unpack('!I', raw_len)[0]
    return sock.recv(msg_len).decode()

# Simulate login and room join
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("127.0.0.1", 5006))

send(s, "2;Alice")  # Login
print("Login Response:", receive(s))

send(s, "4;1")       # Join Room 1
print("Join Room Response:", receive(s))

send(s, "1;Hello!")  # Chat Message
print("Echo Response:", receive(s))

send(s, "7")         # Leave Room
print("Leave Response:", receive(s))

send(s,"3")
print("Leave application")

s.close()