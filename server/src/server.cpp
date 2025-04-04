#include "../include/crow.h" // Include Crow library
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

#define PORT 5006
#define SERVER_BACKLOG 1
#define BUFFER_SIZE 4096

using namespace std;

// Mutex for thread safety
mutex mtx;

// In-memory message store
vector<pair<string, string>> message_store; // Stores <sender, message>

// Function to add a message
void add_message(const string &sender, const string &message)
{
    lock_guard<mutex> lock(mtx);
    message_store.emplace_back(sender, message);
}

// Function to get all messages
vector<pair<string, string>> get_messages()
{
    lock_guard<mutex> lock(mtx);
    return message_store;
}

// Function to log a message
void log_message(const string &log)
{
    lock_guard<mutex> lock(mtx);
    cout << "[LOG]: " << log << endl;
}

// Function to handle socket-based connections
void handle_connection(int client_socket)
{
    while (true)
    {
        uint32_t msg_length;
        if (recv(client_socket, &msg_length, 4, MSG_WAITALL) != 4)
        {
            break;
        }
        msg_length = ntohl(msg_length);

        string message(msg_length, '\0');
        if (recv(client_socket, &message[0], msg_length, MSG_WAITALL) != msg_length)
        {
            break;
        }

        printf("Received: %s\n", message.c_str());
    }
    close(client_socket);
}

int main()
{
    // Start Crow HTTP server
    crow::SimpleApp app;

    // REST API: POST /send-message
    CROW_ROUTE(app, "/send-message").methods("POST"_method)([](const crow::request &req)
                                                            {
        auto body = crow::json::load(req.body);
        if (!body || !body["sender"] || !body["message"]) {
            return crow::response(400, "Invalid request. 'sender' and 'message' are required.");
        }

        string sender = body["sender"].s();
        string message = body["message"].s();

        // Add the message to the in-memory store
        add_message(sender, message);

        return crow::response(200, "Message sent."); });

    // REST API: GET /messages
    CROW_ROUTE(app, "/messages").methods("GET"_method)([]()
                                                       {
        auto all_messages = get_messages();
        crow::json::wvalue response;
        for (size_t i = 0; i < all_messages.size(); ++i) {
            response[i]["sender"] = all_messages[i].first;
            response[i]["message"] = all_messages[i].second;
        }
        return crow::response(response); });

    // REST API: POST /log-message
    CROW_ROUTE(app, "/log-message").methods("POST"_method)([](const crow::request &req)
                                                           {
        auto body = crow::json::load(req.body);
        if (!body || !body["log"]) {
            return crow::response(400, "Invalid request. 'log' is required.");
        }

        string log = body["log"].s();

        // Log the message
        log_message(log);

        return crow::response(200, "Log message recorded."); });

    // Start the Crow server in a separate thread
    thread crow_thread([&app]()
                       { app.port(8080).multithreaded().run(); });

    // Start the existing socket-based server
    int server_socket, client_socket;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_addr_size;

    server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket == -1)
    {
        perror("socket() failed");
        exit(1);
    }

    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = inet_addr("127.0.0.1");
    server_addr.sin_port = htons(PORT);

    if (bind(server_socket, (sockaddr *)&server_addr, sizeof(server_addr)) == -1)
    {
        perror("bind() failed");
        exit(1);
    }

    printf("Socket server is running on port %d\n", PORT);
    if (listen(server_socket, SERVER_BACKLOG) == -1)
    {
        perror("listen() error");
        exit(1);
    }

    while (1)
    {
        printf("Waiting for connections...\n");
        client_addr_size = sizeof(client_addr);
        client_socket = accept(server_socket, (struct sockaddr *)&client_addr, &client_addr_size);
        if (client_socket == -1)
        {
            perror("accept() failed!");
            continue;
        }

        thread th(handle_connection, client_socket);
        th.detach();
    }

    close(server_socket);
    crow_thread.join();
    return 0;
}