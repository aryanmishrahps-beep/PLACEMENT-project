import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateQuizPage() {
  const [title, setTitle] = useState('');
  const navigate = useNavigate();

  const handleSave = () => {
    alert('Quiz saved successfully! (Demo)');
    navigate('/faculty/dashboard');
  };

  return (
    <ProtectedLayout title="Create Quiz" allowedRoles={['faculty']}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="font-bold text-lg mb-lg">New Assessment</h2>
        
        <div className="form-group">
          <label className="form-label">Quiz Title</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. Midterm JavaScript Assessment"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Duration (Minutes)</label>
          <input type="number" className="form-input" defaultValue={30} />
        </div>

        <div className="form-group">
          <label className="form-label">Course Category</label>
          <select className="form-select">
            <option>Data Structures</option>
            <option>Web Development</option>
            <option>Database Systems</option>
          </select>
        </div>

        <div className="flex justify-end gap-md mt-xl">
          <button className="btn btn-secondary" onClick={() => navigate('/faculty/dashboard')}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Quiz</button>
        </div>
      </div>
    </ProtectedLayout>
  );
}
