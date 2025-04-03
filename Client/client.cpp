// client.h
#ifndef CLIENT_H
#define CLIENT_H

#include <string>
#include <vector>

// Connect to the chat server using IP and port
bool connect_to_server(const std::string& ip, int port);
// Send message to server
void send_to_server(const std::string& msg);
// Thread function: continuously receive messages from server
void receive_from_server();
// Cleanly close the server connection
void close_connection();

// Start embedded HTTP server (for communication with React frontend)
void start_http_server(int port);
// Handle incoming POST /send-message
std::string handle_post_message(const std::string& json);
// Handle incoming GET /get-messages
std::string handle_get_messages();
// Handle incoming GET /clients
std::string handle_get_clients();
// Handle POST /request-client
std::string handle_post_request_client(const std::string& json);
// Handle POST /login
std::string handle_post_login(const std::string& json);

// Thread-safe message buffer append
void buffer_incoming_message(const std::string& msg);
// Thread-safe message buffer access
std::vector<std::string> get_buffered_messages();

#endif // CLIENT_H

// client.cpp
#include "client.h"
#include <iostream>
#include <thread>
#include <mutex>
#include <vector>
#include <cstring>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <sstream>
#include <set>
#include <chrono>
#include "civetweb.h"

int sock_fd;
bool connected = false;
bool authenticated = false;
std::string authenticated_user;
std::mutex buffer_mutex;
std::vector<std::string> message_buffer;
std::set<std::string> available_clients;

bool connect_to_server(const std::string& ip, int port) {
    sock_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (sock_fd == -1) return false;

    sockaddr_in serv_addr{};
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(port);
    inet_pton(AF_INET, ip.c_str(), &serv_addr.sin_addr);

    if (connect(sock_fd, (sockaddr*)&serv_addr, sizeof(serv_addr)) == -1) return false;

    connected = true;
    std::thread(receive_from_server).detach();
    return true;
}

void send_to_server(const std::string& msg) {
    if (connected) {
        send(sock_fd, msg.c_str(), msg.length(), 0);
    }
}

void receive_from_server() {
    char buffer[1024];
    while (connected) {
        ssize_t len = recv(sock_fd, buffer, sizeof(buffer) - 1, 0);
        if (len > 0) {
            buffer[len] = '\0';
            std::string msg(buffer);
            buffer_incoming_message(msg);

            if (msg.rfind("2:", 0) == 0) {
                std::string user = msg.substr(2);
                std::lock_guard<std::mutex> lock(buffer_mutex);
                available_clients.insert(user);
            } else if (msg.rfind("3:", 0) == 0) {
                std::string user = msg.substr(2);
                std::lock_guard<std::mutex> lock(buffer_mutex);
                available_clients.erase(user);
            } else if (msg.rfind("L:success:", 0) == 0) {
                authenticated = true;
                authenticated_user = msg.substr(10);
                buffer_incoming_message("Login successful as " + authenticated_user);
            } else if (msg.rfind("L:fail", 0) == 0) {
                authenticated = false;
                authenticated_user.clear();
                buffer_incoming_message("Login failed");
            }
        } else {
            connected = false;
        }
    }
}

void close_connection() {
    connected = false;
    close(sock_fd);
}

void buffer_incoming_message(const std::string& msg) {
    std::lock_guard<std::mutex> lock(buffer_mutex);
    message_buffer.push_back(msg);
}

std::vector<std::string> get_buffered_messages() {
    std::lock_guard<std::mutex> lock(buffer_mutex);
    return message_buffer;
}

std::string handle_post_login(const std::string& json) {
    auto u = json.find("username");
    auto p = json.find("password");
    if (u != std::string::npos && p != std::string::npos) {
        auto uname = json.substr(u + 10, json.find('"', u + 10) - (u + 10));
        auto pass = json.substr(p + 10, json.find('"', p + 10) - (p + 10));
        send_to_server("L:" + uname + ":" + pass);
        return "{\"status\":\"login_attempted\"}";
    }
    return "{\"status\":\"error\"}";
}

std::string handle_post_message(const std::string& json) {
    if (!authenticated) return "{\"status\":\"unauthorized\"}";
    auto pos = json.find(":");
    if (pos != std::string::npos) {
        std::string msg = json.substr(pos + 1);
        msg.erase(remove(msg.begin(), msg.end(), '}'), msg.end());
        msg.erase(remove(msg.begin(), msg.end(), '"'), msg.end());
        send_to_server("1:" + msg);
        return "{\"status\":\"sent\"}";
    }
    return "{\"status\":\"error\"}";
}

