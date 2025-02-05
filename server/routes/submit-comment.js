const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://kiewtxwqhmhvyzlerwqx.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpZXd0eHdxaG1odnl6bGVyd3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NDU5NjAsImV4cCI6MjA1NDIyMTk2MH0.6x13yfVmZLLQ0NHhm2Jtkxunp6PZkG9gYbALbuMX800";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = async (req, res) => {
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
};
