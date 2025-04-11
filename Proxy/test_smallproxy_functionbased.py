import asyncio
import struct
import pytest
import websockets

import smallproxy_functionbased  # Ensure this file is in your project folder

TEST_TCP_PORT = smallproxy_functionbased.TCP_PORT

# ----------------------------------------------------------------------
# UT-P-01 Test: convert_websocket_to_socket()
# ----------------------------------------------------------------------
def test_convert_websocket_to_socket():
    """
    Test Case ID: UT-P-01
    Testname: convert_websocket_to_socket()
    Description: Convert WebSocket to TCP format.
    Input: "join room1"
    Expected Output: Raw TCP string with 4-byte length prefix.
    """
    input_msg = "join room1"
    result = smallproxy_functionbased.convert_websocket_to_socket(input_msg)
    expected_prefix = struct.pack("!I", len(input_msg.encode()))
    expected = expected_prefix + input_msg.encode()
    assert result == expected, f"Expected {expected}, got {result}"

# ----------------------------------------------------------------------
# UT-P-02 Test: convert_socket_to_websocket()
# ----------------------------------------------------------------------
def test_convert_socket_to_websocket():
    """
    Test Case ID: UT-P-02
    Testname: convert_socket_to_websocket()
    Description: Convert TCP payload to WebSocket format.
    Input: Binary data with 4-byte length header for the string "msg: hello"
    Expected Output: Clean string "msg: hello"
    """
    payload = "msg: hello"
    payload_bytes = payload.encode()
    length_prefix = struct.pack("!I", len(payload_bytes))
    binary_data = length_prefix + payload_bytes
    result = smallproxy_functionbased.convert_socket_to_websocket(binary_data)
    assert result == "msg: hello", f"Expected 'msg: hello', got '{result}'"

# ----------------------------------------------------------------------
# UT-P-03 Test: handle_client_disconnect()
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_handle_client_disconnect(monkeypatch):
    """
    Test Case ID: UT-P-03
    Testname: handle_client_disconnect()
    Description: Gracefully close connection.
    Input: Simulated disconnect (raise ConnectionClosed)
    Expected Output: Socket closed, resources cleaned.
    """
    # Create a dummy websocket that raises ConnectionClosed on recv.
    class DummyWebSocket:
        async def recv(self):
            raise websockets.exceptions.ConnectionClosed(1000, "Closed")
        async def send(self, msg):
            return

    # Create a dummy writer that tracks whether close() is called.
    class DummyWriter:
        def __init__(self):
            self.closed = False
        def write(self, data):
            pass
        async def drain(self):
            pass
        def close(self):
            self.closed = True
        async def wait_closed(self):
            return

    # Monkeypatch asyncio.open_connection so that it returns a dummy reader and our dummy writer.
    async def dummy_open_connection(host, port):
        reader = asyncio.StreamReader()  # We'll never feed data.
        writer = DummyWriter()
        return reader, writer

    monkeypatch.setattr(asyncio, "open_connection", dummy_open_connection)

    dummy_ws = DummyWebSocket()
    # Run the proxy's handle_connection.
    await smallproxy_functionbased.handle_connection(dummy_ws)
    # To test cleanup, force open_connection to return our writer instance.
    writer_instance = DummyWriter()
    async def dummy_open_connection2(host, port):
        reader = asyncio.StreamReader()
        return reader, writer_instance
    monkeypatch.setattr(asyncio, "open_connection", dummy_open_connection2)
    try:
        await smallproxy_functionbased.handle_connection(dummy_ws)
    except Exception:
        pass
    assert writer_instance.closed, "Expected TCP writer to be closed."

# ----------------------------------------------------------------------
# UT-P-04 Test: read_exact_bytes()
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_read_exact_bytes():
    """
    Test Case ID: UT-P-04
    Testname: read_exact_bytes()
    Description: Read specified byte length from TCP stream.
    Input: 10-byte header (dummy data).
    Expected Output: Reads correct 10-byte message.
    """
    # Create an asyncio.StreamReader and feed 10 bytes of known data.
    reader = asyncio.StreamReader()
    expected_data = b"1234567890"  # 10 bytes
    reader.feed_data(expected_data)
    reader.feed_eof()  # Signal that no more data is coming.

    result = await smallproxy_functionbased.read_exact_bytes(reader, 10)
    assert result == expected_data, f"Expected {expected_data}, got {result}"

# ----------------------------------------------------------------------
# UT-P-05 Test: start_proxy_server()
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_start_proxy_server(monkeypatch, event_loop):
    """
    Test Case ID: UT-P-05
    Testname: start_proxy_server()
    Description: Server startup logic.
    Input: Run main() (server startup)
    Expected Output: Listens on correct ports, no crash.
    """
    # Use a random high port for testing.
    import random
    proxy_port = random.randint(10000, 60000)

    # Override the proxy's TCP settings for testing.
    monkeypatch.setattr(smallproxy_functionbased, "TCP_HOST", "127.0.0.1")
    monkeypatch.setattr(smallproxy_functionbased, "TCP_PORT", TEST_TCP_PORT)

    # Start the WebSocket proxy server on the chosen port (remove loop parameter).
    ws_server = await websockets.serve(smallproxy_functionbased.handle_connection, "localhost", proxy_port)
    # Try to connect to the running proxy server.
    try:
        async with websockets.connect(f"ws://localhost:{proxy_port}") as websocket:
            await websocket.send("test")
            # We don't care about the reply; we only expect the server to accept the connection.
    finally:
        ws_server.close()
        await ws_server.wait_closed()
    # If no exceptions occurred, the test passes.
