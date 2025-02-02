import supabase from "@/DB/db";

export default async function handleJobs(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabase.from("jobs").select("*");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } else if (req.method === "POST") {
    const { label, checked } = req.body;
    const { data, error } = await supabase
      .from("jobs")
      .insert([{ label, checked }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data);
  } else if (req.method === "DELETE") {
    const { id } = req.query;
    const { data, error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
  } else if (req.method === "PUT") {
    const { id, label } = req.query;
    const { data, error } = await supabase
      .from("jobs")
      .update([{ label }])
      .eq("id", id);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
  } else {
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not allowed`);
  }
}
