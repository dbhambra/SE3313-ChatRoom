import asyncio
import websockets
import struct

TCP_HOST = '192.168.122.62'  # Your TCP server's IP
TCP_PORT = 5006

def convert_websocket_to_socket(msg: str) -> bytes:
    """
    Converts a plain-text WebSocket message into raw TCP format.
    (UT-P-01)
    Output: 4-byte big-endian length prefix followed by message bytes.
    """
    msg_bytes = msg.encode()
    length_prefix = struct.pack('!I', len(msg_bytes))
    return length_prefix + msg_bytes

def convert_socket_to_websocket(data: bytes) -> str:
    """
    Converts raw TCP data with a 4-byte length header into a plain-text string.
    (UT-P-02)
    Example: Given binary data containing a 4-byte header followed by the payload,
             returns the payload as a clean string.
    """
    if len(data) < 4:
        return ""
    msg_length = int.from_bytes(data[:4], byteorder='big')
    payload = data[4:4+msg_length]
    return payload.decode(errors='ignore')

async def read_exact_bytes(reader: asyncio.StreamReader, n: int) -> bytes:
    """
    Reads exactly n bytes from the TCP stream.
    (UT-P-04)
    """
    return await reader.readexactly(n)

async def cleanup_connection(writer: asyncio.StreamWriter):
    """
    Cleans up the TCP connection by closing the writer.
    (UT-P-03)
    """
    if writer:
        writer.close()
        await writer.wait_closed()

async def handle_connection(websocket):
    print("[Proxy] WebSocket client connected")
    
    reader = None
    writer = None
    try:
        # Establish TCP connection to the server.
        reader, writer = await asyncio.open_connection(TCP_HOST, TCP_PORT)
        print(f"[Proxy] Connected to TCP server at {TCP_HOST}:{TCP_PORT}")

        async def websocket_to_tcp():
            while True:
                try:
                    # Wait for a plain text message from the WebSocket client.
                    msg = await websocket.recv()
                    print(f"[WS→TCP] Received from WebSocket: {msg}")
                    
                    # Convert the message using our helper function.
                    full_packet = convert_websocket_to_socket(msg)
                    writer.write(full_packet)
                    await writer.drain()
                    print(f"[WS→TCP] Sent to TCP server: {full_packet}")
                except websockets.exceptions.ConnectionClosed:
                    print("[Proxy] WebSocket closed.")
                    break
                except Exception as e:
                    print(f"[Proxy] WS→TCP error: {e}")
                    break

        async def tcp_to_websocket():
            while True:
                try:
                    # Here the TCP server sends plain text (without a length prefix).
                    data = await reader.read(1024)
                    if not data:
                        print("[Proxy] TCP connection closed.")
                        break
                    msg = data.decode(errors='ignore')
                    print(f"[TCP→WS] Received from TCP server: {msg}")
                    
                    # Forward the plain text response to the WebSocket client.
                    await websocket.send(msg)
                    print(f"[TCP→WS] Sent to WebSocket: {msg}")
                except Exception as e:
                    print(f"[Proxy] TCP→WS error: {e}")
                    break

        # Run both communication loops concurrently.
        await asyncio.gather(websocket_to_tcp(), tcp_to_websocket())
    
    except Exception as e:
        print(f"[Proxy] Connection setup error: {e}")
    finally:
        print("[Proxy] Cleaning up connection")
        await cleanup_connection(writer)

async def main():
    print("[Proxy] Running on ws://localhost:8080/")
    async with websockets.serve(handle_connection, "localhost", 8080):
        await asyncio.Future()  # Keep the server running indefinitely.

if __name__ == "__main__":
    asyncio.run(main())