std::string handle_get_messages() {
    auto messages = get_buffered_messages();
    std::ostringstream oss;
    oss << "[";
    for (size_t i = 0; i < messages.size(); ++i) {
        oss << "\"" << messages[i] << "\"";
        if (i != messages.size() - 1) oss << ",";
    }
    oss << "]";
    return oss.str();
}

std::string handle_get_clients() {
    std::lock_guard<std::mutex> lock(buffer_mutex);
    std::ostringstream oss;
    oss << "[";
    size_t count = 0;
    for (const auto& client : available_clients) {
        oss << "\"" << client << "\"";
        if (++count < available_clients.size()) oss << ",";
    }
    oss << "]";
    return oss.str();
}

std::string handle_post_request_client(const std::string& json) {
    if (!authenticated) return "{\"status\":\"unauthorized\"}";
    auto pos = json.find(":");
    if (pos != std::string::npos) {
        std::string target = json.substr(pos + 1);
        target.erase(remove(target.begin(), target.end(), '}'), target.end());
        target.erase(remove(target.begin(), target.end(), '"'), target.end());

        std::lock_guard<std::mutex> lock(buffer_mutex);
        if (available_clients.find(target) != available_clients.end()) {
            send_to_server("4:" + target);
            return "{\"status\":\"request_sent\"}";
        } else {
            return "{\"status\":\"client_busy_or_not_found\"}";
        }
    }
    return "{\"status\":\"error\"}";
}

class LoginHandler : public CivetHandler {
public:
    bool handlePost(CivetServer *server, struct mg_connection *conn) override {
        char buffer[1024];
        int len = mg_read(conn, buffer, sizeof(buffer));
        std::string body(buffer, len);
        std::string response = handle_post_login(body);

        mg_printf(conn,
                  "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: %lu\r\n\r\n%s",
                  response.length(), response.c_str());
        return true;
    }
};

class PostHandler : public CivetHandler {
public:
    bool handlePost(CivetServer *server, struct mg_connection *conn) override {
        char buffer[1024];
        int len = mg_read(conn, buffer, sizeof(buffer));
        std::string body(buffer, len);
        std::string response = handle_post_message(body);

        mg_printf(conn,
                  "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: %lu\r\n\r\n%s",
                  response.length(), response.c_str());
        return true;
    }
};

class GetHandler : public CivetHandler {
public:
    bool handleGet(CivetServer *server, struct mg_connection *conn) override {
        std::string response = handle_get_messages();

        mg_printf(conn,
                  "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: %lu\r\n\r\n%s",
                  response.length(), response.c_str());
        return true;
    }
};

class ClientsHandler : public CivetHandler {
public:
    bool handleGet(CivetServer *server, struct mg_connection *conn) override {
        std::string response = handle_get_clients();

        mg_printf(conn,
                  "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: %lu\r\n\r\n%s",
                  response.length(), response.c_str());
        return true;
    }
};

class RequestClientHandler : public CivetHandler {
public:
    bool handlePost(CivetServer *server, struct mg_connection *conn) override {
        char buffer[1024];
        int len = mg_read(conn, buffer, sizeof(buffer));
        std::string body(buffer, len);
        std::string response = handle_post_request_client(body);

        mg_printf(conn,
                  "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: %lu\r\n\r\n%s",
                  response.length(), response.c_str());
        return true;
    }
};

void start_http_server(int port) {
    std::string port_str = std::to_string(port);
    const char *options[] = {"listening_ports", port_str.c_str(), 0};
    CivetServer *server = new CivetServer(options);

    server->addHandler("/login", new LoginHandler());
    server->addHandler("/send-message", new PostHandler());
    server->addHandler("/get-messages", new GetHandler());
    server->addHandler("/clients", new ClientsHandler());
    server->addHandler("/request-client", new RequestClientHandler());

    std::cout << "HTTP server running on http://localhost:" << port << std::endl;
    std::cout << "Use /login, /send-message, /get-messages, /clients, /request-client" << std::endl;
}

int main() {
    if (!connect_to_server("127.0.0.1", 5006)) {
        std::cerr << "Failed to connect to server.\n";
        return 1;
    }

    start_http_server(8080);

#if defined(_WIN32)
    system("start http://localhost:3000");
#elif defined(__APPLE__)
    system("open http://localhost:3000");
#else
    system("xdg-open http://localhost:3000");
#endif

    while (true) std::this_thread::sleep_for(std::chrono::seconds(60));
    return 0;
}
