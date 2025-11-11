/**
 * MFA Section Component
 * 
 * Component for managing Multi-Factor Authentication.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components';
import { getConfig } from '@/abstractions/config';
import { MFAFactor } from '@/abstractions/auth';

export function MFASection() {
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFactors();
  }, []);

  const loadFactors = async () => {
    try {
      const { auth } = getConfig().providers;
      const mfaFactors = await auth.listMFAFactors();
      setFactors(mfaFactors);
    } catch (err) {
      console.error('Failed to load MFA factors:', err);
    }
  };

  const handleEnroll = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const { auth } = getConfig().providers;
      const result = await auth.enrollMFA({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });

      setFactorId(result.id);
      if (result.totp) {
        setQrCode(result.totp.qr_code);
        setSecret(result.totp.secret);
      }
      setIsEnrolling(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!factorId || !verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const { auth } = getConfig().providers;
      await auth.verifyMFA({
        factorId,
        code: verificationCode,
      });

      setSuccess('MFA has been successfully enabled!');
      setIsEnrolling(false);
      setQrCode(null);
      setSecret(null);
      setVerificationCode('');
      setFactorId(null);
      await loadFactors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify MFA code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnenroll = async (id: string) => {
    if (!confirm('Are you sure you want to disable MFA? This will make your account less secure.')) {
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const { auth } = getConfig().providers;
      await auth.unenrollMFA(id);
      setSuccess('MFA has been disabled');
      await loadFactors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const hasVerifiedFactors = factors.some(f => f.status === 'verified');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Add an extra layer of security to your account by enabling two-factor authentication.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {!isEnrolling && !hasVerifiedFactors && (
            <Button
              variant="primary"
              onClick={handleEnroll}
              disabled={isLoading}
            >
              {isLoading ? 'Setting up...' : 'Enable 2FA'}
            </Button>
          )}

          {isEnrolling && qrCode && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  1. Scan this QR code with your authenticator app:
                </p>
                <div className="flex justify-center p-4 bg-white border rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>

              {secret && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Or enter this code manually:
                  </p>
                  <code className="block p-3 bg-gray-100 rounded text-sm font-mono">
                    {secret}
                  </code>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  2. Enter the 6-digit code from your app:
                </p>
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEnrolling(false);
                    setQrCode(null);
                    setSecret(null);
                    setVerificationCode('');
                    setFactorId(null);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleVerify}
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify and Enable'}
                </Button>
              </div>
            </div>
          )}

          {hasVerifiedFactors && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-900">2FA is enabled</p>
                    <p className="text-xs text-green-700">Your account is protected</p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const factor = factors.find(f => f.status === 'verified');
                    if (factor) handleUnenroll(factor.id);
                  }}
                  disabled={isLoading}
                >
                  Disable
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                <p>Recovery codes are not yet implemented. Please make sure you don&apos;t lose access to your authenticator app.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
