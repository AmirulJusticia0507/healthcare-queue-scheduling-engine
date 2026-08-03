/**
 * Simulasi penjadwalan antrian terhadap daftar dokter.
 *
 * doctors: array of {id, name, avg_consult_time, available_at}
 * queue:   array pasien waiting, urut dari yang paling lama join
 *
 * Mengembalikan:
 * - updatedQueue: pasien + estimatedTime (menit) + assignedDoctor
 * - doctorStates: state dokter terbaru (availableAt dalam ms) setelah simulasi
 */
function simulateQueue(doctors, queue, now = Date.now()) {
  const doctorStates = doctors.map(d => ({
    ...d,
    availableAt: new Date(d.available_at).getTime()
  }));

  const updatedQueue = queue.map(patient => {
    // pilih dokter yang free paling cepat
    doctorStates.sort((a, b) => a.availableAt - b.availableAt);
    const assignedDoctor = doctorStates[0];

    const startAt = Math.max(assignedDoctor.availableAt, now);
    const estimatedTime = Math.max(0, Math.ceil((startAt - now) / 60000));
    const availableAt = startAt + assignedDoctor.avg_consult_time * 60000;

    assignedDoctor.availableAt = availableAt;

    return {
      ...patient,
      estimatedTime,
      assignedDoctor: {
        id: assignedDoctor.id,
        name: assignedDoctor.name,
        availableAt
      }
    };
  });

  return { updatedQueue, doctorStates };
}

module.exports = { simulateQueue };
