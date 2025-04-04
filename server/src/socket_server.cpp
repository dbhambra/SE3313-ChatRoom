#include <sstream>
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
#include <condition_variable>


#define PORT 5006
#define SERVER_BACKLOG 1
#define BUFFER_SIZE  4096

using namespace std;

//typedef struct sockaddr_in SA_IN;
//typedef struct sockaddr SA;

void handle_connection(int);
void send_message (int,const string&);
void admin_send_all_message(const string&);
void handle_error(const string&);
void add_socket_name(int,string);
string get_name_from_socket(int);
int get_socket_from_name(string);
vector<string> splitString(const string&, char);
void admin_send_all_message(const string&);
int check_room(const int&);
void message_type_actions(const char&,int&,vector<string>&);
int get_room(const int&);
int client_count = 0;



mutex mtx;//Mutex
condition_variable cv;
unordered_map<string,int> client_sockets;//Map for all clients and their respective sokets
vector<pair<int,int>> rooms(10);//10 breakout rooms with a capacity of 2 people only
vector<int> active_sockets(20);


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
    
       // char buffer[BUFFER_SIZE];
        while (true) {
            // Read 4-byte length prefix
            uint32_t msg_length;
            if (recv(client_socket, &msg_length, 4, MSG_WAITALL) != 4) {
                break; // Error or closed connection
            }
            msg_length = ntohl(msg_length); // Convert from network byte order
    
            // Read the full message
            string message(msg_length, '\0');
            if (recv(client_socket, &message[0], msg_length, MSG_WAITALL) != msg_length) {
                break; // Error or closed connection
            }
    
            // Process the message
            printf("Received: %s\n", message.c_str());
        	vector<string> split_str = splitString(message.c_str(),';');
		message_type_actions(message[0],client_socket,split_str);		
		//printf("Message Type: %c\n",message[0]);
		//for(int i=0;i<split_str.size();i++){
		//	printf("%s\n",split_str[i].c_str());
		//}
	}
        close(client_socket);
}




int check_room(int &room_num){
    int count = 0;
    if(rooms[room_num-1].first == 0){
        count++;
    }
    if(rooms[room_num-1].second == 0){
        count++;
    }
    //cout << count << endl;
    return count;
}

void add_socket_name(int client_socket, string nickname){
    if(client_sockets.find(nickname) != client_sockets.end()){
        printf("Nickname Already Exists");
        string msg = "Client Name Already Exists";
        //send_message(client_socket,"Client Already Exists, retry");
        close(client_socket);
	return;
    }
    else{
	client_sockets[nickname] = client_socket;
	//cout << "TEST" << endl;
	//send_message(client_socket,"Successfuly logged in");
	return;
    }
}
string get_name_from_socket(int client_socket){
	auto it = std::find_if(client_sockets.begin(), client_sockets.end(),
		[&client_socket](const auto &pair) {
			return pair.second == client_socket;
		}
    );

	printf("Nickname for socket #%d:%s\n",it->second,it->first.c_str());
	return ((it->first));
}

int get_socket_from_name(string nickname){
	return client_sockets[nickname];
}

void send_message(int client_socket,const string &msg){
    send(client_socket,msg.c_str(),msg.length()+1,0);
}

void admin_send_all_message(const string &message){
    for(int i=0;i<active_sockets.size();i++){
        send_message(active_sockets[i],message);
    }
}


void handle_error(const string &message){
    cerr << message << endl;
    exit(1);
}

vector<string> splitString(const string& str, char delimiter){
    vector<string> result;
    stringstream ss(str);
    string temp;

    while(getline(ss,temp,delimiter)){
        result.push_back(temp);
    }

    return result;
}

int get_room(const int& client_socket){
   
    for (int i = 0; i < rooms.size(); i++) {
        if (rooms[i].first == client_socket || rooms[i].second == client_socket) {
            return i + 1; // Room numbers start at 1
        }
    }	
    return 0;
}

