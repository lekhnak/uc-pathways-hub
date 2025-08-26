import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Building, DollarSign, PieChart, BarChart3 } from "lucide-react"

const Pathways = () => {
  const pathways = [
    {
      id: 1,
      title: "Private Credit",
      description: "Direct lending and alternative credit strategies",
      icon: DollarSign,
      color: "bg-academy-blue",
      modules: 6,
      avgSalary: "$150K - $300K",
      skills: ["Credit Analysis", "Risk Assessment", "Due Diligence"],
      companies: ["Apollo", "Blackstone", "KKR", "Ares"]
    },
    {
      id: 2,
      title: "Private Equity",
      description: "Buyouts, growth capital, and value creation",
      icon: TrendingUp,
      color: "bg-academy-blue-dark",
      modules: 8,
      avgSalary: "$200K - $500K",
      skills: ["Financial Modeling", "Deal Sourcing", "Portfolio Management"],
      companies: ["Blackstone", "KKR", "TPG", "Carlyle"]
    },
    {
      id: 3,
      title: "Real Estate",
      description: "Property investment and development finance",
      icon: Building,
      color: "bg-academy-blue-light",
      modules: 5,
      avgSalary: "$120K - $250K",
      skills: ["Property Valuation", "Market Analysis", "Development Finance"],
      companies: ["Brookfield", "Blackstone Real Estate", "Prologis", "CBRE"]
    },
    {
      id: 4,
      title: "Public Equity",
      description: "Stock analysis, portfolio management, and trading",
      icon: BarChart3,
      color: "bg-academy-blue",
      modules: 7,
      avgSalary: "$180K - $400K",
      skills: ["Equity Research", "Portfolio Theory", "Quantitative Analysis"],
      companies: ["Goldman Sachs", "Citadel", "Two Sigma", "Bridgewater"]
    },
    {
      id: 5,
      title: "Fixed Income",
      description: "Bond markets, credit products, and interest rate strategies",
      icon: PieChart,
      color: "bg-academy-blue-dark",
      modules: 6,
      avgSalary: "$160K - $350K",
      skills: ["Bond Valuation", "Duration Analysis", "Credit Research"],
      companies: ["PIMCO", "BlackRock", "Vanguard", "Fidelity"]
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4 text-academy-blue">Career Pathways</h1>
        <p className="text-academy-grey text-lg">
          Explore specialized finance career paths and build the skills needed for success.
        </p>
      </div>

      {/* Pathways Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {pathways.map((pathway) => {
          const IconComponent = pathway.icon
          return (
            <Card key={pathway.id} className="bg-white shadow-card border-academy-grey-light hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${pathway.color} rounded-lg flex items-center justify-center text-white`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl text-academy-blue mb-2">{pathway.title}</CardTitle>
                    <CardDescription className="text-base">{pathway.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-academy-grey-light p-3 rounded-lg">
                    <p className="text-sm text-academy-grey">Learning Modules</p>
                    <p className="text-lg font-semibold text-academy-blue">{pathway.modules}</p>
                  </div>
                  <div className="bg-academy-grey-light p-3 rounded-lg">
                    <p className="text-sm text-academy-grey">Salary Range</p>
                    <p className="text-lg font-semibold text-academy-blue">{pathway.avgSalary}</p>
                  </div>
                </div>

                {/* Key Skills */}
                <div>
                  <h4 className="font-semibold text-academy-blue mb-3">Key Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {pathway.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-academy-grey-light text-academy-blue border-academy-blue">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Top Companies */}
                <div>
                  <h4 className="font-semibold text-academy-blue mb-3">Top Employers</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {pathway.companies.map((company) => (
                      <div key={company} className="text-sm text-academy-grey bg-academy-grey-light p-2 rounded text-center">
                        {company}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full bg-academy-blue hover:bg-academy-blue-dark">
                  Explore {pathway.title} Path
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Cookbooks & Field Lectures Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gradient-subtle border-academy-blue-light shadow-card">
          <CardHeader>
            <CardTitle className="text-academy-blue">Cookbooks</CardTitle>
            <CardDescription>Step-by-step guides for finance professionals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-white rounded-lg border border-academy-grey-light">
              <h4 className="font-semibold text-academy-blue">LBO Modeling Cookbook</h4>
              <p className="text-sm text-academy-grey">Complete guide to leveraged buyout models</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-academy-grey-light">
              <h4 className="font-semibold text-academy-blue">DCF Valuation Guide</h4>
              <p className="text-sm text-academy-grey">Master discounted cash flow analysis</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-academy-grey-light">
              <h4 className="font-semibold text-academy-blue">Credit Analysis Framework</h4>
              <p className="text-sm text-academy-grey">Systematic approach to credit evaluation</p>
            </div>
            <Button variant="outline" className="w-full border-academy-blue text-academy-blue hover:bg-academy-blue-light">
              View All Cookbooks
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-subtle border-academy-blue-light shadow-card">
          <CardHeader>
            <CardTitle className="text-academy-blue">Field-Specific Lectures</CardTitle>
            <CardDescription>Expert insights from industry professionals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-white rounded-lg border border-academy-grey-light">
              <h4 className="font-semibold text-academy-blue">PE Deal Sourcing Strategies</h4>
              <p className="text-sm text-academy-grey">Managing Director, Apollo Global</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-academy-grey-light">
              <h4 className="font-semibold text-academy-blue">Real Estate Market Cycles</h4>
              <p className="text-sm text-academy-grey">Senior VP, Brookfield Properties</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-academy-grey-light">
              <h4 className="font-semibold text-academy-blue">Fixed Income Trading</h4>
              <p className="text-sm text-academy-grey">Portfolio Manager, PIMCO</p>
            </div>
            <Button variant="outline" className="w-full border-academy-blue text-academy-blue hover:bg-academy-blue-light">
              Browse All Lectures
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pathways;