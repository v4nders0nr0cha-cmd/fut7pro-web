// src/app/superadmin/logs/page.tsx

export default function SuperAdminLogsPage() {
  // Mock logs
  const logs = [
    {
      data: "15/06/2025 14:22",
      acao: "Login",
      usuario: "SuperAdmin",
      detalhe: "Acessou dashboard",
    },
    {
      data: "14/06/2025 10:03",
      acao: "Bloqueio",
      usuario: "SuperAdmin",
      detalhe: "Bloqueou Racha Galáticos",
    },
    {
      data: "13/06/2025 19:41",
      acao: "Impersonate",
      usuario: "SuperAdmin",
      detalhe: "Entrou como admin do Racha Vila União",
    },
    {
      data: "13/06/2025 08:09",
      acao: "Novo Admin",
      usuario: "João Silva",
      detalhe: "Criou novo admin no Vila União",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Logs e Auditoria</h1>
      <div className="bg-gray-900 rounded-xl shadow p-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="py-2 px-2">Data/Hora</th>
              <th className="py-2 px-2">Ação</th>
              <th className="py-2 px-2">Usuário</th>
              <th className="py-2 px-2">Detalhe</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="py-2 px-2">{log.data}</td>
                <td className="py-2 px-2">{log.acao}</td>
                <td className="py-2 px-2">{log.usuario}</td>
                <td className="py-2 px-2">{log.detalhe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
