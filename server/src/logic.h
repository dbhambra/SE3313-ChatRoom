#pragma once
#include <string>
#include <vector>

#define NUM_ROOMS 10


using namespace std;


vector<string> split_string(const string &, char);
int add_socket_name(int, const string&);
string get_name_from_socket(int);
int get_socket_from_name(string);
int check_room(int);
int get_room(int);
void reset_state();

