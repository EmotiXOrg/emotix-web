import { Amplify } from "aws-amplify";

//const region = import.meta.env.VITE_AWS_REGION as string;
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID as string;
const userPoolClientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID as string;
const cognitoDomain = (import.meta.env.VITE_COGNITO_DOMAIN as string).replace("https://", "");
const appOrigin = import.meta.env.VITE_APP_ORIGIN as string;

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId,
            userPoolClientId,
            loginWith: {
                oauth: {
                    domain: cognitoDomain,
                    scopes: ["openid", "email", "profile"],
                    redirectSignIn: [`${appOrigin}/auth/callback`],
                    redirectSignOut: [`${appOrigin}/auth`],
                    responseType: "code",
                },
            },
        },
    },
});
