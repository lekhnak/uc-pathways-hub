import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Sun, Briefcase, GraduationCap, ArrowRight } from "lucide-react"

const Internships = () => {

  const categories = [
    {
      title: "Summer Internships",
      description: "Explore summer internship opportunities in finance",
      icon: Sun,
      path: "/internships/summer",
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Full-Time Positions",
      description: "Browse full-time roles and graduate programmes",
      icon: Briefcase,
      path: "/internships/full-time",
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "UC Partners",
      description: "Exclusive opportunities through UC partnerships",
      icon: GraduationCap,
      path: "/internships/uc-partners",
      color: "bg-purple-100 text-purple-800"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4 text-academy-blue">Career Opportunities</h1>
        <p className="text-academy-grey text-lg">
          Access internships, full-time positions, and exclusive UC partner opportunities.
        </p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link key={category.title} to={category.path}>
            <Card className="bg-white shadow-card border-academy-grey-light hover:shadow-elevated transition-all h-full group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-academy-grey group-hover:text-academy-blue transition-colors" />
                </div>
                <CardTitle className="text-xl text-academy-blue group-hover:text-academy-blue-dark transition-colors">
                  {category.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {category.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">500+</CardTitle>
            <CardDescription>Total Opportunities</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">150+</CardTitle>
            <CardDescription>Partner Companies</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">85%</CardTitle>
            <CardDescription>Placement Rate</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">$125K</CardTitle>
            <CardDescription>Avg. Starting Salary</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Internships;