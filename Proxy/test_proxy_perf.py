import asyncio
import websockets
import pytest

PROXY_URL = "ws://localhost:8080/"
MESSAGES_TO_RECEIVE = 1000

@pytest.mark.asyncio
async def test_proxy_throughput(benchmark):
    """
    Benchmark: Proxy throughput TCP → Proxy → WebSocket
    """

    async def receive_messages():
        received = 0
        async with websockets.connect(PROXY_URL) as websocket:
            while received < MESSAGES_TO_RECEIVE:
                await websocket.recv()
                received += 1
        return received

    # Run it exactly once
    result = await benchmark.pedantic(
        receive_messages,
        iterations=1,
        rounds=1
    )

    assert result == MESSAGES_TO_RECEIVE
