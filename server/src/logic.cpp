#include "logic.h"
#include <unordered_map>
#include <vector>
#include <mutex>
#include <algorithm>
#include <string>
#include <sstream>
using namespace std;


extern mutex client_mtx, room_mtx;
extern unordered_map<string,int> client_sockets;
extern vector<pair<int,int>> rooms;



string get_name_from_socket(int socket) {
    lock_guard<mutex> lock(client_mtx);
    for (const auto& [name, sock] : client_sockets) {
        if (sock == socket) return name;
    }
    return "";
}

int get_socket_from_name(const string& name) {
    lock_guard<mutex> lock(client_mtx);
    return client_sockets[name];
}

int add_socket_name(int socket, const string& name) {
    lock_guard<mutex> lock(client_mtx);
    if (client_sockets.count(name)) {
        return 0;//UNSUCCESS JOIN
	//send_message(socket, "Name already in use.");
        //close(socket);
    } else {
        client_sockets[name] = socket;
	return 1;//SUCCESS JOIN
    }
}

int check_room(int room_num) {
    lock_guard<mutex> lock(room_mtx);
    int count = 0;
    if (rooms[room_num - 1].first == 0) count++;
    if (rooms[room_num - 1].second == 0) count++;
    return count;
}

int get_room(int socket) {
    lock_guard<mutex> lock(room_mtx);
    for (int i = 0; i < rooms.size(); i++) {
        if (rooms[i].first == socket || rooms[i].second == socket) return i + 1;
    }
    return 0;
}

vector<string> split_string(const string& str, char delimiter) {
    vector<string> result;
    stringstream ss(str);
    string item;
    while (getline(ss, item, delimiter)) result.push_back(item);
    return result;
}
