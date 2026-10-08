import 'server-only'
import { Resend } from 'resend'

// Centralized, server-side-only email configuration.
// RESEND_API_KEY must NEVER be exposed to the client.
const RESEND_API_KEY = process.env.RESEND_API_KEY

// Sender configuration lives in ONE place so it can be swapped easily
// once a custom domain is verified in Resend.
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  'Financial Readiness Check <onboarding@resend.dev>'

// Advisor notification recipient.
const ADVISOR_EMAIL =
  process.env.ADVISOR_NOTIFICATION_EMAIL || 'financialreadinesscheck@gmail.com'

const ADVISOR_NAME = 'Michael Angelo Somosa'

// Brand colors (consistent with the Financial Readiness Check UI)
const NAVY = '#0A2342'
const GOLD = '#D4AF37'

function escapeHtml(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[c])
  )
}

// Mask an email like f***********k@gmail.com for display on the client UI.
export function maskEmail(email) {
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

function getScoreLabel(score) {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs Attention'
}

function getScoreColor(score) {
  if (score >= 80) return '#059669'
  if (score >= 60) return GOLD
  return '#EF4444'
}

function getScoreInterpretation(score) {
  if (score >= 80)
    return 'You have a strong financial foundation. Keep protecting and growing what you have built.'
  if (score >= 60)
    return 'You are on a good track. A few focused improvements will strengthen your financial resilience.'
  if (score >= 40)
    return 'You have started building, but there are important gaps to address to protect your future.'
  return 'There are key areas that need attention. The right plan can help you build a more secure foundation.'
}

function renderList(items, color) {
  if (!items || items.length === 0) {
    return `<p style="margin:0;color:#6b7280;font-size:14px;">Not applicable.</p>`
  }
  return `<ul style="margin:0;padding-left:0;list-style:none;">${items
    .map(
      (item) =>
        `<li style="margin:0 0 8px 0;padding-left:22px;position:relative;color:#374151;font-size:14px;line-height:1.5;">
          <span style="position:absolute;left:0;top:0;color:${color};font-weight:bold;">•</span>${escapeHtml(
          item
        )}</li>`
    )
    .join('')}</ul>`
}

function renderPriorities(items) {
  if (!items || items.length === 0) {
    return `<p style="margin:0;color:#6b7280;font-size:14px;">Not applicable.</p>`
  }
  return items
    .map(
      (item, i) =>
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;"><tr>
          <td width="28" valign="top">
            <div style="width:24px;height:24px;border-radius:12px;background:${GOLD};color:${NAVY};font-weight:bold;font-size:13px;text-align:center;line-height:24px;">${
          i + 1
        }</div>
          </td>
          <td style="color:#374151;font-size:14px;line-height:1.5;padding-left:8px;">${escapeHtml(
            item
          )}</td>
        </tr></table>`
    )
    .join('')
}

// -------- Client Financial Readiness Report Email --------
function buildClientEmailHtml({ firstName, score, recommendations, bookingUrl }) {
  const label = getScoreLabel(score)
  const color = getScoreColor(score)
  const interpretation = getScoreInterpretation(score)

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:${NAVY};padding:32px 32px 28px 32px;text-align:center;">
          <div style="color:${GOLD};font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Financial Readiness Check</div>
          <h1 style="color:#ffffff;font-size:24px;margin:0;">Your Financial Readiness Report</h1>
        </td></tr>

        <!-- Intro -->
        <tr><td style="padding:28px 32px 8px 32px;">
          <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 14px 0;">Hi ${escapeHtml(
            firstName
          )},</p>
          <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 14px 0;">Thank you for completing the Financial Readiness Check. My name is <strong>${ADVISOR_NAME}</strong>, and I'll be your Financial Advisor on this journey. Below is your personalized readiness report.</p>
        </td></tr>

        <!-- Score -->
        <tr><td style="padding:12px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid ${color};border-radius:12px;">
            <tr><td style="padding:24px;text-align:center;">
              <div style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Your Financial Readiness Score</div>
              <div style="color:${color};font-size:52px;font-weight:bold;line-height:1;">${score}<span style="font-size:20px;color:#9ca3af;">/100</span></div>
              <div style="color:${color};font-size:18px;font-weight:bold;margin-top:6px;">${label}</div>
              <p style="color:#6b7280;font-size:14px;line-height:1.5;margin:12px 0 0 0;">${interpretation}</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Strengths -->
        <tr><td style="padding:16px 32px 4px 32px;">
          <h2 style="color:${NAVY};font-size:16px;margin:0 0 10px 0;">Your Key Strengths</h2>
          ${renderList(recommendations.strengths, '#059669')}
        </td></tr>

        <!-- Improvements -->
        <tr><td style="padding:16px 32px 4px 32px;">
          <h2 style="color:${NAVY};font-size:16px;margin:0 0 10px 0;">Areas for Improvement</h2>
          ${renderList(recommendations.improvements, '#F59E0B')}
        </td></tr>

        <!-- Priorities -->
        <tr><td style="padding:16px 32px 4px 32px;">
          <h2 style="color:${NAVY};font-size:16px;margin:0 0 10px 0;">Your Recommended Priorities</h2>
          ${renderPriorities(recommendations.priorities)}
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:24px 32px 8px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NAVY};border-radius:12px;">
            <tr><td style="padding:28px;text-align:center;">
              <h3 style="color:#ffffff;font-size:18px;margin:0 0 10px 0;">Ready to Take the Next Step?</h3>
              <p style="color:#d1d5db;font-size:14px;line-height:1.5;margin:0 0 20px 0;">Book a <strong style="color:${GOLD};">FREE Financial Needs Analysis</strong> and let's build your personalized roadmap to financial readiness.</p>
              <a href="${escapeHtml(
                bookingUrl
              )}" style="display:inline-block;background:${GOLD};color:${NAVY};font-weight:bold;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:8px;">Book Free Consultation →</a>
              <p style="color:#9ca3af;font-size:12px;margin:16px 0 0 0;">30-minute session • No obligation • 100% Free</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px 32px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#6b7280;font-size:13px;margin:0 0 4px 0;"><strong>${ADVISOR_NAME}</strong> — Financial Advisor</p>
          <p style="color:#9ca3af;font-size:12px;margin:0;">This report is based on the information you provided and is for guidance purposes only.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildClientEmailText({ firstName, score, recommendations, bookingUrl }) {
  const label = getScoreLabel(score)
  const lines = [
    `Hi ${firstName},`,
    '',
    `Thank you for completing the Financial Readiness Check. My name is ${ADVISOR_NAME}, and I'll be your Financial Advisor.`,
    '',
    `Your Financial Readiness Score: ${score}/100 (${label})`,
    getScoreInterpretation(score),
    '',
    'Key Strengths:',
    ...(recommendations.strengths?.length
      ? recommendations.strengths.map((s) => `- ${s}`)
      : ['- Not applicable.']),
    '',
    'Areas for Improvement:',
    ...(recommendations.improvements?.length
      ? recommendations.improvements.map((s) => `- ${s}`)
      : ['- Not applicable.']),
    '',
    'Recommended Priorities:',
    ...(recommendations.priorities?.length
      ? recommendations.priorities.map((s, i) => `${i + 1}. ${s}`)
      : ['- Not applicable.']),
    '',
    `Book your FREE Financial Needs Analysis: ${bookingUrl}`,
    '',
    `${ADVISOR_NAME} — Financial Advisor`,
  ]
  return lines.join('\n')
}

// -------- Advisor New Lead Notification Email --------
function buildAdvisorEmailHtml({
  fullName,
  email,
  mobile,
  preferredContact,
  score,
  buyingIntent,
  recommendations,
  assessmentDate,
  adminLeadUrl,
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:${NAVY};padding:24px 32px;">
          <div style="color:${GOLD};font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">New Lead</div>
          <h1 style="color:#ffffff;font-size:20px;margin:0;">New Financial Readiness Check Lead</h1>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;">
            <tr><td style="padding:6px 0;width:180px;color:#6b7280;">Name</td><td style="padding:6px 0;font-weight:bold;">${escapeHtml(
              fullName
            )}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;">${escapeHtml(
              email
            )}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Mobile</td><td style="padding:6px 0;">${escapeHtml(
              mobile || 'Not provided'
            )}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Preferred Contact</td><td style="padding:6px 0;">${escapeHtml(
              preferredContact || 'Not specified'
            )}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Readiness Score</td><td style="padding:6px 0;font-weight:bold;color:${getScoreColor(
              score
            )};">${score}/100 (${getScoreLabel(score)})</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Buying Intent</td><td style="padding:6px 0;font-weight:bold;">${escapeHtml(
              buyingIntent || 'N/A'
            )}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Assessment Date</td><td style="padding:6px 0;">${escapeHtml(
              assessmentDate
            )}</td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 32px 8px 32px;">
          <h2 style="color:${NAVY};font-size:15px;margin:0 0 8px 0;">Key Strengths</h2>
          ${renderList(recommendations.strengths, '#059669')}
        </td></tr>
        <tr><td style="padding:12px 32px 8px 32px;">
          <h2 style="color:${NAVY};font-size:15px;margin:0 0 8px 0;">Areas for Improvement</h2>
          ${renderList(recommendations.improvements, '#F59E0B')}
        </td></tr>
        <tr><td style="padding:12px 32px 8px 32px;">
          <h2 style="color:${NAVY};font-size:15px;margin:0 0 8px 0;">Recommended Priorities</h2>
          ${renderPriorities(recommendations.priorities)}
        </td></tr>

        ${
          adminLeadUrl
            ? `<tr><td style="padding:20px 32px 28px 32px;text-align:center;">
                <a href="${escapeHtml(
                  adminLeadUrl
                )}" style="display:inline-block;background:${GOLD};color:${NAVY};font-weight:bold;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;">View Lead in Admin →</a>
              </td></tr>`
            : ''
        }
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildAdvisorEmailText(data) {
  return [
    'New Financial Readiness Check Lead',
    '',
    `Name: ${data.fullName}`,
    `Email: ${data.email}`,
    `Mobile: ${data.mobile || 'Not provided'}`,
    `Preferred Contact: ${data.preferredContact || 'Not specified'}`,
    `Readiness Score: ${data.score}/100 (${getScoreLabel(data.score)})`,
    `Buying Intent: ${data.buyingIntent || 'N/A'}`,
    `Assessment Date: ${data.assessmentDate}`,
    '',
    `Key Strengths: ${(data.recommendations.strengths || []).join('; ') || 'N/A'}`,
    `Areas for Improvement: ${
      (data.recommendations.improvements || []).join('; ') || 'N/A'
    }`,
    `Recommended Priorities: ${
      (data.recommendations.priorities || []).join('; ') || 'N/A'
    }`,
    data.adminLeadUrl ? `\nView lead: ${data.adminLeadUrl}` : '',
  ].join('\n')
}

