import request from 'request-promise-native';

// eslint-disable-next-line import/extensions
import { logger } from '../utilities/logger';

export interface User {
    fullName: string;
    role: string;
    orgTitle: string;
    location: string;
    timeZoneCode: string;
    employeeType: string;
    legalEntity: string;
    preferredIdentity: string;
    telephoneOffice: string;
    telephoneMobile: string;
    notesEmail: string;
    uid: string;
    slackId: string;
}

export class BluepagesClient {
    public formatBluepagesUser(user: any): User {
        const orgTitle = user?.org?.title;
        // eslint-disable-next-line prefer-destructuring
        const location = user?.address?.business?.location;
        const employeeType = user?.employeeType?.title;
        const legalEntity = user?.legalEntity?.name;
        const telephoneOffice = user?.telephone?.office;
        const telephoneMobile = user?.telephone?.mobile;

        return {
            fullName: user?.nameFull || 'N/A',
            role: user?.role || 'N/A',
            orgTitle: orgTitle || 'N/A',
            location: location || 'N/A',
            timeZoneCode: user?.timeZoneCode || 'N/A',
            employeeType: employeeType || 'N/A',
            legalEntity: legalEntity || 'N/A',
            preferredIdentity: user?.preferredIdentity || 'N/A',
            telephoneOffice: telephoneOffice || 'N/A',
            telephoneMobile: telephoneMobile || 'N/A',
            notesEmail: user?.notesEmail || 'N/A',
            uid: user?.uid || 'N/A',
            slackId: user?.slackId || 'N/A',
        };
    }

    public async getBluepagesData(email: string): Promise<User | null> {
        let userData;
        try {
            userData = await request(
                `http://w3-services1.w3-969.ibm.com/myw3/unified-profile/v2/profiles?emails=${email}`,
            ).then((x): any => JSON.parse(x)[0]);
        } catch (err) {
            logger.error('Request failed: ', err);
            return null;
        }

        if (userData) {
            return this.formatBluepagesUser(userData.content.profile);
        }

        return null;
    }
}
