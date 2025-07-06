import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
  color: string;
  target_grade: number | null;
}

interface AddGradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  selectedSubject?: string | null;
  onGradeAdded: () => void;
}

const testTypes = ['SO', 'PW', 'Toets', 'Mondeling', 'Presentatie', 'Praktijk', 'Overig'];

export const AddGradeDialog = ({ 
  open, 
  onOpenChange, 
  subjects, 
  selectedSubject,
  onGradeAdded 
}: AddGradeDialogProps) => {
  const [subjectId, setSubjectId] = useState(selectedSubject || '');
  const [grade, setGrade] = useState('');
  const [weight, setWeight] = useState('1');
  const [testType, setTestType] = useState('SO');
  const [description, setDescription] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setSubjectId(selectedSubject || '');
    setGrade('');
    setWeight('1');
    setTestType('SO');
    setDescription('');
    setTestDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subjectId || !grade) {
      toast({
        title: "Velden incompleet",
        description: "Selecteer een vak en vul een cijfer in.",
        variant: "destructive",
      });
      return;
    }

    const gradeNum = parseFloat(grade);
    if (gradeNum < 1 || gradeNum > 10) {
      toast({
        title: "Ongeldig cijfer",
        description: "Cijfer moet tussen 1 en 10 liggen.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Niet ingelogd');

      const { error } = await supabase
        .from('grades')
        .insert({
          user_id: user.id,
          subject_id: subjectId,
          grade: gradeNum,
          weight: parseFloat(weight),
          test_type: testType,
          description: description || null,
          test_date: testDate,
        });

      if (error) throw error;

      toast({
        title: "Cijfer toegevoegd!",
        description: `Cijfer ${gradeNum} is toegevoegd.`,
      });

      resetForm();
      onGradeAdded();
    } catch (error) {
      console.error('Error adding grade:', error);
      toast({
        title: "Fout bij toevoegen",
        description: "Er is een fout opgetreden bij het toevoegen van het cijfer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nieuw Cijfer Toevoegen</DialogTitle>
          <DialogDescription>
            Voeg een nieuw cijfer toe aan je overzicht
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Vak</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Cijfer (1-10)</Label>
              <Input
                id="grade"
                type="number"
                min="1"
                max="10"
                step="0.1"
                placeholder="7.5"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weging</Label>
              <Input
                id="weight"
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                placeholder="1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-type">Type</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {testTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschrijving (optioneel)</Label>
            <Textarea
              id="description"
              placeholder="Hoofdstuk 3 - Algebra"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Toevoegen..." : "Cijfer Toevoegen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};