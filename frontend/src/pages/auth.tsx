import {Button, Container, Group, Text, TextInput, PasswordInput, Center} from "@mantine/core";
import {useForm} from '@mantine/form';
import {useRouter} from "next/router";

export default function Auth() {
    const loginform = useForm({
        mode: 'uncontrolled',
        initialValues: {
            username: '',
            password: '',
        },

        validate: {
            username: (value) => value.length < 3 && 'Имя пользователя должно состоять не менее чем из 3 символов',
            password: (value) => value.length < 6 && 'Пароль должен состоять не менее чем из 6 символов',
        },
    });

    const router = useRouter();

    const signupform = useForm({
        mode: 'uncontrolled',
        initialValues: {
            username: '',
            password: '',
        },

        validate: {
            username: (value) => value.length < 3 && 'Имя пользователя должно состоять не менее чем из 3 символов',
            password: (value) => value.length < 6 && 'Пароль должен состоять не менее чем из 6 символов',
        },
    });

    const handleLoginSubmit = (values: typeof loginform.values) => {
        fetch("/api/token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        })
            .then((response) => {
                if (response.status == 200) {
                    response.json().then((data) => {
                        localStorage.setItem("access", data.access);
                        localStorage.setItem("refresh", data.refresh);
                        router.push("/");
                    });
                } else {
                    loginform.setErrors({password: "Неверное имя пользователя или пароль"});
                }
            })
    };

    const handleSignupSubmit = (values: typeof signupform.values) => {
        fetch("/api/user/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        })
            .then((response) => {
                if (response.status == 200) {
                    handleLoginSubmit(values);
                } else {
                    signupform.setErrors({username: "Пользователь уже существует"});
                }
            })
    };


    return (
        <>
            <Container size="lg" bg="#151515" mt="xl" py="md">
                <Group justify="space-between">
                    <Text size="xl" fw={700}>Авторизация</Text>
                </Group>
            </Container>
            <Center>
                <Container size="lg" bg="#151515" mt="xl" py="md">
                    <Text size="xl" fw={700} mb="lg">Войти</Text>
                    <form onSubmit={loginform.onSubmit(handleLoginSubmit)}>
                        <TextInput
                            size="xs"
                            label="Имя пользователи"
                            placeholder="Введите имя пользователя"
                            key={loginform.key('username')}
                            {...loginform.getInputProps('username')}
                        />
                        <PasswordInput
                            size="xs"
                            mt="xs"
                            label="Пароль"
                            placeholder="Введите пароль"
                            key={loginform.key('password')}
                            {...loginform.getInputProps('password')}
                        />
                        <Button type="submit" mt="xl" variant="light" color="blue">
                            Войти
                        </Button>
                    </form>
                </Container>
            </Center>
            <Center>
                <Container size="lg" bg="#151515" mt="xl" py="md">
                    <Text size="xl" fw={700} mb="lg">Регистрация</Text>
                    <form onSubmit={signupform.onSubmit(handleSignupSubmit)}>
                        <TextInput
                            label="Имя пользователи"
                            size="xs"
                            placeholder="Введите имя пользователя"
                            key={signupform.key('username')}
                            {...signupform.getInputProps('username')}
                        />
                        <PasswordInput
                            mt="xs"
                            size="xs"
                            label="Пароль"
                            placeholder="Введите пароль"
                            key={signupform.key('password')}
                            {...signupform.getInputProps('password')}
                        />
                        <Button type="submit" mt="xl" variant="light" color="blue">
                            Регистрация
                        </Button>
                    </form>
                </Container>
            </Center>
        </>
    );
}