import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
} from "react-native";
import { supabase } from "../supabase";

const { width, height } = Dimensions.get("screen");

const HomeScreen = ({ route }) => {
  const { firstName, lastName, userId } = route.params;
  const [posts, setPosts] = useState("");
  const [postList, setPostList] = useState([]);
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const scrollViewRef = useRef(null);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        comments:comments(*)
      `
      )
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching posts:", error.message);
      return;
    }
    setPostList(data);
  };

  useEffect(() => {
    fetchPosts();

    // Set up real-time listener
    const postsSubscription = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload) => {
          console.log("Change received!", payload);
          fetchPosts(); // Refetch all posts when any change occurs
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      postsSubscription.unsubscribe();
    };
  }, [fetchPosts]); // Removed userId from dependencies

  const handlePostSubmit = async () => {
    if (!posts.trim()) return;
    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          user_id: userId,
          post: posts,
          firstName,
          lastName,
          likes: 0,
          liked_by: [],
        },
      ])
      .select();
    if (error) {
      console.error("Error inserting post:", error.message);
      return;
    }
    setPosts("");
    // No need to update postList here as the real-time subscription will handle it
  };

  const handleDeletePost = async (postId) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("posts")
            .delete()
            .eq("posts_id", postId);

          if (error) {
            console.error("Error deleting post:", error.message);
            return;
          }
          // No need to update postList here as the real-time subscription will handle it
        },
      },
    ]);
  };

  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) return;
    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          post_id: postId,
          user_id: userId,
          comment: commentText,
          user_name: `${firstName} ${lastName}`,
        },
      ])
      .select();
    if (error) {
      console.error("Error submitting comment:", error.message);
      return;
    }
    setCommentText("");
    fetchPosts(); // Refetch all posts to get the updated comments
  };

  const handleLikePost = async (postId, currentLikes, likedBy) => {
    const isLiked = likedBy.includes(userId);
    const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;
    const updatedLikedBy = isLiked
      ? likedBy.filter((id) => id !== userId)
      : [...likedBy, userId];

    const { error } = await supabase
      .from("posts")
      .update({ likes: newLikes, liked_by: updatedLikedBy })
      .eq("posts_id", postId);
    if (error) {
      console.error("Error updating likes:", error.message);
      return;
    }

    setPostList(
      postList.map((post) =>
        post.posts_id === postId
          ? { ...post, likes: newLikes, liked_by: updatedLikedBy }
          : post
      )
    );
  };

  return (
    <>
      <StatusBar backgroundColor="#F7F7F7" barStyle="dark-content" />
      <View style={styles.container}>
        <ScrollView ref={scrollViewRef}>
          {/* Post Input */}
          <View style={styles.postContainer}>
            <View style={styles.postInputWrapper}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{firstName[0]}</Text>
              </View>
              <Text style={{ justifyContent: "center", alignSelf: "center" }}>
                {firstName} {lastName}
              </Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="What's happening?"
                placeholderTextColor="#666"
                value={posts}
                onChangeText={setPosts}
                style={styles.mindText}
                multiline
              />
              <TouchableOpacity
                style={styles.buttonPost}
                onPress={handlePostSubmit}
              >
                <Text style={styles.buttonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Posts List */}
          {postList.map((item) => (
            <View style={styles.postItem} key={item.posts_id}>
              <View style={styles.postHeader}>
                <View style={styles.userAvatar}>
                  <Text style={styles.avatarText}>{item.firstName[0]}</Text>
                </View>
                <View style={styles.postHeaderText}>
                  <Text style={styles.userName}>
                    {item.firstName} {item.lastName}
                  </Text>
                </View>
                {item.user_id === userId && (
                  <TouchableOpacity
                    onPress={() => handleDeletePost(item.posts_id)}
                    style={styles.deleteButton}
                  >
                    <Image
                      source={require("../assets/delete-icon.png")}
                      style={styles.deleteIcon}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.postContent}>{item.post}</Text>

              <View style={styles.postActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    handleLikePost(
                      item.posts_id,
                      item.likes || 0,
                      item.liked_by || []
                    )
                  }
                >
                  <Image
                    source={
                      item.liked_by?.includes(userId)
                        ? require("../assets/liked-icon.png")
                        : require("../assets/like-icon.png")
                    }
                    style={[
                      styles.icon,
                      item.liked_by?.includes(userId) && styles.likedIcon,
                    ]}
                  />
                  <Text style={styles.actionText}>{item.likes || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    setExpandedPost(
                      expandedPost === item.posts_id ? null : item.posts_id
                    )
                  }
                >
                  <Image
                    source={require("../assets/comment-icon.png")}
                    style={styles.icon}
                  />
                  <Text style={styles.actionText}>
                    {item.comments?.length || 0}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Comments Section */}
              {expandedPost === item.posts_id && (
                <View style={styles.commentSection}>
                  <View style={styles.commentInput}>
                    <TextInput
                      placeholder="Add a comment..."
                      value={commentText}
                      onChangeText={setCommentText}
                      style={styles.commentTextInput}
                    />
                    <TouchableOpacity
                      style={styles.commentButton}
                      onPress={() => handleCommentSubmit(item.posts_id)}
                    >
                      <Text style={styles.buttonText}>Reply</Text>
                    </TouchableOpacity>
                  </View>

                  {item.comments?.map((comment) => (
                    <View key={comment.id} style={styles.commentItem}>
                      <View style={styles.smallAvatar}>
                        <Text style={styles.smallAvatarText}>
                          {comment.user_name?.[0]}
                        </Text>
                      </View>
                      <View style={styles.commentContent}>
                        <Text style={styles.commentName}>
                          {comment.user_name}
                        </Text>
                        <Text style={styles.commentText}>
                          {comment.comment}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.scrollToTopButton}
          onPress={() => scrollViewRef.current?.scrollTo({ y: 0 })}
        >
          <Text style={styles.scrollToTopText}>↑</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  welcome: {
    fontSize: 18,
    alignSelf: "center",
    padding: 20,
    marginTop: 20,
    color: "#784F91",
  },
  postContainer: {
    backgroundColor: "#FFF",
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 30
  },
  postInputWrapper: {
    flexDirection: "row",
    padding: 15,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#784F91",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputContainer: {
    flex: 1,
    bottom: 10,
    padding: 15,
  },
  mindText: {
    fontSize: 16,
    maxHeight: 100,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  buttonPost: {
    alignSelf: "flex-end",
    backgroundColor: "#784F91",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  postItem: {
    padding: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  deleteIcon: {
    width: 20,
    height: 20,
    tintColor: "#784F91",
  },
  postHeaderText: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  postContent: {
    fontSize: 16,
    marginTop: 10,
    marginLeft: 50,
    color: "#333",
  },
  postActions: {
    flexDirection: "row",
    marginTop: 10,
    marginLeft: 50,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 5,
    tintColor: "#666",
  },
  likedIcon: {
    tintColor: "#784F91",
  },
  actionText: {
    color: "#666",
  },
  commentSection: {
    marginTop: 10,
    marginLeft: 50,
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  commentTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  commentButton: {
    backgroundColor: "#784F91",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 10,
  },
  smallAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#784F91",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  smallAvatarText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  commentContent: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 10,
  },
  commentName: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  commentText: {
    color: "#333",
  },
  scrollToTopButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#784F91",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollToTopText: {
    color: "#FFF",
    fontSize: 20,
  },
});

export default HomeScreen;
