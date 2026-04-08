import {
  Box,
  Button,
  Card,
  Grid,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { apiRequest } from "./utils/api";

const Tutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [opened, setOpened] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
const [currentVideo, setCurrentVideo] = useState("");

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  // ✅ Fetch all tutorials
  const fetchTutorials = async () => {
    try {
      const res = await apiRequest("GET", "/api/tutorials");
      setTutorials(res);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  // ✅ Create tutorial
  const handleCreate = async () => {
    if (!title || !url) return alert("All fields required");

    try {
      const res = await apiRequest("POST", "/api/tutorials", {
        title,
        url,
      });

      setTutorials((prev) => [res, ...prev]);

      setTitle("");
      setUrl("");
      setOpened(false);
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ Delete tutorial
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this tutorial?"
    );

    if (!confirmDelete) return;

    try {
      await apiRequest("DELETE", `/api/tutorials/${id}`);
      setTutorials((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ Convert YouTube URL → embed
 const getEmbedUrl = (url) => {
  try {
    const videoId = new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  } catch {
    return "";
  }
};

  return (
    <Box p="lg">
      {/* HEADER */}
      <Group justify="space-between" mb="lg">
        <Title order={3}>Tutorials</Title>

        <Button
          radius="xl"
          style={{ background: "black", color: "white" }}
          onClick={() => setOpened(true)}
        >
          + Add Tutorial
        </Button>
      </Group>

      {/* LIST */}
      <Grid>
        {tutorials.map((tut) => (
          <Grid.Col key={tut.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Card
              radius="lg"
              withBorder
              p="md"
              style={{
                borderColor: "#e5e5e5",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Stack>
                <Text fw={600}>{tut.title}</Text>

                {/* YouTube Embed */}
                <Box
                  style={{
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <Box
  onClick={() => {
    setCurrentVideo(getEmbedUrl(tut.url));
    setVideoOpen(true);
  }}
  style={{
    borderRadius: "10px",
    overflow: "hidden",
    cursor: "pointer",
    background: "#000",
    height: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff"
  }}
>
  ▶ Play Video
</Box>
                </Box>
              </Stack>

              <Button
                mt="md"
                color="red"
                variant="outline"
                radius="md"
                onClick={() => handleDelete(tut.id)}
              >
                Delete
              </Button>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* CREATE MODAL */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Add Tutorial"
        centered
      >
        <Stack>
          <TextInput
            label="Title"
            placeholder="Enter tutorial title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextInput
            label="YouTube URL"
            placeholder="https://youtube.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <Button
            fullWidth
            style={{ background: "black", color: "white" }}
            onClick={handleCreate}
          >
            Create
          </Button>
        </Stack>
      </Modal>

      <Modal
  opened={videoOpen}
  onClose={() => {
  setVideoOpen(false);
  setCurrentVideo(""); // ✅ stops playback
}}
  fullScreen   // ✅ THIS makes it real fullscreen
  withCloseButton
  padding={0}
>
  <Box style={{ width: "100vw", height: "100vh", background: "black" }}>

  <iframe
    width="100%"
    height="100%"
    src={currentVideo}
    title="YouTube video player"
    allow="autoplay; encrypted-media"
    allowFullScreen
    style={{ border: "none" }}
  />
</Box>
</Modal>
    </Box>
  );
};

export default Tutorials;