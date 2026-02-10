/**
 * doctors: array of {id, name, avg_consult_time, availableAt}
 * positionInQueue: integer (1-based)
 */
function queueEngine(doctors, positionInQueue) {
  for (let i = 0; i < positionInQueue; i++) {
    // pilih doctor yang available paling cepat
    doctors.sort((a, b) => a.availableAt - b.availableAt);
    const nextDoctor = doctors[0];
    nextDoctor.availableAt += nextDoctor.avg_consult_time;
  }

  doctors.sort((a, b) => a.availableAt - b.availableAt);
  return doctors[0].availableAt; // waktu pasien akan selesai
}

module.exports = queueEngine;
