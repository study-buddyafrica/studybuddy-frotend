import React, { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Users } from 'lucide-react';
import axios from 'axios';
import { FHOST } from '../constants/Functions.jsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState([
    { name: 'Total Users', value: '0' },
    { name: 'Total Teachers', value: '0' },
    { name: 'Total Students', value: '0' },
    { name: 'Total Parents', value: '0' },
  ]);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);

  const fetchFallbackData = async () => {
    try {
      console.log('Fetching fallback data from existing endpoints...');
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      let totalUsers = 0;
      let totalTeachers = 0;
      let totalStudents = 0;
      let totalParents = 0;
      
      // Fetch users by role from the new API
      const roles = ['teacher', 'student', 'parent'];
      
      for (const role of roles) {
        try {
          const res = await axios.get(`${FHOST}/api/users/users-list?role=${role}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }).catch(() => null);
          
          if (res?.data?.results && Array.isArray(res.data.results)) {
            const count = res.data.results.length;
            totalUsers += count;
            
            if (role === 'teacher') {
              totalTeachers = count;
            } else if (role === 'student') {
              totalStudents = count;
            } else if (role === 'parent') {
              totalParents = count;
            }
          }
        } catch (err) {
          console.error(`Failed to fetch ${role} count:`, err);
        }
      }
      
      console.log('Fallback data:', { totalUsers, totalTeachers, totalStudents, totalParents });
      
      setStats([
        { name: 'Total Users', value: totalUsers.toString() },
        { name: 'Total Teachers', value: totalTeachers.toString() },
        { name: 'Total Students', value: totalStudents.toString() },
        { name: 'Total Parents', value: totalParents.toString() },
      ]);
    } catch (error) {
      console.error('Fallback data fetch failed:', error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        
        console.log('Fetching dashboard data...', { FHOST, token: !!token });
        
        // Test admin endpoint first
        try {
          const testRes = await axios.get(`${FHOST}/admin/test`);
          console.log('Admin test response:', testRes.data);
        } catch (testError) {
          console.error('Admin test failed:', testError);
        }
        
        // Fetch dashboard statistics
        try {
          const statsRes = await axios.get(`${FHOST}/admin/dashboard-stats`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          
          console.log('Dashboard stats response:', statsRes.data);
          
          if (statsRes.data && statsRes.data.success) {
            const data = statsRes.data.stats;
            console.log('Stats data:', data);
            setStats([
              { name: 'Total Users', value: (data.total_users || 0).toString() },
              { name: 'Total Teachers', value: (data.total_teachers || 0).toString() },
              { name: 'Total Students', value: (data.total_students || 0).toString() },
              { name: 'Total Parents', value: (data.total_parents || 0).toString() },
            ]);
          } else {
            console.error('Invalid response structure:', statsRes.data);
            // Fallback: try to get data from existing endpoints
            await fetchFallbackData();
          }
        } catch (statsError) {
          console.error('Failed to fetch dashboard stats, trying fallback:', statsError);
          setError(`Failed to fetch dashboard stats: ${statsError.message}`);
          // Fallback: try to get data from existing endpoints
          await fetchFallbackData();
        }

        // Fetch recent activity
        try {
          const activityRes = await axios.get(`${FHOST}/admin/recent-activity`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          
          console.log('Recent activity response:', activityRes.data);
          
          if (activityRes.data && activityRes.data.success) {
            setRecentActivity(activityRes.data.recent_registrations.slice(0, 5));
          }
        } catch (activityError) {
          console.error('Failed to fetch recent activity:', activityError);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        console.error('Error details:', error.response?.data || error.message);
        setError(`Failed to fetch dashboard data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'User Growth',
        data: [65, 89, 120, 156, 205, 250],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const doughnutData = {
    labels: ['Teachers', 'Students', 'Parents'],
    datasets: [
      {
        data: [
          parseInt(stats.find(s => s.name === 'Total Teachers')?.value || '0'),
          parseInt(stats.find(s => s.name === 'Total Students')?.value || '0'),
          parseInt(stats.find(s => s.name === 'Total Parents')?.value || '0')
        ],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-gray-500">
              {stat.name}
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {loading ? '...' : stat.value}
            </dd>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">User Growth</h3>
          <div className="mt-4">
            <Line data={lineChartData} />
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">User Distribution</h3>
          <div className="mt-4">
            <Doughnut data={doughnutData} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <div className="mt-4 flow-root">
            <ul className="-mb-8">
              {loading ? (
                <li className="relative pb-8">
                  <div className="text-sm text-gray-500">Loading recent activity...</div>
                </li>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <li key={activity.id} className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 ring-8 ring-white">
                          <Users className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-500">
                            New {activity.role} registration: <span className="font-medium text-gray-900">{activity.name}</span>
                          </p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          {new Date(activity.registered_on).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="relative pb-8">
                  <div className="text-sm text-gray-500">No recent activity</div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;