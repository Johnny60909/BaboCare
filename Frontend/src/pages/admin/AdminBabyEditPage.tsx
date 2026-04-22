import {
  Container,
  Title,
  Button,
  Card,
  Stack,
  Center,
  Loader,
  Alert,
} from "@mantine/core";
import { IconArrowLeft, IconAlertCircle } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useGetBabyById } from "../../hooks/queries/Babies/useBabies";
import BabyForm from "../../components/BabyForm";

export default function AdminBabyEditPage() {
  const navigate = useNavigate();
  const { babyId } = useParams<{ babyId: string }>();
  const { data: baby, isLoading, error } = useGetBabyById(babyId);

  const handleBack = () => {
    navigate("/admin/babies");
  };

  if (!babyId) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle />} color="red" title="錯誤">
          未提供寶寶 ID
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <Center mih={400}>
          <Loader />
        </Center>
      </Container>
    );
  }

  if (error || !baby) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle />} color="red" title="錯誤">
          無法載入寶寶信息
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={handleBack}
        mb="lg"
      >
        返回列表
      </Button>

      <Card withBorder shadow="sm" radius="md" p="lg">
        <Card.Section withBorder inheritPadding py="lg">
          <Title order={2}>編輯寶寶: {baby.name}</Title>
        </Card.Section>

        <Card.Section inheritPadding py="xl">
          <Stack gap="lg">
            <BabyForm babyId={babyId} onSuccess={handleBack} />
          </Stack>
        </Card.Section>
      </Card>
    </Container>
  );
}
