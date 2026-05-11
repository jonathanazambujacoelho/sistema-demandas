"use client";

import { useState } from "react";

export default function Page() {
  const [logado, setLogado] = useState(false);

  const demandas = [
    {
      id: 1,
      solicitante: "Compras",
      demanda: "Cotação fornecedor",
      status: "Em Processo",
    },
    {
      id: 2,
      solicitante: "Financeiro",
      demanda: "Fechar relatório",
      status: "Iniciado",
    },
  ];

  if (!logado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-96">
          <h1 className="text-2xl font-bold mb-4">Login Sistema</h1>

          <input
            className="w-full border p-2 rounded mb-3"
            placeholder="Usuário"
          />

          <input
            className="w-full border p-2 rounded mb-4"
            type="password"
            placeholder="Senha"
          />

          <button
            onClick={() => setLogado(true)}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <h1 className="text-2xl font-bold mb-6">
        Sistema Administrativo de Demandas
      </h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        <table className="w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Solicitante</th>
              <th>Demanda</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {demandas.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.solicitante}</td>
                <td>{d.demanda}</td>
                <td>{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
