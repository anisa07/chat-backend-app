import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from './firebase.service';
import { readFileSync } from 'fs';
import * as path from 'path';
import { decryptData } from 'src/utils/cypto-utils';

@Module({
  providers: [
    {
      provide: 'FIREBASE',
      useFactory: () => {
        if (!admin.apps.length) {
          const encryptedAccountFile = readFileSync(
            path.join(
              __dirname.replace('dist', 'src'),
              'encrypted-config.json',
            ),
            'utf8',
          );
          const firebaseServiceAccountFile = decryptData(encryptedAccountFile);
          const serviceAccount = JSON.parse(firebaseServiceAccountFile);

          return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        }
        return admin.app();
      },
    },
    FirebaseService,
  ],
  exports: ['FIREBASE', FirebaseService],
})
export class FirebaseModule {}
