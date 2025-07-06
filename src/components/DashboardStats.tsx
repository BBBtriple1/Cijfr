import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Target, Award, BookOpen, Calendar } from "lucide-react";

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

interface DashboardStatsProps {
  subjects: Subject[];
  grades: Grade[];
}

export const DashboardStats = ({ subjects, grades }: DashboardStatsProps) => {
  if (grades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistieken</CardTitle>
          <CardDescription>Voeg cijfers toe om statistieken te zien</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate overall stats
  const subjectAverages = subjects.map(subject => {
    const subjectGrades = grades.filter(g => g.subject_id === subject.id);
    if (subjectGrades.length === 0) return null;
    
    const totalWeightedPoints = subjectGrades.reduce((sum, grade) => sum + (grade.grade * grade.weight), 0);
    const totalWeight = subjectGrades.reduce((sum, grade) => sum + grade.weight, 0);
    
    return {
      subject: subject.name,
      average: totalWeightedPoints / totalWeight,
      color: subject.color
    };
  }).filter(Boolean);

  const overallAverage = subjectAverages.reduce((sum, avg) => sum + avg!.average, 0) / subjectAverages.length;
  const highest = Math.max(...grades.map(g => g.grade));
  const lowest = Math.min(...grades.map(g => g.grade));
  const passing = grades.filter(g => g.grade >= 5.5).length;
  const passingPercentage = (passing / grades.length) * 100;

  // Prepare monthly data
  const monthlyData = grades.reduce((acc, grade) => {
    const month = new Date(grade.test_date).toLocaleDateString('nl-NL', { month: 'short', year: '2-digit' });
    if (!acc[month]) {
      acc[month] = { month, grades: [], total: 0, count: 0 };
    }
    acc[month].grades.push(grade);
    acc[month].total += grade.grade * grade.weight;
    acc[month].count += grade.weight;
    return acc;
  }, {} as Record<string, any>);

  const monthlyChartData = Object.values(monthlyData).map((data: any) => ({
    month: data.month,
    average: data.total / data.count
  })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Grade distribution
  const gradeDistribution = Array.from({ length: 10 }, (_, i) => i + 1).map(grade => ({
    grade: grade.toString(),
    count: grades.filter(g => Math.round(g.grade) === grade).length
  }));

  // All grades timeline
  const timelineData = grades
    .sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime())
    .map((grade, index) => ({
      index: index + 1,
      grade: grade.grade,
      date: new Date(grade.test_date).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' }),
      subject: subjects.find(s => s.id === grade.subject_id)?.name || 'Onbekend'
    }));

  const chartConfig = {
    grade: {
      label: "Cijfer",
      color: "hsl(var(--primary))",
    },
    average: {
      label: "Gemiddelde",
      color: "hsl(var(--primary))",
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
              <div className="text-sm text-muted-foreground">Totaal Gemiddelde</div>
            </div>
            <div className="text-2xl font-bold">{overallAverage.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <div className="text-sm text-muted-foreground">Hoogste Cijfer</div>
            </div>
            <div className="text-2xl font-bold text-success">{highest}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <div className="text-sm text-muted-foreground">Laagste Cijfer</div>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All Grades Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Al je Cijfers</CardTitle>
            <CardDescription>Chronologisch overzicht van alle cijfers</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 10]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="grade" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Average */}
        <Card>
          <CardHeader>
            <CardTitle>Maandelijks Gemiddelde</CardTitle>
            <CardDescription>Gemiddelde per maand</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[1, 10]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="average" fill="hsl(var(--primary))" />
              </BarChart>
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
                <Bar dataKey="count" fill="hsl(var(--secondary))" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subject Averages */}
        <Card>
          <CardHeader>
            <CardTitle>Gemiddeldes per Vak</CardTitle>
            <CardDescription>Vergelijking tussen vakken</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={subjectAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[1, 10]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="average" fill="hsl(var(--warning))" />
                {/* Reference line at 5.5 */}
                <Line y={5.5} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};