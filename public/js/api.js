const API = {
  async login(email, password) {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  },

  async logout() {
    const res = await fetch('/api/v1/auth/logout', { method: 'POST' });
    return await res.json();
  },

  async createUser(userData) {
    const res = await fetch('/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await res.json();
  },

  async createClass(classData) {
    const res = await fetch('/api/v1/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData)
    });
    return await res.json();
  },

  async createSubject(subjectData) {
    const res = await fetch('/api/v1/classes/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData)
    });
    return await res.json();
  },

  async recordBatchAttendance(data) {
    const res = await fetch('/api/v1/attendance/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async addMark(markData) {
    const res = await fetch('/api/v1/marks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(markData)
    });
    return await res.json();
  },

  async createAssignment(assignmentData) {
    const res = await fetch('/api/v1/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData)
    });
    return await res.json();
  },

  async submitAssignment(assignmentId, content) {
    const res = await fetch(`/api/v1/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    return await res.json();
  },

  async triggerAiInsight(studentId) {
    const res = await fetch(`/api/v1/ai/student-insight/${studentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  },

  async getParentDigest(studentId) {
    const res = await fetch(`/api/v1/ai/parent-digest/${studentId}`);
    return await res.json();
  }
};
