import {
  Container,
  Title,
  Button,
  Table,
  ActionIcon,
  Modal,
  Group,
  Badge,
} from "@mantine/core";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  useGetBabies,
  useDeleteBaby,
} from "../../hooks/queries/Babies/useBabies";
import BabyForm from "../../components/BabyForm";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

export default function AdminBabiesPage() {
  const navigate = useNavigate();
  const { data: babies = [] } = useGetBabies();
  const { mutate: deleteBaby } = useDeleteBaby();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDelete = (id: string) => {
    if (confirm("確定要刪除這個寶寶嗎？")) {
      deleteBaby(id, {
        onSuccess: () => {
          notifications.show({
            title: "成功",
            message: "寶寶已刪除",
            color: "green",
            icon: <IconCheck size={16} />,
            autoClose: 3000,
          });
        },
      });
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/babies/${id}`);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>寶寶管理</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setIsFormOpen(true)}
        >
          新增寶寶
        </Button>
      </Group>

      <Modal opened={isFormOpen} onClose={handleFormClose} title="新增寶寶">
        <BabyForm babyId={null} onSuccess={handleFormClose} />
      </Modal>

      <div style={{ overflowX: "auto" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>名稱</Table.Th>
              <Table.Th>出生日期</Table.Th>
              <Table.Th>性別</Table.Th>
              <Table.Th>頭像</Table.Th>
              <Table.Th>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {babies.map((baby) => (
              <Table.Tr key={baby.id}>
                <Table.Td>{baby.name}</Table.Td>
                <Table.Td>{baby.dateOfBirth}</Table.Td>
                <Table.Td>
                  <Badge>{baby.gender || "未設定"}</Badge>
                </Table.Td>
                <Table.Td>{baby.avatarUrl ? "有" : "無"}</Table.Td>
                <Table.Td>
                  <Group gap={0}>
                    <ActionIcon
                      size="sm"
                      color="blue"
                      variant="subtle"
                      onClick={() => handleEdit(baby.id)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      color="red"
                      variant="subtle"
                      onClick={() => handleDelete(baby.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </Container>
  );
}
