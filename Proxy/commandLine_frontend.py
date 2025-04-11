import asyncio
import websockets

async def run_client():
    uri = "ws://localhost:8080/"
    async with websockets.connect(uri) as websocket:
        print("[Client] Connected to WebSocket server at ws://localhost:8080/")
        print("Type your messages (e.g. '2;peer_2') and press Enter. Ctrl+C to exit.")

        try:
            while True:
                message = input("Send: ")
                if not message.strip():
                    continue  # Skip empty messages
                print(f"[Client] Sent: {message}")
                await websocket.send(message)
                

                try:
                    response = await websocket.recv()
                    print(f"[Client] Received: {response}")
                except websockets.exceptions.ConnectionClosed:
                    print("[Client] Connection closed by server")
                    break

        except KeyboardInterrupt:
            print("\n[Client] Disconnected (Ctrl+C)")

if __name__ == "__main__":
    asyncio.run(run_client())
