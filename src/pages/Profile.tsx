import { useState, useEffect } from "react";
import { User, Mail, Phone, LogOut, ChevronRight, Bell, Shield, Palette, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ListCard } from "@/components/ui/list-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, isLoading, isSaving, updateProfile } = useProfile();

  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setPhoneNumber(profile.phone_number || "");
    }
  }, [profile]);

  // Track changes
  useEffect(() => {
    const originalUsername = profile?.username || "";
    const originalPhone = profile?.phone_number || "";
    setHasChanges(username !== originalUsername || phoneNumber !== originalPhone);
  }, [username, phoneNumber, profile]);

  const handleSave = async () => {
    const success = await updateProfile({
      username: username.trim() || null,
      phone_number: phoneNumber.trim() || null,
    });
    if (success) {
      setHasChanges(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const settingsItems = [
    { icon: Bell, label: "Notifications", sublabel: "Manage notification preferences" },
    { icon: Shield, label: "Privacy & Security", sublabel: "Account security settings" },
    { icon: Palette, label: "Appearance", sublabel: "Theme and display options" },
  ];

  if (isLoading) {
    return (
      <div className="animate-fade-in pb-24">
        <PageHeader title="Profile" showBack />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-24">
      <PageHeader title="Profile" showBack />
      
      <div className="px-4 space-y-6">
        {/* User Avatar Card */}
        <ListCard className="text-center py-8">
          <div className="flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-card-blue mb-4">
              <User className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {username.trim() || user?.email?.split("@")[0] || "User"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </div>
        </ListCard>

        {/* Editable Profile Fields */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Profile Information
          </h3>
          <ListCard className="space-y-5 py-5">
            {/* Username - Editable */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-muted-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your display name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                This is how you'll appear in the app
              </p>
            </div>

            {/* Email - Read Only */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Phone Number - Editable */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number (optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-background"
              />
            </div>

            {/* Save Button */}
            {hasChanges && (
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            )}
          </ListCard>
        </section>

        {/* App Preferences */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            App Preferences
          </h3>
          <div className="space-y-2">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              return (
                <ListCard 
                  key={item.label}
                  onClick={() => console.log(`Navigate to ${item.label}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.sublabel}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </ListCard>
              );
            })}
          </div>
        </section>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}