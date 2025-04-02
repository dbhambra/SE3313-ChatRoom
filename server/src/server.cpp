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


#define PORT 1000
#define SERVER_BACKLOG 1
#define BUFFER_SIZE  4096

using namespace std;

//typedef struct sockaddr_in SA_IN;
//typedef struct sockaddr SA;

void handle_connection(int);
void send_msg (const string&);
void handle_error(const string&);
int client_count = 0;
mutex mtx;
unordered_map<string,int> client_sockets;



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

    if (bind(server_socket,(SA*)&server_addr,sizeof(server_addr)) == -1){
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
            handle_error("accept() failed!")
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

    while(bytes_read = recv(client_socket,buffer,sizeof(buffer)-1,0) >0){
        printf("%s", buffer);
    }
    

}


void handle_error(const string &message){
    cerr << message << endl;
    exit(1);
}