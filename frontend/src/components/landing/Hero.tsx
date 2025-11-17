import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StudentProfile {
  first_name: string | null;
  last_name: string | null;
}

export const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tutoringCount, setTutoringCount] = useState(0);
  const [techCount, setTechCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);

  useEffect(() => {
    fetchCategoryCounts();
    fetchStudentCount();
    fetchStudentProfiles();
  }, []);

  const fetchCategoryCounts = async () => {
    try {
      // Fetch all active services and count by category
      const { data: services, error } = await supabase
        .from('services')
        .select('category')
        .eq('is_active', true);
      
      if (error) throw error;
      
      if (services) {
        const tutoring = services.filter(s => s.category === 'tutoring').length;
        const tech = services.filter(s => s.category === 'tech_dev').length;
        setTutoringCount(tutoring);
        setTechCount(tech);
      }
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  };

  const fetchStudentCount = async () => {
    try {
      // Fetch count of all profiles (students/users)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id');
      
      if (error) throw error;
      
      if (profiles) {
        setStudentCount(profiles.length);
      }
    } catch (error) {
      console.error('Error fetching student count:', error);
    }
  };

  const fetchStudentProfiles = async () => {
    try {
      // Fetch first 4 profiles with names for avatar initials
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .limit(4);
      
      if (error) throw error;
      
      if (profiles) {
        setStudentProfiles(profiles);
      }
    } catch (error) {
      console.error('Error fetching student profiles:', error);
    }
  };

  const getInitials = (profile: StudentProfile): string => {
    const first = profile.first_name?.charAt(0).toUpperCase() || '';
    const last = profile.last_name?.charAt(0).toUpperCase() || '';
    
    if (first && last) {
      return `${first}${last}`;
    } else if (first) {
      return first;
    } else if (last) {
      return last;
    }
    return '?';
  };

  const handleGetStarted = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/services');
    }
  };

  const handleBrowseServices = () => {
    navigate('/services');
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient with pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 -z-10">
        <div
          className="absolute inset-0 opacity-10"
          style={{ 
            backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"24\" height=\"24\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Ctext x=\"50%25\" y=\"50%25\" font-size=\"20\" text-anchor=\"middle\" dominant-baseline=\"middle\" fill=\"%23000\" opacity=\"0.1\"%3E+%3C/text%3E%3C/svg%3E')", 
            backgroundSize: "24px" 
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-6">
            <Badge className="px-3 py-1 text-sm mb-2">Student-Powered Marketplace</Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Your Campus, Your Hustle, Your Village
        </h1>
            
            <p className="text-xl text-muted-foreground max-w-[600px]">
              Connect with talented students offering services on your campus. From tutoring to web development, find
              the help you need from your peers.
        </p>
        
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={handleGetStarted}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={handleBrowseServices}>
                Browse Services
              </Button>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {studentProfiles.length > 0 ? (
                  studentProfiles.map((profile, i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background overflow-hidden bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                      {getInitials(profile)}
                    </div>
                  ))
                ) : (
                  // Fallback while loading
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background overflow-hidden bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                      ?
                    </div>
                  ))
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{studentCount > 0 ? `${studentCount}+` : '500+'}</span> students already using Hustle Village
              </p>
            </div>
          </div>

          <div className="relative h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-xl">
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-6xl mb-4">🎓</div>
                <div className="text-sm">Students Collaborating</div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute -bottom-6 -left-6 w-64 bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-muted">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl">
                  🎓
                </div>
                <div>
                  <p className="font-medium">Tutoring Services</p>
                  <p className="text-xs text-muted-foreground">{tutoringCount} available {tutoringCount === 1 ? 'tutor' : 'tutors'}</p>
                </div>
          </div>
        </div>

            <div className="absolute top-10 -right-6 w-64 bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-muted">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl">
                  💻
                </div>
                <div>
                  <p className="font-medium">Tech Services</p>
                  <p className="text-xs text-muted-foreground">{techCount} available {techCount === 1 ? 'developer' : 'developers'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
