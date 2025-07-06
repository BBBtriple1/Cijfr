import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Target, Award } from "lucide-react";

interface Grade {
  id: string;
  subject_id: string;
  grade: number;
  weight: number;
  test_type: string;
  description: string | null;
  test_date: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
  target_grade: number | null;
}

interface SubjectStatsProps {
  grades: Grade[];
  subject: Subject;
}

export const SubjectStats = ({ grades, subject }: SubjectStatsProps) => {
  if (grades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistieken</CardTitle>
          <CardDescription>Geen data beschikbaar</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate basic stats
  const average = grades.reduce((sum, grade) => sum + (grade.grade * grade.weight), 0) / 
                  grades.reduce((sum, grade) => sum + grade.weight, 0);
  
  const highest = Math.max(...grades.map(g => g.grade));
  const lowest = Math.min(...grades.map(g => g.grade));
  const passing = grades.filter(g => g.grade >= 5.5).length;
  const passingPercentage = (passing / grades.length) * 100;

  // Prepare chart data
  const chartData = grades
    .sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime())
    .map((grade, index) => ({
      index: index + 1,
      grade: grade.grade,
      date: new Date(grade.test_date).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' }),
      type: grade.test_type
    }));

  // Grade distribution
  const gradeDistribution = Array.from({ length: 10 }, (_, i) => i + 1).map(grade => ({
    grade: grade.toString(),
    count: grades.filter(g => Math.round(g.grade) === grade).length
  }));

  const chartConfig = {
    grade: {
      label: "Cijfer",
      color: subject.color,
    },
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Gemiddelde</div>
            </div>
            <div className="text-2xl font-bold">{average.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <div className="text-sm text-muted-foreground">Hoogste</div>
            </div>
            <div className="text-2xl font-bold text-success">{highest}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <div className="text-sm text-muted-foreground">Laagste</div>
            </div>
            <div className="text-2xl font-bold text-destructive">{lowest}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <div className="text-sm text-muted-foreground">Voldoende</div>
            </div>
            <div className="text-2xl font-bold">{passingPercentage.toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cijferverloop</CardTitle>
          <CardDescription>Ontwikkeling van je cijfers over tijd</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[1, 10]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="grade" 
                stroke={subject.color} 
                strokeWidth={2}
                dot={{ fill: subject.color, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Cijferverdeling</CardTitle>
          <CardDescription>Hoe vaak je elk cijfer hebt gehaald</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill={subject.color} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Target Progress */}
      {subject.target_grade && (
        <Card>
          <CardHeader>
            <CardTitle>Doelvoortgang</CardTitle>
            <CardDescription>Hoe dicht ben je bij je streefcijfer?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Huidige gemiddelde</span>
                <Badge variant={average >= subject.target_grade ? "default" : "secondary"}>
                  {average.toFixed(1)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Streefcijfer</span>
                <Badge variant="outline">{subject.target_grade}</Badge>
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
              <div className="text-sm text-muted-foreground text-center">
                {average >= subject.target_grade 
                  ? `🎉 Je hebt je doel bereikt!`
                  : `Nog ${(subject.target_grade - average).toFixed(1)} punt${(subject.target_grade - average) !== 1 ? 'en' : ''} te gaan`
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};