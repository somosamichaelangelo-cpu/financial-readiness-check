'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, TrendingUp, Users, Heart, Award, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#0A2342] rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight" style={{ color: '#0A2342' }}>Financial Readiness Check™</h1>
              <p className="text-xs text-gray-500 font-light">by Michael Angelo Somosa</p>
            </div>
          </div>
          <Link href="/admin/login">
            <Button variant="ghost" size="sm">Admin</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-block mb-4 px-4 py-2 bg-emerald-50 rounded-full">
            <span className="text-sm font-semibold" style={{ color: '#059669' }}>FREE 60-Second Assessment</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: '#0A2342' }}>
            Will Your Family Be
            <br />
            <span style={{ color: '#D4AF37' }}>Financially READY?</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Take our FREE Financial Readiness Check™ and discover how prepared you are for life's unexpected events.
          </p>
          <Link href="/assessment">
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: '#D4AF37', color: '#0A2342' }}
            >
              Start Free Assessment
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">No credit card required • Takes 60 seconds • Instant results</p>
        </motion.div>
      </section>

      {/* Why Financial Planning Matters */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12" style={{ color: '#0A2342' }}>
            Why Financial Planning Matters
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-[#D4AF37] transition-colors">
              <CardHeader>
                <Shield className="w-12 h-12 mb-4" style={{ color: '#D4AF37' }} />
                <CardTitle>Protect Your Loved Ones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ensure your family's financial security even when life takes unexpected turns.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-[#D4AF37] transition-colors">
              <CardHeader>
                <TrendingUp className="w-12 h-12 mb-4" style={{ color: '#059669' }} />
                <CardTitle>Build Wealth Systematically</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create a roadmap for achieving your financial goals through proper planning.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-[#D4AF37] transition-colors">
              <CardHeader>
                <Heart className="w-12 h-12 mb-4" style={{ color: '#EF4444' }} />
                <CardTitle>Peace of Mind</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sleep better knowing you have a solid financial foundation for your family.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What You'll Discover */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12" style={{ color: '#0A2342' }}>
              What You'll Discover
            </h3>
            <div className="space-y-4">
              {[
                'Your Financial Readiness Score (0-100)',
                'Strengths in your current financial situation',
                'Critical gaps in your protection',
                'Personalized recommendations for improvement',
                'Clear next steps toward financial security',
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm"
                >
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color: '#059669' }} />
                  <span className="text-lg">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gradient-to-r from-[#0A2342] to-[#1a3a5c] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Award className="w-16 h-16 mx-auto mb-6" style={{ color: '#D4AF37' }} />
            <h3 className="text-3xl font-bold mb-4">About Michael Angelo Somosa</h3>
            <p className="text-lg leading-relaxed mb-6 text-gray-200">
              Licensed Financial Advisor at Sun Life Financial, helping Filipino families become financially prepared through education, planning, and personalized financial guidance.
            </p>
            <p className="text-sm text-gray-300">
              "My mission is to help Filipino families achieve financial readiness and peace of mind."
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4" style={{ color: '#0A2342' }}>
              Ready to Check Your Financial Readiness?
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Join hundreds of Filipino families who have taken control of their financial future.
            </p>
            <Link href="/assessment">
              <Button
                size="lg"
                className="text-lg px-8 py-6 shadow-lg"
                style={{ backgroundColor: '#D4AF37', color: '#0A2342' }}
              >
                Take the Free Assessment Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12" style={{ color: '#0A2342' }}>
            Frequently Asked Questions
          </h3>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'How long does the assessment take?',
                a: 'The assessment takes approximately 60 seconds to complete.'
              },
              {
                q: 'Is this really free?',
                a: 'Yes, the Financial Readiness Check™ is completely free with no hidden costs or credit card required.'
              },
              {
                q: 'What happens after I complete the assessment?',
                a: 'You\'ll receive an instant personalized report with your Financial Readiness Score and recommendations. You can optionally book a free consultation to discuss your results.'
              },
              {
                q: 'Is my information secure?',
                a: 'Absolutely. Your information is securely stored and will never be shared with third parties.'
              },
            ].map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8" style={{ backgroundColor: '#0A2342' }}>
        <div className="container mx-auto px-4 text-center text-white">
          <p className="text-sm">
            © {new Date().getFullYear()} Financial Readiness Check™. All rights reserved.
          </p>
          <p className="text-xs mt-2 text-gray-400">
            by Michael Angelo Somosa • Licensed Financial Advisor • Sun Life Financial
          </p>
        </div>
      </footer>
    </div>
  )
}
