'use client'

import { useState } from 'react'
import { Bell, FileUp, BarChart3, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronRight, Settings, Menu, LogOut } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

type Screen = 'dashboard' | 'results' | 'portfolio'

interface Submission {
  id: string
  aircraft: {
    make: string
    model: string
    year: number
    value: number
  }
  pilot: {
    hours: number
    ratingHours: number
    name: string
  }
  baseAirport: string
  intendedUse: string
  status: 'analyzing' | 'completed' | 'pending'
  uploadedAt: string
}

interface AgentVerdict {
  agentName: string
  verdict: 'Red' | 'Amber' | 'Green'
  riskScore: number
  reasoning: string
  keyFactors: string[]
  qbeCitations: { guideline: string; page: number }[]
  historicalReferences: { policyId: string; claim?: string }[]
}

interface AnalysisResult {
  submissionId: string
  dealScore: number
  decision: 'Quote' | 'Conditional Accept' | 'Decline'
  verdicts: AgentVerdict[]
  synthesisReasoning: string
  requiredMitigations: string[]
}

interface PortfolioThreshold {
  name: string
  currentExposure: number
  proposedExposure: number
  limit: number
  status: 'Compliant' | 'Threshold Breach' | 'Warning'
}

// Sample Data
const SAMPLE_SUBMISSIONS: Submission[] = [
  {
    id: 'SUB-001',
    aircraft: { make: 'Gulfstream', model: 'G650', year: 2008, value: 45000000 },
    pilot: { hours: 450, ratingHours: 80, name: 'John Smith' },
    baseAirport: 'TEB',
    intendedUse: 'Corporate',
    status: 'completed',
    uploadedAt: '2025-11-21T09:30:00Z'
  },
  {
    id: 'SUB-002',
    aircraft: { make: 'Cessna', model: 'Citation X', year: 2015, value: 28000000 },
    pilot: { hours: 2100, ratingHours: 600, name: 'Sarah Johnson' },
    baseAirport: 'LAX',
    intendedUse: 'Charter',
    status: 'analyzing',
    uploadedAt: '2025-11-21T10:45:00Z'
  },
  {
    id: 'SUB-003',
    aircraft: { make: 'Beechcraft', model: 'King Air 350', year: 1985, value: 8500000 },
    pilot: { hours: 5200, ratingHours: 1200, name: 'Michael Davis' },
    baseAirport: 'JFK',
    intendedUse: 'Cargo',
    status: 'pending',
    uploadedAt: '2025-11-21T11:15:00Z'
  }
]

