import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AddSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubjectAdded: () => void;
}

const subjectColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export const AddSubjectDialog = ({ open, onOpenChange, onSubjectAdded }: AddSubjectDialogProps) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(subjectColors[0]);
  const [targetGrade, setTargetGrade] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setName('');
    setSelectedColor(subjectColors[0]);
    setTargetGrade('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Veld incompleet",
        description: "Vul een vaknaam in.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Niet ingelogd');

      const { error } = await supabase
        .from('subjects')
        .insert({
          user_id: user.id,
          name: name.trim(),
          color: selectedColor,
          target_grade: targetGrade ? parseFloat(targetGrade) : null,
        });

      if (error) throw error;

      toast({
        title: "Vak toegevoegd!",
        description: `${name} is toegevoegd aan je vakken.`,
      });

      resetForm();
      onSubjectAdded();
    } catch (error) {
      console.error('Error adding subject:', error);
      toast({
        title: "Fout bij toevoegen",
        description: "Er is een fout opgetreden bij het toevoegen van het vak.",
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
          <DialogTitle>Nieuw Vak Toevoegen</DialogTitle>
          <DialogDescription>
            Voeg een nieuw vak toe om cijfers bij te houden
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Vaknaam</Label>
            <Input
              id="name"
              type="text"
              placeholder="Bijvoorbeeld: Wiskunde"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Kleur</Label>
            <div className="flex flex-wrap gap-2">
              {subjectColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-primary border-4' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Streefcijfer (optioneel)</Label>
            <Input
              id="target"
              type="number"
              min="1"
              max="10"
              step="0.1"
              placeholder="7.5"
              value={targetGrade}
              onChange={(e) => setTargetGrade(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Toevoegen..." : "Vak Toevoegen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};