'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Calendar, TrendingUp, Award, Loader2, LogOut, Menu } from 'lucide-react'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [leads, setLeads] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsRes = await fetch('/api/admin/stats')
        if (!statsRes.ok) {
          router.push('/admin/login')
          return
        }
        const statsData = await statsRes.json()
        setStats(statsData)

        // Fetch recent leads
        const leadsRes = await fetch('/api/admin/leads')
        if (!leadsRes.ok) {
          router.push('/admin/login')
          return
        }
        const leadsData = await leadsRes.json()
        setLeads(leadsData.leads.slice(0, 5))
      } catch (error) {
        console.error('Fetch error:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#D4AF37' }} />
      </div>
    )
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#059669'
    if (score >= 60) return '#D4AF37'
    return '#EF4444'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#0A2342] rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight" style={{ color: '#0A2342' }}>Financial Readiness Check™</h1>
              <p className="text-xs text-gray-500 font-light">Admin Dashboard</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Leads
              </CardTitle>
              <Users className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#0A2342' }}>
                {stats?.totalLeads || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                New Leads (7d)
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {stats?.newLeads || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Appointments
              </CardTitle>
              <Calendar className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#D4AF37' }}>
                {stats?.totalAppointments || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg. Score
              </CardTitle>
              <Award className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: getScoreColor(stats?.avgReadinessScore || 0) }}>
                {stats?.avgReadinessScore || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Leads</CardTitle>
            <Link href="/admin/leads">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No leads yet</p>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/admin/leads/${lead.id}`}
                    className="block p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold" style={{ color: '#0A2342' }}>
                          {lead.first_name} {lead.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{lead.email}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {lead.readiness_score && (
                          <div
                            className="text-2xl font-bold"
                            style={{ color: getScoreColor(lead.readiness_score) }}
                          >
                            {lead.readiness_score}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 capitalize">
                          {lead.status || 'new'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/leads">
            <Card className="hover:shadow-lg transition cursor-pointer">
              <CardContent className="pt-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#D4AF37' }} />
                <h3 className="font-semibold mb-1">Manage Leads</h3>
                <p className="text-sm text-gray-600">View and manage all leads</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/">
            <Card className="hover:shadow-lg transition cursor-pointer">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-3" style={{ color: '#059669' }} />
                <h3 className="font-semibold mb-1">View Website</h3>
                <p className="text-sm text-gray-600">Preview the public site</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition cursor-pointer opacity-50">
            <CardContent className="pt-6 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <h3 className="font-semibold mb-1">Analytics</h3>
              <p className="text-sm text-gray-600">Coming soon</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
