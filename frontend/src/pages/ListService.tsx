import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Navbar } from '@/components/landing/Navbar';
import { useCategories } from '@/hooks/useCategories';

const ListService = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [defaultDeliveryTime, setDefaultDeliveryTime] = useState('');
  const [expressPrice, setExpressPrice] = useState('');
  const [expressDeliveryTime, setExpressDeliveryTime] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to list a service');
      return;
    }

    if (!title || !description || !category || !defaultPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create service using backend API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/sellers/create-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
        title,
        description,
          category,
          default_price: parseFloat(defaultPrice) || null,
          default_delivery_time: defaultDeliveryTime || null,
          express_price: expressPrice ? parseFloat(expressPrice) : null,
          express_delivery_time: expressDeliveryTime || null,
          portfolio: portfolio || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || 'Failed to create service');
      }

      toast.success('Service listed successfully!');
      navigate('/my-services');
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast.error(error.message || 'Failed to list service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">List a New Service</CardTitle>
            <CardDescription>
              Share your skills and start earning on Hustle Village
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Professional Math Tutoring"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your service in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                />
              </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory} required disabled={categoriesLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.slug}>
                        {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-price">Default Price (GHS) *</Label>
                  <Input
                    id="default-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-delivery-time">Default Delivery Time</Label>
                  <Input
                    id="default-delivery-time"
                    placeholder="e.g., 3-5 days"
                    value={defaultDeliveryTime}
                    onChange={(e) => setDefaultDeliveryTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="express-price">Express Price (GHS) - Optional</Label>
                <Input
                    id="express-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                    value={expressPrice}
                    onChange={(e) => setExpressPrice(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="express-delivery-time">Express Delivery Time</Label>
                  <Input
                    id="express-delivery-time"
                    placeholder="e.g., 1-2 days"
                    value={expressDeliveryTime}
                    onChange={(e) => setExpressDeliveryTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio/Work Samples *</Label>
                <Textarea
                  id="portfolio"
                  placeholder="Describe your previous work, include links, or paste portfolio content..."
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'List Service'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListService;
