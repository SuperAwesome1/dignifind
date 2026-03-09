export interface TypographyStyle {
    fontFamily: string;
    color: string;
}

export interface SocialPages {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
}

export interface ProfileData {
    backgroundUrl?: string;
    logoUrl?: string;
    headerUrl?: string;
    backgroundPath?: string;
    logoPath?: string;
    headerPath?: string;
    contactNumber?: string;
    emergencyNumber?: string;
    whatsappNumber?: string;
    email?: string;
    socialPages?: SocialPages;
    typography?: {
        h1: TypographyStyle;
        h2: TypographyStyle;
        h3: TypographyStyle;
        h4: TypographyStyle;
        p: TypographyStyle;
        hr: { color: string };
    };
    location?: {
        name: string;
        url: string;
    };
    footerSettings?: {
        backgroundColor: string;
        fontColor: string;
    };
}

export const DEFAULT_TYPOGRAPHY: NonNullable<ProfileData['typography']> = {
    h1: { fontFamily: 'Times New Roman', color: '#C49847' },
    h2: { fontFamily: 'Times New Roman', color: '#27345C' },
    h3: { fontFamily: 'Times New Roman', color: '#000000' },
    h4: { fontFamily: 'Times New Roman', color: '#000000' },
    p: { fontFamily: 'Lato', color: '#333333' },
    hr: { color: '#C49847' },
};
