import {
    Box,
    Button,
    Container,
    Group,
    Text,
    Center,
    Paper,
    Select,
    Modal,
    Textarea,
    TextInput,
    FileInput,
} from "@mantine/core";
import {
    IconThumbUp,
    IconThumbDown,
    IconBubble,
    IconTrash, IconPencil,
    IconX, IconUpload, IconPhoto
} from "@tabler/icons-react";
import {Dropzone, IMAGE_MIME_TYPE, MIME_TYPES} from '@mantine/dropzone';
import InfiniteScroll from "react-infinite-scroll-component";
import {useEffect, useState} from "react";
import {sendImage, sendRequest} from "../../jwt";
import {useDisclosure} from "@mantine/hooks";
import {useForm} from "@mantine/form";

type Post = {
    id: number;
    title: string;
    user: string;
    body: string;
    rubric: string;
    likes: number;
    image: string;
    dislikes: number;
};

type Comment = {
    id: number;
    user: string;
    body: string;
};

type User = {
    username: string;
    uuid: string;
}

export default function Home() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openedEditor, {open, close}] = useDisclosure(false);
    const [openedEditorPost, {open: openEPost, close: closeEPost}] = useDisclosure(false);
    const [hasNext, setHasNext] = useState(true);
    const [hasNextC, setHasNextC] = useState(true);
    const [rubric, setRubric] = useState("all");
    const [sort_by, setSortBy] = useState("-created_at");
    const [user, setUser] = useState<User | null>(null);
    const [openedPost, {open: openPost, close: closePost}] = useDisclosure(false);
    const [current_post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);

    const new_post_form = useForm({
        mode: "uncontrolled",
        initialValues: {
            title: "",
            body: "",
            rubric: "blog",
            image: null,
        },
        validate: {
            title: (value) =>
                (value.length > 128 &&
                    "Title should be less than 128 characters long") ||
                (value == "" && "Title should be at least 1 character long"),
            body: (value) =>
                value.length < 6 && "Body should be at least 6 characters long",
        },
    });

    const comment_form = useForm({
        mode: "uncontrolled",
        initialValues: {
            body: "",
        },
        validate: {
            body: (value) =>
                value.length < 1 && "Body should be at least 1 characters long",
        },
    });

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.reload();
    };

    const post = (values: typeof new_post_form.values) => {
        sendRequest("/api/post/", "POST", values).then((data) => {
            setPosts([data, ...posts]);
            new_post_form.reset();
            close();
        });
    };

    const edit = (values: typeof new_post_form.values) => {
        sendRequest("/api/posts/" + current_post?.id + "/update", "PUT", values).then((data) => {
            setPosts(posts.map((p) => p.id == current_post?.id ? data : p));
            closeEPost();
            new_post_form.reset();
        });
    };

    useEffect(() => {
        sendRequest("/api/post/?rubric=" + rubric + "&sort_by=" + sort_by,
            "GET", undefined).then((data) =>
            setPosts(data.results)
        );
    }, [rubric, sort_by]);

    useEffect(() => {
        sendRequest("/api/user/", "GET", undefined).then((data) => setUser(data));
        setIsLoading(false);
    }, []);

    return (
        <>
            <Modal
                opened={openedEditorPost}
                onClose={closeEPost}
                title="Редактирование поста"
                size="lg"
                centered
            >
                <form onSubmit={new_post_form.onSubmit((values) => edit(values))}>
                    <TextInput
                        label="Заголовок"
                        placeholder="Введите заголовок поста"
                        key={new_post_form.key("title")}
                        {...new_post_form.getInputProps("title")}
                    />
                    <Textarea
                        mt="md"
                        label="Описание"
                        placeholder="Введите описание"
                        key={new_post_form.key("body")}
                        {...new_post_form.getInputProps("body")}
                    />
                    <Select
                        mt="md"
                        data={[
                            {value: "blog", label: "Блог"},
                            {value: "news", label: "Новости"},
                            {value: "other", label: "Другое"},
                        ]}
                        label="Рубрика"
                        placeholder="Выберите рубрику"
                        defaultValue="blog"
                        searchable={false}
                        onChange={(value) => {
                            if (typeof value == "string") {
                                new_post_form.setFieldValue("rubric", value);
                            }
                        }}
                    />
                    <Button mt="xl" variant="filled" color="blue" type="submit">
                        Отправить
                    </Button>
                </form>
            </Modal>
            <Modal
                opened={openedEditor}
                onClose={close}
                title="Новый пост"
                size="lg"
                centered
            >
                <form onSubmit={new_post_form.onSubmit((values) => post(values))}>
                    <TextInput
                        label="Заголовок"
                        placeholder="Введите заголовок"
                        key={new_post_form.key("title")}
                        {...new_post_form.getInputProps("title")}
                    />
                    <Textarea
                        mt="md"
                        label="Описание"
                        placeholder="Введите описание"
                        key={new_post_form.key("body")}
                        {...new_post_form.getInputProps("body")}
                    />
                    <Select
                        mt="md"
                        data={[
                            {value: "blog", label: "Блог"},
                            {value: "news", label: "Новости"},
                            {value: "other", label: "Другое"},
                        ]}
                        label="Рубрика"
                        placeholder="Выберите рубрику"
                        defaultValue="blog"
                        searchable={false}
                        onChange={(value) => {
                            if (typeof value == "string") {
                                new_post_form.setFieldValue("rubric", value);
                            }
                        }}
                    />
                    <Dropzone
                        onDrop={(files) => {
                            // to base64
                            const reader = new FileReader();
                            reader.onload = () => {
                                new_post_form.setFieldValue("image", reader.result);
                            };
                            reader.readAsDataURL(files[0]);
                            new_post_form.setFieldValue("image", files[0]);
                        }}
                        maxSize={2 * 1024 ** 2}
                        accept={IMAGE_MIME_TYPE}
                    >
                        <Group
                            style={{minHeight: 220, pointerEvents: "none"}}
                        >
                            <Dropzone.Accept>
                                <IconUpload
                                    size={50}
                                    stroke={1.5}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX
                                    size={50}
                                    stroke={1.5}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconPhoto size={50} stroke={1.5}/>
                            </Dropzone.Idle>

                            <div>
                                <Text size="xl" inline>
                                    Перетащите изображение
                                </Text>
                                <Text size="sm" color="dimmed" inline mt={7}>
                                    Принимаются изображения любого формата до 2МБ.
                                </Text>
                            </div>
                        </Group>
                    </Dropzone>
                    <Button mt="xl" variant="light" color="blue" type="submit">
                        Создать
                    </Button>
                </form>
            </Modal>
            <Modal
                opened={openedPost}
                onClose={closePost}
                title={`@${current_post?.user} ${current_post?.title}`}
                size="lg"
            >
                {current_post ? <><Text>{current_post.body.split("\n").map((line) => <>{line}<br/></>)}</Text>
                    <form onSubmit={comment_form.onSubmit((values) => {
                        sendRequest(`/api/posts/${current_post.id}/add_comment/`, "POST", values).then((data) => {
                            comment_form.reset();
                            setComments([data, ...comments]);
                        });
                    })}>
                        <Textarea
                            mt="md"
                            label="Комментарий"
                            placeholder="Оставьте свой комментарий"
                            key={comment_form.key("body")}
                            {...comment_form.getInputProps("body")}
                        />
                        <Button variant="light" color="blue" type="submit">
                            Оставить
                        </Button>
                    </form>
                    <Box id="scrollableDiv" style={{maxHeight: '500px', overflow: 'auto'}}>
                        <InfiniteScroll
                            dataLength={comments.length}
                            next={() => {
                                sendRequest(
                                    `/api/posts/${current_post.id}/comments/` + "?page=" + Math.floor(comments.length / 5 + 1),
                                    "GET",
                                    undefined
                                ).then((data) => {
                                    setComments([...comments, ...data.results]);
                                    if (data.next) {
                                        setHasNextC(true);
                                    } else {
                                        setHasNextC(false);
                                    }
                                });
                            }}
                            hasMore={hasNextC}
                            refreshFunction={() => {
                                sendRequest(`/api/posts/${current_post.id}/comments/`, "GET", undefined).then((data) =>
                                    setComments(data.results)
                                );
                            }}
                            pullDownToRefresh
                            pullDownToRefreshThreshold={10}
                            scrollableTarget="scrollableDiv"
                            loader={<></>}>
                            {comments.map((comment) => (
                                <Paper shadow="xs" p="sm" mt="md" key={comment.id}>
                                    <Text size="lg">{comment.user}</Text>
                                    <Text mt="xs">{comment.body}</Text>
                                    {comment.user == user?.username && (
                                        <Button
                                            size="xs"
                                            leftSection={<IconTrash size={14}/>}
                                            variant="transparent"
                                            color="red"
                                            onClick={() => {
                                                sendRequest(`/api/comments/${comment.id}/delete/`, "DELETE", undefined).then(
                                                    () => {
                                                        setComments(comments.filter((c) => c.id != comment.id));
                                                    }
                                                );
                                            }}
                                        >
                                            Удалить
                                        </Button>
                                    )}
                                </Paper>
                            ))}
                        </InfiniteScroll></Box>
                </> : <></>}

            </Modal>
            <Container size="lg" bg="#151515" mt="xl" py="md">
                <Group justify="space-between">
                    <Text size="xl" fw={700}>
                        Мой блог {isLoading ? "..." : `@${user?.username}`}
                    </Text>
                    {isLoading ? "..." : `${user?.uuid}`}
                    <Button variant="filled" color="blue" onClick={logout}>
                        Выйти
                    </Button>
                </Group>
            </Container>
            <Container size="lg" bg="#151515" mt="xl" py="md">
                <Group justify="space-between">
                    <Group>
                        <Text size="lg">Посты</Text>
                        <Button
                            size="xs"
                            variant="light"
                            color="blue"
                            onClick={open}
                        >
                            Новый пост
                        </Button>
                    </Group>
                    <Select
                        data={[
                            {value: "all", label: "Все рубрики"},
                            {value: "blog", label: "Блог"},
                            {value: "news", label: "Новости"},
                            {value: "other", label: "Другое"},
                        ]}
                        defaultValue="all"
                        searchable={false}
                        onChange={(value) => {
                            if (typeof value == "string") {
                                setRubric(value);
                            }
                        }}
                    />
                    <Select
                        data={[
                            {value: "-created_at", label: "Новые"},
                            {value: "created_at", label: "Старые"},
                            {value: "-likes", label: "По лайкам"},
                            {value: "-dislikes", label: "По дизлайкам"},
                            {value: "title", label: "Заголовок (А-Я)"},
                            {value: "-title", label: "Заголовок (Я-A)"},
                            {value: "body", label: "Описание (A-Я)"},
                            {value: "-body", label: "Описание (Я-A)"},
                        ]}
                        defaultValue="-created_at"
                        searchable={false}
                        onChange={(value) => {
                            if (typeof value == "string") {
                                setSortBy(value);
                            }
                        }}
                    />
                </Group>
                {isLoading ? (
                    <Text>Загрузка...</Text>
                ) : (
                    <Box mt="xl">
                        <InfiniteScroll
                            dataLength={posts.length}
                            next={() => {
                                sendRequest(
                                    "/api/post/?rubric=" + rubric + "&page=" + Math.floor(posts.length / 5 + 1) + "&sort_by=" + sort_by,
                                    "GET",
                                    undefined
                                ).then((data) => {
                                    setPosts([...posts, ...data.results]);
                                    if (data.next) {
                                        setHasNext(true);
                                    } else {
                                        setHasNext(false);
                                    }
                                });
                            }}
                            hasMore={hasNext}
                            loader={<Text>Загрузка...</Text>}
                            refreshFunction={() => {
                                sendRequest("/api/post/?rubric=" + rubric + "&sort_by=" + sort_by, "GET", undefined).then((data) =>
                                    setPosts(data.results)
                                );
                            }}
                            pullDownToRefresh
                            pullDownToRefreshThreshold={50}
                        >
                            {posts.map((post) => (
                                <Center key={post.id}>
                                    <Paper shadow="xs" p="sm" mb="md">
                                        {post.image &&
                                            <img src={post.image} style={{maxWidth: '100%'}} alt="s" width="200"/>
                                        }
                                        <Text size="lg">
                                            {post.rubric} @{post.user} | {post.title}
                                        </Text>
                                        <Text mt="xs">
                                            {post.body.length > 200
                                                ? `${post.body.substring(0, 200)}...`
                                                : post.body}
                                        </Text>
                                        {post.body.length > 200 && (
                                            <Button
                                                mb="xs"
                                                size="xs"
                                                variant="transparent"
                                                color="blue"
                                                onClick={() => {
                                                    sendRequest(`/api/posts/${post.id}/comments/`, "GET", undefined).then(
                                                        (data) => {
                                                            setComments(data.results);
                                                            openPost();
                                                            setPost(post);
                                                        }
                                                    );
                                                }}
                                            >
                                                Подробнее
                                            </Button>
                                        )}
                                        <Group gap="xs" mt="xs">
                                            <Button
                                                size="xs"
                                                leftSection={<IconThumbUp size={14}/>}
                                                variant="transparent"
                                                color="white"
                                                onClick={() => {
                                                    sendRequest(`/api/posts/${post.id}/like/`, "PUT", undefined).then(
                                                        (data) => {
                                                            if (data.detail) {
                                                                return
                                                            }
                                                            setPosts(
                                                                posts.map((p) =>
                                                                    p.id == post.id ? {
                                                                        ...p,
                                                                        likes: data.likes,
                                                                        dislikes: data.dislikes
                                                                    } : p
                                                                )
                                                            );
                                                        }
                                                    );
                                                }}
                                            >
                                                {post.likes}
                                            </Button>
                                            <Button
                                                size="xs"
                                                leftSection={<IconThumbDown size={14}/>}
                                                variant="transparent"
                                                color="white"
                                                onClick={() => {
                                                    sendRequest(`/api/posts/${post.id}/dislike/`, "PUT", undefined).then(
                                                        (data) => {
                                                            if (data.detail) {
                                                                return
                                                            }
                                                            setPosts(
                                                                posts.map((p) =>
                                                                    p.id == post.id ? {
                                                                        ...p,
                                                                        likes: data.likes,
                                                                        dislikes: data.dislikes
                                                                    } : p
                                                                )
                                                            );
                                                        }
                                                    );
                                                }}
                                            >
                                                {post.dislikes}
                                            </Button>
                                            <Button
                                                size="xs"
                                                leftSection={<IconBubble size={14}/>}
                                                variant="transparent"
                                                color="white"
                                                onClick={() => {
                                                    sendRequest(`/api/posts/${post.id}/comments/`, "GET", undefined).then(
                                                        (data) => {
                                                            setComments(data.results);
                                                            openPost();
                                                            setPost(post);
                                                        }
                                                    );
                                                }}
                                            >
                                                Комментарии
                                            </Button>
                                            {post.user == user?.username && (
                                                <Button
                                                    size="xs"
                                                    leftSection={<IconTrash size={14}/>}
                                                    variant="transparent"
                                                    color="red"
                                                    onClick={() => {
                                                        sendRequest(`/api/posts/${post.id}/delete/`, "DELETE", undefined).then(
                                                            () => {
                                                                setPosts(posts.filter((p) => p.id != post.id));
                                                            }
                                                        );
                                                    }}
                                                >
                                                    Удалить
                                                </Button>
                                            )}
                                            {post.user == user?.username && (
                                                <Button
                                                    size="xs"
                                                    leftSection={<IconPencil size={14}/>}
                                                    variant="transparent"
                                                    color="blue"
                                                    onClick={() => {
                                                        setPost(post);
                                                        new_post_form.setValues({
                                                            title: post.title,
                                                            body: post.body,
                                                            rubric: post.rubric,
                                                        });
                                                        openEPost();
                                                    }}
                                                >
                                                    Изменить
                                                </Button>
                                            )}
                                        </Group>
                                    </Paper></Center>
                            ))}
                        </InfiniteScroll>
                    </Box>
                )}
            </Container>
        </>
    );
}
