'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Calendar, FileText, Loader2, Send, MessageCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function LeadDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.id

  const [loading, setLoading] = useState(true)
  const [lead, setLead] = useState(null)
  const [assessment, setAssessment] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)

  useEffect(() => {
    const fetchLeadDetails = async () => {
      try {
        const response = await fetch(`/api/admin/lead?id=${leadId}`)
        if (!response.ok) {
          router.push('/admin/login')
          return
        }
        const data = await response.json()
        setLead(data.lead)
        setAssessment(data.assessment)
        setAppointments(data.appointments || [])
        setNotes(data.notes || [])
      } catch (error) {
        console.error('Fetch error:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    if (leadId) {
      fetchLeadDetails()
    }
  }, [leadId, router])

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch('/api/admin/lead/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: newStatus }),
      })

      if (response.ok) {
        setLead((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (error) {
      console.error('Update status error:', error)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setAddingNote(true)
    try {
      const response = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, content: newNote }),
      })

      if (response.ok) {
        const result = await response.json()
        setNotes([result.note, ...notes])
        setNewNote('')
      }
    } catch (error) {
      console.error('Add note error:', error)
    } finally {
      setAddingNote(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#059669'
    if (score >= 60) return '#D4AF37'
    return '#EF4444'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#D4AF37' }} />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Lead not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/admin/leads"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#0A2342' }}>
                {lead.first_name} {lead.last_name}
              </h1>
              <p className="text-sm text-gray-600">
                Submitted {new Date(lead.created_at).toLocaleDateString()}
              </p>
            </div>
            <Select value={lead.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="not_interested">Not Interested</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a href={`mailto:${lead.email}`} className="font-medium text-blue-600 hover:underline">
                      {lead.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Mobile</p>
                    <a href={`tel:${lead.mobile}`} className="font-medium">
                      {lead.mobile}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Preferred Contact</p>
                    <p className="font-medium capitalize">{lead.preferred_contact || 'Not specified'}</p>
                  </div>
                </div>
                {/* Messenger Link - Show if preferred contact is messenger */}
                {lead.messenger_link && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <MessageCircle className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">Facebook/Messenger</p>
                      <a
                        href={lead.messenger_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Send Message on Messenger
                      </a>
                      <p className="text-xs text-gray-500 mt-2 break-all">
                        {lead.messenger_link}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assessment Summary */}
            {assessment && (
              <Card>
                <CardHeader>
                  <CardTitle>Financial Assessment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-semibold">{assessment.age || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Occupation</p>
                      <p className="font-semibold">{assessment.occupation || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Marital Status</p>
                      <p className="font-semibold capitalize">{assessment.marital_status || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Children</p>
                      <p className="font-semibold">{assessment.num_children || 0}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Financial Overview</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Monthly Income</p>
                        <p className="font-semibold">₱{assessment.monthly_income?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Monthly Expenses</p>
                        <p className="font-semibold">₱{assessment.monthly_expenses?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Emergency Fund</p>
                        <p className="font-semibold">₱{assessment.emergency_fund?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Savings</p>
                        <p className="font-semibold">₱{assessment.savings?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Insurance Coverage</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        {assessment.has_life_insurance ? '✅' : '❌'} Life Insurance
                      </div>
                      <div className="flex items-center gap-2">
                        {assessment.has_health_insurance ? '✅' : '❌'} Health Insurance
                      </div>
                      <div className="flex items-center gap-2">
                        {assessment.has_critical_illness ? '✅' : '❌'} Critical Illness
                      </div>
                      <div className="flex items-center gap-2">
                        {assessment.has_hmo ? '✅' : '❌'} HMO
                      </div>
                    </div>
                  </div>

                  {assessment.goals && assessment.goals.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Financial Goals</h4>
                      <div className="flex flex-wrap gap-2">
                        {assessment.goals.map((goal, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-slate-100 rounded-full text-sm"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note about this lead..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={addingNote || !newNote.trim()}
                    size="sm"
                    style={{ backgroundColor: '#D4AF37', color: '#0A2342' }}
                  >
                    {addingNote ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Add Note
                  </Button>
                </div>

                {notes.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No notes yet</p>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(note.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Readiness Score */}
            {lead.readiness_score && (
              <Card>
                <CardHeader>
                  <CardTitle>Readiness Score</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div
                    className="text-6xl font-bold mb-2"
                    style={{ color: getScoreColor(lead.readiness_score) }}
                  >
                    {lead.readiness_score}
                  </div>
                  <p className="text-sm text-gray-600">out of 100</p>
                  {lead.buying_intent && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-1">Buying Intent</p>
                      <p className="font-semibold" style={{ color: getScoreColor(lead.readiness_score) }}>
                        {lead.buying_intent}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No appointments</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold capitalize">
                            {appointment.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(appointment.preferred_date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Time: {appointment.preferred_time}</p>
                        <p className="text-sm text-gray-600">Via: {appointment.preferred_contact_method}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
