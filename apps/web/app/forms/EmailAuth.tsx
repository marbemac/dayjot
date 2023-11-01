import { valibotResolver } from '@hookform/resolvers/valibot';
import { useRevalidator } from '@remix-run/react';
import { Box, Button } from '@supastack/ui-primitives';
import { Form, FormInputField } from '@supastack/ui-primitives/forms';
import { useCallback, useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { email, type Input, object, optional, string } from 'valibot';

import { ctx } from '~/app.ts';

const emailSchema = string('Must be a valid email address', [email()]);

const EmailSchema = object({
  email: emailSchema,
  password: optional(string()),
});

const EmailPassSchema = object({
  email: emailSchema,
  password: string(),
});

export function EmailAuthForm() {
  const [step, setStep] = useState<'listOptions' | 'authenticate'>('listOptions');
  const [hasAccount, setHasAccount] = useState(false);
  const [passwordSignInEnabled, setPasswordSignInEnabled] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const revalidator = useRevalidator();
  const listLoginOptions = ctx.trpc.auth.listLoginOptions.useMutation();
  const sendMagicLink = ctx.trpc.auth.sendMagicLink.useMutation();
  const withMagicToken = ctx.trpc.auth.withMagicToken.useMutation({
    // invalidate entire cache on login
    onSuccess: () => ctx.trpc.$invalidate(),
  });

  const isPending = listLoginOptions.isPending || sendMagicLink.isPending || withMagicToken.isPending;

  const methods = useForm<Input<typeof EmailSchema>>({
    resolver: valibotResolver(step === 'listOptions' ? EmailSchema : EmailPassSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const ctaText =
    step === 'listOptions'
      ? 'Continue with email'
      : hasAccount
      ? passwordSignInEnabled
        ? 'Continue with password'
        : 'Continue with login code'
      : 'Create new account';

  const tokenText =
    step === 'authenticate' && !passwordSignInEnabled
      ? `We just emailed you a temporary ${
          hasAccount ? 'login' : 'sign up'
        } code. Please check your inbox and paste the ${hasAccount ? 'login' : 'sign up'} code below.`
      : null;

  useEffect(() => {
    methods.setFocus(step === 'listOptions' ? 'email' : 'password');
  }, [methods, step]);

  useEffect(() => {
    const subscription = methods.watch((value, { name, type }) => {
      if (name === 'email' && type === 'change' && step === 'authenticate' && !passwordSignInEnabled) {
        // If we're in the token auth flow, and user changes email, reset back to listOptions step
        setStep('listOptions');
      }
    });

    return () => subscription.unsubscribe();
  }, [methods, passwordSignInEnabled, step]);

  const onSubmit: SubmitHandler<Input<typeof EmailSchema>> = useCallback(
    async data => {
      setError(null);

      try {
        if (step === 'listOptions') {
          const res = await listLoginOptions.mutateAsync({ email: data.email });
          if (!res.passwordSignInEnabled) {
            await sendMagicLink.mutateAsync({ email: data.email });
          }

          setStep('authenticate');
          setPasswordSignInEnabled(res.passwordSignInEnabled);
          setHasAccount(res.hasAccount);
        } else if (passwordSignInEnabled) {
          // @TODO
        } else {
          await withMagicToken.mutateAsync({
            token: data.password!,
          });

          /**
           * Special case.. when logging in/out we need to trigger
           * any loader redirects, etc. Normally we don't need to use router revalidate, and can just leverage the
           * tanstack query cache.
           */
          revalidator.revalidate();
        }
      } catch (err: any) {
        console.error(err);
        setError(err);
      }
    },
    [listLoginOptions, passwordSignInEnabled, revalidator, sendMagicLink, step, withMagicToken],
  );

  return (
    <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)} tw="w-80">
      <FormInputField
        control={methods.control}
        name="email"
        label="Email"
        inputProps={{
          placeholder: 'Enter your email address...',
          autoComplete: 'email',
          autoCorrect: 'off',
        }}
      />

      {tokenText ? <Box tw="px-4 text-center text-muted">{tokenText}</Box> : null}

      <FormInputField
        control={methods.control}
        name="password"
        label={passwordSignInEnabled ? 'Password' : `${hasAccount ? 'Login' : 'Sign up'} code`}
        hidden={step === 'listOptions'}
        inputProps={{
          type: 'password',
          placeholder: passwordSignInEnabled ? 'Enter your password' : `Paste ${hasAccount ? 'login' : 'sign up'} code`,
          autoComplete: passwordSignInEnabled ? `${hasAccount ? 'current' : 'new'}-password` : 'otp',
          autoCorrect: 'off',
        }}
      />

      <Button type="submit" variant="solid" intent="primary" isLoading={isPending} loadingText={ctaText} fullWidth>
        {ctaText}
      </Button>

      {error ? <Box tw="text-center text-danger">{error.message}</Box> : null}
    </Form>
  );
}
