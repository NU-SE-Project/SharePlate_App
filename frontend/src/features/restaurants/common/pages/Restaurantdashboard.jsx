import React, { useState, useEffect } from 'react';
import {
  Package, Clock, CheckCircle, XCircle, Utensils, AlertCircle, Bell, ChevronRight, Check, X,
  TrendingUp, Activity, PlusCircle, List, MessageSquareWarning, ArrowUpRight
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../../../utils/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'];

const RestaurantDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/restaurant');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-transparent">
        <Activity className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-transparent text-gray-500">
      <AlertCircle className="w-16 h-16 mb-4 text-gray-300" />
      <p className="text-lg">No dashboard data available</p>
    </div>
  );

  const { profile, stats, recentActivity, alerts, charts, notifications } = data;

  return (
    <div>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header & Quick Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 backdrop-blur-xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Utensils className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
                  {profile?.name || 'Restaurant Overview'}
                </h1>
                {profile?.verificationStatus === 'verified' && (
                  <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400" title="Verified Restaurant">
                    <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
                  </div>
                )}
              </div>

            </div>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Link to="/restaurant/donate-food" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
              <PlusCircle className="w-5 h-5" /> Donate Food
            </Link>
            <Link to="/restaurant/donation-requests-management" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm active:translate-y-0 hover:-translate-y-0.5 transition-all duration-300">
              <List className="w-5 h-5" /> All Requests
            </Link>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts && alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <div key={idx} className="flex items-start gap-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/60 dark:border-amber-700/30 rounded-2xl shadow-sm" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="p-3 bg-amber-100 dark:bg-amber-800/50 rounded-xl shadow-sm">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 pt-0.5">
                  <h3 className="text-base font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    Donation Expiring Soon
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-200/50 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold tracking-wide uppercase">Action Required</span>
                  </h3>
                  <p className="text-amber-700 dark:text-amber-400/80 mt-1.5 leading-relaxed">
                    "{alert.foodName}" is expiring on <span className="font-semibold">{new Date(alert.expiryTime).toLocaleDateString()}</span>. Consider converting it to compost if not requested.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Posted" value={stats.totalDonations} icon={<Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />} color="bg-blue-50 dark:bg-blue-500/10" borderColor="border-blue-100 dark:border-blue-500/20" />
          <StatCard title="Active Requests" value={stats.activeRequests} icon={<Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />} color="bg-indigo-50 dark:bg-indigo-500/10" borderColor="border-indigo-100 dark:border-indigo-500/20" />
          <StatCard title="Approved" value={stats.approvedRequests} icon={<CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />} color="bg-emerald-50 dark:bg-emerald-500/10" borderColor="border-emerald-100 dark:border-emerald-500/20" />
          <StatCard title="Rejected" value={stats.rejectedRequests} icon={<XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />} color="bg-rose-50 dark:bg-rose-500/10" borderColor="border-rose-100 dark:border-rose-500/20" />
          {/* <StatCard title="Meals Collected" value={stats.mealsCollected} icon={<Utensils className="w-6 h-6 text-amber-600 dark:text-amber-400" />} color="bg-amber-50 dark:bg-amber-500/10" borderColor="border-amber-100 dark:border-amber-500/20" /> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Area - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">

            {/* Charts Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="bg-white dark:bg-gray-800/80 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Request Overview</h3>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400"><Activity className="w-4 h-4" /></div>
                </div>
                <div className="h-64 flex items-center justify-center">
                  {charts.requestStatusDistribution.some(stat => stat.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={charts.requestStatusDistribution.filter(d => d.value > 0)}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={85}
                          paddingAngle={6} dataKey="value" stroke="none"
                        >
                          {charts.requestStatusDistribution.filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'rgba(255,255,255,0.95)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', color: '#1f2937', fontWeight: 500 }}
                          itemStyle={{ color: '#1f2937', fontWeight: 600 }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 500, paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400 font-medium">No request data yet.</p>
                  )}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-white dark:bg-gray-800/80 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Categories Donated</h3>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400"><TrendingUp className="w-4 h-4" /></div>
                </div>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.foodTypeDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 13, fontWeight: 500 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 13, fontWeight: 500 }} />
                      <Tooltip
                        cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'rgba(255,255,255,0.95)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', color: '#1f2937', fontWeight: 500 }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={45}>
                        {charts.foodTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="space-y-6">
              {/* Recent Donations Table */}
              <div className="bg-white dark:bg-gray-800/80 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/70 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/30">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    <span>My Donations</span>
                  </h3>
                  <Link to="/restaurant/donate-food" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1 group transition-colors">
                    View All <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-transparent">
                        <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Food Item</th>
                        <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Type</th>
                        <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Qty (Rem/Tot)</th>
                        <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.donations && recentActivity.donations.map((item, idx) => (
                        <tr key={idx} className="border-t border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                          <td className="py-4 px-6 text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {item.foodName}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg ${item.foodType === 'veg' ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-orange-100/80 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'}`}>
                              {item.foodType}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.remainingQuantity / item.totalQuantity) * 100}%` }}></div>
                              </div>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.remainingQuantity}/{item.totalQuantity}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(!recentActivity.donations || recentActivity.donations.length === 0) && (
                        <tr>
                          <td colSpan="4" className="py-12 text-center text-gray-400">
                            <Package className="w-10 h-10 mb-3 mx-auto opacity-30" />
                            <p className="font-medium text-sm">No recent donations posted</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Accepted Requests Table */}
              <div className="bg-white dark:bg-gray-800/80 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/70 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/30">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span>Accepted Requests</span>
                  </h3>
                  <Link to="/restaurant/donation-requests-management" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1 group transition-colors">
                    Manage Requests <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-transparent">
                        <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Food Bank</th>
                        <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Item</th>
                        <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Qty</th>
                        <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">My Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.requests && recentActivity.requests.map((acc, idx) => (
                        <tr key={idx} className="border-t border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{acc.request_id?.foodbank_id?.name || 'N/A'}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{acc.request_id?.foodbank_id?.address || 'No address'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {acc.request_id?.foodName || 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-sm font-bold text-blue-600 dark:text-blue-400">
                            {acc.acceptedQuantity}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(acc.status)}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {acc.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(!recentActivity.requests || recentActivity.requests.length === 0) && (
                        <tr>
                          <td colSpan="4" className="py-12 text-center text-gray-400">
                            <CheckCircle className="w-10 h-10 mb-3 mx-auto opacity-30" />
                            <p className="font-medium text-sm">No accepted requests yet</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Notifications Panel */}
            <div className="bg-white dark:bg-gray-800/80 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col h-full lg:max-h-[850px]">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                    <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Activity</h3>
                </div>
                {notifications && notifications.length > 0 && (
                  <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm shadow-rose-500/30">{notifications.length} New</span>
                )}
              </div>

              <div className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                {notifications && notifications.length > 0 ? (
                  notifications.map((notif, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer group">
                      <div className="mt-0.5 shrink-0">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                          {notif.message}
                        </p>
                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center h-48">
                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
                      <Bell className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">You're all caught up!</p>
                  </div>
                )}
              </div>

              <div className="p-4 pt-0 mt-auto">
                <button className="w-full py-3.5 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 group">
                  View full history <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components
const StatCard = ({ title, value, icon, color, borderColor }) => (
  <div className={`bg-white dark:bg-gray-800/80 p-5 lg:p-6 rounded-3xl shadow-sm border ${borderColor} hover:shadow-md hover:-translate-y-1 transition-all duration-300 group`}>
    <div className="flex items-center gap-4 lg:gap-5">
      <div className={`p-3.5 lg:p-4 rounded-2xl ${color} bg-opacity-50 dark:bg-opacity-20 shadow-inner max-w-min`}>
        {icon}
      </div>
      <div>
        <p className="text-xs lg:text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wide uppercase">{title}</p>
        <h4 className="text-2xl lg:text-3xl font-black text-gray-800 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">{value}</h4>
      </div>
    </div>
  </div>
);

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'open':
    case 'available':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'fulfilled':
    case 'collected':
    case 'closed':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'expired':
    case 'rejected':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'request':
      return <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800/30"><Clock className="w-4 h-4" /></div>;
    case 'approval':
      return <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800/30"><Check className="w-4 h-4" /></div>;
    case 'rejection':
      return <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-800/30"><X className="w-4 h-4" /></div>;
    default:
      return <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/30"><Bell className="w-4 h-4" /></div>;
  }
};

export default RestaurantDashboard;