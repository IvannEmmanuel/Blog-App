const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://kiewtxwqhmhvyzlerwqx.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpZXd0eHdxaG1odnl6bGVyd3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NDU5NjAsImV4cCI6MjA1NDIyMTk2MH0.6x13yfVmZLLQ0NHhm2Jtkxunp6PZkG9gYbALbuMX800";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = async (req, res) => {
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
};
