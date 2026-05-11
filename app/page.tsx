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
  });

  useEffect(() => {
    const data = localStorage.getItem("demandas");
    if (data) setDemandas(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("demandas", JSON.stringify(demandas));
  }, [demandas]);

  function adicionar() {
    if (!form.solicitante || !form.descricao) return;

    const nova: Demanda = {
      id: Date.now(),
      solicitante: form.solicitante,
      responsavel: form.responsavel,
      descricao: form.descricao,
      status: form.status,
      dataCriacao: new Date().toISOString(),
    };

    setDemandas([nova, ...demandas]);

    setForm({
      solicitante: "",
      responsavel: "",
      descricao: "",
      status: "Iniciado",
    });
  }

  function atualizarStatus(id: number, status: Status) {
    setDemandas(
      demandas.map((d) =>
        d.id === id
          ? {
              ...d,
              status,
              dataConclusao:
                status === "Concluído"
                  ? new Date().toISOString()
                  : undefined,
            }
          : d
      )
    );
  }

  function deletar(id: number) {
    setDemandas(demandas.filter((d) => d.id !== id));
  }

  // 🔎 FILTRO + BUSCA
  const filtradas = useMemo(() => {
    return demandas
      .filter((d) => {
        if (filtroStatus === "Todos") return true;
        return d.status === filtroStatus;
      })
      .filter((d) => {
        const texto = (d.solicitante + d.descricao + d.responsavel)
          .toLowerCase();
        return texto.includes(busca.toLowerCase());
      });
  }, [demandas, filtroStatus, busca]);

  // 📊 DASHBOARD
  const relatorio = useMemo(() => {
    const mes = new Date().getMonth();
    const ano = new Date().getFullYear();

    const concluidasMes = demandas.filter((d) => {
      if (!d.dataConclusao) return false;
      const dt = new Date(d.dataConclusao);
      return dt.getMonth() === mes && dt.getFullYear() === ano;
    }).length;

    const emAberto = demandas.filter(
      (d) => d.status !== "Concluído"
    ).length;

    const atrasadas = demandas.filter(
      (d) => d.status !== "Concluído"
    ).length;

    return {
      total: demandas.length,
      emAberto,
      concluidasMes,
      atrasadas,
    };
  }, [demandas]);

  // 📁 EXPORTAR EXCEL (CSV)
  function exportar() {
    const csv = [
      ["Solicitante", "Responsável", "Status", "Descrição"],
      ...demandas.map((d) => [
        d.solicitante,
        d.responsavel,
        d.status,
        d.descricao,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio-demandas.csv";
    a.click();
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🏢 Sistema Administrativo de Demandas</h1>

      {/* DASHBOARD */}
      <div style={{ display: "flex", gap: 20 }}>
        <div>📦 Total: {relatorio.total}</div>
        <div>⏳ Em aberto: {relatorio.emAberto}</div>
        <div>📅 Mês: {relatorio.concluidasMes}</div>
        <div>⚠️ Abertas: {relatorio.atrasadas}</div>
      </div>

      <button onClick={exportar} style={{ marginTop: 10 }}>
        📁 Exportar Excel
      </button>

      <hr />

      {/* FORM */}
      <h3>Nova Demanda</h3>

      <input
        placeholder="Solicitante"
        value={form.solicitante}
        onChange={(e) =>
          setForm({ ...form, solicitante: e.target.value })
        }
      />

      <input
        placeholder="Responsável"
        value={form.responsavel}
        onChange={(e) =>
          setForm({ ...form, responsavel: e.target.value })
        }
      />

      <input
        placeholder="Descrição"
        value={form.descricao}
        onChange={(e) =>
          setForm({ ...form, descricao: e.target.value })
        }
      />

      <button onClick={adicionar}>Adicionar</button>

      <hr />

      {/* FILTROS */}
      <input
        placeholder="Buscar..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <select
        value={filtroStatus}
        onChange={(e) =>
          setFiltroStatus(e.target.value as any)
        }
      >
        <option value="Todos">Todos</option>
        <option value="Iniciado">Iniciado</option>
        <option value="Em processo">Em processo</option>
        <option value="Concluído">Concluído</option>
      </select>

      {/* TABELA */}
      <table border={1} cellPadding={8} width="100%">
        <thead>
          <tr>
            <th>Solicitante</th>
            <th>Responsável</th>
            <th>Descrição</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {filtradas.map((d) => (
            <tr key={d.id}>
              <td>{d.solicitante}</td>
              <td>{d.responsavel}</td>
              <td>{d.descricao}</td>

              <td>
                <select
                  value={d.status}
                  onChange={(e) =>
                    atualizarStatus(
                      d.id,
                      e.target.value as Status
                    )
                  }
                >
                  <option>Iniciado</option>
                  <option>Em processo</option>
                  <option>Concluído</option>
                </select>
              </td>

              <td>
                <button onClick={() => deletar(d.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
