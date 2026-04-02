import { Navigate, Link, useSearchParams } from 'react-router';
import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container, Alert, Anchor } from '@mantine/core';
import { useLogin } from '../hooks/useLogin';
import { getToken } from '../lib/auth';
import { useNavigate } from 'react-router';

/// <summary>
/// 登入頁面組件
/// </summary>
export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activated = searchParams.get('activated') === '1';
  const prefillUsername = searchParams.get('username') ?? '';
  const [username, setUsername] = useState(prefillUsername);
  const [password, setPassword] = useState('');
  const { mutate: login, isPending, error } = useLogin();

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { username, password },
      { onSuccess: () => navigate('/', { replace: true }) }
    );
  };

  return (
    <Container size={420} my={80}>
      <Title ta="center" mb="md">BaboCare</Title>
      <Text c="dimmed" size="sm" ta="center" mb="xl">保母托育管理系統</Text>
      <Paper withBorder shadow="md" p="xl" radius="md">
        <form onSubmit={handleSubmit}>
          {activated && (
            <Alert color="green" mb="md">
              🎉 帳號已成功啟用！請使用帳號密碼登入。
            </Alert>
          )}
          <TextInput
            label="帳號"
            placeholder="請輸入帳號"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            mb="md"
          />
          <PasswordInput
            label="密碼"
            placeholder="請輸入密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mb="xl"
          />
          {error && (
            <Alert color="red" mb="md">
              帳號或密碼錯誤，請重試。
            </Alert>
          )}
          <Button type="submit" fullWidth loading={isPending}>
            登入
          </Button>
        </form>
        <Text size="sm" ta="center" mt="md">
          還沒有帳號？{' '}
          <Anchor component={Link} to="/register" size="sm">
            初次登入（自行申請）
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};
