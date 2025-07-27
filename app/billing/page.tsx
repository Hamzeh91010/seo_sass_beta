"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import ProtectedRoute from '@/components/layout/protected-route';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Check,
  Crown,
  CreditCard,
  Calendar,
  Download,
  ExternalLink,
  Zap,
  Users,
  BarChart3,
  Search,
  Link as LinkIcon,
  FileText,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data
const mockBillingHistory = [
  {
    id: 1,
    date: '2024-01-01',
    amount: 59.00,
    status: 'paid',
    plan: 'Growth',
    invoice: 'INV-2024-001',
  },
  {
    id: 2,
    date: '2023-12-01',
    amount: 59.00,
    status: 'paid',
    plan: 'Growth',
    invoice: 'INV-2023-012',
  },
  {
    id: 3,
    date: '2023-11-01',
    amount: 29.00,
    status: 'paid',
    plan: 'Starter',
    invoice: 'INV-2023-011',
  },
];

const plans = [
  {
    name: 'Starter',
    price: { monthly: 29, yearly: 290 },
    description: 'Perfect for small websites',
    features: [
      '1 Project',
      '300 Tracked Keywords',
      '10 SEO Audits/Month',
      'Google Tracking Only',
      'Basic Reports',
      'Email Support',
    ],
    limitations: ['No Backlink Analysis', 'No Team Collaboration', 'Limited History'],
    recommended: false,
  },
  {
    name: 'Growth',
    price: { monthly: 59, yearly: 590 },
    description: 'Great for growing businesses',
    features: [
      '8 Projects',
      '800 Tracked Keywords',
      '25 SEO Audits/Month',
      'Google + Bing Tracking',
      'Custom Reports',
      'Team Collaboration (3 members)',
      'Priority Support',
    ],
    limitations: ['Basic Backlink Analysis'],
    recommended: true,
  },
  {
    name: 'Pro Agency',
    price: { monthly: 149, yearly: 1490 },
    description: 'For agencies and large sites',
    features: [
      '30 Projects',
      '3,000 Tracked Keywords',
      '100 SEO Audits/Month',
      'All Search Engines',
      'White-label Reports',
      'Full Backlink Analysis',
      'Team Collaboration (10 members)',
      'API Access',
      'Priority Support',
    ],
    limitations: [],
    recommended: false,
  },
  {
    name: 'Enterprise',
    price: { monthly: 'Custom', yearly: 'Custom' },
    description: 'Custom solutions for enterprises',
    features: [
      'Unlimited Projects',
      '10,000+ Keywords',
      'Unlimited Audits',
      'All Features',
      'Custom Integrations',
      'Dedicated Support',
      'SLA Guarantee',
      'Training & Onboarding',
    ],
    limitations: [],
    recommended: false,
  },
];

export default function BillingPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const isRTL = i18n.language === 'ar';
  const currentPlan = user?.subscription?.plan || 'starter';

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    setShowUpgradeDialog(true);
  };

  const handleStripePayment = () => {
    // Mock Stripe integration
    toast.success('Redirecting to Stripe...');
    setShowUpgradeDialog(false);
  };

  const handleMyFatoorahPayment = () => {
    // Mock MyFatoorah integration
    toast.success('Redirecting to MyFatoorah...');
    setShowUpgradeDialog(false);
  };

  const handleContactSales = () => {
    toast.success('Contact form submitted! We\'ll be in touch soon.');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {t('billing.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription and billing information
            </p>
          </div>

          {/* Current Plan & Usage */}
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Crown className={`h-5 w-5 text-yellow-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('billing.currentPlan')}
                    </CardTitle>
                    <CardDescription>
                      {user?.subscription?.plan} Plan - {user?.subscription?.status}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    $59/month
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Features */}
                <div>
                  <h4 className="font-medium mb-3">Plan Features</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">8 Projects</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">800 Keywords</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">25 Audits/Month</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">3 Team Members</span>
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <div>
                  <h4 className="font-medium mb-3">{t('billing.usage')}</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Projects</span>
                        <span>5 / 8</span>
                      </div>
                      <Progress value={62} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Keywords</span>
                        <span>432 / 800</span>
                      </div>
                      <Progress value={54} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Audits This Month</span>
                        <span>12 / 25</span>
                      </div>
                      <Progress value={48} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleUpgrade('Pro Agency')}>
                    {t('billing.upgradeNow')}
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('billing.manageBilling')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Next Billing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('billing.nextBilling')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">$59.00</p>
                  <p className="text-sm text-muted-foreground">February 1, 2024</p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">•••• •••• •••• 4242</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('billing.updatePayment')}
                  </Button>
                </div>

                {user?.subscription?.status === 'trial' && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <Zap className="inline h-4 w-4 mr-1" />
                      Free trial ends in 45 days
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pricing Plans */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>
                Choose the plan that best fits your needs
              </CardDescription>
              
              {/* Billing Toggle */}
              <div className="flex items-center justify-center p-1 bg-muted rounded-lg w-fit">
                <Button
                  variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </Button>
                <Button
                  variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setBillingCycle('yearly')}
                >
                  Yearly
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Save 17%
                  </Badge>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-4">
                {plans.map((plan) => (
                  <Card key={plan.name} className={`relative ${plan.recommended ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                    {plan.recommended && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Recommended
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="pt-2">
                        <span className="text-3xl font-bold">
                          {typeof plan.price[billingCycle] === 'number' 
                            ? `$${plan.price[billingCycle]}`
                            : plan.price[billingCycle]
                          }
                        </span>
                        {typeof plan.price[billingCycle] === 'number' && (
                          <span className="text-muted-foreground">
                            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      {plan.limitations.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Not included:</p>
                          {plan.limitations.map((limitation, index) => (
                            <div key={index} className="flex items-center text-xs text-muted-foreground">
                              <span className="w-4 h-4 mr-2 flex-shrink-0">×</span>
                              <span>{limitation}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="pt-4">
                        {plan.name === 'Enterprise' ? (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={handleContactSales}
                          >
                            Contact Sales
                          </Button>
                        ) : currentPlan.toLowerCase() === plan.name.toLowerCase() ? (
                          <Button variant="outline" className="w-full" disabled>
                            Current Plan
                          </Button>
                        ) : (
                          <Button 
                            className="w-full"
                            variant={plan.recommended ? 'default' : 'outline'}
                            onClick={() => handleUpgrade(plan.name)}
                          >
                            {currentPlan === 'starter' ? 'Upgrade' : 'Switch Plan'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>{t('billing.billingHistory')}</CardTitle>
              <CardDescription>
                Your recent billing transactions and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBillingHistory.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.plan} Plan</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                        <Badge variant={transaction.status === 'paid' ? 'default' : 'destructive'}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Dialog */}
          <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Choose Payment Method</DialogTitle>
                <DialogDescription>
                  Select your preferred payment provider to upgrade to {selectedPlan}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <Button
                  onClick={handleStripePayment}
                  className="w-full h-12 justify-start"
                  variant="outline"
                >
                  <CreditCard className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Pay with Stripe</div>
                    <div className="text-xs text-muted-foreground">Credit/Debit Cards, Apple Pay, Google Pay</div>
                  </div>
                </Button>
                
                <Button
                  onClick={handleMyFatoorahPayment}
                  className="w-full h-12 justify-start"
                  variant="outline"
                >
                  <Shield className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Pay with MyFatoorah</div>
                    <div className="text-xs text-muted-foreground">KNET, Visa, Mastercard, Apple Pay</div>
                  </div>
                </Button>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  );
}