import socket
import struct
import time
import math

HOST = 'localhost'
PORT = 5006
MESSAGES = 1000
MIN_DELAY = 0.0001  # ~10,000 msgs/sec
MAX_DELAY = 0.01    # 100 msgs/sec
USE_SINE_WAVE = True  # Set to False to linearly ramp

def calculate_delay(i):
    # Vary the interval over time
    if USE_SINE_WAVE:
        # Oscillates speed: fast ↔ slow using a sine wave pattern
        return MIN_DELAY + (MAX_DELAY - MIN_DELAY) * (1 + math.sin(i / 100 * math.pi)) / 2
    else:
        # Linearly ramp up from fast to slow (or reverse)
        return MIN_DELAY + (MAX_DELAY - MIN_DELAY) * (i / MESSAGES)

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen(1)
    print("[TCP] Waiting for proxy connection...")
    conn, addr = s.accept()
    print(f"[TCP] Connected to {addr}")
    with conn:
        for i in range(MESSAGES):
            msg = f"spam {i}"
            msg_bytes = msg.encode()
            length = struct.pack("!I", len(msg_bytes))
            conn.sendall(length + msg_bytes)

            delay = calculate_delay(i)
            time.sleep(delay)

        print(f"[TCP] Done sending {MESSAGES} messages.")
