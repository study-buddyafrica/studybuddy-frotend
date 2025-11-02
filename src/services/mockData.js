export const mockUsers = [
  {
    id: 1,
    email: "teacher@example.com",
    password: "teacher123",
    name: "James Teacher",
    role: "teacher",
    auth: {
      access_token: "mock_teacher_access_token",
      refresh_token: "mock_teacher_refresh_token",
    },
  },
  {
    id: 2,
    email: "student@example.com",
    password: "student123",
    name: "Tylan Student",
    role: "student",
    auth: {
      access_token: "mock_student_access_token",
      refresh_token: "mock_student_refresh_token",
    },
  },
  {
    id: 3,
    email: "parent@example.com",
    password: "parent123",
    name: "Reginah Parent",
    role: "parent",
    auth: {
      access_token: "mock_parent_access_token",
      refresh_token: "mock_parent_refresh_token",
    },
  },
  {
    id: 4,
    email: "admin@example.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    auth: {
      access_token: "mock_admin_access_token",
      refresh_token: "mock_admin_refresh_token",
    },
  },
];
