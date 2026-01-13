import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';
import FacultyNavbar from '../../components/FacultyNavbar';
import RelievingRequest from './RelievingRequest';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [requestData, setRequestData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      // Get Faculty Profile
      const { data: faculty, error: facultyError } = await supabase
        .from('faculties')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (facultyError) throw facultyError;
      setFacultyProfile(faculty);

      // Fetch existing relieving request
      const { data: req } = await supabase
        .from('relieving_requests')
        .select('*')
        .eq('faculty_id', faculty.id)
        .maybeSingle();

      setRequestData(req);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading Portal...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <FacultyNavbar 
        facultyName={facultyProfile?.full_name} 
        employeeId={facultyProfile?.employee_id} 
      />
      
      {/* CENTERED UI WRAPPER 
          - flex justify-center: Centers the form horizontally
          - max-w-3xl: Keeps the form at a professional reading width
      */}
      <div className="flex justify-center items-start p-6 md:p-12">
        <div className="w-full max-w-3xl"> 
          <RelievingRequest 
            faculty={facultyProfile} 
            existingRequest={requestData} 
            onRefresh={fetchDashboardData} 
          />
        </div>
      </div>
    </div>
  );
}; // <--- This was the missing brace causing your error!

export default FacultyDashboard;