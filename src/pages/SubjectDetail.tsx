import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, TrendingUp, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddGradeDialog } from "@/components/AddGradeDialog";
import { SubjectStats } from "@/components/SubjectStats";

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

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

  useEffect(() => {
    if (subjectId) {
      fetchSubjectData();
    }
  }, [subjectId]);

  const fetchSubjectData = async () => {
    try {
      // Fetch subject
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();

      if (subjectError) throw subjectError;
      setSubject(subjectData);

      // Fetch grades for this subject
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .eq('subject_id', subjectId)
        .order('test_date', { ascending: false });

      if (gradesError) throw gradesError;
      setGrades(gradesData || []);
    } catch (error) {
      console.error('Error fetching subject data:', error);
      toast({
        title: "Fout",
        description: "Kon vakgegevens niet laden",
        variant: "destructive",
      });
    }
  };

  const deleteGrade = async (gradeId: string) => {
    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', gradeId);

      if (error) throw error;
      
      setGrades(grades.filter(g => g.id !== gradeId));
      toast({
        title: "Succes",
        description: "Cijfer verwijderd",
      });
    } catch (error) {
      console.error('Error deleting grade:', error);
      toast({
        title: "Fout",
        description: "Kon cijfer niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const calculateAverage = () => {
    if (grades.length === 0) return null;
    
    const totalWeightedPoints = grades.reduce((sum, grade) => sum + (grade.grade * grade.weight), 0);
    const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
    
    return totalWeightedPoints / totalWeight;
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 8) return 'text-success';
    if (grade >= 6.5) return 'text-primary';
    if (grade >= 5.5) return 'text-warning';
    return 'text-destructive';
  };

  if (!subject) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const average = calculateAverage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: subject.color }}
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{subject.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {grades.length} cijfer{grades.length !== 1 ? 's' : ''}
                  {average && ` • Gemiddelde: ${average.toFixed(1)}`}
                </p>
              </div>
            </div>
            {subject.target_grade && (
              <Badge variant="outline" className="ml-auto">
                <Target className="h-4 w-4 mr-1" />
                Doel: {subject.target_grade}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Statistics */}
        <SubjectStats grades={grades} subject={subject} />

        {/* Add Grade Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Cijfers</h2>
          <Button onClick={() => setShowAddGrade(true)}>
            <Plus className="h-4 w-4" />
            Nieuw Cijfer
          </Button>
        </div>

        {/* Grades List */}
        {grades.length > 0 ? (
          <div className="grid gap-4">
            {grades.map((grade) => (
              <Card key={grade.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold ${getGradeColor(grade.grade)}`}>
                      {grade.grade}
                    </div>
                    <div>
                      <div className="font-medium">{grade.test_type}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(grade.test_date).toLocaleDateString('nl-NL')}
                        {grade.description && ` • ${grade.description}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Weging: {grade.weight}x
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteGrade(grade.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Geen cijfers gevonden</CardTitle>
              <CardDescription>
                Voeg je eerste cijfer toe voor dit vak
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Add Grade Dialog */}
      <AddGradeDialog
        open={showAddGrade}
        onOpenChange={setShowAddGrade}
        subjects={[subject]}
        selectedSubject={subject.id}
        onGradeAdded={() => {
          setShowAddGrade(false);
          fetchSubjectData();
        }}
      />
    </div>
  );
};

export default SubjectDetail;