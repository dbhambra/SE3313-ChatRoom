#pragma once
#include <string>
#include <vector>
#include <unordered_map>
#include <mutex>
//#include <pair>
//HEADER FOR LOGIC
#define NUM_ROOMS 10

#ifdef DEFINE_CHAT_GLOBALS
    #define CHAT_EXTERN 
#else
    #define CHAT_EXTERN extern
#endif

CHAT_EXTERN std::mutex client_mtx;
CHAT_EXTERN std::mutex room_mtx;
CHAT_EXTERN std::unordered_map<std::string, int> client_sockets;
CHAT_EXTERN std::vector<std::pair<int, int>> rooms;

using namespace std;


vector<string> split_string(const string &, char);//GENERAL STRING SPLITTER FUNCTION, RETURNS THE SPLIT BASED OFF DELIMITER AS VECTOR
int add_socket_name(int, const string&);//ADD SOCKET_ID AND NICKNAME TO MAP TRACKER
string get_name_from_socket(const int&);//RETURN NAME FROM SOCKET ID
int get_socket_from_name(const string&);//RETURN SOCKET ID FROM NICKNAME
int check_room(int);//CHECK ROOM AVAILABILITY
int get_room(int);//RETURN ROOM BASED OFF SOCKET ID
void remove_client_from_map(const string&);//REMOVE CLIENT FORM LIST
void reset_state();//RESET STATE USED FOR TESTING

