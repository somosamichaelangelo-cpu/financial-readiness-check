import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateFinancialReadinessScore, calculateBuyingIntent, generateRecommendations } from '@/lib/scoring'
import { sendAssessmentEmails } from '@/lib/email'

export const runtime = 'nodejs'

// Handle POST requests
export async function POST(request) {
  const pathname = request.nextUrl.pathname
  
  // Submit Assessment
  if (pathname === '/api/submit-assessment') {
    try {
      const { leadInfo, assessmentData } = await request.json()
      const supabase = await createClient()

      // Calculate scores
      const readinessScore = calculateFinancialReadinessScore(assessmentData)
      const buyingIntent = calculateBuyingIntent(readinessScore, assessmentData)

      // Insert lead
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert({
          first_name: leadInfo.first_name,
          last_name: leadInfo.last_name,
          email: leadInfo.email,
          mobile: leadInfo.mobile,
          preferred_contact: leadInfo.preferred_contact,
          consent: leadInfo.consent,
          readiness_score: readinessScore,
          buying_intent: buyingIntent,
          status: 'new',
          source: 'assessment',
        })
        .select()
        .single()

      if (leadError) {
        console.error('Lead insert error:', leadError)
        return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
      }

      // Insert assessment response
      const { error: assessmentError } = await supabase
        .from('assessment_responses')
        .insert({
          lead_id: lead.id,
          ...assessmentData,
          age: parseInt(assessmentData.age) || null,
          num_children: parseInt(assessmentData.num_children) || 0,
          dependents: parseInt(assessmentData.dependents) || 0,
          monthly_income: parseFloat(assessmentData.monthly_income) || 0,
          additional_income: parseFloat(assessmentData.additional_income) || 0,
          monthly_expenses: parseFloat(assessmentData.monthly_expenses) || 0,
          housing_cost: parseFloat(assessmentData.housing_cost) || 0,
          emergency_fund: parseFloat(assessmentData.emergency_fund) || 0,
          savings: parseFloat(assessmentData.savings) || 0,
          life_insurance_coverage: parseFloat(assessmentData.life_insurance_coverage) || 0,
          home_loan: parseFloat(assessmentData.home_loan) || 0,
          car_loan: parseFloat(assessmentData.car_loan) || 0,
          personal_loan: parseFloat(assessmentData.personal_loan) || 0,
          credit_card_debt: parseFloat(assessmentData.credit_card_debt) || 0,
          other_debt: parseFloat(assessmentData.other_debt) || 0,
          readiness_score: readinessScore,
          completed: true,
        })

      if (assessmentError) {
        console.error('Assessment insert error:', assessmentError)
        return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 })
      }

      // -------- Email delivery (must NEVER break the assessment flow) --------
      let emailSent = false
      try {
        // Build a numeric assessment object for recommendation generation,
        // mirroring the same parsing used for the DB insert above.
        const parsedAssessment = {
          ...assessmentData,
          monthly_income: parseFloat(assessmentData.monthly_income) || 0,
          additional_income: parseFloat(assessmentData.additional_income) || 0,
          monthly_expenses: parseFloat(assessmentData.monthly_expenses) || 0,
          emergency_fund: parseFloat(assessmentData.emergency_fund) || 0,
          savings: parseFloat(assessmentData.savings) || 0,
          life_insurance_coverage: parseFloat(assessmentData.life_insurance_coverage) || 0,
          home_loan: parseFloat(assessmentData.home_loan) || 0,
          car_loan: parseFloat(assessmentData.car_loan) || 0,
          personal_loan: parseFloat(assessmentData.personal_loan) || 0,
          credit_card_debt: parseFloat(assessmentData.credit_card_debt) || 0,
          other_debt: parseFloat(assessmentData.other_debt) || 0,
        }

        const recommendations = generateRecommendations(readinessScore, parsedAssessment)

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
        // Client report CTA points to the public Google Calendar booking page
        // (same destination as the in-app "Book Free Consultation" button).
        const bookingUrl = 'https://calendar.app.google/XGDtjDgS7bago5Uo6'
        const adminLeadUrl = baseUrl ? `${baseUrl}/admin/leads/${lead.id}` : ''

        emailSent = await sendAssessmentEmails({
          lead,
          score: readinessScore,
          buyingIntent,
          recommendations,
          bookingUrl,
          adminLeadUrl,
        })
      } catch (emailError) {
        // Log server-side only; do not surface to client or fail the request.
        console.error('Financial Readiness email failed', {
          leadId: lead.id,
          error: emailError?.message,
        })
        emailSent = false
      }

      return NextResponse.json({ leadId: lead.id, readinessScore, emailSent })
    } catch (error) {
      console.error('Submit assessment error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // Book Appointment
  if (pathname === '/api/book-appointment') {
    try {
      const { leadId, preferredDate, preferredTime, preferredContactMethod } = await request.json()
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          lead_id: leadId,
          preferred_date: preferredDate,
          preferred_time: preferredTime,
          preferred_contact_method: preferredContactMethod,
          status: 'requested',
        })
        .select()
        .single()

      if (error) {
        console.error('Appointment insert error:', error)
        return NextResponse.json({ error: 'Failed to book appointment' }, { status: 500 })
      }

      return NextResponse.json({ success: true, appointmentId: data.id })
    } catch (error) {
      console.error('Book appointment error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // Admin Login
  if (pathname === '/api/admin/login') {
    try {
      const { email, password } = await request.json()
      const supabase = await createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }

      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', data.user.id)
        .eq('active', true)
        .single()

      if (adminError || !adminData) {
        await supabase.auth.signOut()
        return NextResponse.json({ error: 'Not authorized as admin' }, { status: 403 })
      }

      return NextResponse.json({ success: true, user: data.user })
    } catch (error) {
      console.error('Login error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // Admin Logout
  if (pathname === '/api/admin/logout') {
    try {
      const supabase = await createClient()
      await supabase.auth.signOut()
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Logout error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // Add Note
  if (pathname === '/api/admin/notes') {
    try {
      const { leadId, content } = await request.json()
      const supabase = await createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data, error } = await supabase
        .from('notes')
        .insert({
          lead_id: leadId,
          content,
          author_user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: 'Failed to add note' }, { status: 500 })
      }

      return NextResponse.json({ success: true, note: data })
    } catch (error) {
      console.error('Add note error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

// Handle GET requests
export async function GET(request) {
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams

  // Get Results
  if (pathname === '/api/results') {
    try {
      const leadId = searchParams.get('leadId')
      if (!leadId) {
        return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
      }

      const supabase = await createClient()

      // Get lead
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (leadError || !lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      }

      // Get assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('lead_id', leadId)
        .single()

      if (assessmentError || !assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
      }

      // Generate recommendations
      const recommendations = generateRecommendations(assessment.readiness_score, assessment)

      return NextResponse.json({
        lead,
        assessment,
        recommendations,
      })
    } catch (error) {
      console.error('Get results error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // Admin: Get All Leads
  if (pathname === '/api/admin/leads') {
    try {
      const supabase = await createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
      }

      return NextResponse.json({ leads })
    } catch (error) {
      console.error('Get leads error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // Admin: Get Lead Details
  if (pathname === '/api/admin/lead') {
    try {
      const leadId = searchParams.get('id')
      if (!leadId) {
        return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
      }

      const supabase = await createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Get lead
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (leadError) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      }

      // Get assessment
      const { data: assessment } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('lead_id', leadId)
        .single()

      // Get appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      // Get notes
      const { data: notes } = await supabase
        .from('notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      return NextResponse.json({
        lead,
        assessment,
        appointments: appointments || [],
        notes: notes || [],
      })
    } catch (error) {
      console.error('Get lead details error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // Admin: Dashboard Stats
  if (pathname === '/api/admin/stats') {
    try {
      const supabase = await createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Get total leads
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })

      // Get new leads (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const { count: newLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())

      // Get total appointments
      const { count: totalAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })

      // Get average readiness score
      const { data: scoresData } = await supabase
        .from('leads')
        .select('readiness_score')
        .not('readiness_score', 'is', null)

      const avgScore = scoresData && scoresData.length > 0
        ? Math.round(scoresData.reduce((sum, item) => sum + (item.readiness_score || 0), 0) / scoresData.length)
        : 0

      return NextResponse.json({
        totalLeads: totalLeads || 0,
        newLeads: newLeads || 0,
        totalAppointments: totalAppointments || 0,
        avgReadinessScore: avgScore,
      })
    } catch (error) {
      console.error('Get stats error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

// Handle PUT requests
export async function PUT(request) {
  const pathname = request.nextUrl.pathname

  // Update Lead Status
  if (pathname === '/api/admin/lead/status') {
    try {
      const { leadId, status } = await request.json()
      const supabase = await createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data, error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', leadId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
      }

      return NextResponse.json({ success: true, lead: data })
    } catch (error) {
      console.error('Update lead status error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
