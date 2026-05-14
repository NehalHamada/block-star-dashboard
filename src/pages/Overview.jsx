import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Users, 
  Zap, 
  ClipboardList,
  CheckCircle,
  Clock,
  Truck
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
} from "recharts";

import StatCard from "../components/common/StatCard";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/common/Card";
import statsService from "../services/statsService";

const COLORS = ["#8E741D", "#151314", "#C5C5C5"];

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsService.getStats();
        if (response.success) {
          setStats(response.data);
        } else {
          setError("فشل في جلب البيانات");
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("حدث خطأ أثناء جلب الإحصائيات");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-80 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  const { overview, monthly_sales, orders_by_status } = stats || {};
  
  const chartData = monthly_sales?.data.map(item => ({
    name: item.month_name,
    sales: item.total_sales,
    orders: item.orders_count
  })) || [];

  const statusData = [
    { name: "قيد الانتظار", value: orders_by_status?.pending || 0, icon: Clock, color: "#8E741D" },
    { name: "مؤكد", value: orders_by_status?.confirmed || 0, icon: CheckCircle, color: "#151314" },
    { name: "تم الشحن", value: orders_by_status?.shipped || 0, icon: Truck, color: "#676767" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          name="إجمالي المبيعات"
          icon={Zap}
          value={`${overview?.total_sales?.toLocaleString() || 0} ر.س`}
          color="#8E741D"
        />
        <StatCard
          name="إجمالي المستخدمين"
          icon={Users}
          value={overview?.total_users?.toLocaleString() || 0}
          color="#151314"
        />
        <StatCard
          name="إجمالي المنتجات"
          icon={ShoppingBag}
          value={overview?.total_products?.toLocaleString() || 0}
          color="#8E741D"
        />
        <StatCard
          name="إجمالي الطلبات"
          icon={ClipboardList}
          value={overview?.total_orders?.toLocaleString() || 0}
          color="#151314"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>نظرة عامة على المبيعات ({monthly_sales?.year})</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: "320px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8E741D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8E741D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#C5C5C5" opacity={0.2} />
                  <XAxis
                    dataKey="name"
                    stroke="#676767"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#676767" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFDF5",
                      borderColor: "#8E741D",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#8E741D"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                    name="المبيعات"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>حالات الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div style={{ width: "100%", height: "200px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-3">
                {statusData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <item.icon size={16} className="text-gray-500" />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
