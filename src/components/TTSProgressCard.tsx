import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, PlayCircle } from "lucide-react";
import { TTSProgress } from "@/hooks/useTTSProgress";

interface TTSProgressCardProps {
  courseId: string;
  courseName: string;
  progress?: TTSProgress | null;
  className?: string;
}

export const TTSProgressCard = ({ courseId, courseName, progress, className }: TTSProgressCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <PlayCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 50) return "bg-blue-500";
    return "bg-gray-300";
  };

  if (!progress) {
    return (
      <Card className={`border-dashed border-2 ${className}`}>
        <CardContent className="flex items-center justify-center py-6">
          <div className="text-center text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No progress data available</p>
            <p className="text-xs">Link your TTS account to track progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = progress.progress_percentage || 0;
  const status = progress.completion_status || 'not_started';

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getStatusIcon(status)}
            TTS Progress
          </CardTitle>
          {getStatusBadge(status)}
        </div>
        <CardDescription className="text-xs">
          {courseName}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
              // Use dynamic color based on progress
            />
          </div>
          
          {progress.last_accessed_at && (
            <div className="text-xs text-muted-foreground">
              Last accessed: {new Date(progress.last_accessed_at).toLocaleDateString()}
            </div>
          )}
          
          {progress.completed_at && (
            <div className="text-xs text-green-600 font-medium">
              ✓ Completed: {new Date(progress.completed_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};