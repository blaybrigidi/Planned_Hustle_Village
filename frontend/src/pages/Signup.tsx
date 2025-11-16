import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  { value: 'food_baking', label: 'Food & Baking' },
  { value: 'design_creative', label: 'Design & Creative' },
  { value: 'tutoring', label: 'Tutoring' },
  { value: 'beauty_hair', label: 'Beauty & Hair' },
  { value: 'events_music', label: 'Events & Music' },
  { value: 'tech_dev', label: 'Tech & Development' },
];

const PRICING_TYPES = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'negotiable', label: 'Negotiable' },
];

const Signup = () => {
  // Step 1: Basic info
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userType, setUserType] = useState<'buyer' | 'seller' | 'both'>('buyer');
  
  // Step 2: Service info (only for sellers)
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [pricingType, setPricingType] = useState('fixed');
  
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !firstName || !lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    // If buyer, proceed to send OTP directly
    if (userType === 'buyer') {
      handleFinalSubmit();
    } else {
      // If seller, go to step 2 to collect service info
      setStep(2);
    }
  };

  const handleFinalSubmit = async () => {
    // Validate service info if seller
    if (userType === 'seller' || userType === 'both') {
      if (!serviceTitle || !serviceDescription || !serviceCategory || !servicePrice) {
        toast.error('Please fill in all service details');
        return;
      }

      const price = parseFloat(servicePrice);
      if (isNaN(price) || price < 0) {
        toast.error('Please enter a valid price');
        return;
      }
    }

    setLoading(true);

    // Store signup data in localStorage to use after email verification
    const signupData: any = {
      email,
      firstName,
      lastName,
      phoneNumber,
      userType
    };

    // Add service data if seller
    if (userType === 'seller' || userType === 'both') {
      signupData.service = {
        title: serviceTitle,
        description: serviceDescription,
        category: serviceCategory,
        price: parseFloat(servicePrice),
        pricing_type: pricingType
      };
    }

    localStorage.setItem('signupData', JSON.stringify(signupData));

    const { error } = await signIn(email);

    setLoading(false);

    if (error) {
      toast.error(error.message || 'Failed to send verification email');
      return;
    }

    navigate('/verify-email');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {step === 1 ? 'Create an account' : 'Tell us about your service'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 1 
              ? 'Join Hustle Village with your email'
              : 'Help buyers find you by providing service details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+233 XX XXX XXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <Label>I want to:</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="buyer"
                      checked={userType === 'buyer'}
                      onChange={(e) => setUserType(e.target.value as 'buyer')}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm">Find services (Buyer)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="seller"
                      checked={userType === 'seller'}
                      onChange={(e) => setUserType(e.target.value as 'seller')}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm">Offer services (Hustler)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="both"
                      checked={userType === 'both'}
                      onChange={(e) => setUserType(e.target.value as 'both')}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm">Both</span>
                  </label>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {userType === 'buyer' ? 'Sign up with Email' : 'Continue to Service Details'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Basic Info
              </Button>
              <form onSubmit={(e) => { e.preventDefault(); handleFinalSubmit(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceTitle">Service Title *</Label>
                  <Input
                    id="serviceTitle"
                    type="text"
                    placeholder="e.g., Professional Hair Braiding"
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceDescription">Description *</Label>
                  <Textarea
                    id="serviceDescription"
                    placeholder="Describe your service in detail..."
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceCategory">Category *</Label>
                  <Select value={serviceCategory} onValueChange={setServiceCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="servicePrice">Price (GHS) *</Label>
                    <Input
                      id="servicePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={servicePrice}
                      onChange={(e) => setServicePrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricingType">Pricing Type *</Label>
                    <Select value={pricingType} onValueChange={setPricingType} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICING_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Sign up with Email'}
                </Button>
              </form>
            </div>
          )}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => navigate('/login')}
            >
              Log in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
