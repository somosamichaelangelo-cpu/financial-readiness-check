'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { CheckCircle2, Home, Calendar } from 'lucide-react'

export default function AppointmentConfirmedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" style={{ color: '#059669' }} />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#0A2342' }}>
            Appointment Requested!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for booking your FREE Financial Needs Analysis. We'll contact you shortly to confirm the exact time.
          </p>
          <div className="bg-slate-50 p-6 rounded-lg mb-8 text-left">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: '#D4AF37' }} />
              What Happens Next?
            </h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. We'll reach out within 24 hours</li>
              <li>2. Confirm the appointment time</li>
              <li>3. Send you any preparation materials</li>
              <li>4. Meet for your consultation</li>
            </ol>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
