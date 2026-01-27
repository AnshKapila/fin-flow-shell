import { User, Mail, Calendar, LogOut, ChevronRight, Bell, Shield, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ListCard } from "@/components/ui/list-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const settingsItems = [
    { icon: Bell, label: "Notifications", sublabel: "Manage notification preferences" },
    { icon: Shield, label: "Privacy & Security", sublabel: "Account security settings" },
    { icon: Palette, label: "Appearance", sublabel: "Theme and display options" },
  ];

  return (
    <div className="animate-fade-in pb-24">
      <PageHeader title="Profile" showBack />
      
      <div className="px-4 space-y-6">
        {/* User Info Card */}
        <ListCard className="text-center py-8">
          <div className="flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-card-blue mb-4">
              <User className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {user?.email?.split("@")[0] || "User"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </div>
        </ListCard>

        {/* Account Details */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Account Details
          </h3>
          <ListCard className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium text-foreground">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                    : "—"}
                </p>
              </div>
            </div>
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
