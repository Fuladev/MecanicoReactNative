import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import { Alert, Image } from 'react-native';
import { Button } from './ui';
import { authErrorMessage, CancelledError, isAppleAvailable, loginWithApple, loginWithGoogle } from '../services/auth';

export function SocialButtons() {
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);
  const [apple, setApple] = useState(false);
  useEffect(() => {
    isAppleAvailable().then(setApple).catch(() => setApple(false));
  }, []);

  const run = async (kind: 'google' | 'apple') => {
    setLoading(kind);
    try {
      await (kind === 'google' ? loginWithGoogle() : loginWithApple());
    } catch (e) {
      if (!(e instanceof CancelledError)) Alert.alert('No se pudo iniciar sesión', authErrorMessage(e));
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Button
        title="Continuar con Google"
        variant="secondary"
        loading={loading === 'google'}
        disabled={!!loading}
        onPress={() => run('google')}
        icon={<Image source={require('../../assets/images/ic_google.png')} style={{ width: 20, height: 20 }} />}
      />
      {apple ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={25}
          style={{ height: 50, marginBottom: 12 }}
          onPress={() => run('apple')}
        />
      ) : null}
    </>
  );
}
