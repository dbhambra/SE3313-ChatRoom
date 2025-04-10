
#pragma once
#include <string.h>
#include <vector>

using namespace std;

void handle_connection(int);//HANDLING INCOMING CONNECTIONS
void send_message(int, const string&);//SEND MESSAGES
void admin_send_all_message(const string&);//SEND MESSAGES TO EVERYONE
void handle_error(const string&);//HANDLE ERRORS
void message_type_actions(char, int&, vector<string>&);//ACTIONS BASED OFF DECODED/PARSED INCOMING MESSAGES