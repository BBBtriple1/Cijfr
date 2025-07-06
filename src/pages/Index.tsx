import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, BookOpen, Calculator } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary-light">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-primary mb-6">
            Cijfr
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            De slimste manier om je schoolcijfers te beheren, analyseren en voorspellen
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Begin Nu
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/auth")}>
              Inloggen
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Overzichtelijk</h3>
              <p className="text-muted-foreground">Alle cijfers per vak in één duidelijk overzicht</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Slim Analyseren</h3>
              <p className="text-muted-foreground">Automatische berekening van gemiddeldes en voortgang</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-8 w-8 text-warning-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Voorspellen</h3>
              <p className="text-muted-foreground">Bereken wat je moet halen voor je streefcijfer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
