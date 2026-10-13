export const initialUsers = [
  { id: 1, name: 'Alice Freeman', email: 'alice.f@example.com', role: 'Admin', status: 'Active', lastLogin: '2023-10-01T10:00:00Z' },
  { id: 2, name: 'Bob Smith', email: 'bob.smith@example.com', role: 'Editor', status: 'Active', lastLogin: '2023-10-02T14:30:00Z' },
  { id: 3, name: 'Charlie Davis', email: 'charlie.d@example.com', role: 'Viewer', status: 'Inactive', lastLogin: '2023-09-15T09:15:00Z' },
  { id: 4, name: 'Diana Prince', email: 'diana.p@example.com', role: 'Editor', status: 'Active', lastLogin: '2023-10-05T16:45:00Z' },
  { id: 5, name: 'Evan Wright', email: 'evan.w@example.com', role: 'Viewer', status: 'Active', lastLogin: '2023-10-06T08:20:00Z' }
];

export const initialActivities = [
  { id: 101, user: 'System', action: 'System reboot', time: '2023-10-06T00:00:00Z' },
  { id: 102, user: 'Alice Freeman', action: 'Updated user Bob Smith', time: '2023-10-06T09:15:00Z' },
  { id: 103, user: 'Bob Smith', action: 'Logged in', time: '2023-10-06T10:30:00Z' },
];

export const userGrowthData = [
  { name: 'Jan', users: 120 },
  { name: 'Feb', users: 210 },
  { name: 'Mar', users: 380 },
  { name: 'Apr', users: 540 },
  { name: 'May', users: 790 },
  { name: 'Jun', users: 1050 },
];
