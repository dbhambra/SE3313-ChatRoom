import asyncio
import websockets
import struct

TCP_HOST = '192.168.122.62'  # your TCP server's IP
TCP_PORT = 5006

async def handle_connection(websocket):
    print("[Proxy] WebSocket client connected")
    
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
                    
                    # Format the message with a 4-byte length prefix.
                    msg_bytes = msg.encode()
                    length_prefix = struct.pack('!I', len(msg_bytes))
                    full_packet = length_prefix + msg_bytes
                    
                    # Send the length-prefixed packet to the TCP server.
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
                    # Instead of reading a 4-byte length header, we simply read plain text.
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
        
        # Run both directions concurrently.
        await asyncio.gather(websocket_to_tcp(), tcp_to_websocket())
    
    except Exception as e:
        print(f"[Proxy] Connection setup error: {e}")
    finally:
        print("[Proxy] Cleaning up connection")
        if 'writer' in locals() and writer:
            writer.close()
            await writer.wait_closed()

async def main():
    print("[Proxy] Running on ws://localhost:8080/")
    async with websockets.serve(handle_connection, "localhost", 8080):
        await asyncio.Future()  # Keeps the server running indefinitely.

if __name__ == "__main__":
    asyncio.run(main())
