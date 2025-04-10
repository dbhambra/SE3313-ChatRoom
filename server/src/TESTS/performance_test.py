#SIMULATING 50 JOINING CLIENTS THAT LEAVE AND JOIN
import socket, struct, multiprocessing
SERVER_HOST = '127.0.0.1' # REPLACE WITH WHATEVER IP
SERVER_PORT = 5006

def chat_client(name,i):
    try:
        s = socket.socket()
        s.connect((SERVER_HOST, SERVER_PORT))
        send = lambda msg: s.send(struct.pack('!I', len(msg)) + msg.encode())
        receive = lambda: s.recv(struct.unpack('!I', s.recv(4))[0]).decode()
        ## EACH CLIENT WIll join with unique name, join a room and send a message and leave
        send(f"2;{name}")
        receive()

        send("4;" + str(int(i/3)) )# ensures each client dont only join 1 room, every 3 try to join a same room,
        receive()

        send("1;Hi there!")
        receive()

        send("7")
        receive()
        #CLOSE SOCKET
        send("3")
        s.close()
    except Exception as e:
        print(f"Error with {name}: {e}")

clients = [multiprocessing.Process(target=chat_client, args=(f"User{i}",i)) for i in range(30)]

for c in clients: c.start()
for c in clients: c.join()

