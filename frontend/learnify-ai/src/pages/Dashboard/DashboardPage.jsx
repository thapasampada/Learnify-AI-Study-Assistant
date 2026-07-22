import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import progressService from '../../services/progressService';
import toast from 'react-hot-toast';
import { Clock, FileText, TrendingUp, BookOpen } from 'lucide-react';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        setDashboardData(data.data);
      } catch (error) {
        toast.error('Failed to fetch dashboard data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFB]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EAF2F2] mb-4">
            <TrendingUp className="w-8 h-8 text-[#9CB0B4]" />
          </div>
          <p className="text-[#647278] text-sm">No dashboard data available.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Documents',
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      bg: 'bg-[#4F9DA6]',
    },
    {
      label: 'Total Flashcards',
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      bg: 'bg-[#8FB89A]',
    },
    {
      label: 'Total Quizzes',
      value: dashboardData.overview.totalQuizzes,
      icon: TrendingUp,
      bg: 'bg-[#6B8CAE]',
    },
  ];

  // Format a date, or show a fallback if missing/invalid
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-GB') + ', ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const recentActivityItems = dashboardData.recentActivity
    ? [
        ...(dashboardData.recentActivity.documents || []).map((doc) => ({
          id: doc._id,
          description: doc.title,
          timestamp: doc.lastAccessed,
          link: `/documents/${doc._id}`,
          type: 'document',
        })),
        ...(dashboardData.recentActivity.quizzes || []).map((quiz) => ({
          id: quiz._id,
          description: quiz.title,
          timestamp: quiz.completedAt,
          link: `/documents/${quiz.documentId?._id}/flashcards`,
          type: 'quiz',
        })),
      ].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
    : [];

  return (
    <div className="min-h-screen bg-[#F7FAFB] px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#2A3439] tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-[#647278] text-sm">
            Track your learning progress and activity.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white border border-[#DCE6E8] rounded-2xl p-6 flex items-start justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-[#9CB0B4] tracking-wide uppercase mb-3">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-[#2A3439]">
                    {stat.value ?? 0}
                  </p>
                </div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg}`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-[#DCE6E8] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EAF2F2]">
              <Clock className="w-4 h-4 text-[#647278]" strokeWidth={2} />
            </div>
            <h3 className="text-base font-semibold text-[#2A3439]">
              Recent Activity
            </h3>
          </div>

          {recentActivityItems.length > 0 ? (
            <div className="divide-y divide-[#EAF2F2]">
              {recentActivityItems.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        activity.type === 'document' ? 'bg-[#4F9DA6]' : 'bg-[#8FB89A]'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-[#2A3439]">
                        {activity.type === 'document' ? 'Accessed Document: ' : 'Attempted Quiz: '}
                        {activity.description}
                      </p>
                      <p className="text-xs text-[#9CB0B4] mt-0.5">
                        {formatDate(activity.timestamp) || 'Not completed yet'}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={activity.link}
                    className="text-sm font-medium text-[#3D7F87] hover:text-[#2E6167] shrink-0"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9CB0B4]">No recent activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
