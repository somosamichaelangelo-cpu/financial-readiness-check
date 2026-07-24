'use client'

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

function LeadCaptureContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [assessmentData, setAssessmentData] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    messenger_link: '',
    preferred_contact: 'email',
    consent: false,
  })

  useEffect(() => {
    const data = searchParams.get('data')
    if (data) {
      try {
        setAssessmentData(JSON.parse(decodeURIComponent(data)))
      } catch (error) {
        console.error('Failed to parse assessment data:', error)
        router.push('/assessment')
      }
    } else {
      router.push('/assessment')
    }
  }, [searchParams, router])

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.consent) {
      alert('Please agree to the privacy policy to continue')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/submit-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadInfo: formData,
          assessmentData: assessmentData,
        }),
      })

      const result = await response.json()
      if (response.ok) {
        router.push(`/results?leadId=${result.leadId}`)
      } else {
        alert(result.error || 'Failed to submit assessment')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit assessment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!assessmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link href="/assessment" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assessment
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" style={{ color: '#0A2342' }}>
              Almost Done! ✨
            </CardTitle>
            <CardDescription className="text-base">
              Please provide your contact information to receive your personalized Financial Readiness Report.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => updateField('first_name', e.target.value)}
                    required
                    placeholder="Juan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => updateField('last_name', e.target.value)}
                    required
                    placeholder="Dela Cruz"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                  placeholder="juan.delacruz@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => updateField('mobile', e.target.value)}
                  required
                  placeholder="09171234567"
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Contact Method</Label>
                <RadioGroup
                  value={formData.preferred_contact}
                  onValueChange={(value) => updateField('preferred_contact', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="contact_email" />
                    <Label htmlFor="contact_email">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile" id="contact_mobile" />
                    <Label htmlFor="contact_mobile">Mobile</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="messenger" id="contact_messenger" />
                    <Label htmlFor="contact_messenger">Facebook Messenger</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Conditional Messenger Link Field */}
              {formData.preferred_contact === 'messenger' && (
                <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <Label htmlFor="messenger_link">Facebook/Messenger Link *</Label>
                  <Input
                    id="messenger_link"
                    type="url"
                    value={formData.messenger_link || ''}
                    onChange={(e) => updateField('messenger_link', e.target.value)}
                    required={formData.preferred_contact === 'messenger'}
                    placeholder="https://m.me/yourname or https://facebook.com/yourname"
                  />
                  <p className="text-xs text-gray-600">
                    💡 Tip: Go to your Facebook profile → Click "..." → "Copy link" and paste it here
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => updateField('consent', checked)}
                    required
                  />
                  <Label htmlFor="consent" className="text-sm leading-relaxed">
                    I consent to receiving my Financial Readiness Report and occasional follow-up communication about financial planning. Your information is secure and will never be shared with third parties. *
                  </Label>
                </div>
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
                    Processing...
                  </>
                ) : (
                  'Get My Results'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LeadCapturePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#D4AF37' }} />
      </div>
    }>
      <LeadCaptureContent />
    </Suspense>
  )
}
