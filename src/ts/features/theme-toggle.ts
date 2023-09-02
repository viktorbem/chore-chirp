import Fetcher from "../utilities/fetcher";

export default class ThemeToggle {
    private theme: string;
    private darkModeToggler: HTMLElement | null;

    constructor(toggleButtonSelector: string) {
        this.theme = this.getCurrentTheme();
        if (this.theme === '') {
            this.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            this.updateThemeValue();
        }
        this.darkModeToggler = document.getElementById(toggleButtonSelector);
        this.darkModeToggler?.addEventListener('click', this.handleChange);
    }

    public get currentTheme() {
        return this.theme;
    }
    private getCurrentTheme() {
        return document.documentElement.getAttribute('data-bs-theme') ?? '';
    }

    private handleChange = (event: MouseEvent) => {
        event.preventDefault();

        // Get the currently set theme
        this.theme = this.getCurrentTheme() === 'dark' ? 'light' : 'dark';

        // Set the html element attribute to the new theme
        this.updateThemeValue();
        if (App.userId === '') return;

        // Store the new theme in database if the user is logged in
        Fetcher.post(App.endpoints.updateUser, {
            user_id: App.userId,
            updates: {
                theme: this.theme,
            },
        }).catch((err) => {
            console.error('Unable to set the user\'s theme.', err);
        });
    }

    private updateThemeValue() {
        document.documentElement.setAttribute('data-bs-theme', this.theme);
    }
}
