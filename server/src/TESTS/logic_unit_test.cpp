#define DEFINE_CHAT_GLOBALS
#include <gtest/gtest.h>
#include "logic.h"

// 🧪 Test the string splitting utility
TEST(SplitStringTest, NormalInput) {
    std::vector<std::string> result = split_string("alpha;beta;gamma", ';');
    ASSERT_EQ(result.size(), 3);
    EXPECT_EQ(result[0], "alpha");
    EXPECT_EQ(result[1], "beta");
    EXPECT_EQ(result[2], "gamma");
}

TEST(SplitStringTest, EmptyInput) {
    std::vector<std::string> result = split_string("", ';');
    ASSERT_EQ(result.size(), 1);
    EXPECT_EQ(result[0], "");
}

TEST(SplitStringTest, NoDelimiter) {
    std::vector<std::string> result = split_string("nodelem", ';');
    ASSERT_EQ(result.size(), 1);
    EXPECT_EQ(result[0], "nodelem");
}

// 🧪 Test socket-name mapping logic
TEST(SocketMappingTest, AddAndRetrieveSocket) {
    reset_state();
    EXPECT_EQ(add_socket_name(5, "Alice"), 1);
    EXPECT_EQ(get_socket_from_name("Alice"), 5);
    EXPECT_EQ(get_name_from_socket(5), "Alice");
}

TEST(SocketMappingTest, DuplicateNameRejection) {
    reset_state();
    EXPECT_EQ(add_socket_name(5, "Bob"), 1);
    EXPECT_EQ(add_socket_name(6, "Bob"), 0); // Should reject duplicate name
    EXPECT_EQ(get_socket_from_name("Bob"), 5);
}

TEST(SocketMappingTest, RemoveClient) {
    reset_state();
    add_socket_name(10, "Charlie");
    EXPECT_EQ(get_socket_from_name("Charlie"), 10);
    remove_client_from_map("Charlie");
    EXPECT_EQ(get_socket_from_name("Charlie"), 0);  // Should return 0 if not found
}

// 🧪 Test room logic
TEST(RoomTest, RoomAvailabilityAndAssignment) {
    reset_state();
    EXPECT_EQ(check_room(1), 2);  // Empty room
    extern std::vector<std::pair<int, int>> rooms;
    rooms[0].first = 7;
    EXPECT_EQ(check_room(1), 1);
    rooms[0].second = 8;
    EXPECT_EQ(check_room(1), 0);
}

TEST(RoomTest, GetRoomFromSocket) {
    reset_state();
    extern std::vector<std::pair<int, int>> rooms;
    rooms[2].first = 11;
    EXPECT_EQ(get_room(11), 3);
    EXPECT_EQ(get_room(99), 0);  // Not found
}