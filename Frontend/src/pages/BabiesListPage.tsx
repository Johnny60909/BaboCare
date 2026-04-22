import {
  Container,
  Title,
  SimpleGrid,
  Card,
  Image,
  Text,
  Group,
  Badge,
  Button,
} from "@mantine/core";
import {
  useGetBabies,
  useGetBabyCountByRole,
} from "../hooks/queries/Babies/useBabies";
import { useNavigate } from "react-router";

export default function BabiesListPage() {
  const { data: babies = [] } = useGetBabies();
  const { data: count } = useGetBabyCountByRole();
  const navigate = useNavigate();

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>我的寶寶</Title>
          <Text c="dimmed" size="sm">
            總共 {count?.count || 0} 個寶寶
          </Text>
        </div>
      </Group>

      {babies.length === 0 ? (
        <Card withBorder padding="lg" bg="gray.0">
          <Text c="dimmed" ta="center" py="xl">
            尚無寶寶記錄
          </Text>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {babies.map((baby) => (
            <Card key={baby.id} shadow="sm" padding="lg" radius="md" withBorder>
              {baby.avatarUrl && (
                <Card.Section mb="sm">
                  <Image src={baby.avatarUrl} height={200} alt={baby.name} />
                </Card.Section>
              )}

              <Title order={4}>{baby.name}</Title>

              <Group justify="space-between" mt="md" mb="xs">
                <Text size="sm" c="dimmed">
                  出生日期：{baby.dateOfBirth}
                </Text>
                {baby.gender && <Badge>{baby.gender}</Badge>}
              </Group>

              <Button
                fullWidth
                variant="light"
                color="blue"
                onClick={() => navigate(`/records/${baby.id}`)}
              >
                查看詳細
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
