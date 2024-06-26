import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from './firebase.service';
import { readFileSync } from 'fs';
import * as path from 'path';

@Module({
  providers: [
    {
      provide: 'FIREBASE',
      useFactory: () => {
        const firebaseServiceAccountFile = readFileSync(
          path.join(__dirname.replace('dist', 'src'), 'config.json'),
          'utf8',
        );
        const serviceAccount = JSON.parse(firebaseServiceAccountFile);

        if (!admin.apps.length) {
          return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            // databaseURL: process.env.FIREBASE_DB_URL,
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
