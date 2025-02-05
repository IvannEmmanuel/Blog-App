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

// Import route handlers
const deletePostRoute = require("./routes/delete-post");
const fetchPostsRoute = require("./routes/fetch-posts");
const likePostRoute = require("./routes/like-post");
const submitPostRoute = require("./routes/submit-post");
const submitCommentRoute = require("./routes/submit-comment");

// Use route handlers
app.use("/delete-post", deletePostRoute);
app.use("/fetch-posts", fetchPostsRoute);
app.use("/like-post", likePostRoute);
app.use("/submit-post", submitPostRoute);
app.use("/submit-comment", submitCommentRoute);

// Test Route
app.get("/", (req, res) => {
  res.send(`Server is running on port ${port}`);
});

// Start Server
const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
