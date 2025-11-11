import { UserLayout } from '@/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components';

export default function Subscription() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '1,000 API calls/month',
        '10 GB storage',
        'Community support',
        'Basic features',
      ],
      current: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      features: [
        '10,000 API calls/month',
        '100 GB storage',
        'Priority support',
        'Advanced features',
        'Custom integrations',
      ],
      current: true,
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      features: [
        'Unlimited API calls',
        '1 TB storage',
        '24/7 dedicated support',
        'All features',
        'Custom integrations',
        'SLA guarantee',
        'Advanced security',
      ],
      current: false,
    },
  ];

  return (
    <UserLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription plan and billing information.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Pro Plan</h3>
                <p className="text-gray-600 mt-1">$29 per month</p>
                <p className="text-sm text-gray-500 mt-2">Next billing date: December 15, 2024</p>
              </div>
              <div className="text-right space-y-2">
                <Button variant="secondary" size="sm">
                  Manage Billing
                </Button>
                <br />
                <Button variant="danger" size="sm">
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.popular ? 'border-2 border-blue-500' : ''}>
                <CardContent className="pt-6">
                  {plan.popular && (
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-4">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="ml-2 text-gray-500">/{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    {plan.current ? (
                      <Button variant="secondary" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        variant={plan.popular ? 'primary' : 'secondary'}
                        className="w-full"
                      >
                        {plan.name === 'Free' ? 'Downgrade' : 'Upgrade'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-900">Nov 15, 2024</td>
                    <td className="py-4 px-4 text-gray-600">Pro Plan - Monthly</td>
                    <td className="py-4 px-4 text-gray-900 font-medium">$29.00</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Paid
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="secondary" size="sm">Download</Button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-900">Oct 15, 2024</td>
                    <td className="py-4 px-4 text-gray-600">Pro Plan - Monthly</td>
                    <td className="py-4 px-4 text-gray-900 font-medium">$29.00</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Paid
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="secondary" size="sm">Download</Button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-900">Sep 15, 2024</td>
                    <td className="py-4 px-4 text-gray-600">Pro Plan - Monthly</td>
                    <td className="py-4 px-4 text-gray-900 font-medium">$29.00</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Paid
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="secondary" size="sm">Download</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
