import { Button } from "../../../components/ui/button";
import Health from "../../Components/Dashboard/Health";
import StatCard from "../../Components/Dashboard/StatCard";
import RecentCases from "../../Components/Dashboard/RecentCases";
import NeedsReview from "../../Components/Dashboard/NeedsReview";
import DashboardLayout from "../../Components/Layout/DashboardLayout";

import {
  PlusCircle,
  Zap,
  Database,
  FileText,
  ShieldCheck,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                Dashboard
              </h1>
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                MY RESEARCH TEAM
              </span>
            </div>
            <p className="text-slate-600 mt-2">
              Welcome back. AI engines are currently processing 3 priority
              cases.
            </p>
          </div>

          <Button className="px-6 py-6 text-lg bg-slate-900 hover:bg-slate-800 rounded-2xl">
            <PlusCircle size={24} />
            New Case
          </Button>
        </div>

        {/* Workspace Health */}
        <div className="mb-6">
          <Health />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Zap} value="24" label="Active Cases" />
          <StatCard icon={Database} value="1.2k" label="Sources Ingested" />
          <StatCard icon={FileText} value="142" label="Reports Published" />
          <StatCard icon={ShieldCheck} value="94%" label="Citation Cov." />
        </div>

        {/* Recent Cases & Needs Review */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Cases - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentCases />
          </div>

          {/* Needs Review - Takes 1 column */}
          <div>
            <NeedsReview />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