void message_type_actions(const char &message_type,int &client_socket,vector<string> &split_str){
        //Switch Statement
        switch(message_type) {
            case '1'://message (receive 1;<message>)
		{
            int receiver;
            int sender = client_socket;
            mtx.lock();	      
            int room = get_room(client_socket);
            if(rooms[room-1].first==client_socket){
                receiver = rooms[room-1].second;
            }
            else{
                receiver = rooms[room-1].first;
            }
	    stringstream message;
	    message << get_name_from_socket(client_socket) << ";" << split_str[1];
            //sprintf(message,"%s:%s",get_name_from_socket(client_socket),split_str[1]);         
			mtx.unlock();
            send_message(sender,message.str());
            send_message(receiver,message.str());
			break;
		}
            case '2'://New User connected to server get the nickname (receive 2;<nickname>)
		{
			mtx.lock();
			add_socket_name(client_socket,split_str[1].c_str());
			//active_sockets.push_back(client_socket);
			send_message(client_socket,"Successful Connection\n");
			printf("Client Socket ID: %d, Nickname: %s\n",client_socket,get_name_from_socket(client_socket).c_str());
			mtx.unlock();
			break;
		}
            case '3'://User wants to disconnect from Server (receive 3)
		{

			mtx.lock();
			string nickname = get_name_from_socket(client_socket);
			//Remove from all tracking	
			//active_sockets.erase(remove(active_sockets.begin(),active_sockets.end(),client_socket),active_sockets.end());
			client_sockets.erase(nickname.c_str());
			close(client_socket);
			mtx.unlock();
			printf("Removed Client:%s\n",nickname.c_str());
			break;
		}
            case '4': 
		    {//Join a Room (receive 4;<Room Number>) Room Number starts from 1
			    mtx.lock();
           		int room_num = stoi(split_str[1].c_str());
			    int available_space = check_room(room_num);
           		//int client_socket_from_nickname = get_socket_from_name(split_str[2]);
			    //cout << client_socket_from_nickname <<endl;
                    if(available_space > 0){
			    if(rooms[room_num-1].first ==0){
				rooms[room_num-1].first = client_socket;
			    }
			    else{
				rooms[room_num-1].second = client_socket;
			    }
		   // stringstream message;
		   // message << "2;" << room_num;
                    send_message(client_socket,"2");
                    active_sockets.push_back(client_socket);               
                }
    		    else{
				    send_message(client_socket,"3");
			    }
			    mtx.unlock();
			    break;
		    }
            case '5':
		{ // 5;<room_num>
			stringstream message;
			int available_rooms;
			int room_num = stoi(split_str[1].c_str());
			mtx.lock();
			available_rooms = check_room(room_num);
			mtx.unlock();
			message << "4;" << available_rooms;
			send_message(client_socket,message.str());
			break;
		}
            case '7'://Leave Room (receive 7;<Room Number>)
		    {
                int other;
                //string message;
                int room;
			    mtx.lock();
                string current_nickname = get_name_from_socket(client_socket);
                //remove from active sockets 
                room = get_room(client_socket);
                if(rooms[room-1].first == client_socket){
                    rooms[room-1].first == 0;
                    other = rooms[room-1].second;
                }
                else{
                    rooms[room-1].second == 0;
                    other = rooms[room-1].first;
                }
                active_sockets.erase(remove(active_sockets.begin(),active_sockets.end(),client_socket),active_sockets.end());
                stringstream message;
        		message << "6;" << get_name_from_socket(client_socket);
                mtx.unlock();
                send_message(client_socket,"5");                
                send_message(other,message.str());
                break;
        	}    
    	    case '8'://Broadcast to all (admin only) (receive 8;<msg>)
		    {
			    mtx.lock();
		    	admin_send_all_message(split_str[1]);
			    mtx.unlock();
    			break;
		    }
	}
}
