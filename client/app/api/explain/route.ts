import { NextRequest, NextResponse } from 'next/server'

/**
 * Server-side explanation route for REJECTED applications only.
 *
 * Calls OpenAI Chat Completions to produce a short, plain-English reason the
 * application was likely rejected, plus 1-2 actionable suggestions. The result
 * page renders this only when the verdict is Rejected.
 *
 * Security:
 *   - OPENAI_API_KEY is read from the environment (client/.env.local), which is
 *     git-ignored, so it never ships to GitHub and never reaches the browser.
 *   - The route is server-only (Next.js route handlers run on the server).
 *
 * Fairness:
 *   - Protected attributes (Gender, Ethnicity) are intentionally NOT sent to
 *     the model, and the rule-based fallback ignores them too.
 */

type Applicant = Record<string, string | number>

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

/** Fields deliberately withheld from the explainer (protected attributes). */
const PROTECTED_FIELDS = new Set(['Gender', 'Ethnicity'])

function buildPrompt(applicant: Applicant, probabilityPct: number): string {
  const safe: string[] = []
  for (const [k, v] of Object.entries(applicant)) {
    if (PROTECTED_FIELDS.has(k)) continue
    safe.push(`- ${k}: ${v}`)
  }
  const profile = safe.join('\n')
  return `You are a credit-assessment explainer for an educational credit-card approval predictor. A credit card application was REJECTED with an approval probability of ${probabilityPct}%.

Applicant profile (non-protected fields only):
${profile}

Explain in plain, friendly English why this application was likely rejected, based ONLY on the financial/employment factors shown. Then give 1-2 short, concrete, actionable suggestions that could improve the odds. Do not mention Gender or Ethnicity. Do not give legal or financial advice. Keep it under 120 words. Use two short paragraphs.`
}

/**
 * Rule-based fallback. Produces a believable reason without any external call,
 * using the same financial/employment signals (protected attributes ignored).
 */
function ruleBasedExplanation(applicant: Applicant, probabilityPct: number): string {
  const income = Number(applicant.Income) || 0
  const debt = Number(applicant.Debt) || 0
  const years = Number(applicant.YearsEmployed) || 0
  const employed = applicant.Employed
  const priorDefault = applicant.PriorDefault
  const edu = String(applicant.EducationLevel ?? '')

  const reasons: string[] = []
  if (priorDefault === 'Yes') {
    reasons.push('a prior default on record, which is one of the strongest negative signals')
  }
  if (employed === 'No') {
    reasons.push('no current employment, which reduces demonstrated repayment capacity')
  }
  if (income > 0 && debt / income > 0.4) {
    reasons.push(`a high debt-to-income ratio (about ${Math.round((debt / income) * 100)}%)`)
  } else if (income < 15000) {
    reasons.push('a relatively low reported income')
  }
  if (years < 1) {
    reasons.push('very short employment history')
  }
  if (edu === 'none') {
    reasons.push('limited education history on file')
  }
  if (reasons.length === 0) {
    reasons.push('a combination of marginal financial factors that kept the score just below the approval threshold')
  }

  const list = reasons.join(', ')
  const suggestions: string[] = []
  if (priorDefault === 'Yes') suggestions.push('rebuilding credit history with on-time payments over time')
  if (employed === 'No') suggestions.push('re-establishing steady income')
  if (income > 0 && debt / income > 0.4) suggestions.push('reducing existing debt to lower your debt-to-income ratio')
  else if (income < 15000) suggestions.push('increasing reported income')
  if (years < 1) suggestions.push('building longer employment tenure')
  if (suggestions.length === 0) suggestions.push('strengthening the overall financial profile (income, employment, and debt) before reapplying')

  const sugg = suggestions.slice(0, 2).join('; ')
  return `This application was likely rejected due to ${list}. The model estimated an approval probability of ${probabilityPct}%, which is below the approval threshold. To improve the odds, consider ${sugg}.`
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const data = (body ?? {}) as Applicant
  const probabilityPct = Math.round(Number(data.probability) || 0)

  // Strip protected fields before anything leaves this server for the LLM.
  const safeApplicant: Applicant = {}
  for (const [k, v] of Object.entries(data)) {
    if (k === 'probability') continue
    if (PROTECTED_FIELDS.has(k)) continue
    safeApplicant[k] = v
  }

  // No key configured -> fall back to the local rule-based explainer.
  if (!OPENAI_API_KEY) {
    return NextResponse.json({
      success: true,
      source: 'rules',
      explanation: ruleBasedExplanation(safeApplicant, probabilityPct),
    })
  }

  try {
    const prompt = buildPrompt(safeApplicant, probabilityPct)
    const resp = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a concise, fair, plain-English credit decision explainer for an educational tool. Never reference Gender or Ethnicity.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 220,
      }),
      cache: 'no-store',
    })

    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      console.error('OpenAI explain failed:', resp.status, text)
      return NextResponse.json({
        success: true,
        source: 'rules',
        explanation: ruleBasedExplanation(safeApplicant, probabilityPct),
      })
    }

    const json = await resp.json()
    const explanation: string =
      json?.choices?.[0]?.message?.content?.trim() || ruleBasedExplanation(safeApplicant, probabilityPct)

    return NextResponse.json({ success: true, source: 'ai', explanation })
  } catch (err) {
    console.error('Explain route error:', err)
    return NextResponse.json({
      success: true,
      source: 'rules',
      explanation: ruleBasedExplanation(safeApplicant, probabilityPct),
    })
  }
}
