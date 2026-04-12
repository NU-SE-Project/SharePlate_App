import React, { useState, useEffect } from "react";
import { 
  Users, 
  HandHelping, 
  Utensils, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { fetchAdminStats } from "../../services/adminDataService";
import LoadingState from "../../../../components/common/LoadingState";

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
  <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-600/5">
    <div className="flex items-start justify-between">
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color} shadow-lg shadow-current/10 transition-transform duration-300 group-hover:scale-110`}>
        {React.createElement(Icon, { size: 28 })}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
          trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}%
        </div>
      )}
    </div>
    <div className="mt-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">{title}</h3>
      <p className="mt-1 text-4xl font-black text-slate-900">{value}</p>
    </div>
    {/* Decorative background circle */}
    <div className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full opacity-5 transition-transform duration-500 group-hover:scale-150 ${color.split(' ')[1]}`} />
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const data = await fetchAdminStats();
      setStats(data);
      setIsLoading(false);
    };
    loadStats();
  }, []);

  const chartData = [
    { name: "Mon", donations: 400, requests: 240 },
    { name: "Tue", donations: 300, requests: 139 },
    { name: "Wed", donations: 200, requests: 980 },
    { name: "Thu", donations: 278, requests: 390 },
    { name: "Fri", donations: 189, requests: 480 },
    { name: "Sat", donations: 239, requests: 380 },
    { name: "Sun", donations: 349, requests: 430 },
  ];

  if (isLoading) {
    return (
      <LoadingState
        title="Loading dashboard"
        message="Please wait while we fetch the latest admin insights."
        minHeightClassName="min-h-[60vh]"
        panelClassName="border-0 bg-transparent shadow-none"
      />
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="animate-fade-in">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard Overview</h1>
        <p className="mt-1 text-slate-500">Welcome back! Here's what's happening today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 animate-fade-up">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={Users} 
          trend="up" 
          trendValue="12" 
          color="bg-blue-500 text-white" 
        />
        <StatCard 
          title="Food Banks" 
          value={stats.totalFoodBanks} 
          icon={HandHelping} 
          trend="up" 
          trendValue="5" 
          color="bg-emerald-500 text-white" 
        />
        <StatCard 
          title="Restaurants" 
          value={stats.totalRestaurants} 
          icon={Utensils} 
          trend="down" 
          trendValue="2" 
          color="bg-amber-500 text-white" 
        />
        <StatCard 
          title="Total Donations" 
          value={stats.totalDonations} 
          icon={Activity} 
          trend="up" 
          trendValue="24" 
          color="bg-rose-500 text-white" 
        />
        <StatCard 
          title="Active Requests" 
          value={stats.activeRequests} 
          icon={TrendingUp} 
          trend="up" 
          trendValue="18" 
          color="bg-indigo-500 text-white" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 animate-fade-up animation-delay-200">
        <div className="col-span-2 rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Donation Activity</h3>
              <p className="text-sm text-slate-500">Weekly platform engagement</p>
            </div>
            <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="donations" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorDonations)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-xl font-bold text-slate-900">User Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Food Bank', value: stats.totalFoodBanks },
                { name: 'Restaurant', value: stats.totalRestaurants },
                { name: 'Admin', value: 3 },
              ]}>
                 <XAxis dataKey="name" hide />
                 <Tooltip cursor={{fill: 'transparent'}} />
                 <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#3b82f6" />
                 </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="h-3 w-3 rounded-full bg-emerald-500" />
                   <span className="text-sm font-medium text-slate-600">Food Banks</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{stats.totalFoodBanks}</span>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="h-3 w-3 rounded-full bg-amber-500" />
                   <span className="text-sm font-medium text-slate-600">Restaurants</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{stats.totalRestaurants}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
