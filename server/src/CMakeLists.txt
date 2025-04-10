cmake_minimum_required(VERSION 3.10)
project(socket_Server)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

#Source files
set(SOURCES
    socket_server.cpp
    logic.cpp
)

#Header files (optional, for IDEs)
set(HEADERS
    socket_server.h
    logic.h
)

#Create the chat server executable
add_executable(socket_server ${SOURCES} ${HEADERS})