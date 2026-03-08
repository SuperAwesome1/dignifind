export interface FuneralPictures {
    pic1?: string;
    pic2?: string;
    pic3?: string;
    pic4?: string;
    pic5?: string;
}

export interface FuneralData {
    firstName?: string;
    surname?: string;
    dateOfBirth?: number | string;
    dateOfDeath?: number | string;
    dateOfFuneral?: number | string;
    dateOfUnveiling?: number | string;
    venue?: string;
    time?: string;
    lat?: number;
    lng?: number;
    homelat?: number;
    homelng?: number;
    servicelat?: number;
    servicelng?: number;
    picture?: string;
    pictures?: FuneralPictures;
    programme?: string;
    obituary?: string;
    hymn?: string;
    info?: string;
    streaming?: boolean;
    homestream?: string;
    hstreamtime?: string;
    mstreamtime?: string;
    memostream?: string;
    memorial?: boolean;
    dateofmemorial?: number | string;
    memorialvenue?: string;
    memorialtime?: string;
    memorialprogramme?: string;
    memoriallocation?: string;
    thankson?: boolean;
    voteofthanks?: string;
}
