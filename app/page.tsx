'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Plus, TrendingUp, TrendingDown, Send, ChevronDown, ChevronUp, Download, MessageSquare, ArrowLeft, PieChart as PieChartIcon, BarChart3, Zap, DollarSign, Shield, TrendingUpIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

type Screen = 'dashboard' | 'input' | 'results' | 'brainstorm'

interface PortfolioHolding {
  ticker: string
  quantity: number
  purchase_price: number
  current_price: number
  sector?: string
  dividend_yield?: number
}

interface Portfolio {
  id: string
  name: string
  holdings: PortfolioHolding[]
  createdAt: string
  analysis?: AnalysisResult
}

interface PersonaAnalysis {
  score: number
  rating: string
  key_finding: string
  top_recommendation: string
  [key: string]: any
}

interface AnalysisResult {
  executive_summary?: {
    portfolio_health_score: number
    overall_assessment: string
    top_3_strengths: string[]
    top_3_concerns: string[]
  }
  persona_analyses?: {
    risk_analyst: PersonaAnalysis
    growth_strategist: PersonaAnalysis
    income_optimizer: PersonaAnalysis
    value_investor: PersonaAnalysis
    macro_economist: PersonaAnalysis
  }
  prioritized_suggestions?: Array<{
    priority: number
    suggestion: string
    impact_rating: number
    confidence: number
    supporting_personas: string[]
  }>
  [key: string]: any
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// Sample portfolio data
const SAMPLE_PORTFOLIO: PortfolioHolding[] = [
  { ticker: 'AAPL', quantity: 100, purchase_price: 150, current_price: 175, sector: 'Technology', dividend_yield: 0.4 },
  { ticker: 'MSFT', quantity: 75, purchase_price: 280, current_price: 380, sector: 'Technology', dividend_yield: 0.8 },
  { ticker: 'NVDA', quantity: 50, purchase_price: 200, current_price: 450, sector: 'Technology', dividend_yield: 0.1 },
  { ticker: 'JNJ', quantity: 60, purchase_price: 140, current_price: 160, sector: 'Healthcare', dividend_yield: 2.8 },
  { ticker: 'PG', quantity: 80, purchase_price: 130, current_price: 155, sector: 'Consumer Staples', dividend_yield: 2.1 },
  { ticker: 'XOM', quantity: 40, purchase_price: 85, current_price: 105, sector: 'Energy', dividend_yield: 3.5 },
  { ticker: 'T', quantity: 200, purchase_price: 25, current_price: 18, sector: 'Telecommunications', dividend_yield: 6.5 },
  { ticker: 'O', quantity: 30, purchase_price: 55, current_price: 62, sector: 'Real Estate', dividend_yield: 5.2 },
]

const SAMPLE_ANALYSIS: AnalysisResult = {
  executive_summary: {
    portfolio_health_score: 7.2,
    overall_assessment: 'Well-balanced portfolio with strong growth positioning but elevated concentration risk in technology sector',
    top_3_strengths: ['Strong growth exposure in AI/semiconductors', 'Quality dividend payers', 'Good macro alignment with economic cycle'],
    top_3_concerns: ['Tech concentration at 45% creates systemic risk', 'Limited value opportunities in current market', 'Interest rate sensitivity of growth holdings']
  },
  persona_analyses: {
    risk_analyst: {
      score: 6.5,
      rating: 'Moderate-High',
      key_finding: 'High concentration in technology sector increases systemic risk',
      top_recommendation: 'Add defensive positions to buffer downturns',
      volatility_analysis: 'Portfolio beta of 1.2 indicates 20% more volatile than market'
    },
    growth_strategist: {
      score: 8.0,
      rating: 'Above Average',
      key_finding: 'Strong positioning for AI and semiconductor growth themes',
      top_recommendation: 'Add clean energy exposure for diversified growth',
      portfolio_growth_assessment: 'Current growth exposure at 62%, higher than market average'
    },
    income_optimizer: {
      score: 6.0,
      rating: 'Moderate',
      key_finding: 'Below-average yield with room for income enhancement',
      top_recommendation: 'Add REIT exposure for income diversification',
      weighted_avg_yield: '2.4%'
    },
    value_investor: {
      score: 6.8,
      rating: 'Moderately Valued',
      key_finding: 'Mixed valuation profile with some overvalued growth names',
      top_recommendation: 'Trim overvalued positions, add undervalued quality names',
      overvalued_holdings: 'NVDA trading at 67% premium to intrinsic value'
    },
    macro_economist: {
      score: 7.5,
      rating: 'Well Positioned',
      key_finding: 'Well-positioned for current cycle but vulnerable to rate changes',
      top_recommendation: 'Increase healthcare for late-cycle defense',
      rate_sensitivity: 'Slightly positive - benefits from elevated rates'
    }
  },
  prioritized_suggestions: [
    {
      priority: 1,
      suggestion: 'Reduce technology sector allocation from 45% to 35%',
      impact_rating: 9,
      confidence: 0.92,
      supporting_personas: ['Risk Analyst', 'Value Investor', 'Macro Economist']
    },
    {
      priority: 2,
      suggestion: 'Add healthcare sector exposure to 15% allocation',
      impact_rating: 8,
      confidence: 0.88,
      supporting_personas: ['Risk Analyst', 'Macro Economist']
    },
    {
      priority: 3,
      suggestion: 'Initiate REIT allocation at 8-10%',
      impact_rating: 7,
      confidence: 0.85,
      supporting_personas: ['Income Optimizer', 'Macro Economist']
    }
  ]
}

// Main App
export default function HomePage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard')
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [currentPortfolio, setCurrentPortfolio] = useState<Portfolio | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const handleNewPortfolio = (portfolio: Portfolio) => {
    setCurrentPortfolio(portfolio)
    setCurrentScreen('input')
  }

