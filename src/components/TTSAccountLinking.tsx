import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link, CheckCircle, AlertCircle } from "lucide-react";

interface TTSAccountLink {
  id: string;
  tts_username: string;
  tts_email: string;
  sync_status: string;
  linked_at: string;
  last_sync_at: string;
}

export const TTSAccountLinking = () => {
  const [accountLink, setAccountLink] = useState<TTSAccountLink | null>(null);
  const [ttsUsername, setTtsUsername] = useState("");
  const [ttsEmail, setTtsEmail] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccountLink();
  }, []);

  const fetchAccountLink = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tts_account_links')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching TTS account link:', error);
        return;
      }

      setAccountLink(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    if (!ttsUsername.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter your TTS username",
        variant: "destructive",
      });
      return;
    }

    setIsLinking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('tts_account_links')
        .upsert({
          user_id: user.id,
          tts_username: ttsUsername.trim(),
          tts_email: ttsEmail.trim() || null,
          sync_status: 'pending'
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Account Linked",
        description: "Your TTS account has been linked successfully",
      });

      // Refresh the account link data
      await fetchAccountLink();
      
      // Clear form
      setTtsUsername("");
      setTtsEmail("");
    } catch (error) {
      console.error('Error linking account:', error);
      toast({
        title: "Error",
        description: "Failed to link TTS account",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkAccount = async () => {
    if (!accountLink) return;

    try {
      const { error } = await supabase
        .from('tts_account_links')
        .delete()
        .eq('id', accountLink.id);

      if (error) throw error;

      setAccountLink(null);
      toast({
        title: "Account Unlinked",
        description: "Your TTS account has been unlinked",
      });
    } catch (error) {
      console.error('Error unlinking account:', error);
      toast({
        title: "Error",
        description: "Failed to unlink TTS account",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'disabled':
        return <Badge variant="outline">Disabled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="w-5 h-5" />
          Training The Street Account
        </CardTitle>
        <CardDescription>
          Link your TTS account to automatically track your progress in UCIA modules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {accountLink ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-sm font-medium">TTS Username</Label>
                <p className="text-sm text-muted-foreground">{accountLink.tts_username}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  {getStatusBadge(accountLink.sync_status)}
                </div>
              </div>
              {accountLink.tts_email && (
                <div>
                  <Label className="text-sm font-medium">TTS Email</Label>
                  <p className="text-sm text-muted-foreground">{accountLink.tts_email}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Linked At</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(accountLink.linked_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnlinkAccount}
              >
                Unlink Account
              </Button>
              {accountLink.sync_status === 'failed' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => fetchAccountLink()}
                >
                  Retry Sync
                </Button>
              )}
            </div>

            {accountLink.sync_status === 'pending' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Account Linking in Progress</strong><br />
                  We're working on connecting to your TTS account. This may take a few minutes to activate.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="tts-username">TTS Username *</Label>
                <Input
                  id="tts-username"
                  placeholder="Enter your Training The Street username"
                  value={ttsUsername}
                  onChange={(e) => setTtsUsername(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tts-email">TTS Email (Optional)</Label>
                <Input
                  id="tts-email"
                  type="email"
                  placeholder="Enter your TTS email for verification"
                  value={ttsEmail}
                  onChange={(e) => setTtsEmail(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleLinkAccount}
              disabled={isLinking || !ttsUsername.trim()}
              className="w-full"
            >
              {isLinking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Linking Account...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  Link TTS Account
                </>
              )}
            </Button>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>How it works:</strong> Once linked, we'll attempt to sync your progress from Training The Street. 
                Currently, this requires manual activation by our administrators due to TTS platform limitations.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};