import supabase from "@/DB/db";

export default async function handleJobs(req, res) {
  if (req.method === "GET") {
    // Recuperar jobs do banco de dados
    const { data, error } = await supabase.from("jobs").select("*");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } else if (req.method === "POST") {
    // Adicionar um novo job ao banco de dados
    const { label, checked } = req.body;
    const { data, error } = await supabase
      .from("jobs")
      .insert([{ label, checked }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } else if (req.method === "PUT") {
    // Atualizar um job no banco de dados
    const { id } = req.query;
    const { label } = req.body;
    const { data, error } = await supabase
      .from("jobs")
      .update({ label })
      .eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } else if (req.method === "DELETE") {
    // Deletar um job do banco de dados
    const { id } = req.query;
    const { data, error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
