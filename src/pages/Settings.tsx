import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/Layout";

const Settings = () => {
  const [settings, setSettings] = useState({
    language: "english",
    theme: "light",
    backup_enabled: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setSettings({
        language: data.language,
        theme: data.theme,
        backup_enabled: data.backup_enabled,
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("settings")
      .update(settings)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved successfully!");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Language</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={settings.theme} onValueChange={(value) => setSettings({ ...settings, theme: value })}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="font-normal cursor-pointer">Light Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="font-normal cursor-pointer">Dark Mode</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup & Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Cloud Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync your data to the cloud
                </p>
              </div>
              <Switch
                checked={settings.backup_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, backup_enabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full" size="lg" disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </Layout>
  );
};

export default Settings;