const SAMPLE_ANALYSIS: AnalysisResult = {
  submissionId: 'SUB-001',
  dealScore: 68,
  decision: 'Conditional Accept',
  synthesisReasoning: 'Strong aircraft condition and base location offset by pilot experience gaps. Conditional acceptance with pilot training requirement.',
  requiredMitigations: [
    'Pilot must complete 50 additional hours on Gulfstream G-series aircraft',
    'Annual hull value limit reduced to $40M until training completed',
    'Quarterly proficiency checks required for first year'
  ],
  verdicts: [
    {
      agentName: 'Hull Risk Agent',
      verdict: 'Green',
      riskScore: 0.25,
      reasoning: '2008 Gulfstream G650 with excellent maintenance records and modern avionics. Parts availability confirmed.',
      keyFactors: ['Recent overhaul (2023)', 'Full glass cockpit', 'Low utilization hours'],
      qbeCitations: [{ guideline: 'Hull Coverage Limits & Age Analysis', page: 47 }],
      historicalReferences: [{ policyId: 'AV-2019-0342', claim: 'Similar G650, zero losses' }]
    },
    {
      agentName: 'Pilot Qualification Agent',
      verdict: 'Red',
      riskScore: 0.75,
      reasoning: 'Pilot has only 450 total hours with 80 hours on type. QBE minimum is 500 total hours and 100 on type.',
      keyFactors: ['450 total hours (500 required)', '80 hours on type (100 required)', 'No high-altitude endorsement'],
      qbeCitations: [{ guideline: 'Pilot Experience Minimums', page: 52 }],
      historicalReferences: [{ policyId: 'AV-2020-1045', claim: 'Low-hour pilot loss - $2.3M' }]
    },
    {
      agentName: 'Maintenance & Aging Agent',
      verdict: 'Amber',
      riskScore: 0.45,
      reasoning: 'Aircraft maintained to high standards, but engine overhaul due within 6 months. Service history excellent.',
      keyFactors: ['Overhaul due June 2025', 'Established service center (Hauppauge)', '1850 total engine hours'],
      qbeCitations: [{ guideline: 'Engine Overhaul Requirements', page: 89 }],
      historicalReferences: [{ policyId: 'AV-2018-0876', claim: 'Engine failure due to delayed overhaul - $4.1M' }]
    },
    {
      agentName: 'Ground Risk Agent',
      verdict: 'Green',
      riskScore: 0.2,
      reasoning: 'TEB (Teterboro) is premium location with excellent weather mitigation and low accident history.',
      keyFactors: ['TEB has low accident rate', 'Modern hangar facility', 'Low hurricane exposure'],
      qbeCitations: [{ guideline: 'Airport Safety & Weather Zones', page: 156 }],
      historicalReferences: [{ policyId: 'AV-2021-0654', claim: 'No losses for TEB-based fleet' }]
    },
    {
      agentName: 'Liability Risk Agent',
      verdict: 'Green',
      riskScore: 0.3,
      reasoning: 'Corporate use with max 8 passengers. Requested $100M limits align with aircraft value and operations.',
      keyFactors: ['8-seat configuration', 'Corporate use (low exposure)', 'Liability limits appropriate'],
      qbeCitations: [{ guideline: 'Liability Limits by Aircraft Type', page: 121 }],
      historicalReferences: [{ policyId: 'AV-2022-0234', claim: 'Similar corporate G650 - zero exposure' }]
    },
    {
      agentName: 'Geopolitical Risk Agent',
      verdict: 'Green',
      riskScore: 0.15,
      reasoning: 'Domestic US flights only. No conflict zone or sanction-affected region exposure.',
      keyFactors: ['US domestic only', 'No high-risk destinations', 'Standard airspace'],
      qbeCitations: [{ guideline: 'Geopolitical & Sanction Compliance', page: 198 }],
      historicalReferences: [{ policyId: 'AV-2023-0112', claim: 'Domestic fleet - excellent loss history' }]
    }
  ]
}

const PORTFOLIO_THRESHOLDS: PortfolioThreshold[] = [
  {
    name: 'TEB Hull Value',
    currentExposure: 285000000,
    proposedExposure: 330000000,
    limit: 500000000,
    status: 'Compliant'
  },
  {
    name: 'G-Series Aircraft Concentration',
    currentExposure: 156000000,
    proposedExposure: 201000000,
    limit: 250000000,
    status: 'Compliant'
  },
  {
    name: 'Corporate Use Liability',
    currentExposure: 1200000000,
    proposedExposure: 1300000000,
    limit: 1500000000,
    status: 'Warning'
  },
  {
    name: 'New York Metro Exposure',
    currentExposure: 450000000,
    proposedExposure: 495000000,
    limit: 600000000,
    status: 'Compliant'
  }
]

// Components

