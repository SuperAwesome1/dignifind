export interface GalleryImage {
    url: string;
    path: string;  // Firebase Storage path — needed for deletion
}

export interface Funeral {
    id?: string;
    graveNumber: string;
    idNumber: string;
    firstName: string;
    surname: string;
    gender: 'male' | 'female';
    dateOfBirth: string;
    dateOfDeath: string;
    dateOfFuneral: string;
    venue?: string;
    time?: string;
    area?: string;

    // GPS coordinates
    homelat?: string;
    homelng?: string;
    servicelat?: string;
    servicelng?: string;
    lat?: string;
    lng?: string;

    // Memorial
    memorial: boolean;
    dateofmemorial?: string;
    memorialvenue?: string;
    memorialtime?: string;
    memoriallocation?: string;
    memorialprogramme?: string;

    // Streaming
    streaming: boolean;
    memostream?: string;
    homestream?: string;
    cemstream?: string;
    mstreamtime?: string;
    hstreamtime?: string;
    cstreamtime?: string;

    // Next of kin
    nextOfKinFullname?: string;
    nextOfKinContacts?: string;
    nextOfKinAddress?: string;

    // Content
    obituary?: string;
    programme?: string;
    poem?: string;
    hymn?: string;
    info?: string;
    donations?: string;
    voteofthanks?: string;
    thankson?: boolean;

    // Images
    picture?: string;                          // cover photo URL
    gallery?: Record<string, GalleryImage>;    // key → { url, path }

    undertaker?: string;
    user?: string;
    graveCaptured?: boolean;
    homeCaptured?: boolean;
    shortId?: string;
}

export interface Provider {
    id?: string;
    providerName: string;
    providerType: 'undertaker' | 'tombstone' | 'both';
    providerwebsite: string;
    providerlogo?: string;
    user?: string;
}
