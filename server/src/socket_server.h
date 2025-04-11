
#pragma once
#include <string.h>
#include <vector>

using namespace std;

void handle_connection(int);
void send_message(int, const string&);
void admin_send_all_message(const string&);
void handle_error(const string&);
void message_type_actions(char, int&, vector<string>&);