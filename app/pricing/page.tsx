"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Check,
  X,
  Crown,
  Zap,
  Users,
  BarChart3,
  Search,
  Link as LinkIcon,
  FileText,
  Shield,
  ArrowRight,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import PublicNavbar from '@/components/layout/public-navbar';
import Footer from '@/components/layout/footer';

export default function PricingPage() {
  const { t, i18n } = useTranslation();
  const [isYearly, setIsYearly] = useState(false);

  const isRTL = i18n.language === 'ar';

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      price: { monthly: 0, yearly: 0 },
      popular: false,
      features: [
        '1 Project',
        '10 Keywords',
        '1 Site Audit/month',
        'Basic Reporting',
        'Email Support',
      ],
      limitations: [
        'No Backlink Analysis',
        'No Team Members',
        'No Custom Reports',
        'No API Access',
      ],
      cta: 'Start Free',
      href: '/auth/register',
    },
    {
      name: 'Starter',
      description: 'Great for small businesses',
      price: { monthly: 29, yearly: 24 },
      popular: false,
      features: [
        '3 Projects',
        '100 Keywords',
        '5 Site Audits/month',
        'Backlink Analysis',
        'Custom Reports',
        'Email Support',
      ],
      limitations: [
        'No Team Members',
        'No White-label Reports',
        'No API Access',
      ],
      cta: 'Start Free Trial',
      href: '/auth/register',
    },
    {
      name: 'Growth',
      description: 'Perfect for growing agencies',
      price: { monthly: 79, yearly: 66 },
      popular: true,
      features: [
        '10 Projects',
        '500 Keywords',
        '25 Site Audits/month',
        'Advanced Backlink Analysis',
        'White-label Reports',
        '3 Team Members',
        'Priority Support',
      ],
      limitations: [
        'No API Access',
        'No Custom Integrations',
      ],
      cta: 'Start Free Trial',
      href: '/auth/register',
    },
    {
      name: 'Pro Agency',
      description: 'For established agencies',
      price: { monthly: 199, yearly: 166 },
      popular: false,
      features: [
        '50 Projects',
        '2,000 Keywords',
        '100 Site Audits/month',
        'Full Backlink Suite',
        'Advanced White-label',
        '10 Team Members',
        'API Access',
        'Custom Integrations',
        'Priority Support',
      ],
      limitations: [],
      cta: 'Start Free Trial',
      href: '/auth/register',
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      price: { monthly: 'Custom', yearly: 'Custom' },
      popular: false,
      features: [
        'Unlimited Projects',
        'Unlimited Keywords',
        'Unlimited Audits',
        'Full Platform Access',
        'Unlimited Team Members',
        'Custom Integrations',
        'Dedicated Support',
        'SLA Guarantee',
        'Custom Training',
      ],
      limitations: [],
      cta: 'Contact Sales',
      href: '/contact',
    },
  ];

  const features = [
    { name: 'Projects', free: '1', starter: '3', growth: '10', pro: '50', enterprise: 'Unlimited' },
    { name: 'Keywords', free: '10', starter: '100', growth: '500', pro: '2,000', enterprise: 'Unlimited' },
    { name: 'Site Audits/month', free: '1', starter: '5', growth: '25', pro: '100', enterprise: 'Unlimited' },
    { name: 'Team Members', free: '1', starter: '1', growth: '3', pro: '10', enterprise: 'Unlimited' },
    { name: 'Backlink Analysis', free: false, starter: true, growth: true, pro: true, enterprise: true },
    { name: 'Custom Reports', free: false, starter: true, growth: true, pro: true, enterprise: true },
    { name: 'White-label Reports', free: false, starter: false, growth: true, pro: true, enterprise: true },
    { name: 'API Access', free: false, starter: false, growth: false, pro: true, enterprise: true },
    { name: 'Priority Support', free: false, starter: false, growth: true, pro: true, enterprise: true },
    { name: 'Custom Integrations', free: false, starter: false, growth: false, pro: true, enterprise: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-8 max-w-3xl mx-auto">
            <Badge variant="outline" className="w-fit mx-auto">
              <Crown className="h-3 w-3 mr-1" />
              Pricing Plans
            </Badge>
            <h1 className="text-4xl font-bold lg:text-6xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Choose the perfect plan
              <br />
              <span className="text-primary">for your business</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Start with our free plan and upgrade as you grow. All plans include a 14-day free trial.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4">
              <Label htmlFor="billing-toggle" className={isYearly ? 'text-muted-foreground' : 'font-medium'}>
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <Label htmlFor="billing-toggle" className={isYearly ? 'font-medium' : 'text-muted-foreground'}>
                Yearly
                <Badge variant="secondary" className="ml-2">
                  Save 17%
                </Badge>
              </Label>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 -mt-10">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-5">
            {plans.map((plan, index) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-2xl scale-105' : 'shadow-lg'} border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">
                      {typeof plan.price[isYearly ? 'yearly' : 'monthly'] === 'number' 
                        ? `$${plan.price[isYearly ? 'yearly' : 'monthly']}`
                        : plan.price[isYearly ? 'yearly' : 'monthly']
                      }
                    </span>
                    {typeof plan.price[isYearly ? 'yearly' : 'monthly'] === 'number' && (
                      <span className="text-muted-foreground">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  {isYearly && typeof plan.price.monthly === 'number' && plan.price.monthly > 0 && (
                    <p className="text-sm text-muted-foreground">
                      ${plan.price.monthly}/month billed annually
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t space-y-3">
                      {plan.limitations.map((limitation, limitationIndex) => (
                        <div key={limitationIndex} className="flex items-center text-sm text-muted-foreground">
                          <X className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span>{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="pt-6">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href={plan.href}>
                        {plan.cta}
                        {plan.name !== 'Enterprise' && (
                          <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                        )}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold lg:text-4xl">
              Compare all features
            </h2>
            <p className="text-xl text-muted-foreground">
              See exactly what's included in each plan
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-6 font-semibold">Features</th>
                  <th className="text-center p-6 font-semibold">Free</th>
                  <th className="text-center p-6 font-semibold">Starter</th>
                  <th className="text-center p-6 font-semibold bg-primary/5">
                    Growth
                    <Badge variant="secondary" className="ml-2 text-xs">Popular</Badge>
                  </th>
                  <th className="text-center p-6 font-semibold">Pro Agency</th>
                  <th className="text-center p-6 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={feature.name} className={`border-b ${index % 2 === 0 ? 'bg-muted/20' : ''}`}>
                    <td className="p-6 font-medium">{feature.name}</td>
                    <td className="text-center p-6">
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : (
                        feature.free
                      )}
                    </td>
                    <td className="text-center p-6">
                      {typeof feature.starter === 'boolean' ? (
                        feature.starter ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : (
                        feature.starter
                      )}
                    </td>
                    <td className="text-center p-6 bg-primary/5">
                      {typeof feature.growth === 'boolean' ? (
                        feature.growth ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : (
                        <span className="font-medium">{feature.growth}</span>
                      )}
                    </td>
                    <td className="text-center p-6">
                      {typeof feature.pro === 'boolean' ? (
                        feature.pro ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : (
                        feature.pro
                      )}
                    </td>
                    <td className="text-center p-6">
                      {typeof feature.enterprise === 'boolean' ? (
                        feature.enterprise ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : (
                        feature.enterprise
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold lg:text-4xl">
              Frequently asked questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Can I change plans anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate any billing differences.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What happens after the free trial?</h3>
              <p className="text-muted-foreground">
                After your 14-day free trial ends, you'll be automatically moved to the Free plan. 
                You can upgrade to a paid plan at any time.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Do you offer refunds?</h3>
              <p className="text-muted-foreground">
                Yes, we offer a 30-day money-back guarantee on all paid plans. 
                If you're not satisfied, we'll refund your payment in full.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Absolutely. You can cancel your subscription at any time from your account settings. 
                Your access will continue until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold lg:text-4xl text-white">
              Ready to get started?
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Join thousands of SEO professionals who trust our platform to grow their business.
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/auth/register">
                Start Free Trial
                <ArrowRight className={`h-5 w-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}