function DashboardPage({ onSelectSubmission }: { onSelectSubmission: (sub: Submission) => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 border-r border-slate-800`}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-lg font-bold">QBE Aviation</h1>}
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-slate-800">
            <Menu className="w-4 h-4" />
          </Button>
        </div>
        <nav className="p-4 space-y-2">
          <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Dashboard" isActive sidebarOpen={sidebarOpen} />
          <NavItem icon={<FileUp className="w-5 h-5" />} label="Active Submissions" sidebarOpen={sidebarOpen} />
          <NavItem icon={<AlertCircle className="w-5 h-5" />} label="Portfolio Monitor" sidebarOpen={sidebarOpen} />
          <NavItem icon={<Settings className="w-5 h-5" />} label="Guidelines Library" sidebarOpen={sidebarOpen} />
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          {sidebarOpen && <p className="text-sm text-slate-400 mb-3">Underwriter Account</p>}
          <Button variant="ghost" size="sm" className="w-full text-slate-300 hover:text-white hover:bg-slate-800 justify-start">
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Underwriting Dashboard</h2>
            <p className="text-sm text-slate-600">Aviation Insurance Risk Assessment</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">JD</div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatsCard label="Submissions Today" value="12" trend="+3" />
            <StatsCard label="Avg Deal Score" value="72" trend="+5" />
            <StatsCard label="Portfolio Exposure" value="$2.4B" trend="+8%" />
            <StatsCard label="Approval Rate" value="78%" trend="-2%" />
          </div>

          {/* Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Submit New Risk for Underwriting</CardTitle>
              <CardDescription>Upload broker email and PDF attachments for automated analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition">
                <FileUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-900 font-medium mb-2">Drag and drop your files here</p>
                <p className="text-sm text-slate-600 mb-4">or</p>
                <Button variant="outline">Browse Files</Button>
                <p className="text-xs text-slate-500 mt-4">Supported: PDF, DOCX, EML files</p>
              </div>
            </CardContent>
          </Card>

          {/* Active Submissions */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Active Reviews</h3>
            <div className="grid grid-cols-3 gap-4">
              {SAMPLE_SUBMISSIONS.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  onClick={() => {
                    if (submission.status === 'completed') {
                      onSelectSubmission(submission)
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function SubmissionCard({ submission, onClick }: { submission: Submission; onClick: () => void }) {
  const statusConfig = {
    completed: { color: 'bg-green-50', badge: 'bg-green-100 text-green-800', icon: CheckCircle },
    analyzing: { color: 'bg-blue-50', badge: 'bg-blue-100 text-blue-800', icon: AlertCircle },
    pending: { color: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-800', icon: AlertCircle }
  }

  const config = statusConfig[submission.status]
  const StatusIcon = config.icon

  return (
    <Card className={`${config.color} cursor-pointer hover:shadow-lg transition`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-bold text-slate-900">{submission.aircraft.make} {submission.aircraft.model}</p>
            <p className="text-sm text-slate-600">{submission.aircraft.year}</p>
          </div>
          <Badge className={config.badge}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {submission.status === 'analyzing' ? 'Analyzing...' : submission.status === 'completed' ? 'Completed' : 'Pending'}
          </Badge>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-700">
            <span>Pilot Hours:</span>
            <span className="font-semibold">{submission.pilot.hours}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Base:</span>
            <span className="font-semibold">{submission.baseAirport}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Value:</span>
            <span className="font-semibold">${(submission.aircraft.value / 1000000).toFixed(1)}M</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResultsPage({ result, onBack }: { result: AnalysisResult; onBack: () => void }) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(result.verdicts[0]?.agentName ?? null)

  const getDealScoreColor = (score: number) => {
    if (score < 40) return 'text-red-600'
    if (score < 70) return 'text-amber-600'
    return 'text-green-600'
  }

  const getDecisionColor = (decision: string) => {
    if (decision === 'Decline') return 'bg-red-100 text-red-800'
    if (decision === 'Conditional Accept') return 'bg-amber-100 text-amber-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold text-slate-900">Underwriting Analysis Results</h2>
        <p className="text-sm text-slate-600">Submission SUB-001 | Gulfstream G650</p>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        {/* Decision Section */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Deal Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Deal Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-5xl font-bold ${getDealScoreColor(result.dealScore)} mb-2`}>
                {result.dealScore}/100
              </div>
              <Progress value={result.dealScore} className="h-2 mb-2" />
              <p className="text-xs text-slate-600">{result.dealScore < 40 ? 'High Risk' : result.dealScore < 70 ? 'Moderate Risk' : 'Low Risk'}</p>
            </CardContent>
          </Card>

          {/* Final Decision */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Final Decision</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${getDecisionColor(result.decision)}`}>
                {result.decision}
              </div>
              <p className="text-sm text-slate-600 mt-3">{result.synthesisReasoning}</p>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Verdict Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Green Verdicts:</span>
                  <span className="font-bold text-green-600">4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Amber Verdicts:</span>
                  <span className="font-bold text-amber-600">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Red Verdicts:</span>
                  <span className="font-bold text-red-600">1</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Required Mitigations */}
        {result.requiredMitigations.length > 0 && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
                Required Mitigations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.requiredMitigations.map((mitigation, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-amber-600 mr-3 font-bold">•</span>
                    <span className="text-slate-800">{mitigation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* POV Agent Verdicts */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">POV Agent Verdicts</h3>
          <div className="space-y-3">
            {result.verdicts.map((verdict, idx) => (
              <AgentVerdictPanel
                key={idx}
                verdict={verdict}
                isExpanded={expandedAgent === verdict.agentName}
                onToggle={() => setExpandedAgent(expandedAgent === verdict.agentName ? null : verdict.agentName)}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700">Generate Conditional Quote</Button>
          <Button variant="outline">Export Report as PDF</Button>
        </div>
      </main>
    </div>
  )
}

function AgentVerdictPanel({ verdict, isExpanded, onToggle }: { verdict: AgentVerdict; isExpanded: boolean; onToggle: () => void }) {
  const verdictColors = {
    Red: 'bg-red-50 border-red-200',
    Amber: 'bg-amber-50 border-amber-200',
    Green: 'bg-green-50 border-green-200'
  }

  const verdictBadgeColors = {
    Red: 'bg-red-100 text-red-800',
    Amber: 'bg-amber-100 text-amber-800',
    Green: 'bg-green-100 text-green-800'
  }

  return (
    <Card className={`border-2 ${verdictColors[verdict.verdict]} cursor-pointer`} onClick={onToggle}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4 flex-1">
            <Badge className={verdictBadgeColors[verdict.verdict]}>{verdict.verdict}</Badge>
            <div className="flex-1">
              <p className="font-bold text-slate-900">{verdict.agentName}</p>
              <p className="text-sm text-slate-600">{verdict.reasoning}</p>
            </div>
          </div>
          <div className="text-right ml-4">
            <p className="text-xs text-slate-600">Risk Score</p>
            <p className="text-2xl font-bold text-slate-900">{(verdict.riskScore * 100).toFixed(0)}</p>
            <ChevronRight className={`w-5 h-5 text-slate-400 mt-2 transition ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
            <div>
              <p className="font-semibold text-slate-900 mb-2">Key Factors:</p>
              <ul className="space-y-1">
                {verdict.keyFactors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start">
                    <span className="text-slate-400 mr-2">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-2">QBE Citations:</p>
              <div className="space-y-1">
                {verdict.qbeCitations.map((citation, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="text-sm text-blue-600 hover:underline flex items-start"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-slate-400 mr-2">→</span>
                    {citation.guideline} (Page {citation.page})
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-2">Historical References:</p>
              <div className="space-y-1">
                {verdict.historicalReferences.map((ref, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="text-sm text-blue-600 hover:underline flex items-start"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-slate-400 mr-2">→</span>
                    Policy {ref.policyId} {ref.claim ? `- ${ref.claim}` : ''}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PortfolioPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold text-slate-900">Portfolio Impact Monitor</h2>
        <p className="text-sm text-slate-600">Exposure validation for proposed Gulfstream G650 acceptance</p>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        {/* Exposure Summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <PortfolioMetricCard label="Total Hull Value" value="$1.28B" trend="↑ $45M" />
          <PortfolioMetricCard label="Liability Exposure" value="$4.2B" trend="↑ $100M" />
          <PortfolioMetricCard label="Geographic Concentration" value="35%" trend="↑ 2.1%" />
          <PortfolioMetricCard label="Aircraft Type Concentration" value="28%" trend="↑ 1.8%" />
        </div>

        {/* Threshold Alerts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Exposure Threshold Status</CardTitle>
            <CardDescription>Compliance check for proposed risk acceptance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {PORTFOLIO_THRESHOLDS.map((threshold, idx) => (
                <ThresholdRow key={idx} threshold={threshold} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
              Active Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start text-sm">
                <span className="text-amber-600 mr-2">⚠</span>
                <span>Corporate Use Liability at 86.7% of limit. Recommend reducing requested limits or applying higher deductible.</span>
              </li>
              <li className="flex items-start text-sm">
                <span className="text-amber-600 mr-2">⚠</span>
                <span>Gulfstream fleet concentration approaching 80% utilization. Consider portfolio balance before additional G-series acceptance.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Portfolio Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-800">
              Proposed risk is <span className="font-bold text-green-700">PORTFOLIO COMPLIANT</span>. All thresholds remain within safe operating limits.
              Recommend proceeding with conditional acceptance pending pilot training completion.
            </p>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex gap-4 mt-8">
          <Button className="bg-green-600 hover:bg-green-700">Approve for Binding</Button>
          <Button variant="outline">Return to Results</Button>
        </div>
      </main>
    </div>
  )
}

// Helper Components

function NavItem({ icon, label, isActive, sidebarOpen }: { icon: React.ReactNode; label: string; isActive?: boolean; sidebarOpen: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
      {icon}
      {sidebarOpen && <span className="text-sm">{label}</span>}
    </button>
  )
}

function StatsCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-slate-600 mb-2">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
        <p className={`text-xs ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{trend} from yesterday</p>
      </CardContent>
    </Card>
  )
}

function PortfolioMetricCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-slate-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 mt-2">{trend}</p>
      </CardContent>
    </Card>
  )
}

function ThresholdRow({ threshold }: { threshold: PortfolioThreshold }) {
  const statusColor = {
    'Compliant': 'bg-green-50 border-green-200',
    'Threshold Breach': 'bg-red-50 border-red-200',
    'Warning': 'bg-amber-50 border-amber-200'
  }

  const statusBadgeColor = {
    'Compliant': 'bg-green-100 text-green-800',
    'Threshold Breach': 'bg-red-100 text-red-800',
    'Warning': 'bg-amber-100 text-amber-800'
  }

  const percentage = (threshold.currentExposure / threshold.limit) * 100

  return (
    <div className={`border rounded-lg p-4 ${statusColor[threshold.status]}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-slate-900">{threshold.name}</p>
          <p className="text-xs text-slate-600 mt-1">
            {(threshold.currentExposure / 1000000).toFixed(0)}M → {(threshold.proposedExposure / 1000000).toFixed(0)}M / ${(threshold.limit / 1000000).toFixed(0)}M limit
          </p>
        </div>
        <Badge className={statusBadgeColor[threshold.status]}>{threshold.status}</Badge>
      </div>
      <Progress value={(threshold.proposedExposure / threshold.limit) * 100} className="h-2" />
      <p className="text-xs text-slate-600 mt-2">{((threshold.proposedExposure / threshold.limit) * 100).toFixed(1)}% of limit</p>
    </div>
  )
}

// Main App Component
export default function HomePage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission)
    setCurrentScreen('results')
  }

  return (
    <div className="min-h-screen">
      {currentScreen === 'dashboard' && <DashboardPage onSelectSubmission={handleSelectSubmission} />}
      {currentScreen === 'results' && (
        <ResultsPage
          result={SAMPLE_ANALYSIS}
          onBack={() => setCurrentScreen('dashboard')}
        />
      )}
      {currentScreen === 'portfolio' && <PortfolioPage onBack={() => setCurrentScreen('results')} />}

      {/* Navigation overlay - add portfolio link to results screen */}
      {currentScreen === 'results' && (
        <div className="fixed bottom-8 right-8">
          <Button onClick={() => setCurrentScreen('portfolio')} className="bg-blue-600 hover:bg-blue-700">
            Check Portfolio Impact
          </Button>
        </div>
      )}
    </div>
  )
}
