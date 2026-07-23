'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STEPS = [
  { id: 1, title: 'Personal Information', fields: ['age', 'gender', 'marital_status', 'num_children', 'occupation', 'location'] },
  { id: 2, title: 'Family Information', fields: ['dependents', 'spouse_working'] },
  { id: 3, title: 'Income', fields: ['monthly_income', 'additional_income'] },
  { id: 4, title: 'Monthly Expenses', fields: ['monthly_expenses', 'housing_cost'] },
  { id: 5, title: 'Emergency Fund & Savings', fields: ['emergency_fund', 'savings', 'existing_investments'] },
  { id: 6, title: 'Existing Insurance', fields: ['has_life_insurance', 'life_insurance_coverage', 'has_health_insurance', 'has_critical_illness', 'has_hmo', 'has_accident_insurance'] },
  { id: 7, title: 'Outstanding Debts', fields: ['home_loan', 'car_loan', 'personal_loan', 'credit_card_debt', 'other_debt'] },
  { id: 8, title: 'Financial Goals', fields: ['goals'] },
]

const FINANCIAL_GOALS = [
  'Protect family',
  'Retirement planning',
  'Education fund',
  'Wealth building',
  'Estate planning',
  'Early retirement',
  'Business protection',
]

export default function AssessmentPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1
    age: '',
    gender: '',
    marital_status: '',
    num_children: 0,
    occupation: '',
    location: '',
    // Step 2
    dependents: 0,
    spouse_working: null,
    // Step 3
    monthly_income: '',
    additional_income: '',
    // Step 4
    monthly_expenses: '',
    housing_cost: '',
    // Step 5
    emergency_fund: '',
    savings: '',
    existing_investments: false,
    // Step 6
    has_life_insurance: false,
    life_insurance_coverage: '',
    has_health_insurance: false,
    has_critical_illness: false,
    has_hmo: false,
    has_accident_insurance: false,
    // Step 7
    home_loan: '',
    car_loan: '',
    personal_loan: '',
    credit_card_debt: '',
    other_debt: '',
    // Step 8
    goals: [],
  })
  const [submitting, setSubmitting] = useState(false)

  const progress = (currentStep / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      // Last step - redirect to lead capture
      router.push(`/lead-capture?data=${encodeURIComponent(JSON.stringify(formData))}`)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleGoal = (goal) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      {/* Header */}
      <div className="container mx-auto px-4 mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0A2342' }}>
              Golden Trident Financial Readiness Check™
            </h1>
            <p className="text-sm text-gray-600">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}</p>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>Please provide accurate information for the best results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup value={formData.gender} onValueChange={(value) => updateField('gender', value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <RadioGroup value={formData.marital_status} onValueChange={(value) => updateField('marital_status', value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single">Single</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="married" id="married" />
                      <Label htmlFor="married">Married</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="widowed" id="widowed" />
                      <Label htmlFor="widowed">Widowed</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num_children">Number of Children</Label>
                  <Input
                    id="num_children"
                    type="number"
                    value={formData.num_children}
                    onChange={(e) => updateField('num_children', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => updateField('occupation', e.target.value)}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="e.g., Metro Manila"
                  />
                </div>
              </>
            )}

            {/* Step 2: Family Information */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="dependents">Number of Financial Dependents</Label>
                  <Input
                    id="dependents"
                    type="number"
                    value={formData.dependents}
                    onChange={(e) => updateField('dependents', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                  <p className="text-sm text-gray-500">Include spouse, children, parents, etc.</p>
                </div>
                <div className="space-y-2">
                  <Label>Is your spouse working?</Label>
                  <RadioGroup value={formData.spouse_working?.toString()} onValueChange={(value) => updateField('spouse_working', value === 'true')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="spouse_yes" />
                      <Label htmlFor="spouse_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="spouse_no" />
                      <Label htmlFor="spouse_no">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="null" id="spouse_na" />
                      <Label htmlFor="spouse_na">Not Applicable</Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}

            {/* Step 3: Income */}
            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="monthly_income">Monthly Income (₱)</Label>
                  <Input
                    id="monthly_income"
                    type="number"
                    value={formData.monthly_income}
                    onChange={(e) => updateField('monthly_income', e.target.value)}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additional_income">Additional Monthly Income (₱)</Label>
                  <Input
                    id="additional_income"
                    type="number"
                    value={formData.additional_income}
                    onChange={(e) => updateField('additional_income', e.target.value)}
                    placeholder="0"
                  />
                  <p className="text-sm text-gray-500">From side business, investments, etc.</p>
                </div>
              </>
            )}

            {/* Step 4: Monthly Expenses */}
            {currentStep === 4 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="monthly_expenses">Total Monthly Expenses (₱)</Label>
                  <Input
                    id="monthly_expenses"
                    type="number"
                    value={formData.monthly_expenses}
                    onChange={(e) => updateField('monthly_expenses', e.target.value)}
                    placeholder="30000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="housing_cost">Monthly Housing Cost (₱)</Label>
                  <Input
                    id="housing_cost"
                    type="number"
                    value={formData.housing_cost}
                    onChange={(e) => updateField('housing_cost', e.target.value)}
                    placeholder="10000"
                  />
                  <p className="text-sm text-gray-500">Rent or mortgage payment</p>
                </div>
              </>
            )}

            {/* Step 5: Emergency Fund & Savings */}
            {currentStep === 5 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="emergency_fund">Emergency Fund (₱)</Label>
                  <Input
                    id="emergency_fund"
                    type="number"
                    value={formData.emergency_fund}
                    onChange={(e) => updateField('emergency_fund', e.target.value)}
                    placeholder="100000"
                  />
                  <p className="text-sm text-gray-500">Easily accessible cash for emergencies</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="savings">Total Savings (₱)</Label>
                  <Input
                    id="savings"
                    type="number"
                    value={formData.savings}
                    onChange={(e) => updateField('savings', e.target.value)}
                    placeholder="200000"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="existing_investments"
                    checked={formData.existing_investments}
                    onCheckedChange={(checked) => updateField('existing_investments', checked)}
                  />
                  <Label htmlFor="existing_investments">
                    I have existing investments (stocks, mutual funds, VUL, etc.)
                  </Label>
                </div>
              </>
            )}

            {/* Step 6: Existing Insurance */}
            {currentStep === 6 && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_life_insurance"
                      checked={formData.has_life_insurance}
                      onCheckedChange={(checked) => updateField('has_life_insurance', checked)}
                    />
                    <Label htmlFor="has_life_insurance">Life Insurance</Label>
                  </div>
                  {formData.has_life_insurance && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="life_insurance_coverage">Coverage Amount (₱)</Label>
                      <Input
                        id="life_insurance_coverage"
                        type="number"
                        value={formData.life_insurance_coverage}
                        onChange={(e) => updateField('life_insurance_coverage', e.target.value)}
                        placeholder="1000000"
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_health_insurance"
                      checked={formData.has_health_insurance}
                      onCheckedChange={(checked) => updateField('has_health_insurance', checked)}
                    />
                    <Label htmlFor="has_health_insurance">Health Insurance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_critical_illness"
                      checked={formData.has_critical_illness}
                      onCheckedChange={(checked) => updateField('has_critical_illness', checked)}
                    />
                    <Label htmlFor="has_critical_illness">Critical Illness Coverage</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_hmo"
                      checked={formData.has_hmo}
                      onCheckedChange={(checked) => updateField('has_hmo', checked)}
                    />
                    <Label htmlFor="has_hmo">HMO</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_accident_insurance"
                      checked={formData.has_accident_insurance}
                      onCheckedChange={(checked) => updateField('has_accident_insurance', checked)}
                    />
                    <Label htmlFor="has_accident_insurance">Accident Insurance</Label>
                  </div>
                </div>
              </>
            )}

            {/* Step 7: Outstanding Debts */}
            {currentStep === 7 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="home_loan">Home Loan Balance (₱)</Label>
                  <Input
                    id="home_loan"
                    type="number"
                    value={formData.home_loan}
                    onChange={(e) => updateField('home_loan', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="car_loan">Car Loan Balance (₱)</Label>
                  <Input
                    id="car_loan"
                    type="number"
                    value={formData.car_loan}
                    onChange={(e) => updateField('car_loan', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personal_loan">Personal Loan Balance (₱)</Label>
                  <Input
                    id="personal_loan"
                    type="number"
                    value={formData.personal_loan}
                    onChange={(e) => updateField('personal_loan', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credit_card_debt">Credit Card Debt (₱)</Label>
                  <Input
                    id="credit_card_debt"
                    type="number"
                    value={formData.credit_card_debt}
                    onChange={(e) => updateField('credit_card_debt', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="other_debt">Other Debt (₱)</Label>
                  <Input
                    id="other_debt"
                    type="number"
                    value={formData.other_debt}
                    onChange={(e) => updateField('other_debt', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </>
            )}

            {/* Step 8: Financial Goals */}
            {currentStep === 8 && (
              <>
                <div className="space-y-4">
                  <Label>Select your financial goals (choose all that apply):</Label>
                  {FINANCIAL_GOALS.map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={formData.goals.includes(goal)}
                        onCheckedChange={() => toggleGoal(goal)}
                      />
                      <Label htmlFor={goal} className="font-normal">{goal}</Label>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                style={{ backgroundColor: '#D4AF37', color: '#0A2342' }}
              >
                {currentStep === STEPS.length ? 'Continue' : 'Next'}
                {currentStep === STEPS.length ? <CheckCircle className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
