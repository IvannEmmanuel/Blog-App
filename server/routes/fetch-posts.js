const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://kiewtxwqhmhvyzlerwqx.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpZXd0eHdxaG1odnl6bGVyd3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NDU5NjAsImV4cCI6MjA1NDIyMTk2MH0.6x13yfVmZLLQ0NHhm2Jtkxunp6PZkG9gYbALbuMX800";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = async (req, res) => {
  try {
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

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
