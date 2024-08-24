import bs58 from 'bs58'
import * as web3 from '@solana/web3.js'

import { StudentIntroReference } from '../models/serialize/StudentIntroReference'


const STUDENT_INTRO_PROGRAM_ID = 'HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf'

export class StudentIntroCoordinatorReference {
    static accounts: web3.PublicKey[] = []

    static async prefetchAccounts(connection: web3.Connection, search: string) {
        const accounts = await connection.getProgramAccounts(
            new web3.PublicKey(STUDENT_INTRO_PROGRAM_ID),
            {
                dataSlice: { offset: 1, length: 12 },
                filters: search === '' ? [] : [
                    {
                        memcmp:
                        {
                            offset: 5,
                            bytes: bs58.encode(Buffer.from(search))
                        }
                    }
                ]
            }
        );
         //@ts-ignore
        accounts.sort((a, b) => {
            const lengthA = a.account.data.readUInt32LE(0)
            const lengthB = b.account.data.readUInt32LE(0)

            // borsh adds u32 int at the beginning of the string. 
            // we must create a data slice with a 4 byte offset
            const dataA = a.account.data.slice(4, 4 + lengthA)
            const dataB = b.account.data.slice(4, 4 + lengthB)

            return dataA.compare(dataB)
        });

        this.accounts = accounts.map(account => account.pubkey);
    };

    static async fetchPage(connection: web3.Connection, page: number, perPage: number, search: string, reload: boolean = false): Promise<StudentIntroReference[]> {
        if (this.accounts.length === 0 || reload) {
            await this.prefetchAccounts(connection, search)
        }

        const paginatedPublicKeys = this.accounts.slice(
            (page - 1) * perPage,
            page * perPage,
        );

        if (paginatedPublicKeys.length === 0) {
            return []
        }

        const accounts = await connection.getMultipleAccountsInfo(paginatedPublicKeys);

        const studentIntros = accounts.reduce((accum: StudentIntroReference[], account) => {
            const studentIntro = StudentIntroReference.deserialize(account?.data);

            if (!studentIntro) {
                return accum
            }

            return [...accum, studentIntro];
        }, []);

        return studentIntros;
    };
};