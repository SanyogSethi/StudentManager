const initStudentPerformanceChart = (canvasId, subjectData) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !subjectData || subjectData.length === 0) return;

  const labels = subjectData.map(s => s.name);
  const scores = subjectData.map(s => s.percentage);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Subject Percentage (%)',
        data: scores,
        backgroundColor: [
          'rgba(99, 102, 241, 0.6)',
          'rgba(6, 182, 212, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(168, 85, 247, 0.6)',
          'rgba(245, 158, 11, 0.6)'
        ],
        borderColor: [
          '#6366f1',
          '#06b6d4',
          '#10b981',
          '#a855f7',
          '#f59e0b'
        ],
        borderWidth: 1.5,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#9ca3af' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#9ca3af' }
        }
      }
    }
  });
};

const initAttendanceDoughnut = (canvasId, present, absent) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Present/Late', 'Absent'],
      datasets: [{
        data: [present, absent],
        backgroundColor: ['#10b981', '#f43f5e'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#9ca3af', boxWidth: 12, padding: 15 }
        }
      }
    }
  });
};
