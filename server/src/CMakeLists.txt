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

# ====================
# Testing Setup
# ====================
enable_testing()

include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/release-1.12.1.zip
)

# For Windows users to avoid runtime issues with Google Test
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)

FetchContent_MakeAvailable(googletest)

# Test target
add_executable(chat_logic_tests
    logic_unit_test.cpp
    logic.cpp
)

target_link_libraries(chat_logic_tests
    gtest_main
)

include(GoogleTest)
gtest_discover_tests(chat_logic_tests)
