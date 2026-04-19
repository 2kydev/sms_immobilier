import React from 'react';
import { useEnhancedDashboard } from '@/hooks/useEnhancedDashboard';
import {
  TrendingUp, TrendingDown, Building2, Users, Calendar,
  DollarSign, Activity, AlertTriangle, CheckCircle2,
  ArrowUpRight, ArrowDownRight, BarChart3, Eye, Home, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell
} from 'recharts';

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 1_000_000_000
    ? `${(n / 1_000_000_000).toFixed(2)} Md FCFA`
    : n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)} M FCFA`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(0)} k FCFA`
    : `${n.toLocaleString('fr-FR')} FCFA`;


// ─── KPI Card ────────────────────────────────────────────────────────────────
interface KPICardProps {
  title: string;
  value: string;
  sub?: string;
  trend?: { percentage: number; isPositive: boolean };
  icon: React.ElementType;
  accent: string; // tailwind bg class for the icon container
}

const KPICard: React.FC<KPICardProps> = ({ title, value, sub, trend, icon: Icon, accent }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
        }`}>
          {trend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend.percentage.toFixed(1)} %
        </span>
      )}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

// ─── Pipeline Funnel ─────────────────────────────────────────────────────────
const FUNNEL_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#10b981'];
const FUNNEL_LABELS: Record<string, string> = {
  prospection: 'Disponible',
  qualification: 'Sous offre',
  negotiation: 'Négociation',
  signature: 'Compromis',
  finalise: 'Vendu',
};

interface PipelinePanelProps {
  pipeline: { prospection: number; qualification: number; negotiation: number; signature: number; finalise: number; totalValue: number };
}

const PipelinePanel: React.FC<PipelinePanelProps> = ({ pipeline }) => {
  const stages = ['prospection', 'qualification', 'negotiation', 'signature', 'finalise'] as const;
  const maxVal = Math.max(...stages.map(s => pipeline[s]), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Pipeline des ventes</h3>
          <p className="text-xs text-gray-400 mt-0.5">Valeur totale : {fmt(pipeline.totalValue)}</p>
        </div>
        <BarChart3 className="w-5 h-5 text-gray-300" />
      </div>
      <div className="space-y-3">
        {stages.map((stage, i) => {
          const count = pipeline[stage];
          const width = maxVal > 0 ? (count / maxVal) * 100 : 0;
          return (
            <div key={stage}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 font-medium">{FUNNEL_LABELS[stage]}</span>
                <span className="font-bold text-gray-800">{count}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${width}%`, backgroundColor: FUNNEL_COLORS[i] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Agent Ranking ────────────────────────────────────────────────────────────
interface AgentRankingProps {
  agents: { agent: string; visits: number; deals: number; revenue: number }[];
}

const MEDALS = ['🥇', '🥈', '🥉'];

