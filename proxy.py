import asyncio
import websockets

TCP_HOST = 'localhost'
TCP_PORT = 1234

async def handle_connection(websocket):
    print("[Proxy] WebSocket client connected")

    try:
        reader, writer = await asyncio.open_connection(TCP_HOST, TCP_PORT)

        async def websocket_to_tcp():
            while True:
                try:
                    msg = await websocket.recv()
                    if not msg.endswith('\n'):
                        msg += '\n'
                    print(f"[WS→TCP] {msg.strip()}")
                    writer.write(msg.encode())
                    await writer.drain()
                except websockets.exceptions.ConnectionClosed:
                    print("[Proxy] WebSocket closed")
                    break
                except Exception as e:
                    print(f"[Proxy] WS→TCP error: {e}")
                    break

        async def tcp_to_websocket():
            while True:
                try:
                    line = await reader.readline()
                    if not line:
                        print("[Proxy] TCP connection closed.")
                        break
                    msg = line.decode().strip()
                    print(f"[TCP→WS] {msg}")
                    await websocket.send(msg)
                except Exception as e:
                    print(f"[Proxy] TCP→WS error: {e}")
                    break

        await asyncio.gather(websocket_to_tcp(), tcp_to_websocket())

    except Exception as e:
        print(f"[Proxy] Connection setup error: {e}")
    finally:
        print("[Proxy] Cleaning up connection")
        writer.close()
        await writer.wait_closed()

async def main():
    print("[Proxy] Running on ws://localhost:8080/")
    async with websockets.serve(handle_connection, "localhost", 8080):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
