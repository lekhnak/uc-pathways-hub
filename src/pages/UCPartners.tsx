import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, DollarSign, Building, Users } from "lucide-react"
import { useInternships } from '@/hooks/useInternships';

const UCPartners = () => {
  const { internships, loading } = useInternships();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'summer-program': return 'bg-green-100 text-green-800';
      case 'full-time': return 'bg-blue-100 text-blue-800';
      case 'part-time': return 'bg-purple-100 text-purple-800';
      default: return 'bg-academy-grey-light text-academy-grey'
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4 text-academy-blue">UC Partner Opportunities</h1>
        <p className="text-academy-grey text-lg">
          Exclusive opportunities for UC students through our industry partnerships.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">
              {internships.filter(i => i.is_uc_partner).length}
            </CardTitle>
            <CardDescription>UC Partners</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">
              {internships.reduce((sum, i) => sum + (i.available_positions || 1), 0)}
            </CardTitle>
            <CardDescription>Open Positions</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">89%</CardTitle>
            <CardDescription>Placement Rate</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">$165K</CardTitle>
            <CardDescription>Avg. Starting Salary</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Partner Postings */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-academy-grey">Loading internships...</div>
        </div>
      ) : internships.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-academy-grey">No UC partner internships available at this time.</div>
        </div>
      ) : (
        <div className="space-y-6">
          {internships.map((internship) => (
            <Card key={internship.id} className="bg-white shadow-card border-academy-grey-light hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl text-academy-blue">{internship.title}</CardTitle>
                      <Badge className={getTypeColor(internship.position_type)}>
                        {internship.position_type.replace('-', ' ')}
                      </Badge>
                      {internship.is_uc_partner && (
                        <Badge variant="outline" className="border-academy-blue text-academy-blue">
                          UC Partner
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-academy-grey mb-3">
                      <span className="font-semibold text-academy-blue text-lg flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {internship.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {internship.location}
                      </span>
                      {internship.available_positions && internship.available_positions > 1 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {internship.available_positions} positions
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-base">{internship.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-academy-grey">
                      Posted {new Date(internship.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-academy-grey-light rounded-lg">
                  {internship.compensation && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-academy-blue" />
                      <div>
                        <p className="text-sm font-medium">Compensation</p>
                        <p className="text-sm text-academy-grey">{internship.compensation}</p>
                      </div>
                    </div>
                  )}
                  {internship.application_deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-academy-blue" />
                      <div>
                        <p className="text-sm font-medium">Application Deadline</p>
                        <p className="text-sm text-academy-grey">
                          {new Date(internship.application_deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {internship.available_positions && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-academy-blue" />
                      <div>
                        <p className="text-sm font-medium">Available Slots</p>
                        <p className="text-sm text-academy-grey">{internship.available_positions} positions</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Requirements */}
                {internship.requirements && Array.isArray(internship.requirements) && internship.requirements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-academy-blue mb-2">Requirements</h4>
                    <div className="flex flex-wrap gap-2">
                      {(internship.requirements as string[]).map((req, index) => (
                        <Badge key={index} variant="secondary" className="bg-white border border-academy-grey-light text-academy-blue">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  {internship.apply_url ? (
                    <Button className="flex-1 bg-academy-blue hover:bg-academy-blue-dark" asChild>
                      <a href={internship.apply_url} target="_blank" rel="noopener noreferrer">
                        Apply Through UC Portal
                      </a>
                    </Button>
                  ) : (
                    <Button className="flex-1 bg-academy-blue hover:bg-academy-blue-dark">
                      Apply Through UC Portal
                    </Button>
                  )}
                  <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                    Contact Advisor
                  </Button>
                  <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Admin Notice */}
      <Card className="bg-academy-blue-light border-academy-blue">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-semibold text-academy-blue mb-2">For Career Services Admin</h3>
            <p className="text-academy-grey mb-4">
              These postings are managed through the UC Career Services portal. Contact admin to add new partner opportunities.
            </p>
            <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-white">
              Admin Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UCPartners;