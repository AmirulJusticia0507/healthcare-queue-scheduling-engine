function formatAvailable(availableAt) {
  if (!availableAt) return '-'
  return new Date(availableAt).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DoctorsTable({ doctors, loading, onEdit, onDelete, canManage }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="px-4 py-2 font-medium">Nama Dokter</th>
              <th className="px-4 py-2 font-medium">Konsultasi (mnt)</th>
              <th className="px-4 py-2 font-medium">Tersedia Kembali</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((n) => (
              <tr key={n} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2"><div className="h-4 bg-gray-200 animate-pulse rounded" /></td>
                <td className="px-4 py-2"><div className="h-4 bg-gray-200 animate-pulse rounded" /></td>
                <td className="px-4 py-2"><div className="h-4 bg-gray-200 animate-pulse rounded" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-200">
            <th className="px-4 py-2 font-medium">Nama Dokter</th>
            <th className="px-4 py-2 font-medium">Konsultasi (mnt)</th>
            <th className="px-4 py-2 font-medium">Tersedia Kembali</th>
            {canManage && <th className="px-4 py-2 font-medium">Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {doctors.length === 0 ? (
            <tr>
              <td colSpan={canManage ? 4 : 3} className="px-4 py-4 text-center text-gray-500">
                Belum ada dokter
              </td>
            </tr>
          ) : (
            doctors.map((d) => (
              <tr key={d.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{d.name}</td>
                <td className="px-4 py-2">{d.avg_consult_time}</td>
                <td className="px-4 py-2">{formatAvailable(d.available_at)}</td>
                {canManage && (
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button onClick={() => onEdit(d)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 mr-2">Ubah</button>
                    <button onClick={() => onDelete(d)} className="text-xs font-semibold text-red-600 hover:text-red-700">Hapus</button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DoctorsTable