const AgentRanking: React.FC<AgentRankingProps> = ({ agents }) => {
  const top = agents.slice(0, 6);
  const maxRevenue = Math.max(...top.map(a => a.revenue), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Performance agents</h3>
        <span className="text-xs text-gray-400">{agents.length} agent{agents.length > 1 ? 's' : ''}</span>
      </div>
      {top.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Aucune donnée disponible</p>
      ) : (
        <div className="space-y-3">
          {top.map((a, idx) => (
            <div key={a.agent} className="flex items-center gap-3">
              <span className="text-base w-6 text-center">{MEDALS[idx] ?? <span className="text-gray-400 text-xs font-bold">#{idx + 1}</span>}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800 truncate">{a.agent || '—'}</span>
                  <span className="text-xs font-bold text-indigo-600 ml-2">{fmt(a.revenue)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full"
                    style={{ width: `${(a.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-gray-400">{a.visits} visite{a.visits > 1 ? 's' : ''}</span>
                  <span className="text-xs text-gray-400">{a.deals} vente{a.deals > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Revenue Chart ────────────────────────────────────────────────────────────
interface RevenueChartProps {
  monthlyData: { month: string; revenue: number; sales: number; visits: number }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ monthlyData }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-semibold text-gray-900">Évolution du chiffre d'affaires</h3>
        <p className="text-xs text-gray-400">6 derniers mois</p>
      </div>
      <TrendingUp className="w-5 h-5 text-gray-300" />
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === 'revenue' ? fmt(value) : value,
            name === 'revenue' ? 'CA' : 'Ventes',
          ]}
          contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }}
        />
        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
        <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fill="url(#colorSales)" />
      </AreaChart>
    </ResponsiveContainer>
    <div className="flex gap-4 mt-2">
      <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-0.5 bg-indigo-500 inline-block rounded" /> Chiffre d'affaires</span>
      <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> Ventes</span>
    </div>
  </div>
);

// ─── Activity & Alerts ───────────────────────────────────────────────────────
interface ActivityPanelProps {
  alerts: { id: string; type: string; title: string; message: string; priority: string }[];
  visitKPIs: { scheduledToday: number; totalVisitsThisMonth: number; completedVisits: number };
  clientKPIs: { newClientsThisMonth: number; totalClients: number };
}

const ActivityPanel: React.FC<ActivityPanelProps> = ({ alerts, visitKPIs, clientKPIs }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-gray-900">Activité & Alertes</h3>
      <Activity className="w-5 h-5 text-gray-300" />
    </div>

    {/* Quick stats */}
    <div className="grid grid-cols-2 gap-3 mb-4">
      {[
        { label: "Visites aujourd'hui", value: visitKPIs.scheduledToday, icon: Calendar, color: 'text-indigo-500' },
        { label: 'Visites effectuées', value: visitKPIs.completedVisits, icon: CheckCircle2, color: 'text-emerald-500' },
        { label: 'Nouveaux clients', value: clientKPIs.newClientsThisMonth, icon: Users, color: 'text-violet-500' },
        { label: 'Visites ce mois', value: visitKPIs.totalVisitsThisMonth, icon: Eye, color: 'text-blue-500' },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <div>
            <p className="text-lg font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 leading-tight">{label}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Alerts */}
    <div className="space-y-2">
      {alerts.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-xl px-3 py-2">
          <CheckCircle2 className="w-4 h-4" />
          Aucune alerte en cours
        </div>
      ) : (
        alerts.slice(0, 3).map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs ${
              alert.priority === 'high'
                ? 'bg-red-50 text-red-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">{alert.title}</p>
              <p className="opacity-80">{alert.message}</p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// ─── Main DGDashboard ────────────────────────────────────────────────────────
const DGDashboard: React.FC = () => {
  const { dashboardData, loading, lastUpdated, refetch } = useEnhancedDashboard();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center gap-3 text-gray-400">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500" />
        Chargement du tableau de bord…
      </div>
    );
  }

  const { propertyKPIs, salesKPIs, clientKPIs, visitKPIs, transactionPipeline, alerts, monthlyData, agentPerformance } = dashboardData;

  // Vente vs Location
  const ventePct = propertyKPIs.totalProperties > 0
    ? Math.round(((propertyKPIs.saleCountByType?.terrain + propertyKPIs.saleCountByType?.maison + propertyKPIs.saleCountByType?.immeuble + propertyKPIs.saleCountByType?.entrepot + propertyKPIs.saleCountByType?.autres) / propertyKPIs.totalProperties) * 100)
    : 0;

  // YTD revenue: sum of monthlyData
  const ytdRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-1">Vue exécutive — Direction Générale</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-400">
            Mis à jour le {lastUpdated.toLocaleDateString('fr-FR', {
              weekday: 'short', day: 'numeric', month: 'short',
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="CA du mois"
          value={fmt(salesKPIs.monthlyRevenue)}
          sub={`Mois précédent : ${fmt(salesKPIs.lastMonthRevenue)}`}
          trend={salesKPIs.revenueTrend}
          icon={DollarSign}
          accent="bg-indigo-500"
        />
        <KPICard
          title="CA annuel (YTD)"
          value={fmt(ytdRevenue)}
          sub={`${salesKPIs.totalDeals} transaction${salesKPIs.totalDeals > 1 ? 's' : ''} ce mois`}
          icon={TrendingUp}
          accent="bg-violet-500"
        />
        <KPICard
          title="Biens disponibles"
          value={String(propertyKPIs.availableProperties)}
          sub={`sur ${propertyKPIs.totalProperties} biens au total`}
          trend={propertyKPIs.salesTrend}
          icon={Building2}
          accent="bg-amber-500"
        />
        <KPICard
          title="Part Vente / Location"
          value={`${ventePct}% vente`}
          sub={`${100 - ventePct}% location`}
          icon={Home}
          accent="bg-rose-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart monthlyData={monthlyData} />
        </div>
        <PipelinePanel pipeline={transactionPipeline} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AgentRanking agents={agentPerformance} />
        <ActivityPanel alerts={alerts} visitKPIs={visitKPIs} clientKPIs={clientKPIs} />
      </div>
    </div>
  );
};

export default DGDashboard;
