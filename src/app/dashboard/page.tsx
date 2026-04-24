"use client";
import { useAppStore } from "@/context/GlobalContext";

export default function Dashboard() {
  const { aiLogs, toggleLogCorrectness } = useAppStore();

  // Analytics Math
  const totalLogs = aiLogs.length;
  const evaluatedLogs = aiLogs.filter(l => l.isCorrect !== null);
  const correctLogs = evaluatedLogs.filter(l => l.isCorrect === true).length;
  
  const accuracyRate = evaluatedLogs.length > 0 
    ? Math.round((correctLogs / evaluatedLogs.length) * 100) 
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">AI Observability Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h3 className="text-gray-400">Total Inferences</h3>
          <p className="text-4xl font-bold mt-2">{totalLogs}</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h3 className="text-gray-400">Accuracy Rate (Evaluated)</h3>
          <p className="text-4xl font-bold mt-2 text-green-400">{accuracyRate}%</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h3 className="text-gray-400">Needs Evaluation</h3>
          <p className="text-4xl font-bold mt-2 text-yellow-400">
            {totalLogs - evaluatedLogs.length}
          </p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="p-4">Transcript</th>
              <th className="p-4">Parsed JSON</th>
              <th className="p-4">Execution</th>
              <th className="p-4">Evaluate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {aiLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-800/50">
                <td className="p-4 font-medium">"{log.transcript}"</td>
                <td className="p-4">
                  <pre className="text-xs bg-gray-950 p-2 rounded text-green-300 overflow-x-auto max-w-xs">
                    {JSON.stringify(log.parsedJSON, null, 2)}
                  </pre>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${log.success ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    {log.success ? "Success" : "Failed"}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button 
                    onClick={() => toggleLogCorrectness(log.id, true)}
                    className={`p-2 rounded ${log.isCorrect === true ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    ✅
                  </button>
                  <button 
                    onClick={() => toggleLogCorrectness(log.id, false)}
                    className={`p-2 rounded ${log.isCorrect === false ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
            {aiLogs.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No logs yet. Use the voice assistant!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}