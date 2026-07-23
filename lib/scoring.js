// Rule-Based Financial Readiness Scoring Engine
// Calculates a score from 0-100 based on assessment responses

export function calculateFinancialReadinessScore(assessment) {
  let score = 0
  const weights = {
    income: 15,
    emergency_fund: 20,
    insurance: 25,
    debt: 20,
    savings: 10,
    planning: 10,
  }

  // 1. Income Stability (15 points)
  const incomeScore = calculateIncomeScore(assessment)
  score += incomeScore * (weights.income / 100)

  // 2. Emergency Fund (20 points)
  const emergencyScore = calculateEmergencyFundScore(assessment)
  score += emergencyScore * (weights.emergency_fund / 100)

  // 3. Insurance Coverage (25 points)
  const insuranceScore = calculateInsuranceScore(assessment)
  score += insuranceScore * (weights.insurance / 100)

  // 4. Debt Management (20 points)
  const debtScore = calculateDebtScore(assessment)
  score += debtScore * (weights.debt / 100)

  // 5. Savings & Investments (10 points)
  const savingsScore = calculateSavingsScore(assessment)
  score += savingsScore * (weights.savings / 100)

  // 6. Financial Planning (10 points)
  const planningScore = calculatePlanningScore(assessment)
  score += planningScore * (weights.planning / 100)

  return Math.round(score)
}

function calculateIncomeScore(assessment) {
  let score = 0
  const { monthly_income, additional_income, monthly_expenses } = assessment

  const totalIncome = (monthly_income || 0) + (additional_income || 0)
  const expenses = monthly_expenses || 0

  if (totalIncome <= 0) return 0

  // Income to expense ratio
  const ratio = totalIncome / (expenses || 1)

  if (ratio >= 2.0) score = 100
  else if (ratio >= 1.5) score = 80
  else if (ratio >= 1.3) score = 60
  else if (ratio >= 1.1) score = 40
  else score = 20

  return score
}

function calculateEmergencyFundScore(assessment) {
  const { emergency_fund, monthly_expenses } = assessment
  const fund = emergency_fund || 0
  const expenses = monthly_expenses || 1

  const months = fund / expenses

  if (months >= 6) return 100
  if (months >= 3) return 70
  if (months >= 1) return 40
  if (fund > 0) return 20
  return 0
}

function calculateInsuranceScore(assessment) {
  let score = 0
  const {
    has_life_insurance,
    life_insurance_coverage,
    has_health_insurance,
    has_critical_illness,
    has_hmo,
    has_accident_insurance,
    monthly_income,
  } = assessment

  // Life insurance (40 points)
  if (has_life_insurance) {
    const coverage = life_insurance_coverage || 0
    const annualIncome = (monthly_income || 0) * 12
    const coverageRatio = coverage / (annualIncome || 1)

    if (coverageRatio >= 10) score += 40
    else if (coverageRatio >= 5) score += 30
    else if (coverageRatio >= 3) score += 20
    else score += 10
  }

  // Health insurance (20 points)
  if (has_health_insurance || has_hmo) score += 20

  // Critical illness (20 points)
  if (has_critical_illness) score += 20

  // Accident insurance (20 points)
  if (has_accident_insurance) score += 20

  return score
}

function calculateDebtScore(assessment) {
  const {
    home_loan,
    car_loan,
    personal_loan,
    credit_card_debt,
    other_debt,
    monthly_income,
  } = assessment

  const totalDebt =
    (home_loan || 0) +
    (car_loan || 0) +
    (personal_loan || 0) +
    (credit_card_debt || 0) +
    (other_debt || 0)

  if (totalDebt === 0) return 100

  const annualIncome = (monthly_income || 1) * 12
  const debtToIncomeRatio = totalDebt / annualIncome

  if (debtToIncomeRatio <= 0.5) return 100
  if (debtToIncomeRatio <= 1.0) return 80
  if (debtToIncomeRatio <= 2.0) return 60
  if (debtToIncomeRatio <= 3.0) return 40
  return 20
}

function calculateSavingsScore(assessment) {
  const { savings, existing_investments, monthly_income } = assessment

  let score = 0
  const savingsAmount = savings || 0
  const income = monthly_income || 1

  const savingsRatio = savingsAmount / (income * 12)

  if (savingsRatio >= 0.3) score += 60
  else if (savingsRatio >= 0.2) score += 40
  else if (savingsRatio >= 0.1) score += 20
  else if (savingsAmount > 0) score += 10

  if (existing_investments) score += 40

  return score
}

function calculatePlanningScore(assessment) {
  const { goals } = assessment

  if (!goals || goals.length === 0) return 0
  if (goals.length >= 3) return 100
  if (goals.length === 2) return 70
  return 40
}

export function calculateBuyingIntent(score, assessment) {
  // Buying intent based on score and specific indicators
  const {
    has_life_insurance,
    has_critical_illness,
    goals,
    monthly_income,
  } = assessment

  const hasProtectionGaps = !has_life_insurance || !has_critical_illness
  const hasIncome = (monthly_income || 0) > 0
  const hasGoals = goals && goals.length > 0

  if (score >= 80) return 'Low' // Already well protected
  if (score >= 60 && score < 80) return 'Medium'
  if (score >= 40 && score < 60 && hasProtectionGaps && hasIncome) return 'High'
  if (score < 40 && hasProtectionGaps && hasIncome && hasGoals) return 'Very High'
  return 'Medium'
}

export function generateRecommendations(score, assessment) {
  const recommendations = {
    strengths: [],
    improvements: [],
    priorities: [],
  }

  // Analyze strengths
  if ((assessment.emergency_fund || 0) >= (assessment.monthly_expenses || 0) * 3) {
    recommendations.strengths.push('Strong emergency fund');
  }
  if ((assessment.monthly_income || 0) > (assessment.monthly_expenses || 0) * 1.5) {
    recommendations.strengths.push('Healthy income-to-expense ratio');
  }
  if (assessment.has_life_insurance) {
    recommendations.strengths.push('Has life insurance coverage');
  }
  if (assessment.existing_investments) {
    recommendations.strengths.push('Active in investments');
  }

  // Analyze improvement areas
  if (!assessment.has_life_insurance) {
    recommendations.improvements.push('No income protection in place');
    recommendations.priorities.push('Consider life insurance to protect your family\'s financial future');
  }
  if (!assessment.has_critical_illness) {
    recommendations.improvements.push('No critical illness coverage');
    recommendations.priorities.push('Explore critical illness insurance for medical emergencies');
  }
  if ((assessment.emergency_fund || 0) < (assessment.monthly_expenses || 0) * 3) {
    recommendations.improvements.push('Emergency fund needs strengthening');
    recommendations.priorities.push('Build an emergency fund covering 3-6 months of expenses');
  }
  if (!assessment.existing_investments && (assessment.goals || []).includes('retirement')) {
    recommendations.improvements.push('No retirement planning in place');
    recommendations.priorities.push('Start investing for retirement through VUL or mutual funds');
  }

  const totalDebt =
    (assessment.home_loan || 0) +
    (assessment.car_loan || 0) +
    (assessment.personal_loan || 0) +
    (assessment.credit_card_debt || 0) +
    (assessment.other_debt || 0);

  if (totalDebt > (assessment.monthly_income || 0) * 24) {
    recommendations.improvements.push('High debt burden');
    recommendations.priorities.push('Create a debt reduction strategy while building protection');
  }

  return recommendations
}
