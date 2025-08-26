import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const Internships = () => {
  const { toast } = useToast();
  
  const credentials = {
    email: "lek21@g.ucla.edu",
    password: "Jimmyjabs@2109"
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const openInNewTab = () => {
    window.open("https://bootcamps.adventiscg.com/summer-internships/get/adventis-opportunities-database/student", "_blank");
  };

  return (
    <div className="h-full w-full space-y-4">
      {/* Login Credentials Card */}
      <Card className="bg-academy-blue-light border-academy-blue">
        <CardHeader className="pb-3">
          <CardTitle className="text-academy-blue flex items-center gap-2">
            Login Credentials for Adventis Database
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={openInNewTab}
              className="text-academy-blue hover:bg-academy-blue hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-academy-grey">Email:</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-sm">
                  {credentials.email}
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(credentials.email, "Email")}
                  className="border-academy-blue text-academy-blue hover:bg-academy-blue hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-academy-grey">Password:</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-sm">
                  {credentials.password}
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(credentials.password, "Password")}
                  className="border-academy-blue text-academy-blue hover:bg-academy-blue hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-sm text-academy-grey">
            Use these credentials to log into the database below. Click the copy buttons to copy credentials to your clipboard.
          </p>
        </CardContent>
      </Card>

      {/* Embedded Database */}
      <div className="border border-academy-grey-light rounded-lg overflow-hidden">
        <iframe
          src="https://bootcamps.adventiscg.com/summer-internships/get/adventis-opportunities-database/student"
          className="w-full h-[800px] border-0"
          title="Adventis Opportunities Database"
          allow="fullscreen"
        />
      </div>
    </div>
  );
};

export default Internships;