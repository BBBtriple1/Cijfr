import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Target } from "lucide-react";

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

interface GradeCalculatorProps {
  subjects: Subject[];
  grades: Grade[];
}

export const GradeCalculator = ({ subjects, grades }: GradeCalculatorProps) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [targetGrade, setTargetGrade] = useState('');
  const [nextTestWeight, setNextTestWeight] = useState('1');
  const [result, setResult] = useState<number | null>(null);

  const calculateSubjectAverage = (subjectId: string) => {
    const subjectGrades = grades.filter(g => g.subject_id === subjectId);
    if (subjectGrades.length === 0) return null;
    
    const totalWeightedPoints = subjectGrades.reduce((sum, grade) => sum + (grade.grade * grade.weight), 0);
    const totalWeight = subjectGrades.reduce((sum, grade) => sum + grade.weight, 0);
    
    return totalWeightedPoints / totalWeight;
  };

  const calculateRequiredGrade = () => {
    if (!selectedSubjectId || !targetGrade || !nextTestWeight) return;

    const target = parseFloat(targetGrade);
    const weight = parseFloat(nextTestWeight);
    const currentAverage = calculateSubjectAverage(selectedSubjectId);
    const currentGrades = grades.filter(g => g.subject_id === selectedSubjectId);
    
    if (currentGrades.length === 0) {
      setResult(target);
      return;
    }

    const currentTotalWeightedPoints = currentGrades.reduce((sum, grade) => sum + (grade.grade * grade.weight), 0);
    const currentTotalWeight = currentGrades.reduce((sum, grade) => sum + grade.weight, 0);

    // Formula: (current_total + required_grade * weight) / (current_weight + weight) = target
    // Solving for required_grade: required_grade = (target * (current_weight + weight) - current_total) / weight
    const requiredGrade = (target * (currentTotalWeight + weight) - currentTotalWeightedPoints) / weight;
    
    setResult(Math.round(requiredGrade * 10) / 10);
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const currentAverage = selectedSubjectId ? calculateSubjectAverage(selectedSubjectId) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Cijfer Calculator</CardTitle>
            <CardDescription>
              Bereken wat je moet halen om je streefcijfer te behalen
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="calc-subject">Vak</Label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer een vak" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: subject.color }}
                      />
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-grade">Gewenst gemiddelde</Label>
            <Input
              id="target-grade"
              type="number"
              min="1"
              max="10"
              step="0.1"
              placeholder="7.5"
              value={targetGrade}
              onChange={(e) => setTargetGrade(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="next-weight">Weging volgende toets</Label>
            <Input
              id="next-weight"
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              placeholder="1"
              value={nextTestWeight}
              onChange={(e) => setNextTestWeight(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={calculateRequiredGrade} className="w-full md:w-auto">
          <Target className="h-4 w-4" />
          Bereken Benodigde Cijfer
        </Button>

        {selectedSubject && currentAverage && (
          <div className="p-4 bg-accent rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Huidig gemiddelde {selectedSubject.name}:</span>
              <span className="font-medium">{currentAverage.toFixed(1)}</span>
            </div>
            
            {result !== null && (
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Je moet halen:</span>
                  <div className="text-right">
                    <span className={`text-xl font-bold ${
                      result <= 10 ? (result >= 5.5 ? 'text-success' : 'text-warning') : 'text-destructive'
                    }`}>
                      {result.toFixed(1)}
                    </span>
                    {result > 10 && (
                      <p className="text-xs text-destructive">Niet haalbaar!</p>
                    )}
                    {result < 1 && (
                      <p className="text-xs text-success">Al gehaald!</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};