#include <sys/socket.h>
#include <stdio.h>      // printf, perror
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
#define PORT 5006
#define SERVER_BACKLOG 1
#define BUFFER_SIZE  4096

using namespace std;

//typedef struct sockaddr_in SA_IN;
//typedef struct sockaddr SA;

void handle_connection(int);
void send_msg (const string&);
void handle_error(const string&);

void add_socket_name(int,string);
string get_name_from_socket(int);
int get_socket_from_name(string);
int client_count = 0;



mutex mtx;
unordered_map<string,int> client_sockets;
vector<pair<string,string>> rooms;



int main(void){
    int server_socket, client_socket;
    struct sockaddr_in server_addr,client_addr;
    socklen_t client_addr_size;

    server_socket = socket(AF_INET, SOCK_STREAM,0);

    if(server_socket == -1){
       handle_error("socket() failed"); 
    }

    memset(&server_addr,0,sizeof(server_addr));

    server_addr.sin_family = AF_INET;
    //server_addr.sin_addr.s_addr = htonl(INADDR_ANY);
    server_addr.sin_addr.s_addr = inet_addr("127.0.0.1");
    server_addr.sin_port = htons(PORT);

    if (bind(server_socket,(sockaddr*)&server_addr,sizeof(server_addr)) == -1){
        handle_error("bind() failed");
    }
    printf("Server is running on port %d\n" , PORT);
    if(listen(server_socket,SERVER_BACKLOG) == -1){
        handle_error("listen() error");
    }

    while (1) {
        printf("Waiting for connections...\n");
        client_addr_size = sizeof(client_addr);
        client_socket = accept(server_socket,(struct sockaddr*)&client_addr,&client_addr_size);
        if (client_socket == -1){
            handle_error("accept() failed!");
        }

        mtx.lock();
        client_count ++;
        mtx.unlock();


        thread th(handle_connection,client_socket);
        //if(th.joinable()){
        //    th.join();
        //}
        th.detach();
        
    }
    close(server_socket);
    return 0;


}

void handle_connection(int client_socket){
    char buffer[BUFFER_SIZE];
    size_t bytes_read;
    int msgsize = 0;

    while((bytes_read = recv(client_socket,buffer,sizeof(buffer),0)) != 0) {
    	buffer[bytes_read] = '\0';
    	char message_type = buffer[0];
	buffer[0] = ' ';
	string received_data(buffer,bytes_read);
    	if(message_type == '2'){
        	//printf("Welcome New User: %s",buffer);
		mtx.lock();
    		add_socket_name(client_socket,received_data);
		print_name_from_socket(client_socket);
		mtx.unlock();
	}       
    }

}

void add_socket_name(int client_socket, string nickname){
	client_sockets[nickname] = client_socket;
}
string get_name_from_socket(int client_socket){
	auto it = std::find_if(client_sockets.begin(), client_sockets.end(),
		[&client_socket](const auto &pair) {
			return pair.second == client_socket;
		}
    	);

	//printf("Nickname for socket #%d:%s\n",it->second,it->first.c_str());
	return (it->first.c_str());
}

int get_socket_from_name(string nickname){
	return client_sockets[nickname];
}

void handle_error(const string &message){
    cerr << message << endl;
    exit(1);
}
