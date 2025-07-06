import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signUp = async () => {
    if (!email || !password) {
      toast({
        title: "Velden incompleet",
        description: "Vul alle velden in om je account aan te maken.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      toast({
        title: "Account aanmaken mislukt",
        description: error.message === "User already registered" 
          ? "Er bestaat al een account met dit e-mailadres." 
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account aangemaakt!",
        description: "Check je e-mail voor de bevestigingslink.",
      });
    }
    setIsLoading(false);
  };

  const signIn = async () => {
    if (!email || !password) {
      toast({
        title: "Velden incompleet",
        description: "Vul je e-mailadres en wachtwoord in.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Inloggen mislukt",
        description: "Controleer je e-mailadres en wachtwoord.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light to-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Cijfr</h1>
          <p className="text-muted-foreground">Je slimme cijferbeheertool</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Welkom</CardTitle>
            <CardDescription>
              Log in of maak een account aan om je cijfers te beheren
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Inloggen</TabsTrigger>
                <TabsTrigger value="signup">Account aanmaken</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mailadres</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="je@email.nl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Wachtwoord</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={signIn} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Bezig met inloggen..." : "Inloggen"}
                </Button>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup">E-mailadres</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="je@email.nl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Wachtwoord</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="Minimaal 6 karakters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={signUp} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Account aanmaken..." : "Account aanmaken"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;