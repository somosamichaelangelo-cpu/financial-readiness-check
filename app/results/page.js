'use client'

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertTriangle, TrendingUp, Calendar, ArrowRight, Loader2 } from 'lucide-react'

// Public Google Calendar appointment booking page.
// Centralized here so it can be updated in one place if the link ever changes.
const BOOKING_URL = 'https://calendar.app.google/XGDtjDgS7bago5Uo6'

function maskEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) return ''
  const [local, domain] = email.split('@')
  if (local.length <= 2) {
    return `${local[0] || ''}***@${domain}`
  }
  const first = local[0]
  const last = local[local.length - 1]
  const stars = '*'.repeat(Math.max(3, local.length - 2))
  return `${first}${stars}${last}@${domain}`
}

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState(null)
  const emailSent = searchParams.get('emailSent') === 'true'

  useEffect(() => {
    const leadId = searchParams.get('leadId')
    if (!leadId) {
      router.push('/assessment')
      return
    }

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/results?leadId=${leadId}`)
        const data = await response.json()
        if (response.ok) {
          setResults(data)
        } else {
          alert('Failed to load results')
          router.push('/assessment')
        }
      } catch (error) {
        console.error('Error fetching results:', error)
        router.push('/assessment')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#D4AF37' }} />
      </div>
    )
  }

  if (!results) {
    return null
  }

  const { lead, assessment, recommendations } = results
  const score = assessment.readiness_score || 0

  const getScoreColor = (score) => {
    if (score >= 80) return '#059669' // Emerald
    if (score >= 60) return '#D4AF37' // Gold
    return '#EF4444' // Red
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Attention'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0A2342' }}>
            Your Financial Readiness Report
          </h1>
          <p className="text-gray-600">Hello {lead.first_name}, here's your personalized assessment</p>
        </div>

        {/* Score Card */}
        <Card className="mb-8 border-2" style={{ borderColor: getScoreColor(score) }}>
          <CardHeader className="text-center">
            <CardTitle className="text-lg text-gray-600 mb-4">Your Financial Readiness Score</CardTitle>
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke={getScoreColor(score)}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(score / 100) * 439.8} 439.8`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold" style={{ color: getScoreColor(score) }}>
                    {score}
                  </div>
                  <div className="text-sm text-gray-600">out of 100</div>
                </div>
              </div>
              <div className="text-xl font-semibold" style={{ color: getScoreColor(score) }}>
                {getScoreLabel(score)}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Strengths */}
        {recommendations.strengths && recommendations.strengths.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" style={{ color: '#059669' }} />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendations.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#059669' }} />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Areas for Improvement */}
        {recommendations.improvements && recommendations.improvements.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" style={{ color: '#F59E0B' }} />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendations.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#F59E0B' }} />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Priority Recommendations */}
        {recommendations.priorities && recommendations.priorities.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" style={{ color: '#D4AF37' }} />
                Recommended Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recommendations.priorities.map((priority, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D4AF37', color: '#0A2342' }}>
                      {index + 1}
                    </div>
                    <span>{priority}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* CTA - Book Appointment */}
        <Card className="bg-gradient-to-r from-[#0A2342] to-[#1a3a5c] text-white">
          <CardContent className="p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: '#D4AF37' }} />
            <h3 className="text-2xl font-bold mb-4">Ready to Take Action?</h3>
            <p className="text-lg mb-6 text-gray-200">
              Book a FREE Financial Needs Analysis to discuss your personalized roadmap to financial readiness.
            </p>
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="text-lg px-8 py-6"
                style={{ backgroundColor: '#D4AF37', color: '#0A2342' }}
              >
                Book Free Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <p className="text-sm mt-4 text-gray-300">30-minute session • No obligation • 100% Free</p>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-8 text-sm">
          {emailSent ? (
            <p className="text-emerald-600 font-medium">
              ✓ Your Financial Readiness Report has been sent to {maskEmail(lead.email)}.
            </p>
          ) : (
            <p className="text-gray-500">
              Your report is ready below. We couldn&apos;t send the email right now, but you can still view your results.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#D4AF37' }} />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
