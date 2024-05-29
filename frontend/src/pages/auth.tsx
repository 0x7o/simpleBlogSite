import {Button, Container, Group, Text, TextInput, PasswordInput} from "@mantine/core";
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
            username: (value) => value.length < 3 && 'Username should be at least 3 characters long',
            password: (value) => value.length < 6 && 'Password should be at least 6 characters long',
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
            username: (value) => value.length < 3 && 'Username should be at least 3 characters long',
            password: (value) => value.length < 6 && 'Password should be at least 6 characters long',
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
                    loginform.setErrors({password: "Invalid username or password"});
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
                    signupform.setErrors({username: "User already exists"});
                }
            })
    };


    return (
        <>
            <Container size="lg" bg="#FEFDED" mt="xl" py="md">
                <Group justify="space-between">
                    <Text size="xl" fw={700}>Authorization</Text>
                </Group>
            </Container>
            <Container size="lg" bg="#FEFDED" mt="xl" py="md">
                <Text size="xl" fw={700} mb="lg">Log In</Text>
                <form onSubmit={loginform.onSubmit(handleLoginSubmit)}>
                    <TextInput
                        label="Username"
                        placeholder="Enter your username"
                        key={loginform.key('username')}
                        {...loginform.getInputProps('username')}
                    />
                    <PasswordInput
                        mt="xs"
                        label="Password"
                        placeholder="Enter your password"
                        key={loginform.key('password')}
                        {...loginform.getInputProps('password')}
                    />
                    <Button type="submit" mt="xl" variant="filled" color="green">
                        Log In
                    </Button>
                </form>
            </Container>
            <Container size="lg" bg="#FEFDED" mt="xl" py="md">
                <Text size="xl" fw={700} mb="lg">Sign Up</Text>
                <form onSubmit={signupform.onSubmit(handleSignupSubmit)}>
                    <TextInput
                        label="Username"
                        placeholder="Enter your username"
                        key={signupform.key('username')}
                        {...signupform.getInputProps('username')}
                    />
                    <PasswordInput
                        mt="xs"
                        label="Password"
                        placeholder="Enter your password"
                        key={signupform.key('password')}
                        {...signupform.getInputProps('password')}
                    />
                    <Button type="submit" mt="xl" variant="filled" color="green">
                        Sign Up
                    </Button>
                </form>
            </Container>
        </>
    );
}