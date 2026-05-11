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

  useEffect(() => {
    const data = localStorage.getItem("demandas");
    if (data) setDemandas(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("demandas", JSON.stringify(demandas));
  }, [demandas]);

  function adicionar() {
    if (!form.solicitante || !form.descricao) {
      alert("Preencha Solicitante e Descrição!");
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
    setForm({ solicitante: "", responsavel: "", descricao: "", status: "Iniciado", dataVencimento: "" });
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

    const concluidasMes = demandas.filter((d) => d.dataConclusao && 
      new Date(d.dataConclusao).getMonth() === mesAtual && 
      new Date(d.dataConclusao).getFullYear() === anoAtual).length;

    const emAberto = demandas.filter((d) => d.status !== "Concluído").length;
    const atrasadas = demandas.filter((d) => 
      d.status !== "Concluído" && d.dataVencimento && new Date(d.dataVencimento) < hoje
    ).length;

    return { total: demandas.length, emAberto, concluidasMes, atrasadas };
  }, [demandas]);

  function exportarCSV() {
    // (mesma função de antes)
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

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demandas_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const getStatusColor = (status: Status) => {
    if (status === "Concluído") return "bg-green-100 text-green-700";
    if (status === "Em processo") return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🏢 Dashboard de Demandas</h1>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Total de Demandas</p>
            <p className="text-4xl font-bold mt-2">{relatorio.total}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Em Aberto</p>
            <p className="text-4xl font-bold mt-2 text-orange-600">{relatorio.emAberto}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Concluídas este mês</p>
            <p className="text-4xl font-bold mt-2 text-green-600">{relatorio.concluidasMes}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Atrasadas</p>
            <p className="text-4xl font-bold mt-2 text-red-600">{relatorio.atrasadas}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Demandas</h2>
          <button 
            onClick={exportarCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
          >
            📥 Exportar CSV
          </button>
        </div>

        {/* Formulário */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h3 className="text-xl font-semibold mb-4">Nova Demanda</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              placeholder="Solicitante *"
              value={form.solicitante}
              onChange={(e) => setForm({ ...form, solicitante: e.target.value })}
              className="border rounded-lg px-4 py-3"
            />
            <input
              placeholder="Responsável"
              value={form.responsavel}
              onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
              className="border rounded-lg px-4 py-3"
            />
            <input
              type="date"
              value={form.dataVencimento}
              onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
              className="border rounded-lg px-4 py-3"
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
              className="border rounded-lg px-4 py-3"
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
            className="w-full mt-4 border rounded-lg px-4 py-3"
            rows={3}
          />

          <button
            onClick={adicionar}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium"
          >
            ➕ Adicionar Demanda
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            placeholder="🔎 Buscar demandas..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 border rounded-lg px-5 py-3"
          />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as "Todos" | Status)}
            className="border rounded-lg px-5 py-3"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Iniciado">Iniciado</option>
            <option value="Em processo">Em processo</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-5">Solicitante</th>
                <th className="text-left p-5">Responsável</th>
                <th className="text-left p-5">Descrição</th>
                <th className="text-left p-5">Vencimento</th>
                <th className="text-left p-5">Status</th>
                <th className="text-center p-5">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((d) => (
                <tr key={d.id} className="border-t hover:bg-gray-50">
                  <td className="p-5">{d.solicitante}</td>
                  <td className="p-5">{d.responsavel || "-"}</td>
                  <td className="p-5">{d.descricao}</td>
                  <td className="p-5">
                    {d.dataVencimento ? new Date(d.dataVencimento).toLocaleDateString("pt-BR") : "-"}
                  </td>
                  <td className="p-5">
                    <select
                      value={d.status}
                      onChange={(e) => atualizarStatus(d.id, e.target.value as Status)}
                      className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(d.status)}`}
                    >
                      <option value="Iniciado">Iniciado</option>
                      <option value="Em processo">Em processo</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </td>
                  <td className="p-5 text-center">
                    <button
                      onClick={() => deletar(d.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtradas.length === 0 && (
            <p className="text-center py-12 text-gray-500">Nenhuma demanda encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
