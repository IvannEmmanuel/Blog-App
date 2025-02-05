const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON request body

// Initialize Supabase client
const SUPABASE_URL = "https://kiewtxwqhmhvyzlerwqx.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpZXd0eHdxaG1odnl6bGVyd3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NDU5NjAsImV4cCI6MjA1NDIyMTk2MH0.6x13yfVmZLLQ0NHhm2Jtkxunp6PZkG9gYbALbuMX800";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test Route
app.get("/", (req, res) => {
  res.send(`Server is running on port ${port}`);
});

// Route to fetch posts
app.get("/fetch-posts", async (req, res) => {
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
    return res.status(500).json({ error: error.message });
  }

  res.json(data); // Send the posts as the response
});

// Route to handle post submission
app.post("/submit-post", async (req, res) => {
  const { userId, post, firstName, lastName } = req.body;

  if (!post.trim()) {
    return res.status(400).json({ error: "Post content cannot be empty" });
  }

  const { data, error } = await supabase
    .from("posts")
    .insert([
      {
        user_id: userId,
        post: post,
        firstName: firstName,
        lastName: lastName,
        likes: 0,
        liked_by: [],
      },
    ])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true, data });
});

// Route to update likes for a post
app.post("/like-post", async (req, res) => {
  const { postId, userId, currentLikes, likedBy } = req.body;

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
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true, newLikes, updatedLikedBy });
});

// Route to delete post
app.delete("/delete-post/:postId", async (req, res) => {
  const { postId } = req.params;

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("posts_id", postId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

// Route to handle comment submission
app.post("/submit-comment", async (req, res) => {
  const { postId, userId, commentText, firstName, lastName } = req.body;

  if (!commentText.trim()) {
    return res.status(400).json({ error: "Comment cannot be empty" });
  }

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
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true, data });
});

// Start Server
const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
