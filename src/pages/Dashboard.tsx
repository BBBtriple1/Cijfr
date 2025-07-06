import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, TrendingUp, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddGradeDialog } from "@/components/AddGradeDialog";
import { AddSubjectDialog } from "@/components/AddSubjectDialog";
import { GradeCalculator } from "@/components/GradeCalculator";
import { SubjectCard } from "@/components/SubjectCard";
import { DashboardStats } from "@/components/DashboardStats";

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

interface Profile {
  display_name: string | null;
  school_name: string | null;
  grade_level: string | null;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        fetchData(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchData(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileData) setProfile(profileData);

      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (subjectsData) setSubjects(subjectsData);

      // Fetch grades
      const { data: gradesData } = await supabase
        .from('grades')
        .select('*')
        .eq('user_id', userId)
        .order('test_date', { ascending: false });
      
      if (gradesData) setGrades(gradesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const calculateSubjectAverage = (subjectId: string) => {
    const subjectGrades = grades.filter(g => g.subject_id === subjectId);
    if (subjectGrades.length === 0) return null;
    
    const totalWeightedPoints = subjectGrades.reduce((sum, grade) => sum + (grade.grade * grade.weight), 0);
    const totalWeight = subjectGrades.reduce((sum, grade) => sum + grade.weight, 0);
    
    return totalWeightedPoints / totalWeight;
  };

  const calculateOverallAverage = () => {
    const averages = subjects.map(subject => calculateSubjectAverage(subject.id)).filter(avg => avg !== null);
    if (averages.length === 0) return null;
    return averages.reduce((sum, avg) => sum + avg!, 0) / averages.length;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Cijfr</h1>
            <p className="text-sm text-muted-foreground">
              Welkom terug, {profile?.display_name || user?.email?.split('@')[0]}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowAddSubject(true)}>
              <BookOpen className="h-4 w-4" />
              Nieuw Vak
            </Button>
            <Button onClick={() => setShowAddGrade(true)}>
              <Plus className="h-4 w-4" />
              Nieuw Cijfer
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Gemiddelde</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateOverallAverage()?.toFixed(1) || '--'}
              </div>
              <p className="text-xs text-muted-foreground">
                Over alle vakken
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aantal Vakken</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.length}</div>
              <p className="text-xs text-muted-foreground">
                Actieve vakken
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Cijfers</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{grades.length}</div>
              <p className="text-xs text-muted-foreground">
                Ingevoerde cijfers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Grid */}
        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                grades={grades.filter(g => g.subject_id === subject.id)}
                onAddGrade={() => {
                  setSelectedSubject(subject.id);
                  setShowAddGrade(true);
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>Geen vakken gevonden</CardTitle>
              <CardDescription>
                Voeg je eerste vak toe om te beginnen met het bijhouden van je cijfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowAddSubject(true)} variant="hero">
                <BookOpen className="h-4 w-4" />
                Voeg je eerste vak toe
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {subjects.length > 0 && grades.length > 0 && (
          <div className="mt-8">
            <DashboardStats subjects={subjects} grades={grades} />
          </div>
        )}

        {/* Grade Calculator */}
        {subjects.length > 0 && (
          <div className="mt-8">
            <GradeCalculator subjects={subjects} grades={grades} />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddGradeDialog
        open={showAddGrade}
        onOpenChange={setShowAddGrade}
        subjects={subjects}
        selectedSubject={selectedSubject}
        onGradeAdded={() => {
          setShowAddGrade(false);
          setSelectedSubject(null);
          if (user) fetchData(user.id);
        }}
      />
      
      <AddSubjectDialog
        open={showAddSubject}
        onOpenChange={setShowAddSubject}
        onSubjectAdded={() => {
          setShowAddSubject(false);
          if (user) fetchData(user.id);
        }}
      />
    </div>
  );
};

export default Dashboard;