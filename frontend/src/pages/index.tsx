import {
    Box,
    Button,
    Container,
    Group,
    Text,
    Paper,
    Select,
    Modal,
    Textarea,
    TextInput,
} from "@mantine/core";
import {
    IconThumbUp,
    IconThumbDown,
    IconBubble,
    IconPlus, IconTrash, IconPencil,
} from "@tabler/icons-react";
import InfiniteScroll from "react-infinite-scroll-component";
import {useEffect, useState} from "react";
import {sendRequest} from "../../jwt";
import {useDisclosure} from "@mantine/hooks";
import {useForm} from "@mantine/form";

type Post = {
    id: number;
    title: string;
    user: string;
    body: string;
    rubric: string;
    likes: number;
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
                value.length < 6 && "Body should be at least 6 characters long",
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
                title="Edit Post"
                size="xl"
                centered
            >
                <form onSubmit={new_post_form.onSubmit((values) => edit(values))}>
                    <TextInput
                        label="Title"
                        placeholder="Enter post title"
                        key={new_post_form.key("title")}
                        {...new_post_form.getInputProps("title")}
                    />
                    <Textarea
                        mt="md"
                        label="Body"
                        placeholder="Enter post body"
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
                        label="Rubric"
                        placeholder="Select rubric"
                        defaultValue="blog"
                        searchable={false}
                        onChange={(value) => {
                            if (typeof value == "string") {
                                new_post_form.setFieldValue("rubric", value);
                            }
                        }}
                    />
                    <Button mt="xl" variant="filled" color="blue" type="submit">
                        Edit
                    </Button>
                </form>
            </Modal>
            <Modal
                opened={openedEditor}
                onClose={close}
                title="New Post"
                size="xl"
                centered
            >
                <form onSubmit={new_post_form.onSubmit((values) => post(values))}>
                    <TextInput
                        label="Title"
                        placeholder="Enter post title"
                        key={new_post_form.key("title")}
                        {...new_post_form.getInputProps("title")}
                    />
                    <Textarea
                        mt="md"
                        label="Body"
                        placeholder="Enter post body"
                        key={new_post_form.key("body")}
                        {...new_post_form.getInputProps("body")}
                    />
                    <Select
                        mt="md"
                        data={[
                            {value: "blog", label: "Blog"},
                            {value: "news", label: "News"},
                            {value: "other", label: "Other"},
                        ]}
                        label="Rubric"
                        placeholder="Select rubric"
                        defaultValue="blog"
                        searchable={false}
                        onChange={(value) => {
                            if (typeof value == "string") {
                                new_post_form.setFieldValue("rubric", value);
                            }
                        }}
                    />
                    <Button mt="xl" variant="filled" color="green" type="submit">
                        Create
                    </Button>
                </form>
            </Modal>
            <Modal
                opened={openedPost}
                onClose={closePost}
                title={`@${current_post?.user} ${current_post?.title}`}
                size="xl"
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
                            label="Comment"
                            placeholder="Enter your comment"
                            key={comment_form.key("body")}
                            {...comment_form.getInputProps("body")}
                        />
                        <Button variant="filled" color="green" type="submit">
                            Submit
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
                                            Delete
                                        </Button>
                                    )}
                                </Paper>
                            ))}
                        </InfiniteScroll></Box>
                </> : <></>}

            </Modal>
            <Container size="lg" bg="#FEFDED" mt="xl" py="md">
                <Group justify="space-between">
                    <Text size="xl" fw={700}>
                        My Blog {isLoading ? "..." : `@${user?.username}`}
                    </Text>
                    {isLoading ? "..." : `${user?.uuid}`}
                    <Button variant="filled" color="green" onClick={logout}>
                        Logout
                    </Button>
                </Group>
            </Container>
            <Container size="lg" bg="#FEFDED" mt="xl" py="md">
                <Group justify="space-between">
                    <Group>
                        <Text size="lg">All Posts</Text>
                        <Button
                            size="xs"
                            rightSection={<IconPlus size={14}/>}
                            variant="light"
                            color="green"
                            onClick={open}
                        >
                            New Post
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
                    <Text>Loading...</Text>
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
                            loader={<Text>Loading...</Text>}
                            refreshFunction={() => {
                                sendRequest("/api/post/?rubric=" + rubric + "&sort_by=" + sort_by, "GET", undefined).then((data) =>
                                    setPosts(data.results)
                                );
                            }}
                            pullDownToRefresh
                            pullDownToRefreshThreshold={50}
                        >
                            {posts.map((post) => (
                                <Paper shadow="xs" p="sm" mb="md" key={post.id}>
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
                                            color="green"
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
                                            See more
                                        </Button>
                                    )}
                                    <Group gap="xs" mt="xs">
                                        <Button
                                            size="xs"
                                            leftSection={<IconThumbUp size={14}/>}
                                            variant="transparent"
                                            color="black"
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
                                            color="black"
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
                                            color="black"
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
                                            Comments
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
                                                Delete
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
                                                Edit
                                            </Button>
                                        )}
                                    </Group>
                                </Paper>
                            ))}
                        </InfiniteScroll>
                    </Box>
                )}
            </Container>
        </>
    );
}
