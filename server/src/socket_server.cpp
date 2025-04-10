#include <sstream>
#include <sys/socket.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <netinet/in.h>
#include <string.h>
#include <mutex>
#include <unordered_map>
#include <thread>
#include <iostream>
#include <arpa/inet.h>
#include <algorithm>
#include <string>
#include <vector>
#include <utility>
#include <condition_variable>
#include <queue>
#include <memory>
#include <atomic>


#include "socket_server.h"
#include "logic.h"

#define PORT 5006
#define SERVER_BACKLOG 1
#define BUFFER_SIZE  4096
#define THREAD_POOL_SIZE NUM_ROOMS*2

using namespace std;

mutex queue_mtx,client_mtx,room_mtx;
condition_variable queue_cv;
atomic<bool> server_running(true);

queue<int> client_queue;
vector<int> active_sockets(20);
unordered_map<string,int> client_sockets;
vector<pair<int,int>> rooms(NUM_ROOMS);



int main() {
    int server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket == -1) handle_error("socket() failed");

    struct sockaddr_in server_addr{}, client_addr{};
    socklen_t client_addr_size = sizeof(client_addr);

    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = htonl(INADDR_ANY);
    server_addr.sin_port = htons(PORT);

    if (bind(server_socket, (sockaddr*)&server_addr, sizeof(server_addr)) == -1)
        handle_error("bind() failed");

    printf("Server is running on port %d\n", PORT);
    if (listen(server_socket, SERVER_BACKLOG) == -1)
        handle_error("listen() error");

    vector<thread> thread_pool;
    for (int i = 0; i < THREAD_POOL_SIZE; ++i) {
        thread_pool.emplace_back([] {
            while (server_running) {
                int client = -1;
                {
                    unique_lock<mutex> lock(queue_mtx);
                    queue_cv.wait(lock, [] {
                        return !client_queue.empty() || !server_running;
                    });

                    if (!server_running) return;
                    if (!client_queue.empty()) {
                        client = client_queue.front();
                        client_queue.pop();
                    }
                }
                if (client != -1) handle_connection(client);
            }
        });
    }

    while (server_running) {
        printf("Waiting for connections...\n");
        int client_socket = accept(server_socket, (struct sockaddr*)&client_addr, &client_addr_size);
        if (client_socket == -1) {
            if (server_running) handle_error("accept() failed!");
            break;
        }
        {
            lock_guard<mutex> lock(queue_mtx);
            client_queue.push(client_socket);
        }
        queue_cv.notify_one();
    }

    server_running = false;
    queue_cv.notify_all();
    for (auto& t : thread_pool) if (t.joinable()) t.join();

    close(server_socket);
    return 0;
}

void handle_error(const string& msg) {
    cerr << msg << endl;
    exit(EXIT_FAILURE);
}



void send_message(int socket, const string& msg) {
    uint32_t len = htonl(msg.length());
    send(socket, &len, sizeof(len), 0);
    send(socket, msg.c_str(), msg.length(), 0);
}



void admin_send_all_message(const string& msg) {
    lock_guard<mutex> lock(client_mtx);
    for (const auto& sock : active_sockets) {
        if (sock != 0) send_message(sock, msg);
    }
}


void message_type_actions(char type, int& socket, vector<string>& parts) {
    switch (type) {
        case '1': {
            int room = get_room(socket);
            int receiver;
            {
                lock_guard<mutex> lock(room_mtx);
                receiver = (rooms[room - 1].first == socket) ? rooms[room - 1].second : rooms[room - 1].first;
            }
            stringstream msg;
            msg << get_name_from_socket(socket) << ":" << parts[1];
            send_message(socket, msg.str());
            if (receiver != 0) send_message(receiver, msg.str());
            break;
        }
        case '2': {
            int res = add_socket_name(socket, parts[1]);
	    if (res == 1) {
            	send_message(socket, "21;Successfully logged in.");
	    }
	    else{
	    	send_message(socket,"20;Name already in use try again");
	    }
	    break;
        }
        case '3': {
            string name = get_name_from_socket(socket);
            {
                lock_guard<mutex> lock(client_mtx);
                client_sockets.erase(name);
            }
            close(socket);
            break;
        }
        case '4': {
            int room_num = stoi(parts[1]);
            int space = check_room(room_num);
            if (space > 0) {
                {
                    scoped_lock lock(room_mtx,client_mtx);
                    if (rooms[room_num - 1].first == 0)
                        rooms[room_num - 1].first = socket;
                    else
                        rooms[room_num - 1].second = socket;
                    active_sockets.push_back(socket);
                }
                send_message(socket, "2"); 
            } else {
                send_message(socket, "3");
            }
            break;
        }
        case '5': {
            int room_num = stoi(parts[1]);
            int space = check_room(room_num);
            stringstream msg;
            msg << "4;" << space;
            send_message(socket, msg.str());
            break;
        }
        case '7': {
            int other;
            int room = get_room(socket);
            string name = get_name_from_socket(socket);
            {
                scoped_lock(room_mtx,client_mtx);
                if (rooms[room - 1].first == socket) {
                    rooms[room - 1].first = 0;
                    other = rooms[room - 1].second;
                } else {
                    rooms[room - 1].second = 0;
                    other = rooms[room - 1].first;
                }
                active_sockets.erase(remove(active_sockets.begin(), active_sockets.end(), socket), active_sockets.end());
            }
            stringstream msg;
            msg << "6;" << name;
            send_message(socket, "5");
            if (other != 0) send_message(other, msg.str());
            break;
        }
        case '8': {
            admin_send_all_message(parts[1]);
            break;
        }
    }
}

void handle_connection(int socket) {
    while (true) {
        uint32_t len;
        if (recv(socket, &len, sizeof(len), MSG_WAITALL) != sizeof(len)) break;
        len = ntohl(len);
        string msg(len, '\0');
        if (recv(socket, &msg[0], len, MSG_WAITALL) != len) break;

        vector<string> parts = split_string(msg, ';');
        if (!parts.empty()) message_type_actions(msg[0], socket, parts);
    }
    close(socket);
}