/**
 * Sends the client Financial Readiness Report and the advisor notification.
 * This function NEVER throws — it always resolves to a boolean so that email
 * delivery can never break the assessment flow.
 *
 * @returns {Promise<boolean>} emailSent — true if the client report was sent.
 */
export async function sendAssessmentEmails({
  lead,
  score,
  buyingIntent,
  recommendations,
  bookingUrl,
  adminLeadUrl,
}) {
  // If the API key is missing, skip delivery gracefully (no crash).
  if (!RESEND_API_KEY) {
    console.warn(
      'Financial Readiness email skipped: RESEND_API_KEY is not configured. Assessment flow continues normally.'
    )
    return false
  }

  const recs = recommendations || { strengths: [], improvements: [], priorities: [] }
  const firstName = lead.first_name || 'there'
  const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
  const assessmentDate = new Date().toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  let clientSent = false

  try {
    const resend = new Resend(RESEND_API_KEY)

    // 1) Client report email
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [lead.email],
        subject: 'Your Financial Readiness Report — Michael Angelo Somosa',
        html: buildClientEmailHtml({ firstName, score, recommendations: recs, bookingUrl }),
        text: buildClientEmailText({ firstName, score, recommendations: recs, bookingUrl }),
      })
      if (error) {
        console.error('Financial Readiness client email failed', {
          leadId: lead.id,
          error: error?.message || 'unknown',
        })
      } else {
        clientSent = true
      }
    } catch (err) {
      console.error('Financial Readiness client email exception', {
        leadId: lead.id,
        error: err?.message,
      })
    }

    // 2) Advisor notification email (does not affect emailSent for the client)
    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [ADVISOR_EMAIL],
        subject: `New Financial Readiness Check Lead — ${fullName || lead.email}`,
        html: buildAdvisorEmailHtml({
          fullName,
          email: lead.email,
          mobile: lead.mobile,
          preferredContact: lead.preferred_contact,
          score,
          buyingIntent,
          recommendations: recs,
          assessmentDate,
          adminLeadUrl,
        }),
        text: buildAdvisorEmailText({
          fullName,
          email: lead.email,
          mobile: lead.mobile,
          preferredContact: lead.preferred_contact,
          score,
          buyingIntent,
          recommendations: recs,
          assessmentDate,
          adminLeadUrl,
        }),
      })
      if (error) {
        console.error('Financial Readiness advisor email failed', {
          leadId: lead.id,
          error: error?.message || 'unknown',
        })
      }
    } catch (err) {
      console.error('Financial Readiness advisor email exception', {
        leadId: lead.id,
        error: err?.message,
      })
    }
  } catch (err) {
    // Resend client construction or unexpected failure — never break the flow.
    console.error('Financial Readiness email delivery failed', {
      leadId: lead.id,
      error: err?.message,
    })
    return false
  }

  return clientSent
}
