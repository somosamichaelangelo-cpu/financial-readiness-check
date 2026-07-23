'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, Users, Loader2, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AdminLeadsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState([])
  const [filteredLeads, setFilteredLeads] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('/api/admin/leads')
        if (!response.ok) {
          router.push('/admin/login')
          return
        }
        const data = await response.json()
        setLeads(data.leads)
        setFilteredLeads(data.leads)
      } catch (error) {
        console.error('Fetch error:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [router])

  useEffect(() => {
    let filtered = leads

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (lead) =>
          lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.mobile?.includes(searchTerm)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.status === statusFilter)
    }

    setFilteredLeads(filtered)
  }, [searchTerm, statusFilter, leads])

  const getScoreColor = (score) => {
    if (score >= 80) return '#059669'
    if (score >= 60) return '#D4AF37'
    return '#EF4444'
  }

  const getBuyingIntentColor = (intent) => {
    if (intent === 'Very High') return '#DC2626'
    if (intent === 'High') return '#F59E0B'
    if (intent === 'Medium') return '#D4AF37'
    return '#6B7280'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#D4AF37' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: '#0A2342' }}>
            Lead Management
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                All Leads ({filteredLeads.length})
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No leads found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Table Header - Hidden on mobile */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-2 bg-slate-50 rounded-lg font-semibold text-sm text-gray-600">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-3">Contact</div>
                  <div className="col-span-2">Score</div>
                  <div className="col-span-2">Intent</div>
                  <div className="col-span-2">Date</div>
                </div>

                {/* Table Rows */}
                {filteredLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/admin/leads/${lead.id}`}
                    className="block p-4 bg-white border rounded-lg hover:shadow-md transition"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4">
                      <div className="md:col-span-3">
                        <p className="font-semibold" style={{ color: '#0A2342' }}>
                          {lead.first_name} {lead.last_name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {lead.status || 'new'}
                        </p>
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-sm">{lead.email}</p>
                        <p className="text-xs text-gray-500">{lead.mobile}</p>
                      </div>
                      <div className="md:col-span-2">
                        {lead.readiness_score ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="text-2xl font-bold"
                              style={{ color: getScoreColor(lead.readiness_score) }}
                            >
                              {lead.readiness_score}
                            </span>
                            <span className="text-xs text-gray-500">/100</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        {lead.buying_intent ? (
                          <span
                            className="text-sm font-semibold"
                            style={{ color: getBuyingIntentColor(lead.buying_intent) }}
                          >
                            {lead.buying_intent}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </div>
                      <div className="md:col-span-2 text-xs text-gray-500">
                        {new Date(lead.created_at).toLocaleString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
