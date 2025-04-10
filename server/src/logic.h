#pragma once
#include <string>
#include <vector>

//HEADER FOR LOGIC

#define NUM_ROOMS 10


using namespace std;


vector<string> split_string(const string &, char);//GENERAL STRING SPLITTER FUNCTION, RETURNS THE SPLIT BASED OFF DELIMITER AS VECTOR
int add_socket_name(int, const string&);//ADD SOCKET_ID AND NICKNAME TO MAP TRACKER
string get_name_from_socket(int);//RETURN NAME FROM SOCKET ID
int get_socket_from_name(string);//RETURN SOCKET ID FROM NICKNAME
int check_room(int);//CHECK ROOM AVAILABILITY
int get_room(int);//RETURN ROOM BASED OFF SOCKET ID
void reset_state();//RESET STATE USED FOR TESTING

