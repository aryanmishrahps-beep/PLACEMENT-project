import ProtectedLayout from '../../components/layout/ProtectedLayout';

export default function FacultyCoursesPage() {
  const mockCourses = [
    { id: 1, title: 'Data Structures & Algorithms', students: 120, status: 'Active' },
    { id: 2, title: 'Advanced React Patterns', students: 85, status: 'Active' },
    { id: 3, title: 'Introduction to SQL', students: 150, status: 'Draft' },
  ];

  return (
    <ProtectedLayout title="Manage Courses" allowedRoles={['faculty']}>
      <div className="card">
        <div className="flex justify-between items-center mb-md">
          <h2 className="font-bold text-lg">Your Courses</h2>
          <button className="btn btn-primary">Create Course</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Course Title</th>
              <th>Enrolled Students</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockCourses.map(c => (
              <tr key={c.id}>
                <td className="font-semibold text-primary">{c.title}</td>
                <td>{c.students}</td>
                <td>
                  <span className={`badge ${c.status === 'Active' ? 'badge-accent' : 'badge-warning'}`}>
                    {c.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-secondary mr-sm">Edit</button>
                  <button className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedLayout>
  );
}
