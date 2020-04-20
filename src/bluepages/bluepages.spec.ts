/* eslint-disable import/extensions */
import { BluepagesClient } from './bluepages';
import { bluepagesApiData } from './mock-bluepages-data';

describe('Formating bluepages user data', () => {
    const bluepagesClient = new BluepagesClient();

    test('format bluepage data for user', async () => {
        expect.assertions(1);

        const result = bluepagesClient.formatBluepagesUser(bluepagesApiData);

        expect(result).toEqual({
            fullName: 'Name Test',
            role: 'Role',
            orgTitle: 'Finance and Operations',
            location: 'Research Triangle Park, NC, United States',
            timeZoneCode: 'America/New_York',
            employeeType: 'IBM employee, Regular',
            legalEntity: 'IBM USA',
            preferredIdentity: 'name.test@ibm.com',
            telephoneOffice: '1-1234567890',
            telephoneMobile: '1-1234567890',
            notesEmail: 'Name Test/US/IBM',
            uid: '01A02B03C',
            slackId: 'QWERTY',
        });
    });

    test('format bluepages data even if most fields are not there', async () => {
        expect.assertions(1);

        const result = bluepagesClient.formatBluepagesUser({});

        expect(result).toEqual({
            fullName: 'N/A',
            role: 'N/A',
            orgTitle: 'N/A',
            location: 'N/A',
            timeZoneCode: 'N/A',
            employeeType: 'N/A',
            legalEntity: 'N/A',
            preferredIdentity: 'N/A',
            telephoneOffice: 'N/A',
            telephoneMobile: 'N/A',
            notesEmail: 'N/A',
            uid: 'N/A',
            slackId: 'N/A',
        });
    });
});
