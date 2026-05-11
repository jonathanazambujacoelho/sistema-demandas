"use client";
import { useEffect, useMemo, useState } from "react";

type Status = "Iniciado" | "Em processo" | "Concluído";

type Demanda = {
  id: number;
  solicitante: string;
  responsavel: string;
  descricao: string;
  status: Status;
  dataCriacao: string;
  dataVencimento?: string;
  dataConclusao?: string;
};

export default function Home() {
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | Status>("Todos");

  const [form, setForm] = useState({
    solicitante: "",
    responsavel: "",
    descricao: "",
    status: "Iniciado" as Status,
    dataVencimento: "",
  });

  // Carregar e salvar no localStorage
  useEffect(() => {
    const data = localStorage.getItem("demandas");
    if (data) setDemandas(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("demandas", JSON.stringify(demandas));
  }, [demandas]);

  function adicionar() {
    if (!form.solicitante || !form.descricao) {
      alert("❌ Preencha Solicitante e Descrição!");
      return;
    }

    const nova: Demanda = {
      id: Date.now(),
      solicitante: form.solicitante,
      responsavel: form.responsavel,
      descricao: form.descricao,
      status: form.status,
      dataCriacao: new Date().toISOString(),
      dataVencimento: form.dataVencimento || undefined,
    };

    setDemandas([nova, ...demandas]);
    setForm({
      solicitante: "",
      responsavel: "",
      descricao: "",
      status: "Iniciado",
      dataVencimento: "",
    });
  }

  function atualizarStatus(id: number, novoStatus: Status) {
    setDemandas((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: novoStatus,
              dataConclusao: novoStatus === "Concluído" ? new Date().toISOString() : undefined,
            }
          : d
      )
    );
  }

  function deletar(id: number) {
    if (confirm("Excluir esta demanda?")) {
      setDemandas((prev) => prev.filter((d) => d.id !== id));
    }
  }

  const filtradas = useMemo(() => {
    return demandas
      .filter((d) => filtroStatus === "Todos" || d.status === filtroStatus)
      .filter((d) =>
        `${d.solicitante} ${d.responsavel} ${d.descricao}`.toLowerCase().includes(busca.toLowerCase())
      )
      .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
  }, [demandas, filtroStatus, busca]);

  const relatorio = useMemo(() => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const concluidasMes = demandas.filter((d) => {
      if (!d.dataConclusao) return false;
      const dt = new Date(d.dataConclusao);
      return dt.getMonth() === mesAtual && dt.getFullYear() === anoAtual;
    }).length;

    const emAberto = demandas.filter((d) => d.status !== "Concluído").length;
    const atrasadas = demandas.filter((d) => {
      if (d.status === "Concluído" || !d.dataVencimento) return false;
      return new Date(d.dataVencimento) < hoje;
    }).length;

    return { total: demandas.length, emAberto, concluidasMes, atrasadas };
  }, [demandas]);

  function exportarCSV() {
    const headers = ["Solicitante", "Responsável", "Descrição", "Status", "Criação", "Vencimento", "Conclusão"];
    const rows = demandas.map((d) => [
      d.solicitante,
      d.responsavel,
      `"${d.descricao.replace(/"/g, '""')}"`,
      d.status,
      new Date(d.dataCriacao).toLocaleDateString("pt-BR"),
      d.dataVencimento ? new Date(d.dataVencimento).toLocaleDateString("pt-BR") : "",
      d.dataConclusao ? new Date(d.dataConclusao).toLocaleDateString("pt-BR") : "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demandas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const getStatusStyle = (status: Status) => {
    if (status === "Concluído") return "bg-emerald-500 text-white";
    if (status === "Em processo") return "bg-blue-500 text-white";
    return "bg-amber-500 text-white";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 text-white">
      {/* Header com Avatar */}
      <header className="border-b border-slate-700 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="https://i.imgur.com/2v6vL8K.jpeg" 
              alt="Avatar"
              className="w-12 h-12 rounded-full border-4 border-emerald-400 shadow-xl"
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestão de Demandas</h1>
              <p className="text-slate-400 text-sm">Administração • Jonathan</p>
            </div>
          </div>
          <button
            onClick={exportarCSV}
            className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-2xl font-medium flex items-center gap-2 transition-all"
          >
            📥 Exportar CSV
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Cards do Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-800/70 border border-slate-600 rounded-3xl p-6">
            <p className="text-slate-400">Total de Demandas</p>
            <p className="text-5xl font-bold mt-3">{relatorio.total}</p>
          </div>
          <div className="bg-slate-800/70 border border-slate-600 rounded-3xl p-6">
            <p className="text-slate-400">Em Aberto</p>
            <p className="text-5xl font-bold mt-3 text-orange-400">{relatorio.emAberto}</p>
          </div>
          <div className="bg-slate-800/70 border border-slate-600 rounded-3xl p-6">
            <p className="text-slate-400">Concluídas este mês</p>
            <p className="text-5xl font-bold mt-3 text-emerald-400">{relatorio.concluidasMes}</p>
          </div>
          <div className="bg-slate-800/70 border border-red-500/40 rounded-3xl p-6">
            <p className="text-slate-400">Atrasadas</p>
            <p className="text-5xl font-bold mt-3 text-red-400">{relatorio.atrasadas}</p>
          </div>
        </div>

        {/* Formulário Nova Demanda */}
        <div className="bg-slate-800/70 border border-slate-600 rounded-3xl p-8 mb-10">
          <h3 className="text-2xl font-semibold mb-6 text-emerald-400">➕ Nova Demanda</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              placeholder="Solicitante *"
              value={form.solicitante}
              onChange={(e) => setForm({ ...form, solicitante: e.target.value })}
              className="bg-slate-900 border border-slate-600 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500"
            />
            <input
              placeholder="Responsável"
              value={form.responsavel}
              onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
              className="bg-slate-900 border border-slate-600 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="date"
              value={form.dataVencimento}
              onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
              className="bg-slate-900 border border-slate-600 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500"
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
              className="bg-slate-900 border border-slate-600 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500"
            >
              <option value="Iniciado">Iniciado</option>
              <option value="Em processo">Em processo</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>

          <textarea
            placeholder="Descrição da demanda *"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            rows={4}
            className="w-full mt-6 bg-slate-900 border border-slate-600 rounded-3xl px-5 py-4 focus:outline-none focus:border-emerald-500"
          />

          <button
            onClick={adicionar}
            className="mt-6 bg-emerald-500 hover:bg-emerald-600 px-10 py-4 rounded-2xl font-semibold text-lg transition-all"
          >
            Adicionar Demanda
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            placeholder="🔎 Buscar por nome, responsável ou descrição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-600 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500"
          />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as "Todos" | Status)}
            className="bg-slate-900 border border-slate-600 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Iniciado">Iniciado</option>
            <option value="Em processo">Em processo</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="bg-slate-800/70 border border-slate-600 rounded-3xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-700">
                <th className="text-left p-6">Solicitante</th>
                <th className="text-left p-6">Responsável</th>
                <th className="text-left p-6">Descrição</th>
                <th className="text-left p-6">Vencimento</th>
                <th className="text-left p-6">Status</th>
                <th className="text-center p-6">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((d) => (
                <tr key={d.id} className="border-t border-slate-700 hover:bg-slate-700/50 transition">
                  <td className="p-6 font-medium">{d.solicitante}</td>
                  <td className="p-6">{d.responsavel || "-"}</td>
                  <td className="p-6">{d.descricao}</td>
                  <td className="p-6">
                    {d.dataVencimento ? new Date(d.dataVencimento).toLocaleDateString("pt-BR") : "-"}
                  </td>
                  <td className="p-6">
                    <select
                      value={d.status}
                      onChange={(e) => atualizarStatus(d.id, e.target.value as Status)}
                      className={`px-5 py-2 rounded-2xl text-sm font-medium ${getStatusStyle(d.status)}`}
                    >
                      <option value="Iniciado">Iniciado</option>
                      <option value="Em processo">Em processo</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </td>
                  <td className="p-6 text-center">
                    <button
                      onClick={() => deletar(d.id)}
                      className="text-red-500 hover:text-red-600 font-medium transition"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtradas.length === 0 && (
            <p className="text-center py-20 text-slate-500 text-lg">
              Nenhuma demanda encontrada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
