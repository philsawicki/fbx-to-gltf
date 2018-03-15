import path from 'path';
import * as utilities from '../utilities';


jest.mock('fs', () => {
    return {
        readdir: (err, callback) => {
            callback(null, ['file1', 'file2']);
        }
    };
});


describe('Utilities', () => {
    describe('#generateUUID()', () => {
        let uuid;

        beforeEach(() => {
            uuid = utilities.generateUUID();
        });

        // UUIDs are 32-character long, with 4 additional dashes:
        it('should return a 36-character String', () => {
            expect(typeof uuid).toEqual('string');
            expect(uuid).toHaveLength(36);
        });

        // According to RFC 4122 (defining the UUID specification), string
        // output of UUIDs should be in lowercase.
        // See http://www.ietf.org/rfc/rfc4122.txt
        it('should be lowercase (except for dashes)', () => {
            const allCharactersLowercase = uuid
                .split('')
                .filter(uuidCharacter => uuidCharacter !== '-')
                .reduce((accumulator, uuidCharacter) => {
                    return accumulator && uuidCharacter === uuidCharacter.toLowerCase();
                }, true);

            expect(allCharactersLowercase).toBeTruthy();
        });

        it('should have a "4" character at index 14', () => {
            expect(uuid[14]).toEqual('4');
        });

        it('should have dashes at indices 8, 13, 18 and 23', () => {
            expect(uuid[ 8]).toEqual('-');
            expect(uuid[13]).toEqual('-');
            expect(uuid[18]).toEqual('-');
            expect(uuid[23]).toEqual('-');
        });

        it('should have all hexadecimal characters (except for dashes)', () => {
            const uuidCharactersWithoutDashes = uuid
                .split('')
                .filter(uuidCharacter => uuidCharacter !== '-')
                .reduce((accumulator, uuidCharacter) => {
                    const isInRange = (uuidCharacter >= '0' && uuidCharacter <= '9')
                        || (uuidCharacter >= 'a' && uuidCharacter <= 'f');
                    return accumulator && isInRange;
                }, true);

            expect(uuidCharactersWithoutDashes).toBeTruthy();
        });
    });

    describe('#updateJobData', () => {
        let mockJob;

        beforeEach(() => {
            mockJob = {
                data: {
                    'initial': 'content'
                },
                update: callback => callback()
            };
        });

        it('should return a Promise', () => {
            const result = utilities.updateJobData(mockJob);

            expect(result).toBeInstanceOf(Promise);
        });

        it('should update the job data with the provided data', async () => {
            await utilities.updateJobData(mockJob, {
                some: 'other content'
            });

            expect(mockJob.data).toEqual({
                initial: 'content',
                some: 'other content'
            });
        });

        it('should reject with an error if the job could not be updated', async () => {
            mockJob.update = callback => callback(new Error('Error!'));

            await expect(utilities.updateJobData(mockJob)).rejects.toThrow();
        });
    });

    describe('#logJobMessage()', () => {
        let mockJob;

        beforeEach(() => {
            mockJob = {
                log: jest.fn()
            };
        });

        it('should call the "log()" method on the job with the given message', () => {
            const spy = jest.spyOn(mockJob, 'log');

            utilities.logJobMessage(mockJob, 'some message');

            expect(spy).toHaveBeenCalledWith(expect.stringContaining('some message'));

            spy.mockReset();
            spy.mockRestore();
        });
    });

    describe('#dirlist()', () => {
        it('returns a Promise', () => {
            expect(utilities.dirlist('.')).toBeInstanceOf(Promise);
        });

        it('returns an Array of full paths to the files', async () => {
            const rootDir = path.join('full', 'path', 'to', 'root', 'dir');
            const results = await utilities.dirlist(rootDir);

            expect(results).toBeInstanceOf(Array);
            expect(results).toEqual([
                path.join(rootDir, 'file1'),
                path.join(rootDir, 'file2')
            ]);
        });
    });
});
