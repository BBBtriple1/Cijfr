import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Target } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  color: string;
  target_grade: number | null;
}

interface Grade {
  id: string;
  subject_id: string;
  grade: number;
  weight: number;
  test_type: string;
  description: string | null;
  test_date: string;
}

interface SubjectCardProps {
  subject: Subject;
  grades: Grade[];
  onAddGrade: () => void;
}

export const SubjectCard = ({ subject, grades, onAddGrade }: SubjectCardProps) => {
  const calculateAverage = () => {
    if (grades.length === 0) return null;
    
    const totalWeightedPoints = grades.reduce((sum, grade) => sum + (grade.grade * grade.weight), 0);
    const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
    
    return totalWeightedPoints / totalWeight;
  };

  const getGradeColor = (average: number | null) => {
    if (!average) return 'text-muted-foreground';
    if (average >= 8) return 'text-success';
    if (average >= 6.5) return 'text-primary';
    if (average >= 5.5) return 'text-warning';
    return 'text-destructive';
  };

  const getLatestGrades = () => {
    return grades
      .sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime())
      .slice(0, 3);
  };

  const average = calculateAverage();
  const latestGrades = getLatestGrades();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">{subject.name}</CardTitle>
          <CardDescription>
            {grades.length} cijfer{grades.length !== 1 ? 's' : ''}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: subject.color }}
          />
          {subject.target_grade && (
            <Badge variant="outline" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              {subject.target_grade}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Average */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Gemiddelde</span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getGradeColor(average)}`}>
                {average ? average.toFixed(1) : '--'}
              </span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Latest grades */}
          {latestGrades.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Laatste cijfers</span>
              <div className="flex flex-wrap gap-1">
                {latestGrades.map((grade) => (
                  <Badge
                    key={grade.id}
                    variant={grade.grade >= 5.5 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {grade.grade} ({grade.test_type})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Target comparison */}
          {subject.target_grade && average && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Naar doel</span>
                <span className={average >= subject.target_grade ? 'text-success' : 'text-warning'}>
                  {average >= subject.target_grade ? '✓' : `${(subject.target_grade - average).toFixed(1)} punt${(subject.target_grade - average) !== 1 ? 'en' : ''} tekort`}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    average >= subject.target_grade ? 'bg-success' : 'bg-warning'
                  }`}
                  style={{
                    width: `${Math.min((average / subject.target_grade) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          )}

          <Button onClick={onAddGrade} variant="outline" className="w-full">
            <Plus className="h-4 w-4" />
            Cijfer Toevoegen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};