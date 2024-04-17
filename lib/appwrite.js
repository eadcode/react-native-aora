import {
    Account,
    Avatars,
    Client,
    Databases,
    ID,
    Query,
    Storage,
} from "react-native-appwrite";

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.eadcodes.aora',
    projectId: '661ee8d7de98d1c983df',
    databaseId: '661ee9f2d083b9dca31b',
    userCollectionId: '661eea103deb6e0a786f',
    videoCollectionId: '661eea3b0661d7cf57f5',
    storageId: '661eeb9036e8ffeae022',
};

// Init your react-native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform(config.platform)
;

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (! newAccount) {
            throw Error;
        }

        const avatarUrl = avatars.getInitials(username);

        await signIn(email, password);

        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email: email,
                username: username,
                avatar: avatarUrl,
            }
        );

        return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailSession(email, password);

        return session;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

export const getAccount = async () => {
    try {
        const currentAccount = await account.get();

        return currentAccount;
    } catch (error) {
        throw new Error(error);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await getAccount();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        );

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const signOut = async () => {
    try {
        const session = await account.deleteSession("current");

        return session;
    } catch (error) {
        throw new Error(error);
    }
}

// Get all video Posts
export const getAllPosts = async () => {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId
        );

        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getLatestPosts = async () => {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.orderDesc("$createdAt"), Query.limit(7)]
        );

        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}