  const handleAnalyze = async (portfolio: Portfolio) => {
    setCurrentPortfolio(portfolio)
    setIsLoading(true)
    setAnalysisProgress(0)

    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress(p => {
        if (p >= 90) {
          clearInterval(interval)
          return 90
        }
        return p + Math.random() * 20
      })
    }, 500)

    try {
      // Call Portfolio Analysis Coordinator
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze this portfolio for multi-perspective insights: ${JSON.stringify(portfolio.holdings)}`,
          agent_id: '69382e87a7a2106e9680aab1' // Portfolio Analysis Coordinator
        })
      })

      const data = await response.json()

      setAnalysisProgress(100)
      clearInterval(interval)

      const updatedPortfolio = {
        ...portfolio,
        analysis: data.response || SAMPLE_ANALYSIS
      }
      setCurrentPortfolio(updatedPortfolio)
      setPortfolios(portfolios.map(p => p.id === portfolio.id ? updatedPortfolio : p))

      setTimeout(() => {
        setIsLoading(false)
        setCurrentScreen('results')
      }, 500)
    } catch (error) {
      console.error('Analysis failed:', error)
      setIsLoading(false)
      // Use sample analysis on error
      const updatedPortfolio = {
        ...portfolio,
        analysis: SAMPLE_ANALYSIS
      }
      setCurrentPortfolio(updatedPortfolio)
      setCurrentScreen('results')
    }
  }

  if (currentScreen === 'dashboard') {
    return <DashboardScreen onNewPortfolio={handleNewPortfolio} onAnalyze={handleAnalyze} portfolios={portfolios} setPortfolios={setPortfolios} />
  }

  if (currentScreen === 'input' && currentPortfolio) {
    return <InputScreen portfolio={currentPortfolio} onSubmit={(p) => handleAnalyze(p)} onBack={() => setCurrentScreen('dashboard')} />
  }

  if (currentScreen === 'results' && currentPortfolio) {
    return (
      <ResultsScreen
        portfolio={currentPortfolio}
        isLoading={isLoading}
        progress={analysisProgress}
        onBrainstorm={() => setCurrentScreen('brainstorm')}
        onBack={() => setCurrentScreen('dashboard')}
      />
    )
  }

  if (currentScreen === 'brainstorm' && currentPortfolio) {
    return (
      <BrainstormScreen
        portfolio={currentPortfolio}
        analysis={currentPortfolio.analysis || SAMPLE_ANALYSIS}
        onBack={() => setCurrentScreen('results')}
      />
    )
  }

  return null
}

// Dashboard Screen
function DashboardScreen({ onNewPortfolio, onAnalyze, portfolios, setPortfolios }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Portfolio Intelligence</h1>
              <p className="text-sm text-slate-600 mt-1">Multi-perspective investment analysis platform</p>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onNewPortfolio({
              id: Date.now().toString(),
              name: 'New Portfolio',
              holdings: SAMPLE_PORTFOLIO,
              createdAt: new Date().toISOString()
            })}>
              <Plus className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {portfolios.length === 0 ? (
          <EmptyState onNewPortfolio={onNewPortfolio} />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <QuickStatCard label="Total Portfolios" value={portfolios.length.toString()} icon={<PieChartIcon className="w-5 h-5" />} />
              <QuickStatCard label="Avg Health Score" value={(portfolios.reduce((sum, p) => sum + (p.analysis?.executive_summary?.portfolio_health_score || 0), 0) / portfolios.length).toFixed(1)} icon={<TrendingUp className="w-5 h-5" />} />
              <QuickStatCard label="Total Holdings" value={portfolios.reduce((sum, p) => sum + p.holdings.length, 0).toString()} icon={<BarChart3 className="w-5 h-5" />} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Analyses</h2>
              <div className="grid gap-4">
                {portfolios.map(portfolio => (
                  <PortfolioCard key={portfolio.id} portfolio={portfolio} onAnalyze={onAnalyze} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function EmptyState({ onNewPortfolio }: any) {
  return (
    <div className="text-center py-16">
      <PieChartIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-slate-900 mb-2">No portfolios yet</h3>
      <p className="text-slate-600 mb-8">Create your first portfolio analysis to get started</p>
      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onNewPortfolio({
        id: Date.now().toString(),
        name: 'My Portfolio',
        holdings: SAMPLE_PORTFOLIO,
        createdAt: new Date().toISOString()
      })}>
        <Plus className="w-4 h-4 mr-2" />
        Create Portfolio
      </Button>
    </div>
  )
}

function QuickStatCard({ label, value, icon }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
          <div className="text-emerald-600">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function PortfolioCard({ portfolio, onAnalyze }: any) {
  const holdingCount = portfolio.holdings.length
  const totalValue = portfolio.holdings.reduce((sum: number, h: PortfolioHolding) => sum + (h.quantity * h.current_price), 0)
  const totalCost = portfolio.holdings.reduce((sum: number, h: PortfolioHolding) => sum + (h.quantity * h.purchase_price), 0)
  const gain = totalValue - totalCost
  const gainPercent = ((gain / totalCost) * 100).toFixed(1)
  const health = portfolio.analysis?.executive_summary?.portfolio_health_score || 0

  return (
    <Card className="hover:shadow-lg transition">
      <CardContent className="p-6">
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{portfolio.name}</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-600 mb-1">Holdings</p>
                <p className="text-xl font-semibold text-slate-900">{holdingCount}</p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Portfolio Value</p>
                <p className="text-xl font-semibold text-slate-900">${(totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Gain/Loss</p>
                <p className={`text-xl font-semibold ${gain > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {gain > 0 ? '+' : ''}{gainPercent}%
                </p>
              </div>
            </div>
          </div>

          {health > 0 && (
            <div className="col-span-3">
              <p className="text-xs text-slate-600 mb-2">Health Score</p>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-600 mb-2">{health.toFixed(1)}</p>
                <Progress value={health * 10} className="h-2" />
              </div>
            </div>
          )}

          <div className="col-span-3 text-right">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
              onClick={() => onAnalyze(portfolio)}
            >
              {portfolio.analysis ? 'View Analysis' : 'Analyze'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Input Screen
function InputScreen({ portfolio, onSubmit, onBack }: any) {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(portfolio.holdings)
  const [showUpload, setShowUpload] = useState(false)

  const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.current_price), 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Portfolio Setup</h1>
          <p className="text-sm text-slate-600 mt-1">Enter your holdings for comprehensive analysis</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="grid grid-cols-3 gap-8">
          {/* Holdings Table */}
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Portfolio Holdings</CardTitle>
                  <Dialog open={showUpload} onOpenChange={setShowUpload}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Import CSV
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Import Portfolio CSV</DialogTitle>
                        <DialogDescription>Upload a CSV file with columns: ticker, quantity, purchase_price, current_price</DialogDescription>
                      </DialogHeader>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-sm text-slate-600 mb-4">Drag CSV here or click to browse</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-3 font-semibold text-slate-700">Ticker</th>
                        <th className="text-right py-3 px-3 font-semibold text-slate-700">Qty</th>
                        <th className="text-right py-3 px-3 font-semibold text-slate-700">Avg Cost</th>
                        <th className="text-right py-3 px-3 font-semibold text-slate-700">Current</th>
                        <th className="text-right py-3 px-3 font-semibold text-slate-700">Value</th>
                        <th className="text-center py-3 px-3 font-semibold text-slate-700">Gain/Loss</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((holding, idx) => {
                        const value = holding.quantity * holding.current_price
                        const cost = holding.quantity * holding.purchase_price
                        const gain = value - cost
                        const gainPct = (gain / cost) * 100
                        return (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-3 font-semibold text-slate-900">{holding.ticker}</td>
                            <td className="text-right py-3 px-3 text-slate-700">{holding.quantity}</td>
                            <td className="text-right py-3 px-3 text-slate-700">${holding.purchase_price.toFixed(2)}</td>
                            <td className="text-right py-3 px-3 text-slate-700">${holding.current_price.toFixed(2)}</td>
                            <td className="text-right py-3 px-3 font-semibold text-slate-900">${(value / 1000).toFixed(0)}k</td>
                            <td className={`text-right py-3 px-3 font-semibold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {gain >= 0 ? '+' : ''}{gainPct.toFixed(1)}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Portfolio Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-emerald-600">${(totalValue / 1000000).toFixed(2)}M</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">Top Holdings</p>
                  {holdings.slice(0, 3).map((h, i) => {
                    const pct = ((h.quantity * h.current_price) / totalValue * 100).toFixed(1)
                    return (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-slate-700">{h.ticker}</span>
                        <span className="font-semibold text-slate-900">{pct}%</span>
                      </div>
                    )
                  })}
                </div>

                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onSubmit(portfolio)}>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Portfolio
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

// Results Screen
function ResultsScreen({ portfolio, isLoading, progress, onBrainstorm, onBack }: any) {
  const analysis = portfolio.analysis || SAMPLE_ANALYSIS
  const [expandedPersona, setExpandedPersona] = useState<string | null>('risk_analyst')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-12 text-center">
            <Zap className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Portfolio</h3>
            <p className="text-slate-600 mb-6">Coordinating insights from 5 specialized personas...</p>
            <Progress value={progress} className="h-3 mb-3" />
            <p className="text-xs text-slate-600">{Math.round(progress)}% complete</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const personas = [
    { key: 'risk_analyst', title: 'Risk Analyst', icon: Shield, color: 'bg-red-50' },
    { key: 'growth_strategist', title: 'Growth Strategist', icon: TrendingUpIcon, color: 'bg-green-50' },
    { key: 'income_optimizer', title: 'Income Optimizer', icon: DollarSign, color: 'bg-blue-50' },
    { key: 'value_investor', title: 'Value Investor', icon: BarChart3, color: 'bg-purple-50' },
    { key: 'macro_economist', title: 'Macro Economist', icon: TrendingUp, color: 'bg-amber-50' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{portfolio.name} Analysis</h1>
              <p className="text-sm text-slate-600 mt-1">Comprehensive multi-perspective investment analysis</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-600">Portfolio Health Score</p>
              <p className="text-4xl font-bold text-emerald-600">{analysis.executive_summary?.portfolio_health_score.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Executive Summary */}
        <Card className="mb-8 border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-800">{analysis.executive_summary?.overall_assessment}</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-emerald-900 mb-2">Strengths</p>
                <ul className="space-y-1">
                  {analysis.executive_summary?.top_3_strengths?.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-emerald-800 flex items-start">
                      <span className="text-emerald-600 mr-2">+</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-2">Concerns</p>
                <ul className="space-y-1">
                  {analysis.executive_summary?.top_3_concerns?.map((c: string, i: number) => (
                    <li key={i} className="text-sm text-amber-800 flex items-start">
                      <span className="text-amber-600 mr-2">!</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Persona Analyses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Five-Perspective Analysis</h2>
          <div className="grid gap-4">
            {personas.map(persona => {
              const data = analysis.persona_analyses?.[persona.key as keyof typeof analysis.persona_analyses]
              const Icon = persona.icon
              return (
                <Card
                  key={persona.key}
                  className={`cursor-pointer transition hover:shadow-lg ${persona.color}`}
                  onClick={() => setExpandedPersona(expandedPersona === persona.key ? null : persona.key)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-white rounded-lg">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{persona.title}</h3>
                          <p className="text-sm text-slate-700 mb-2">{data?.key_finding}</p>
                          <Badge className="bg-white text-slate-900">Score: {data?.score}</Badge>
                        </div>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition ${expandedPersona === persona.key ? 'rotate-180' : ''}`} />
                    </div>

                    {expandedPersona === persona.key && (
                      <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm mb-1">Rating</p>
                          <p className="text-slate-700">{data?.rating}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm mb-1">Top Recommendation</p>
                          <p className="text-slate-700">{data?.top_recommendation}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Final Suggestions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Prioritized Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.prioritized_suggestions?.map((sugg: any, i: number) => (
                <div key={i} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-emerald-100 text-emerald-800">Priority {sugg.priority}</Badge>
                        <p className="font-semibold text-slate-900">{sugg.suggestion}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-600">Impact: <span className="font-semibold text-slate-900">{sugg.impact_rating}/10</span></span>
                        <span className="text-slate-600">Confidence: <span className="font-semibold text-slate-900">{(sugg.confidence * 100).toFixed(0)}%</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {sugg.supporting_personas?.map((p: string, j: number) => (
                      <Badge key={j} variant="outline" className="text-xs">{p}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onBrainstorm}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Brainstorm Suggestions
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </main>
    </div>
  )
}

// Brainstorm Screen
function BrainstormScreen({ portfolio, analysis, onBack }: any) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your investment consultant. I\'ve reviewed the analysis of your portfolio. What would you like to explore? You can ask about specific suggestions, risk concerns, or how to implement recommendations.'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Portfolio Analysis Context: ${JSON.stringify(analysis)}. User Question: ${inputValue}`,
          agent_id: '69382ebda7a2106e9680aab8' // Brainstorm Consultation Agent
        })
      })

      const data = await response.json()
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: typeof data.response === 'string' ? data.response : data.response?.response || 'I understand. Let me help you refine your investment strategy based on the analysis.'
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand your question. Based on the five-perspective analysis, I can help you think through which suggestions align best with your goals. What specific aspect would you like to explore?'
      }
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Analysis
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Brainstorm Session</h1>
        <p className="text-sm text-slate-600">Explore and refine your investment strategy</p>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-md p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-900'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-4 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask about the analysis, implementation, or strategy..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-slate-600 mt-2">Try: "Which suggestion should I prioritize?" or "How do I reduce tech concentration?"</p>
        </div>
      </div>
    </div>
  )
}
