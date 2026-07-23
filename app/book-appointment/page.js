'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, CheckCircle, Loader2 } from 'lucide-react'

export default function BookAppointmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [leadId, setLeadId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    preferredDate: '',
    preferredTime: 'morning',
    preferredContactMethod: 'mobile',
  })

  useEffect(() => {
    const id = searchParams.get('leadId')
    if (!id) {
      router.push('/assessment')
    } else {
      setLeadId(id)
    }
  }, [searchParams, router])

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          ...formData,
        }),
      })

      const result = await response.json()
      if (response.ok) {
        router.push('/appointment-confirmed')
      } else {
        alert(result.error || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to book appointment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!leadId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <Calendar className="w-16 h-16" style={{ color: '#D4AF37' }} />
            </div>
            <CardTitle className="text-2xl text-center" style={{ color: '#0A2342' }}>
              Book Your Free Financial Needs Analysis
            </CardTitle>
            <p className="text-center text-gray-600">
              Let's discuss your personalized roadmap to financial readiness
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Preferred Date *</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  min={minDate}
                  value={formData.preferredDate}
                  onChange={(e) => updateField('preferredDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Time *</Label>
                <RadioGroup
                  value={formData.preferredTime}
                  onValueChange={(value) => updateField('preferredTime', value)}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 transition">
                    <RadioGroupItem value="morning" id="time_morning" />
                    <Label htmlFor="time_morning" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Morning (9:00 AM - 12:00 PM)</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 transition">
                    <RadioGroupItem value="afternoon" id="time_afternoon" />
                    <Label htmlFor="time_afternoon" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Afternoon (1:00 PM - 5:00 PM)</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 transition">
                    <RadioGroupItem value="evening" id="time_evening" />
                    <Label htmlFor="time_evening" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Evening (6:00 PM - 8:00 PM)</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Preferred Contact Method *</Label>
                <RadioGroup
                  value={formData.preferredContactMethod}
                  onValueChange={(value) => updateField('preferredContactMethod', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile" id="method_mobile" />
                    <Label htmlFor="method_mobile">Mobile Call</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="messenger" id="method_messenger" />
                    <Label htmlFor="method_messenger">Facebook Messenger</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="zoom" id="method_zoom" />
                    <Label htmlFor="method_zoom">Zoom Video Call</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in-person" id="method_person" />
                    <Label htmlFor="method_person">In-Person Meeting</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What to Expect:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 30-minute consultation</li>
                  <li>• Review your Financial Readiness Report</li>
                  <li>• Discuss personalized recommendations</li>
                  <li>• Answer your questions</li>
                  <li>• No obligation or pressure to buy</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full text-lg py-6"
                style={{ backgroundColor: '#D4AF37', color: '#0A2342' }}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    Confirm Appointment
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-gray-500">
                We'll contact you to confirm the exact time.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
