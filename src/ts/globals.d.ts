interface IApp {
    endpoints: {
        addComment: string,
        editComment: string,
        getComments: string,
        updateChores: string,
        updateComments: string,
        updateGroups: string,
        updateUser: string,
    },
    flashMessages: [string, string][],
    userId: string,
}

declare const App: IApp;

declare const bootstrap: any;
declare const SimpleMDE: any;
