import asyncio
import websockets

async def run_client():
    uri = "ws://localhost:8080/"
    async with websockets.connect(uri) as websocket:
        print("[Client] Connected. Type input (e.g. numbers). Ctrl+C to exit.")

        while True:
            try:
                msg = input("Send: ")
                await websocket.send(msg + '\n')  # add newline
                response = await websocket.recv()
                print(f"[Client] Received: {response}")
            except KeyboardInterrupt:
                print("\n[Client] Exiting.")
                break

if __name__ == "__main__":
    asyncio.run(run_client())
