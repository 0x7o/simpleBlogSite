import { Container, Text, Center } from "@mantine/core";

export default function NotFoundPage() {
  return (
    <Container size="lg" mt="xl">
      <Center>
        <div>
          <Text size="xl" weight={700} align="center" mb="md">
            404 - Page Not Found
          </Text>
          <Text size="lg" align="center">
            The page you are looking for could not be found. Please check the URL or navigate back to the homepage.
          </Text>
        </div>
      </Center>
    </Container>
  );
}