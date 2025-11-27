import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("english");
  const [theme, setTheme] = useState("light");
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    const { error } = await supabase
      .from("settings")
      .update({ language, theme, backup_enabled: backupEnabled })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Setup failed: " + error.message);
    } else {
      toast.success("Setup complete!");
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-primary rounded-full p-3 w-fit">
            <Store className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>Let's set up your store preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Language</Label>
            <RadioGroup value={language} onValueChange={setLanguage}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="english" id="english" />
                <Label htmlFor="english" className="font-normal cursor-pointer">English</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hindi" id="hindi" />
                <Label htmlFor="hindi" className="font-normal cursor-pointer">हिंदी (Hindi)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kannada" id="kannada" />
                <Label htmlFor="kannada" className="font-normal cursor-pointer">ಕನ್ನಡ (Kannada)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="marathi" id="marathi" />
                <Label htmlFor="marathi" className="font-normal cursor-pointer">मराठी (Marathi)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tamil" id="tamil" />
                <Label htmlFor="tamil" className="font-normal cursor-pointer">தமிழ் (Tamil)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="telugu" id="telugu" />
                <Label htmlFor="telugu" className="font-normal cursor-pointer">తెలుగు (Telugu)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Theme</Label>
            <RadioGroup value={theme} onValueChange={setTheme}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="font-normal cursor-pointer">Light Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="font-normal cursor-pointer">Dark Mode</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Cloud Backup</Label>
              <p className="text-sm text-muted-foreground">
                Sync your data across devices
              </p>
            </div>
            <Switch
              checked={backupEnabled}
              onCheckedChange={setBackupEnabled}
            />
          </div>

          <Button onClick={handleComplete} className="w-full" size="lg" disabled={loading}>
            {loading ? "Setting up..." : "Get Started"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
